'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { POKEDEX_MAX } = require('./pokemon');

function normalizeMode(mode) {
  return mode === 'mock' ? 'mock' : 'watch';
}

const KNOWN_PROVIDERS = ['claude', 'codex'];

function resolvePersistPaths(options = {}) {
  const scope = normalizeMode(options.mode);
  const cwd = options.cwd || process.cwd();
  const ssotBaseDir = path.resolve(options.ssotBaseDir || path.join(cwd, 'data', 'runtime', 'all'));
  const mockBaseDir = path.resolve(options.mockBaseDir || path.join(cwd, 'data', 'runtime', 'mock'));
  const baseDir = scope === 'mock' ? mockBaseDir : ssotBaseDir;

  const providerMirrorDirs = scope === 'mock'
    ? {}
    : (options.providerDirs || {
      claude: path.resolve(path.join(cwd, 'data', 'runtime', 'claude')),
      codex: path.resolve(path.join(cwd, 'data', 'runtime', 'codex'))
    });

  // Locations we will try to migrate from when SSoT is empty. Order matters:
  // earlier entries win on conflict (we still merge non-conflicting fields).
  // Legacy `data/state.json` was claude-only.
  const legacyMigrationSources = scope === 'mock'
    ? []
    : (options.legacyMigrationSources || [
      { provider: 'claude', dir: path.resolve(path.join(cwd, 'data')) },
      { provider: 'claude', dir: providerMirrorDirs.claude },
      { provider: 'codex', dir: providerMirrorDirs.codex }
    ]).filter((entry) => entry && entry.dir);

  return {
    scope,
    baseDir,
    stateFile: path.join(baseDir, 'state.json'),
    pokedexFile: path.join(baseDir, 'pokedex.json'),
    resetFlagFile: path.join(baseDir, '.hard-reset'),
    providerMirrorDirs,
    legacyMigrationSources
  };
}

function filterStateByProvider(data, provider) {
  const matches = (entry) => ((entry && entry.provider) || 'claude') === provider;
  const rateLimitsByProvider = (data.rateLimitsByProvider && data.rateLimitsByProvider[provider])
    ? { [provider]: data.rateLimitsByProvider[provider] }
    : {};
  return {
    version: data.version,
    savedAt: data.savedAt,
    seenPokemonIds: data.seenPokemonIds || [],
    firstDiscoveryByPokemon: data.firstDiscoveryByPokemon || {},
    rateLimits: rateLimitsByProvider[provider] || null,
    rateLimitsByProvider,
    agents: Array.isArray(data.agents) ? data.agents.filter(matches) : [],
    boxedAgents: Array.isArray(data.boxedAgents) ? data.boxedAgents.filter(matches) : [],
    subagentHistory: Array.isArray(data.subagentHistory) ? data.subagentHistory.filter(matches) : []
  };
}

function tagProvider(data, provider) {
  for (const field of ['agents', 'boxedAgents', 'subagentHistory']) {
    if (Array.isArray(data[field])) {
      data[field] = data[field].map((entry) => (entry && entry.provider ? entry : { ...entry, provider }));
    }
  }
  return data;
}

function mergeStateInto(base, incoming) {
  const byId = (list) => new Map((list || []).map((entry) => [entry.agentId, entry]));
  // agents: prefer the entry with newer lastSeen
  const agentMap = byId(base.agents);
  for (const entry of incoming.agents || []) {
    const existing = agentMap.get(entry.agentId);
    if (!existing || (entry.lastSeen || 0) > (existing.lastSeen || 0)) {
      agentMap.set(entry.agentId, entry);
    }
  }
  base.agents = Array.from(agentMap.values());

  // boxedAgents: union by (agentId + createdAt), prefer entries with later doneAt
  const boxKey = (b) => `${b.agentId}|${b.createdAt || 0}`;
  const boxMap = new Map((base.boxedAgents || []).map((b) => [boxKey(b), b]));
  for (const entry of incoming.boxedAgents || []) {
    const key = boxKey(entry);
    const existing = boxMap.get(key);
    if (!existing || (entry.doneAt || 0) > (existing.doneAt || 0)) {
      boxMap.set(key, entry);
    }
  }
  base.boxedAgents = Array.from(boxMap.values());

  // subagentHistory: union by (agentId + createdAt)
  const histKey = (h) => `${h.agentId}|${h.createdAt || 0}|${h.doneAt || 0}`;
  const histMap = new Map((base.subagentHistory || []).map((h) => [histKey(h), h]));
  for (const entry of incoming.subagentHistory || []) {
    const key = histKey(entry);
    if (!histMap.has(key)) histMap.set(key, entry);
  }
  base.subagentHistory = Array.from(histMap.values());

  // seenPokemonIds: union
  const seen = new Set([...(base.seenPokemonIds || []), ...(incoming.seenPokemonIds || [])]);
  base.seenPokemonIds = Array.from(seen).sort((a, b) => a - b);

  // firstDiscoveryByPokemon: earliest wins
  base.firstDiscoveryByPokemon = { ...(incoming.firstDiscoveryByPokemon || {}), ...(base.firstDiscoveryByPokemon || {}) };
  for (const [pid, when] of Object.entries(incoming.firstDiscoveryByPokemon || {})) {
    if (!base.firstDiscoveryByPokemon[pid] || when < base.firstDiscoveryByPokemon[pid]) {
      base.firstDiscoveryByPokemon[pid] = when;
    }
  }

  // rateLimitsByProvider: shallow merge (per-provider keys)
  base.rateLimitsByProvider = { ...(base.rateLimitsByProvider || {}), ...(incoming.rateLimitsByProvider || {}) };
  base.rateLimits = base.rateLimits || incoming.rateLimits || null;
  base.savedAt = Math.max(base.savedAt || 0, incoming.savedAt || 0);
  base.version = base.version || incoming.version || 1;
  return base;
}

function emptyStateSnapshot() {
  return {
    version: 1,
    savedAt: 0,
    seenPokemonIds: [],
    firstDiscoveryByPokemon: {},
    rateLimits: null,
    rateLimitsByProvider: {},
    agents: [],
    boxedAgents: [],
    subagentHistory: []
  };
}

function migrateLegacyState(persist) {
  if (!persist.legacyMigrationSources || persist.legacyMigrationSources.length === 0) {
    return null;
  }
  const base = emptyStateSnapshot();
  const sources = [];
  for (const { provider, dir } of persist.legacyMigrationSources) {
    if (!dir) continue;
    const file = path.join(dir, 'state.json');
    if (!fs.existsSync(file)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
      tagProvider(raw, provider);
      mergeStateInto(base, raw);
      sources.push(file);
    } catch (error) {
      process.stderr.write(`[persist] migrate skip ${file}: ${error.message}\n`);
    }
  }
  if (sources.length === 0) return null;
  base.savedAt = Date.now();
  process.stdout.write(`[persist] migrated SSoT from ${sources.length} legacy source(s): ${sources.join(', ')}\n`);
  return base;
}

function migrateLegacyPokedex(persist) {
  if (!persist.legacyMigrationSources || persist.legacyMigrationSources.length === 0) {
    return null;
  }
  let merged = null;
  for (const { dir } of persist.legacyMigrationSources) {
    if (!dir) continue;
    const file = path.join(dir, 'pokedex.json');
    if (!fs.existsSync(file)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!merged) {
        merged = data;
      } else {
        // Union of seenPokemonIds, earliest firstDiscoveryByPokemon
        const seen = new Set([...(merged.seenPokemonIds || []), ...(data.seenPokemonIds || [])]);
        merged.seenPokemonIds = Array.from(seen).sort((a, b) => a - b);
        merged.firstDiscoveryByPokemon = { ...(merged.firstDiscoveryByPokemon || {}) };
        for (const [pid, when] of Object.entries(data.firstDiscoveryByPokemon || {})) {
          if (!merged.firstDiscoveryByPokemon[pid] || when < merged.firstDiscoveryByPokemon[pid]) {
            merged.firstDiscoveryByPokemon[pid] = when;
          }
        }
        merged.discovered = (merged.seenPokemonIds || []).length;
      }
    } catch (error) {
      process.stderr.write(`[pokedex] migrate skip ${file}: ${error.message}\n`);
    }
  }
  return merged;
}

function ensurePersistenceDir(persist) {
  fs.mkdirSync(persist.baseDir, { recursive: true });
}

function writeStateMirrors(data, persist) {
  if (!persist.providerMirrorDirs) return;
  for (const [provider, dir] of Object.entries(persist.providerMirrorDirs)) {
    if (!dir) continue;
    try {
      fs.mkdirSync(dir, { recursive: true });
      const filtered = filterStateByProvider(data, provider);
      fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify(filtered, null, 2), 'utf8');
    } catch (error) {
      process.stderr.write(`[persist] mirror ${provider} failed: ${error.message}\n`);
    }
  }
}

function writePokedexMirrors(data, persist) {
  if (!persist.providerMirrorDirs) return;
  for (const [, dir] of Object.entries(persist.providerMirrorDirs)) {
    if (!dir) continue;
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'pokedex.json'), JSON.stringify(data, null, 2), 'utf8');
    } catch (_) {
      // ignore mirror failures
    }
  }
}

function saveState(state, persist) {
  try {
    ensurePersistenceDir(persist);
    const data = state.serialize();
    fs.writeFileSync(persist.stateFile, JSON.stringify(data, null, 2), 'utf8');
    writeStateMirrors(data, persist);
  } catch (error) {
    process.stderr.write(`[persist] save failed: ${error.message}\n`);
  }
}

function loadState(state, persist) {
  try {
    let data = null;
    if (fs.existsSync(persist.stateFile)) {
      data = JSON.parse(fs.readFileSync(persist.stateFile, 'utf8'));
    } else {
      data = migrateLegacyState(persist);
      if (data) {
        ensurePersistenceDir(persist);
        fs.writeFileSync(persist.stateFile, JSON.stringify(data, null, 2), 'utf8');
        writeStateMirrors(data, persist);
      }
    }
    if (!data) return false;
    const ok = state.restore(data);
    if (ok) {
      process.stdout.write(`[persist] restored ${data.agents ? data.agents.length : 0} agents, ${data.boxedAgents ? data.boxedAgents.length : 0} boxed\n`);
    }
    return ok;
  } catch (error) {
    process.stderr.write(`[persist] load failed: ${error.message}\n`);
    return false;
  }
}

function savePokedex(state, persist) {
  try {
    ensurePersistenceDir(persist);
    const pokedex = state.pokedexSnapshot();
    const data = {
      version: 1,
      updatedAt: Date.now(),
      seenPokemonIds: pokedex.seenPokemonIds,
      firstDiscoveryByPokemon: pokedex.firstDiscoveryByPokemon,
      discovered: pokedex.discoveredCount,
      total: POKEDEX_MAX
    };
    fs.writeFileSync(persist.pokedexFile, JSON.stringify(data, null, 2), 'utf8');
    writePokedexMirrors(data, persist);
  } catch (error) {
    process.stderr.write(`[pokedex] save failed: ${error.message}\n`);
  }
}

function loadPokedex(state, persist) {
  try {
    let data = null;
    if (fs.existsSync(persist.pokedexFile)) {
      data = JSON.parse(fs.readFileSync(persist.pokedexFile, 'utf8'));
    } else {
      data = migrateLegacyPokedex(persist);
      if (data) {
        ensurePersistenceDir(persist);
        fs.writeFileSync(persist.pokedexFile, JSON.stringify(data, null, 2), 'utf8');
        writePokedexMirrors(data, persist);
        process.stdout.write(`[pokedex] migrated from legacy locations\n`);
      }
    }
    if (!data) return false;
    state.mergeSeenPokemonIds(data.seenPokemonIds, data.firstDiscoveryByPokemon);
    process.stdout.write(`[pokedex] restored ${Array.isArray(data.seenPokemonIds) ? data.seenPokemonIds.length : 0} discovered pokemon\n`);
    return true;
  } catch (error) {
    process.stderr.write(`[pokedex] load failed: ${error.message}\n`);
    return false;
  }
}

function clearPersistedFiles(persist) {
  const targets = [persist.stateFile, persist.pokedexFile];
  if (persist.providerMirrorDirs) {
    for (const dir of Object.values(persist.providerMirrorDirs)) {
      if (!dir) continue;
      targets.push(path.join(dir, 'state.json'));
      targets.push(path.join(dir, 'pokedex.json'));
    }
  }
  for (const filePath of targets) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      process.stderr.write(`[persist] reset cleanup failed for ${path.basename(filePath)}: ${error.message}\n`);
    }
  }
}

function readLiveSessionIds(sessionsDir = path.join(os.homedir(), '.claude', 'sessions')) {
  const liveSessionIds = new Set();
  let files;
  try {
    files = fs.readdirSync(sessionsDir).filter((fileName) => fileName.endsWith('.json'));
  } catch (_) {
    return liveSessionIds;
  }

  for (const fileName of files) {
    try {
      const raw = fs.readFileSync(path.join(sessionsDir, fileName), 'utf8');
      const data = JSON.parse(raw);
      if (!data.sessionId || !data.pid) continue;

      try {
        process.kill(data.pid, 0);
        liveSessionIds.add(data.sessionId);
      } catch (_) {
        // Ignore dead processes.
      }
    } catch (_) {
      // Ignore malformed session files.
    }
  }

  return liveSessionIds;
}

function runStartupZombieBoxing(state, sessionsDir = path.join(os.homedir(), '.claude', 'sessions')) {
  const liveSessionIds = readLiveSessionIds(sessionsDir);
  let boxedCount = 0;

  for (const [agentId, agent] of [...state.agents.entries()]) {
    if (agent.parentId) continue;
    if (liveSessionIds.has(agent.sessionId)) continue;
    state.boxAgent(agent);
    state.removeAgent(agentId);
    boxedCount += 1;
  }

  for (const [, agent] of state.agents.entries()) {
    if (!agent.parentId && liveSessionIds.has(agent.sessionId)) continue;
    if (agent.sessionId && agent.sessionId !== 'unknown-session') {
      state.suppressedSessions.add(agent.sessionId);
    }
  }

  for (const entry of state.boxedAgents) {
    if (entry.sessionId && entry.sessionId !== 'unknown-session') {
      state.suppressedSessions.add(entry.sessionId);
    }
  }

  return {
    boxedCount,
    liveSessionIds
  };
}

function createSessionPidMap(sessionsDir = path.join(os.homedir(), '.claude', 'sessions')) {
  let files;
  try {
    files = fs.readdirSync(sessionsDir).filter((fileName) => fileName.endsWith('.json'));
  } catch (_) {
    return null;
  }

  const sessionPidMap = new Map();
  for (const fileName of files) {
    try {
      const raw = fs.readFileSync(path.join(sessionsDir, fileName), 'utf8');
      const data = JSON.parse(raw);
      if (data.sessionId && data.pid) {
        sessionPidMap.set(data.sessionId, data.pid);
      }
    } catch (_) {
      // Ignore malformed session files.
    }
  }

  return sessionPidMap;
}

function runSessionPidCheck(state, sessionsDir = path.join(os.homedir(), '.claude', 'sessions')) {
  const sessionPidMap = createSessionPidMap(sessionsDir);
  if (!sessionPidMap) {
    state.checkSessionPids(new Map(), true);
    return;
  }
  state.checkSessionPids(sessionPidMap, true);
}

function startPeriodicTick(state, options = {}) {
  const intervalMs = options.intervalMs || 1000;
  const now = typeof options.now === 'function' ? options.now : Date.now;
  const timer = setInterval(() => state.tick(now()), intervalMs);
  timer.unref();
  return timer;
}

function startPeriodicSave(state, persist, options = {}) {
  const intervalMs = options.intervalMs || 30000;
  const timer = setInterval(() => saveState(state, persist), intervalMs);
  timer.unref();
  return timer;
}

function startPeriodicPidCheck(state, sessionsDir, options = {}) {
  const intervalMs = options.intervalMs || 10000;
  runSessionPidCheck(state, sessionsDir);
  const timer = setInterval(() => runSessionPidCheck(state, sessionsDir), intervalMs);
  timer.unref();
  return timer;
}

function stopAll(handles) {
  if (!handles) return;
  const values = Array.isArray(handles) ? handles : Object.values(handles);
  for (const handle of values) {
    if (handle) clearInterval(handle);
  }
}

function markResetFlag(persist) {
  try {
    ensurePersistenceDir(persist);
    fs.writeFileSync(persist.resetFlagFile, '', 'utf8');
    return true;
  } catch (_) {
    return false;
  }
}

function consumeResetFlag(persist) {
  try {
    if (!fs.existsSync(persist.resetFlagFile)) return false;
    fs.unlinkSync(persist.resetFlagFile);
    return true;
  } catch (_) {
    return false;
  }
}

function performDashboardHardReset(options = {}) {
  const command = options.command || 'watch';
  const persist = options.persist || resolvePersistPaths({ mode: command });
  const state = options.state || null;
  const mock = options.mock || null;
  const watcher = options.watcher || null;
  const preserveActiveRootAgents = options.preserveActiveRootAgents === true;

  clearPersistedFiles(persist);

  if (mock && typeof mock.hardReset === 'function') {
    mock.hardReset();
  } else if (state) {
    const liveSessionIds = command === 'watch' ? readLiveSessionIds(options.sessionsDir) : null;
    state.reset({
      preserveActiveRootAgents,
      liveSessionIds
    });
  }

  if (watcher && typeof watcher.resetToCurrentEnd === 'function') {
    watcher.resetToCurrentEnd().catch((error) => {
      process.stderr.write(`[watcher] hard reset re-prime failed: ${error.message}\n`);
    });
  } else if (command === 'watch') {
    markResetFlag(persist);
  }

  if (state) {
    saveState(state, persist);
    savePokedex(state, persist);
  }

  process.stdout.write(`[${command}] hard reset complete\n`);
}

module.exports = {
  normalizeMode,
  resolvePersistPaths,
  ensurePersistenceDir,
  saveState,
  loadState,
  savePokedex,
  loadPokedex,
  clearPersistedFiles,
  readLiveSessionIds,
  runStartupZombieBoxing,
  runSessionPidCheck,
  startPeriodicTick,
  startPeriodicSave,
  startPeriodicPidCheck,
  stopAll,
  markResetFlag,
  consumeResetFlag,
  performDashboardHardReset
};
