'use strict';

const EventEmitter = require('events');
const { EVENT_TYPES } = require('./parser');
const {
  POKEDEX_MIN,
  POKEDEX_MAX,
  AREA_IDS,
  getPokemonIdForAgent,
  getPokemonAreaId,
  getPokemonAreaTotals,
  normalizeAreaId,
  getPokemonRarityTier
} = require('./pokemon');
const {
  normalizeEvolutionItemState,
  cloneEvolutionItemState,
  evolutionItemSnapshot,
  addEffectiveRewardTokens,
  addInventoryItem,
  removeInventoryItem,
  pullEvolutionItem,
  buyEvolutionItem,
  sellEvolutionItem,
  isEvolutionItemId,
  itemNameKo,
  evolutionOptionsForSpecies
} = require('./evolutionItems');

const STATUS = Object.freeze({
  IDLE: 'Idle',
  SLEEPING: 'Sleeping',
  THINKING: 'Thinking',
  TOOL: 'Tool-Running',
  OUTPUT: 'Outputting',
  WAITING: 'Waiting'
});

const LIFECYCLE = Object.freeze({
  ACTIVE: 'active',
  SLEEPING: 'sleeping',
  BOXED: 'boxed',
  DONE: 'done'
});

const DEFAULT_RING_SIZE = 300;
const DEFAULT_MAX_BOXED_AGENTS = 300;
const DEFAULT_MAX_SUBAGENT_HISTORY = 1000;
const DEFAULT_MAX_TRAINING_EVENTS = 500;
const DEFAULT_POKEMON_BOX_ID = 'box-default';
const LEGACY_JOHTO_POKEDEX_MAX = 251;
const PARTY_SIZE = 6;
const TRAINING_TOKEN_DIVISOR = 20;
const OWNED_LEVEL_100_EXP = 30115800;
const OWNED_MEDIUM_FAST_LEVEL_100_EXP = 1000000;
const RECRUIT_POINT_COSTS_DISCOVERED = Object.freeze({ 1: 100, 2: 300, 3: 700, 4: 1000, 5: 2000 });
const RECRUIT_POINT_COSTS_UNDISCOVERED = Object.freeze({ 1: 500, 2: 1500, 3: 3500, 4: 5000, 5: 10000 });
const RECRUIT_CAUGHT_DISCOUNT_RATE = 0.8;
const FIRST_CATCH_POINT_REWARDS = Object.freeze({ 1: 10, 2: 30, 3: 70, 4: 120, 5: 250 });
const CATCH_MILESTONES = Object.freeze([
  Object.freeze({ id: 'caught-1', count: 1, pointReward: 100 }),
  Object.freeze({ id: 'caught-5', count: 5, pointReward: 250 }),
  Object.freeze({ id: 'caught-10', count: 10, pointReward: 500 }),
  Object.freeze({ id: 'caught-25', count: 25, pointReward: 800 }),
  Object.freeze({ id: 'caught-50', count: 50, pointReward: 1200, badge: 'bronze-dex' }),
  Object.freeze({ id: 'caught-100', count: 100, pointReward: 2000, globalRadarLevel: 1 }),
  Object.freeze({ id: 'caught-150', count: 150, pointReward: 2500 }),
  Object.freeze({ id: 'caught-200', count: 200, pointReward: 3500, globalRadarLevel: 2 }),
  Object.freeze({ id: 'caught-300', count: 300, pointReward: 5000 }),
  Object.freeze({ id: 'caught-400', count: 400, pointReward: 7000, globalRadarLevel: 3 }),
  Object.freeze({ id: 'caught-500', count: 500, pointReward: 9000 }),
  Object.freeze({ id: 'caught-649', count: 649, pointReward: 15000, badge: 'national-dex-complete' })
]);
const AREA_CATCH_MILESTONES = Object.freeze([
  Object.freeze({ level: 1, percent: 0.10, pointReward: 50 }),
  Object.freeze({ level: 2, percent: 0.25, pointReward: 150, notCaughtMultiplier: 1.5 }),
  Object.freeze({ level: 3, percent: 0.50, pointReward: 350, notCaughtMultiplier: 2, rareBoostLevel: 1 }),
  Object.freeze({ level: 4, percent: 0.75, pointReward: 700, notCaughtMultiplier: 3, rareBoostLevel: 2 }),
  Object.freeze({ level: 5, percent: 1.00, pointReward: 1500, notCaughtMultiplier: 3, rareBoostLevel: 3, badge: 'area-master' })
]);
const DEFAULT_COUNTERS = Object.freeze({
  seen: 0,
  toolStarts: 0,
  toolEnds: 0,
  outputs: 0,
  waits: 0,
  spawns: 0
});

function normalizeProvider(provider) {
  const value = String(provider || '').toLowerCase();
  return value === 'codex' ? 'codex' : 'claude';
}

function cloneRateLimitsByProvider(rateLimitsByProvider) {
  const out = {};
  if (!rateLimitsByProvider || typeof rateLimitsByProvider !== 'object') {
    return out;
  }

  for (const provider of ['claude', 'codex']) {
    const rateLimits = rateLimitsByProvider[provider];
    if (rateLimits && typeof rateLimits === 'object') {
      out[provider] = rateLimits;
    }
  }
  return out;
}

function cloneCounters(counters) {
  return {
    seen: counters && typeof counters.seen === 'number' ? counters.seen : 0,
    toolStarts: counters && typeof counters.toolStarts === 'number' ? counters.toolStarts : 0,
    toolEnds: counters && typeof counters.toolEnds === 'number' ? counters.toolEnds : 0,
    outputs: counters && typeof counters.outputs === 'number' ? counters.outputs : 0,
    waits: counters && typeof counters.waits === 'number' ? counters.waits : 0,
    spawns: counters && typeof counters.spawns === 'number' ? counters.spawns : 0
  };
}

function cloneAgentRecord(agent) {
  if (!agent) {
    return null;
  }

  return {
    agentId: agent.agentId,
    name: agent.name || agent.agentId,
    displayName: agent.displayName || null,
    subagentType: agent.subagentType || null,
    assignedPokemonId: clampPokemonId(agent.assignedPokemonId),
    provider: agent.provider || 'claude',
    projectId: agent.projectId || 'unknown-project',
    sessionId: agent.sessionId || 'unknown-session',
    parentId: agent.parentId || undefined,
    childrenIds: new Set(Array.from(agent.childrenIds || [])),
    lifecycle: agent.lifecycle || LIFECYCLE.ACTIVE,
    status: agent.status || STATUS.SLEEPING,
    activity: agent.activity || 'Restored',
    lastTool: agent.lastTool || null,
    lastCommand: agent.lastCommand || null,
    lastUserQuery: agent.lastUserQuery || null,
    lastSeen: agent.lastSeen || Date.now(),
    createdAt: agent.createdAt || Date.now(),
    contextUsed: agent.contextUsed || 0,
    contextMax: agent.contextMax || 200000,
    model: agent.model || null,
    selfTokens: agent.selfTokens || 0,
    totalTokens: agent.totalTokens || 0,
    counters: cloneCounters(agent.counters)
  };
}

function isFallbackProjectId(projectId) {
  return typeof projectId === 'string' && /^codex-\d{4}-\d{2}-\d{2}$/.test(projectId);
}

function isSubagent(agent) {
  return !!(agent && agent.parentId);
}

function isStartupReplay(meta) {
  return !!(meta && typeof meta.replaySource === 'string' && meta.replaySource.startsWith('initial-'));
}

function pickBestAgentRecord(candidates, beforeTs) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  const cutoff = typeof beforeTs === 'number' ? beforeTs : Infinity;
  let best = null;
  let bestCreatedAt = -Infinity;

  for (const candidate of candidates) {
    if (!candidate) continue;
    const createdAt = typeof candidate.createdAt === 'number' ? candidate.createdAt : -Infinity;
    if (createdAt > cutoff) continue;
    if (!best || createdAt >= bestCreatedAt) {
      best = candidate;
      bestCreatedAt = createdAt;
    }
  }

  if (best) {
    return best;
  }

  for (const candidate of candidates) {
    if (!candidate) continue;
    const createdAt = typeof candidate.createdAt === 'number' ? candidate.createdAt : -Infinity;
    if (!best || createdAt >= bestCreatedAt) {
      best = candidate;
      bestCreatedAt = createdAt;
    }
  }

  return best;
}

function newestBoxedEntryBySession(boxedAgents, sessionId) {
  if (!sessionId || !Array.isArray(boxedAgents)) {
    return null;
  }

  let newest = null;
  let newestDoneAt = -Infinity;
  for (const entry of boxedAgents) {
    if (!entry || entry.sessionId !== sessionId) continue;
    const doneAt = typeof entry.doneAt === 'number' ? entry.doneAt : -Infinity;
    if (!newest || doneAt >= newestDoneAt) {
      newest = entry;
      newestDoneAt = doneAt;
    }
  }
  return newest;
}

function clampPokemonId(value, maxPokemonId = POKEDEX_MAX) {
  const pokemonId = Number(value);
  const max = Math.max(POKEDEX_MIN, Math.min(POKEDEX_MAX, Number(maxPokemonId) || POKEDEX_MAX));
  if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > max) {
    return null;
  }
  return pokemonId;
}

function normalizePokemonCatalogMax(value) {
  const maxPokemonId = Number(value);
  if (!Number.isInteger(maxPokemonId) || maxPokemonId < POKEDEX_MIN || maxPokemonId > POKEDEX_MAX) {
    return null;
  }
  return maxPokemonId;
}

function assignedPokemonIdExistsInList(list) {
  return Array.isArray(list) && list.some((entry) => !!(entry && clampPokemonId(entry.assignedPokemonId)));
}

function inferLegacyPokemonCatalogMax(data) {
  const explicitMax = normalizePokemonCatalogMax(
    data && (data.pokemonCatalogMax || data.pokedexMax || data.pokedexTotal || data.total)
  );
  if (explicitMax && explicitMax < POKEDEX_MAX) {
    return explicitMax;
  }
  if (explicitMax) {
    return null;
  }

  if (
    assignedPokemonIdExistsInList(data && data.agents) ||
    assignedPokemonIdExistsInList(data && data.boxedAgents) ||
    assignedPokemonIdExistsInList(data && data.subagentHistory)
  ) {
    return null;
  }

  const seenIds = Array.isArray(data && data.seenPokemonIds)
    ? data.seenPokemonIds.map((id) => Number(id)).filter((id) => Number.isInteger(id))
    : [];
  if (seenIds.length > 0 && seenIds.every((id) => id >= POKEDEX_MIN && id <= LEGACY_JOHTO_POKEDEX_MAX)) {
    return LEGACY_JOHTO_POKEDEX_MAX;
  }
  return null;
}

function discoveryPokemonIdsByAgent(firstDiscoveryByPokemon) {
  const byAgentId = new Map();
  if (!firstDiscoveryByPokemon || typeof firstDiscoveryByPokemon !== 'object') {
    return byAgentId;
  }

  for (const [rawPokemonId, rawInfo] of Object.entries(firstDiscoveryByPokemon)) {
    const pokemonId = clampPokemonId(rawPokemonId);
    if (!pokemonId || !rawInfo || typeof rawInfo !== 'object' || !rawInfo.agentId) {
      continue;
    }
    const agentId = String(rawInfo.agentId);
    if (!byAgentId.has(agentId)) {
      byAgentId.set(agentId, pokemonId);
    }
  }
  return byAgentId;
}

function recruitPointCostForSpecies(speciesId, discovered, caught = false) {
  const normalizedId = clampPokemonId(speciesId);
  const tier = Math.max(1, Math.min(5, Number(getPokemonRarityTier(normalizedId)) || 1));
  const isCaught = !!caught;
  const costs = (discovered || isCaught) ? RECRUIT_POINT_COSTS_DISCOVERED : RECRUIT_POINT_COSTS_UNDISCOVERED;
  const basePointCost = costs[tier] || costs[1];
  const pointCost = isCaught
    ? Math.max(1, Math.floor(basePointCost * RECRUIT_CAUGHT_DISCOUNT_RATE))
    : basePointCost;
  return {
    tier,
    discovered: !!(discovered || isCaught),
    caught: isCaught,
    discount: isCaught ? { type: 'caught', rate: RECRUIT_CAUGHT_DISCOUNT_RATE } : null,
    pointCost
  };
}

function firstCatchPointRewardForSpecies(speciesId) {
  const normalizedId = clampPokemonId(speciesId);
  const tier = Math.max(1, Math.min(5, Number(getPokemonRarityTier(normalizedId)) || 1));
  return {
    tier,
    pointReward: FIRST_CATCH_POINT_REWARDS[tier] || FIRST_CATCH_POINT_REWARDS[1]
  };
}

function normalizePokemonIdList(ids) {
  const out = [];
  const seen = new Set();
  if (!Array.isArray(ids)) {
    return out;
  }
  for (const rawId of ids) {
    const pokemonId = clampPokemonId(rawId);
    if (!pokemonId || seen.has(pokemonId)) {
      continue;
    }
    seen.add(pokemonId);
    out.push(pokemonId);
  }
  return out.sort((a, b) => a - b);
}

function normalizeStringSet(values) {
  const out = new Set();
  if (!Array.isArray(values)) {
    return out;
  }
  for (const value of values) {
    const normalized = normalizeOwnedText(value, 120);
    if (normalized) {
      out.add(normalized);
    }
  }
  return out;
}

function areaMilestoneId(areaId, level) {
  return `${areaId}:L${level}`;
}

function areaMilestoneThreshold(totalCount, milestone) {
  const total = Math.max(0, Number(totalCount) || 0);
  if (total <= 0) {
    return Infinity;
  }
  return Math.max(1, Math.ceil(total * milestone.percent));
}

function catchMilestoneReward(milestone) {
  return {
    type: 'catch-milestone',
    id: milestone.id,
    count: milestone.count,
    pointReward: Number(milestone.pointReward) || 0,
    globalRadarLevel: milestone.globalRadarLevel || null,
    badge: milestone.badge || null
  };
}

function areaCatchMilestoneReward(areaId, milestone, threshold) {
  return {
    type: 'area-catch-milestone',
    id: areaMilestoneId(areaId, milestone.level),
    areaId,
    level: milestone.level,
    threshold,
    percent: milestone.percent,
    pointReward: Number(milestone.pointReward) || 0,
    notCaughtMultiplier: milestone.notCaughtMultiplier || null,
    rareBoostLevel: milestone.rareBoostLevel || null,
    badge: milestone.badge || null
  };
}

function normalizeOwnedText(value, maxLength = 80) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, maxLength);
}

function createOwnedPokemonId(now = Date.now()) {
  return `owned-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function encounterIdForAgent(agent) {
  if (!agent || !agent.agentId) {
    return null;
  }
  return [
    agent.provider || 'claude',
    agent.agentId,
    Number.isFinite(agent.createdAt) ? agent.createdAt : 0
  ].join(':');
}

function normalizeOwnedGrowthRate(growthRate = 1) {
  return Number.isFinite(Number(growthRate)) && Number(growthRate) > 0
    ? Number(growthRate)
    : 1;
}

function ownedMediumFastTotalExpForLevel(level) {
  const normalizedLevel = Math.max(1, Math.min(100, Number(level) || 1));
  if (normalizedLevel <= 1) {
    return 0;
  }
  return Math.round((Math.pow(normalizedLevel, 3) / OWNED_MEDIUM_FAST_LEVEL_100_EXP) * OWNED_LEVEL_100_EXP);
}

function ownedBaseExpToNextLevel(level) {
  const normalizedLevel = Math.max(1, Math.min(100, Math.floor(Number(level) || 1)));
  if (normalizedLevel >= 100) {
    return 0;
  }
  return Math.max(1, ownedMediumFastTotalExpForLevel(normalizedLevel + 1) - ownedMediumFastTotalExpForLevel(normalizedLevel));
}

function ownedExpToNextLevel(level, growthRate = 1) {
  const baseExp = ownedBaseExpToNextLevel(level);
  if (baseExp <= 0) {
    return 0;
  }
  return Math.max(1, Math.round(normalizeOwnedGrowthRate(growthRate) * baseExp));
}

function ownedLevelFromTotalExp(totalExp, growthRate = 1) {
  let remaining = Math.max(0, Math.floor(Number(totalExp) || 0));
  let level = 1;
  const normalizedGrowth = normalizeOwnedGrowthRate(growthRate);

  while (level < 100) {
    const needed = ownedExpToNextLevel(level, normalizedGrowth);
    if (remaining < needed) {
      break;
    }
    remaining -= needed;
    level += 1;
  }

  if (level >= 100) {
    return { level: 100, exp: 0 };
  }

  return { level, exp: remaining };
}

function normalizeOwnedPokemon(raw, fallbackNow = Date.now()) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const speciesId = clampPokemonId(raw.speciesId);
  if (!speciesId) {
    return null;
  }

  const growthRate = normalizeOwnedGrowthRate(raw.growthRate || 1);
  const totalTrainingExp = Math.max(0, Math.floor(Number(raw.totalTrainingExp) || 0));
  let level = Math.max(1, Math.min(100, Math.floor(Number(raw.level) || 1)));
  const nextNeeded = level >= 100 ? 0 : ownedExpToNextLevel(level, growthRate);
  let exp = level >= 100
    ? 0
    : Math.max(0, Math.min(nextNeeded, Math.floor(Number(raw.exp) || 0)));
  if (totalTrainingExp > 0) {
    const trainedLevel = ownedLevelFromTotalExp(totalTrainingExp, growthRate);
    level = trainedLevel.level;
    exp = trainedLevel.exp;
  }
  const partySlot = raw.partySlot !== null && raw.partySlot !== undefined && Number.isInteger(Number(raw.partySlot))
    ? Math.max(0, Math.min(PARTY_SIZE - 1, Number(raw.partySlot)))
    : null;

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createOwnedPokemonId(fallbackNow),
    speciesId,
    nickname: normalizeOwnedText(raw.nickname, 40),
    level,
    exp,
    totalTrainingExp,
    growthRate,
    sourceEncounterId: normalizeOwnedText(raw.sourceEncounterId, 240),
    sourceAgentId: normalizeOwnedText(raw.sourceAgentId, 240),
    sourceProjectId: normalizeOwnedText(raw.sourceProjectId, 240),
    sourceSessionId: normalizeOwnedText(raw.sourceSessionId, 240),
    assignedProjectId: normalizeOwnedText(raw.assignedProjectId, 240),
    partySlot,
    boxId: normalizeOwnedText(raw.boxId, 80) || DEFAULT_POKEMON_BOX_ID,
    evolutionHeld: !!raw.evolutionHeld,
    createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : fallbackNow,
    updatedAt: Number.isFinite(Number(raw.updatedAt)) ? Number(raw.updatedAt) : fallbackNow
  };
}

function normalizePokemonBox(raw, fallbackNow = Date.now()) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const id = normalizeOwnedText(raw.id, 80);
  if (!id) {
    return null;
  }
  return {
    id,
    name: normalizeOwnedText(raw.name, 60) || 'Pokemon Box',
    createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : fallbackNow
  };
}

function defaultPokemonBox(now = Date.now()) {
  return {
    id: DEFAULT_POKEMON_BOX_ID,
    name: 'Pokemon Box',
    createdAt: now
  };
}

function trainingEventId(now = Date.now()) {
  return `train-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneOwnedPokemon(pokemon) {
  return { ...pokemon };
}

class AgentState extends EventEmitter {
  constructor(options = {}) {
    super();
    this.activeTimeoutMs = (options.activeTimeoutSec || 60) * 1000;
    this.staleTimeoutMs = (options.staleTimeoutSec || 300) * 1000;
    this.sessionCloseTimeoutMs = (options.sessionCloseTimeoutSec || 60) * 1000;
    this.boxSubagentsImmediately = options.boxSubagentsImmediately !== false;
    this.ringSize = options.ringSize || DEFAULT_RING_SIZE;
    this.maxBoxedAgents = Math.max(1, options.maxBoxedAgents || DEFAULT_MAX_BOXED_AGENTS);
    this.maxSubagentHistory = Math.max(1, options.maxSubagentHistory || DEFAULT_MAX_SUBAGENT_HISTORY);
    this.maxTrainingEvents = Math.max(1, options.maxTrainingEvents || DEFAULT_MAX_TRAINING_EVENTS);
    this.resolvePokemonId = typeof options.resolvePokemonId === 'function' ? options.resolvePokemonId : null;
    this.explorationAreaId = normalizeAreaId(options.explorationAreaId);

    this.agents = new Map();
    this.boxedAgents = [];
    this.subagentHistory = [];
    this.ownedPokemon = [];
    this.pokemonBoxes = [defaultPokemonBox()];
    this.evolutionItems = normalizeEvolutionItemState(options.evolutionItems);
    this.projectTraining = {};
    this.trainingEvents = [];
    this.recentEvents = [];
    this.lastUpdate = 0;
    this.rateLimits = null;
    this.rateLimitsByProvider = {};
    this.seenPokemonIds = new Set();
    this.caughtPokemonIds = new Set();
    this.firstDiscoveryByPokemon = {};
    this.firstCatchByPokemon = {};
    this.claimedCatchMilestones = new Set();
    this.claimedAreaCatchMilestones = new Set();
    this.confirmedSessionIds = new Set(); // sessionIds confirmed alive via PID check
    this.suppressedSessions = new Set(); // sessionIds suppressed after hard-reset until USER_QUERY
  }

  ensureAssignedPokemon(agent, meta = {}, options = {}) {
    if (!agent || !agent.agentId || agent.parentId) {
      return;
    }

    const existing = clampPokemonId(agent.assignedPokemonId);
    if (existing) {
      agent.assignedPokemonId = existing;
      return;
    }

    const maxPokemonId = normalizePokemonCatalogMax(options.maxPokemonId) || POKEDEX_MAX;
    const inferredPokemonId = clampPokemonId(options.inferredPokemonId, maxPokemonId);
    if (inferredPokemonId) {
      agent.assignedPokemonId = inferredPokemonId;
      return;
    }

    let pokemonId = null;
    if (this.resolvePokemonId) {
      pokemonId = this.resolvePokemonId(agent.agentId, {
        agent,
        meta,
        areaId: this.explorationAreaId,
        ts: agent.createdAt || Date.now(),
        getAgentById: (id, lookupOptions = {}) => this.lookupAgentById(id, lookupOptions)
      });
    }

    agent.assignedPokemonId = clampPokemonId(pokemonId, maxPokemonId) ||
      getPokemonIdForAgent(agent.agentId, {
        areaId: this.explorationAreaId,
        maxPokemonId,
        ...this.spawnOptionsForArea(this.explorationAreaId)
      });
  }

  setExplorationArea(areaId) {
    const nextAreaId = normalizeAreaId(areaId);
    if (this.explorationAreaId === nextAreaId) {
      return { ok: true, areaId: this.explorationAreaId };
    }

    this.explorationAreaId = nextAreaId;
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return { ok: true, areaId: this.explorationAreaId };
  }

  trimHistoryBuffers() {
    if (this.boxedAgents.length > this.maxBoxedAgents) {
      this.boxedAgents.splice(0, this.boxedAgents.length - this.maxBoxedAgents);
    }
    if (this.subagentHistory.length > this.maxSubagentHistory) {
      this.subagentHistory.splice(0, this.subagentHistory.length - this.maxSubagentHistory);
    }
    if (this.trainingEvents.length > this.maxTrainingEvents) {
      this.trainingEvents.splice(0, this.trainingEvents.length - this.maxTrainingEvents);
    }
  }

  discoveryInfoForAgent(agentId, ts, meta = {}, agent = null) {
    const source = agent || {};
    const parentId = source.parentId || meta.parentId || null;
    const parentAgent = parentId
      ? this.lookupAgentById(parentId, { beforeTs: source.createdAt || ts })
      : null;
    return {
      agentId,
      agentName: source.displayName || meta.agentDescription || meta.sessionDisplayName || source.subagentType || meta.subagentType || agentId,
      provider: meta.provider || source.provider || 'claude',
      projectId: meta.projectId || source.projectId || 'unknown-project',
      sessionId: meta.sessionId || source.sessionId || 'unknown-session',
      createdAt: source.createdAt || ts,
      discoveredAt: ts,
      parentId,
      parentName: parentAgent ? (parentAgent.displayName || parentAgent.subagentType || parentAgent.agentId) : null,
      viaSubagent: !!parentId
    };
  }

  catchInfoForPokemon(speciesId, ts = Date.now(), context = {}) {
    const sourceAgent = context.sourceAgent || null;
    return {
      speciesId,
      source: context.source || 'recruit',
      agentId: sourceAgent ? sourceAgent.agentId : (context.agentId || null),
      agentName: sourceAgent ? (sourceAgent.displayName || sourceAgent.subagentType || sourceAgent.agentId) : (context.agentName || null),
      provider: context.provider || (sourceAgent && sourceAgent.provider) || 'recruit',
      projectId: context.projectId || (sourceAgent && sourceAgent.projectId) || null,
      sessionId: context.sessionId || (sourceAgent && sourceAgent.sessionId) || null,
      ownedPokemonId: context.ownedPokemonId || null,
      fromSpeciesId: clampPokemonId(context.fromSpeciesId),
      caughtAt: ts
    };
  }

  recordOwnedPokemonDiscovery(speciesId, context = {}) {
    const pokemonId = clampPokemonId(speciesId);
    if (!pokemonId || this.seenPokemonIds.has(pokemonId)) {
      return false;
    }

    const now = Number.isFinite(Number(context.now)) ? Number(context.now) : Date.now();
    const source = context.source === 'evolution'
      ? 'evolution'
      : (context.source === 'owned' ? 'owned' : (context.source === 'restore' ? 'restore' : 'recruit'));
    const sourceAgent = context.sourceAgent || null;
    const ownedPokemon = context.ownedPokemon || null;

    this.seenPokemonIds.add(pokemonId);
    this.firstDiscoveryByPokemon[pokemonId] = {
      agentId: sourceAgent ? sourceAgent.agentId : ((ownedPokemon && ownedPokemon.sourceAgentId) || context.agentId || null),
      agentName: context.agentName || (source === 'evolution'
        ? 'Evolution'
        : (source === 'owned' ? 'Owned Pokemon' : 'Recruit')),
      provider: context.provider || source,
      projectId: context.projectId || (sourceAgent
        ? sourceAgent.projectId
        : (ownedPokemon && (ownedPokemon.assignedProjectId || ownedPokemon.sourceProjectId)) || null),
      sessionId: context.sessionId || (sourceAgent ? sourceAgent.sessionId : (ownedPokemon && ownedPokemon.sourceSessionId) || null),
      createdAt: sourceAgent ? (sourceAgent.createdAt || now) : (ownedPokemon && ownedPokemon.createdAt) || now,
      discoveredAt: now,
      parentId: null,
      parentName: null,
      viaSubagent: false
    };
    return true;
  }

  ensureSeenForCaughtPokemon(speciesId, ts = Date.now(), context = {}) {
    return this.recordOwnedPokemonDiscovery(speciesId, { ...context, now: ts });
  }

  caughtCountByArea(areaId) {
    let count = 0;
    for (const pokemonId of this.caughtPokemonIds) {
      if (getPokemonAreaId(pokemonId) === areaId) {
        count += 1;
      }
    }
    return count;
  }

  globalRadarLevel() {
    let level = 0;
    for (const milestone of CATCH_MILESTONES) {
      if (milestone.globalRadarLevel && this.claimedCatchMilestones.has(milestone.id)) {
        level = Math.max(level, milestone.globalRadarLevel);
      }
    }
    return level;
  }

  areaCatchBonus(areaId) {
    const normalizedAreaId = normalizeAreaId(areaId);
    if (normalizedAreaId === 'all') {
      return { notCaughtMultiplier: 1, rareBoostLevel: 0 };
    }
    let notCaughtMultiplier = 1;
    let rareBoostLevel = 0;
    for (const milestone of AREA_CATCH_MILESTONES) {
      const key = areaMilestoneId(normalizedAreaId, milestone.level);
      if (!this.claimedAreaCatchMilestones.has(key)) {
        continue;
      }
      notCaughtMultiplier = Math.max(notCaughtMultiplier, Number(milestone.notCaughtMultiplier) || 1);
      rareBoostLevel = Math.max(rareBoostLevel, Number(milestone.rareBoostLevel) || 0);
    }
    return { notCaughtMultiplier, rareBoostLevel };
  }

  spawnOptionsForArea(areaId) {
    const normalizedAreaId = normalizeAreaId(areaId);
    if (normalizedAreaId === 'all') {
      const radarLevel = this.globalRadarLevel();
      const radarMultiplier = radarLevel >= 3 ? 2 : (radarLevel === 2 ? 1.5 : (radarLevel === 1 ? 1.25 : 1));
      return {
        caughtPokemonIds: this.caughtPokemonIds,
        notCaughtMultiplier: radarMultiplier,
        rareBoostLevel: 0
      };
    }
    const areaBonus = this.areaCatchBonus(normalizedAreaId);
    return {
      caughtPokemonIds: this.caughtPokemonIds,
      notCaughtMultiplier: areaBonus.notCaughtMultiplier,
      rareBoostLevel: areaBonus.rareBoostLevel
    };
  }

  catchMilestoneSnapshot(caughtCount = this.caughtPokemonIds.size) {
    return CATCH_MILESTONES.map((milestone) => ({
      ...milestone,
      reached: caughtCount >= milestone.count,
      claimed: this.claimedCatchMilestones.has(milestone.id),
      claimable: caughtCount >= milestone.count && !this.claimedCatchMilestones.has(milestone.id)
    }));
  }

  areaCatchProgressSnapshot() {
    const totals = getPokemonAreaTotals();
    return AREA_IDS.map((areaId) => {
      const totalCount = totals[areaId] || 0;
      const caughtCount = this.caughtCountByArea(areaId);
      return {
        areaId,
        caughtCount,
        totalCount,
        percent: totalCount > 0 ? caughtCount / totalCount : 0,
        milestones: AREA_CATCH_MILESTONES.map((milestone) => {
          const threshold = areaMilestoneThreshold(totalCount, milestone);
          const id = areaMilestoneId(areaId, milestone.level);
          return {
            ...milestone,
            id,
            threshold,
            reached: caughtCount >= threshold,
            claimed: this.claimedAreaCatchMilestones.has(id),
            claimable: caughtCount >= threshold && !this.claimedAreaCatchMilestones.has(id)
          };
        })
      };
    });
  }

  registerCaughtPokemon(speciesId, context = {}) {
    const pokemonId = clampPokemonId(speciesId);
    if (!pokemonId) {
      return { isNewCatch: false, rewards: [], totalPointReward: 0 };
    }
    const now = Date.now();
    const wasCaught = this.caughtPokemonIds.has(pokemonId);
    this.ensureSeenForCaughtPokemon(pokemonId, now, context);

    if (wasCaught) {
      return {
        isNewCatch: false,
        speciesId: pokemonId,
        rewards: [],
        totalPointReward: 0,
        caughtCount: this.caughtPokemonIds.size
      };
    }

    this.caughtPokemonIds.add(pokemonId);
    this.firstCatchByPokemon[pokemonId] = this.catchInfoForPokemon(pokemonId, now, context);

    const rewards = [];
    const firstCatchReward = firstCatchPointRewardForSpecies(pokemonId);
    if (firstCatchReward.pointReward > 0) {
      rewards.push({
        type: 'first-catch',
        speciesId: pokemonId,
        tier: firstCatchReward.tier,
        pointReward: firstCatchReward.pointReward
      });
    }

    const areaId = getPokemonAreaId(pokemonId);
    const totalPointReward = rewards.reduce((sum, reward) => sum + (Number(reward.pointReward) || 0), 0);
    if (totalPointReward > 0) {
      this.evolutionItems.itemPoints += totalPointReward;
    }

    this.emit('pokedex', this.pokedexSnapshot());
    return {
      isNewCatch: true,
      speciesId: pokemonId,
      areaId,
      rewards,
      totalPointReward,
      caughtCount: this.caughtPokemonIds.size,
      claimableRewardCount: this.claimablePokedexRewardCount()
    };
  }

  claimablePokedexRewardCount() {
    let count = 0;
    for (const milestone of this.catchMilestoneSnapshot()) {
      if (milestone.claimable) {
        count += 1;
      }
    }
    for (const areaProgress of this.areaCatchProgressSnapshot()) {
      for (const milestone of areaProgress.milestones || []) {
        if (milestone.claimable) {
          count += 1;
        }
      }
    }
    return count;
  }

  claimPokedexReward(rewardType, rewardId) {
    const type = normalizeOwnedText(rewardType, 20);
    if (type === 'catch') {
      return this.claimCatchMilestone(rewardId);
    }
    if (type === 'area') {
      return this.claimAreaCatchMilestone(rewardId);
    }
    return { ok: false, error: 'Unknown Pokedex reward type.' };
  }

  claimCatchMilestone(rewardId) {
    const id = normalizeOwnedText(rewardId, 80);
    const milestone = CATCH_MILESTONES.find((entry) => entry.id === id);
    if (!milestone) {
      return { ok: false, error: 'Unknown Pokedex reward.' };
    }
    if (this.claimedCatchMilestones.has(id)) {
      return { ok: false, error: 'Pokedex reward already claimed.' };
    }
    if (this.caughtPokemonIds.size < milestone.count) {
      return { ok: false, error: 'Pokedex reward is not ready.' };
    }

    this.claimedCatchMilestones.add(id);
    const reward = catchMilestoneReward(milestone);
    if (reward.pointReward > 0) {
      this.evolutionItems.itemPoints += reward.pointReward;
    }
    this.lastUpdate = Date.now();
    const pokedex = this.pokedexSnapshot();
    this.emit('pokedex', pokedex);
    this.emit('update', this.snapshot());
    return {
      ok: true,
      reward,
      itemPoints: this.evolutionItems.itemPoints,
      pokedex
    };
  }

  claimAreaCatchMilestone(rewardId) {
    const id = normalizeOwnedText(rewardId, 120);
    let selected = null;
    const totals = getPokemonAreaTotals();
    for (const areaId of AREA_IDS) {
      const totalCount = totals[areaId] || 0;
      const caughtCount = this.caughtCountByArea(areaId);
      for (const milestone of AREA_CATCH_MILESTONES) {
        const threshold = areaMilestoneThreshold(totalCount, milestone);
        const milestoneId = areaMilestoneId(areaId, milestone.level);
        if (milestoneId !== id) {
          continue;
        }
        selected = { areaId, milestone, threshold, caughtCount };
        break;
      }
      if (selected) {
        break;
      }
    }

    if (!selected) {
      return { ok: false, error: 'Unknown Pokedex reward.' };
    }
    if (this.claimedAreaCatchMilestones.has(id)) {
      return { ok: false, error: 'Pokedex reward already claimed.' };
    }
    if (selected.caughtCount < selected.threshold) {
      return { ok: false, error: 'Pokedex reward is not ready.' };
    }

    this.claimedAreaCatchMilestones.add(id);
    const reward = areaCatchMilestoneReward(selected.areaId, selected.milestone, selected.threshold);
    if (reward.pointReward > 0) {
      this.evolutionItems.itemPoints += reward.pointReward;
    }
    this.lastUpdate = Date.now();
    const pokedex = this.pokedexSnapshot();
    this.emit('pokedex', pokedex);
    this.emit('update', this.snapshot());
    return {
      ok: true,
      reward,
      itemPoints: this.evolutionItems.itemPoints,
      pokedex
    };
  }

  refreshSeenPokemonFromOwned(options = {}) {
    let changed = false;
    const now = Date.now();
    for (const pokemon of this.ownedPokemon) {
      changed = this.recordOwnedPokemonDiscovery(pokemon && pokemon.speciesId, {
        source: 'owned',
        ownedPokemon: pokemon,
        now: pokemon && pokemon.createdAt ? pokemon.createdAt : now
      }) || changed;
    }
    if (changed && options.emit !== false) {
      this.emit('pokedex', this.pokedexSnapshot());
    }
    return changed;
  }

  recordSeenPokemon(agentId, ts = Date.now(), meta = {}, agent = null) {
    if (!this.resolvePokemonId || !agentId) {
      return false;
    }

    const pokemonId = this.resolvePokemonId(agentId, {
      ts,
      meta,
      agent,
      getAgentById: (id, lookupOptions = {}) => this.lookupAgentById(id, lookupOptions)
    });
    if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > POKEDEX_MAX) {
      return false;
    }

    if (this.seenPokemonIds.has(pokemonId)) {
      return false;
    }

    this.seenPokemonIds.add(pokemonId);
    this.firstDiscoveryByPokemon[pokemonId] = this.discoveryInfoForAgent(agentId, ts, meta, agent);
    this.emit('pokedex', this.pokedexSnapshot());
    return true;
  }

  mergeSeenPokemonIds(ids, firstDiscoveryByPokemon = null) {
    let changed = false;
    const seenIds = Array.isArray(ids) ? ids : [];
    for (const rawId of seenIds) {
      const pokemonId = Number(rawId);
      if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > POKEDEX_MAX || this.seenPokemonIds.has(pokemonId)) {
        continue;
      }
      this.seenPokemonIds.add(pokemonId);
      if (firstDiscoveryByPokemon && firstDiscoveryByPokemon[pokemonId]) {
        this.firstDiscoveryByPokemon[pokemonId] = { ...firstDiscoveryByPokemon[pokemonId] };
      }
      changed = true;
    }

    if (changed) {
      this.emit('pokedex', this.pokedexSnapshot());
    }
    return changed;
  }

  mergeCaughtPokemonIds(ids, firstCatchByPokemon = null, options = {}) {
    let changed = false;
    const source = options.source || 'restore';
    const provider = options.provider || source;
    for (const pokemonId of normalizePokemonIdList(ids)) {
      if (this.caughtPokemonIds.has(pokemonId)) {
        continue;
      }
      this.caughtPokemonIds.add(pokemonId);
      this.ensureSeenForCaughtPokemon(pokemonId, Date.now(), { source, provider });
      if (firstCatchByPokemon && firstCatchByPokemon[pokemonId]) {
        this.firstCatchByPokemon[pokemonId] = { ...firstCatchByPokemon[pokemonId] };
      } else if (!this.firstCatchByPokemon[pokemonId]) {
        this.firstCatchByPokemon[pokemonId] = this.catchInfoForPokemon(pokemonId, Date.now(), { source, provider });
      }
      changed = true;
    }

    if (options.claimLegacyMilestones) {
      this.claimEligibleCatchMilestones();
    }

    if (changed) {
      this.emit('pokedex', this.pokedexSnapshot());
    }
    return changed;
  }

  claimEligibleCatchMilestones() {
    const caughtCount = this.caughtPokemonIds.size;
    for (const milestone of CATCH_MILESTONES) {
      if (caughtCount >= milestone.count) {
        this.claimedCatchMilestones.add(milestone.id);
      }
    }
    const totals = getPokemonAreaTotals();
    for (const areaId of AREA_IDS) {
      const areaCaughtCount = this.caughtCountByArea(areaId);
      const totalCount = totals[areaId] || 0;
      for (const milestone of AREA_CATCH_MILESTONES) {
        if (areaCaughtCount >= areaMilestoneThreshold(totalCount, milestone)) {
          this.claimedAreaCatchMilestones.add(areaMilestoneId(areaId, milestone.level));
        }
      }
    }
  }

  refreshSeenPokemonFromAgents(options = {}) {
    let changed = false;
    const allowNewDiscoveries = options.allowNewDiscoveries !== false;

    for (const agent of this.agents.values()) {
      const pokemonId = this.resolvePokemonId ? this.resolvePokemonId(agent.agentId, {
        agent,
        getAgentById: (id, lookupOptions = {}) => this.lookupAgentById(id, lookupOptions)
      }) : null;
      if (pokemonId && this.seenPokemonIds.has(pokemonId) && !this.firstDiscoveryByPokemon[pokemonId]) {
        this.firstDiscoveryByPokemon[pokemonId] = this.discoveryInfoForAgent(agent.agentId, agent.createdAt || Date.now(), {}, agent);
        changed = true;
        continue;
      }
      if (allowNewDiscoveries) {
        changed = this.recordSeenPokemon(agent.agentId, agent.createdAt || Date.now(), {}, agent) || changed;
      }
    }
    for (const agent of this.boxedAgents) {
      const pokemonId = this.resolvePokemonId ? this.resolvePokemonId(agent.agentId, {
        agent,
        getAgentById: (id, lookupOptions = {}) => this.lookupAgentById(id, lookupOptions)
      }) : null;
      if (pokemonId && this.seenPokemonIds.has(pokemonId) && !this.firstDiscoveryByPokemon[pokemonId]) {
        this.firstDiscoveryByPokemon[pokemonId] = this.discoveryInfoForAgent(agent.agentId, agent.createdAt || Date.now(), {}, agent);
        changed = true;
        continue;
      }
      if (allowNewDiscoveries) {
        changed = this.recordSeenPokemon(agent.agentId, agent.createdAt || Date.now(), {}, agent) || changed;
      }
    }

    for (const agent of this.subagentHistory) {
      const pokemonId = this.resolvePokemonId ? this.resolvePokemonId(agent.agentId, {
        agent,
        getAgentById: (id, lookupOptions = {}) => this.lookupAgentById(id, lookupOptions)
      }) : null;
      if (pokemonId && this.seenPokemonIds.has(pokemonId) && !this.firstDiscoveryByPokemon[pokemonId]) {
        this.firstDiscoveryByPokemon[pokemonId] = this.discoveryInfoForAgent(agent.agentId, agent.createdAt || Date.now(), {}, agent);
        changed = true;
        continue;
      }
      if (allowNewDiscoveries) {
        changed = this.recordSeenPokemon(agent.agentId, agent.createdAt || Date.now(), {}, agent) || changed;
      }
    }

    return changed;
  }

  lookupAgentById(agentId, options = {}) {
    if (!agentId) {
      return null;
    }

    const candidates = [];
    const live = this.agents.get(agentId);
    if (live) {
      candidates.push(live);
    }

    for (let i = this.boxedAgents.length - 1; i >= 0; i -= 1) {
      if (this.boxedAgents[i] && this.boxedAgents[i].agentId === agentId) {
        candidates.push(this.boxedAgents[i]);
      }
    }

    for (let i = this.subagentHistory.length - 1; i >= 0; i -= 1) {
      if (this.subagentHistory[i] && this.subagentHistory[i].agentId === agentId) {
        candidates.push(this.subagentHistory[i]);
      }
    }

    return pickBestAgentRecord(candidates, options.beforeTs);
  }

  pokedexSnapshot() {
    const seenPokemonIds = Array.from(this.seenPokemonIds).sort((a, b) => a - b);
    const caughtPokemonIds = Array.from(this.caughtPokemonIds).sort((a, b) => a - b);
    const firstDiscoveryByPokemon = {};
    for (const pokemonId of seenPokemonIds) {
      if (this.firstDiscoveryByPokemon[pokemonId]) {
        firstDiscoveryByPokemon[pokemonId] = { ...this.firstDiscoveryByPokemon[pokemonId] };
      }
    }
    const firstCatchByPokemon = {};
    for (const pokemonId of caughtPokemonIds) {
      if (this.firstCatchByPokemon[pokemonId]) {
        firstCatchByPokemon[pokemonId] = { ...this.firstCatchByPokemon[pokemonId] };
      }
    }
    return {
      seenPokemonIds,
      caughtPokemonIds,
      firstDiscoveryByPokemon,
      firstCatchByPokemon,
      seenCount: seenPokemonIds.length,
      caughtCount: caughtPokemonIds.length,
      discoveredCount: seenPokemonIds.length,
      totalCount: POKEDEX_MAX - POKEDEX_MIN + 1,
      catchMilestones: this.catchMilestoneSnapshot(caughtPokemonIds.length),
      areaCatchProgress: this.areaCatchProgressSnapshot(),
      globalRadarLevel: this.globalRadarLevel(),
      claimableRewardCount: this.claimablePokedexRewardCount()
    };
  }

  getPokemonIdForAgentRecord(agent) {
    if (!this.resolvePokemonId || !agent || !agent.agentId) {
      return null;
    }

    const pokemonId = this.resolvePokemonId(agent.agentId, {
      agent,
      getAgentById: (id, lookupOptions = {}) => this.lookupAgentById(id, lookupOptions),
      ts: agent.createdAt || Date.now()
    });
    return clampPokemonId(pokemonId);
  }

  ownedPokemonById(id) {
    return this.ownedPokemon.find((pokemon) => pokemon && pokemon.id === id) || null;
  }

  hasOwnedPokemonSpecies(speciesId, options = {}) {
    const normalizedId = clampPokemonId(speciesId);
    if (!normalizedId) {
      return false;
    }
    const excludeId = normalizeOwnedText(options.excludeId, 120);
    return this.ownedPokemon.some((pokemon) => (
      pokemon &&
      pokemon.speciesId === normalizedId &&
      (!excludeId || pokemon.id !== excludeId)
    ));
  }

  partyPokemon() {
    return this.ownedPokemon
      .filter((pokemon) => Number.isInteger(pokemon.partySlot))
      .sort((a, b) => a.partySlot - b.partySlot);
  }

  rebuildProjectTraining() {
    const next = {};
    for (const pokemon of this.ownedPokemon) {
      const projectId = normalizeOwnedText(pokemon.assignedProjectId, 240);
      pokemon.assignedProjectId = projectId || null;
      if (!projectId) {
        continue;
      }
      if (!next[projectId]) {
        next[projectId] = [];
      }
      next[projectId].push(pokemon.id);
    }
    this.projectTraining = next;
  }

  firstOpenPartySlot() {
    const used = new Set(this.partyPokemon().map((pokemon) => pokemon.partySlot));
    for (let slot = 0; slot < PARTY_SIZE; slot += 1) {
      if (!used.has(slot)) {
        return slot;
      }
    }
    return null;
  }

  compactPartySlots() {
    this.partyPokemon().forEach((pokemon, index) => {
      pokemon.partySlot = index < PARTY_SIZE ? index : null;
    });
  }

  recruitCostForSpecies(speciesId) {
    const normalizedId = clampPokemonId(speciesId);
    if (!normalizedId) {
      return null;
    }
    const caught = this.hasOwnedPokemonSpecies(normalizedId);
    return recruitPointCostForSpecies(normalizedId, this.seenPokemonIds.has(normalizedId), caught);
  }

  adoptOwnedPokemon(options = {}) {
    const now = Date.now();
    const rawAgentId = normalizeOwnedText(options.agentId, 240);
    let sourceAgent = rawAgentId ? this.lookupAgentById(rawAgentId) : null;
    let speciesId = null;

    if (sourceAgent) {
      speciesId = this.getPokemonIdForAgentRecord(sourceAgent);
    } else {
      speciesId = clampPokemonId(options.speciesId);
    }

    if (!speciesId) {
      return { ok: false, error: 'Unknown Pokemon.' };
    }

    const wasCaught = this.hasOwnedPokemonSpecies(speciesId);
    const wasDiscovered = this.seenPokemonIds.has(speciesId);
    const recruitCost = recruitPointCostForSpecies(speciesId, wasDiscovered, wasCaught);
    if (this.evolutionItems.itemPoints < recruitCost.pointCost) {
      return {
        ok: false,
        error: 'Not enough item points.',
        recruitCost
      };
    }
    this.evolutionItems.itemPoints -= recruitCost.pointCost;

    const shouldJoinParty = options.inParty !== false && options.boxOnly !== true && options.toBox !== true;
    const openSlot = shouldJoinParty ? this.firstOpenPartySlot() : null;
    const owned = normalizeOwnedPokemon({
      id: createOwnedPokemonId(now),
      speciesId,
      nickname: normalizeOwnedText(options.nickname, 40),
      level: 1,
      exp: 0,
      totalTrainingExp: 0,
      sourceEncounterId: sourceAgent ? encounterIdForAgent(sourceAgent) : null,
      sourceAgentId: sourceAgent ? sourceAgent.agentId : null,
      sourceProjectId: sourceAgent ? sourceAgent.projectId : null,
      sourceSessionId: sourceAgent ? sourceAgent.sessionId : null,
      partySlot: openSlot,
      boxId: DEFAULT_POKEMON_BOX_ID,
      createdAt: now,
      updatedAt: now
    }, now);

    this.ownedPokemon.push(owned);
    const catchRewards = this.registerCaughtPokemon(speciesId, {
      source: 'recruit',
      provider: 'recruit',
      sourceAgent,
      ownedPokemonId: owned.id,
      projectId: sourceAgent ? sourceAgent.projectId : null,
      sessionId: sourceAgent ? sourceAgent.sessionId : null,
      agentId: sourceAgent ? sourceAgent.agentId : null,
      agentName: sourceAgent ? (sourceAgent.displayName || sourceAgent.subagentType || sourceAgent.agentId) : 'Recruit'
    });
    this.compactPartySlots();
    this.ensurePokemonBoxes();
    this.lastUpdate = now;
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(owned), recruitCost, catchRewards };
  }

  ensurePokemonBoxes() {
    if (!Array.isArray(this.pokemonBoxes) || this.pokemonBoxes.length === 0) {
      this.pokemonBoxes = [defaultPokemonBox()];
      return;
    }

    if (!this.pokemonBoxes.some((box) => box.id === DEFAULT_POKEMON_BOX_ID)) {
      this.pokemonBoxes.unshift(defaultPokemonBox());
    }
  }

  setOwnedPokemonNickname(id, nickname) {
    const pokemon = this.ownedPokemonById(id);
    if (!pokemon) {
      return { ok: false, error: 'Owned Pokemon not found.' };
    }
    pokemon.nickname = normalizeOwnedText(nickname, 40);
    pokemon.updatedAt = Date.now();
    this.lastUpdate = pokemon.updatedAt;
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(pokemon) };
  }

  setOwnedPokemonParty(id, slot = null) {
    const pokemon = this.ownedPokemonById(id);
    if (!pokemon) {
      return { ok: false, error: 'Owned Pokemon not found.' };
    }

    let nextSlot = slot;
    if (nextSlot === null || nextSlot === undefined || nextSlot === '') {
      nextSlot = this.firstOpenPartySlot();
      if (nextSlot === null && !Number.isInteger(pokemon.partySlot)) {
        return { ok: false, error: 'Party is full.' };
      }
      if (nextSlot === null) {
        nextSlot = pokemon.partySlot;
      }
    }

    nextSlot = Number(nextSlot);
    if (!Number.isInteger(nextSlot) || nextSlot < 0 || nextSlot >= PARTY_SIZE) {
      return { ok: false, error: 'Invalid party slot.' };
    }

    const now = Date.now();
    const party = this.partyPokemon().filter((candidate) => candidate.id !== pokemon.id);
    if (party.length >= PARTY_SIZE && !Number.isInteger(pokemon.partySlot)) {
      return { ok: false, error: 'Party is full.' };
    }
    const insertAt = Math.max(0, Math.min(nextSlot, party.length));
    party.splice(insertAt, 0, pokemon);
    party.forEach((candidate, index) => {
      candidate.partySlot = index < PARTY_SIZE ? index : null;
      candidate.updatedAt = now;
      candidate.boxId = DEFAULT_POKEMON_BOX_ID;
    });

    this.compactPartySlots();
    this.lastUpdate = now;
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(pokemon) };
  }

  removeOwnedPokemonFromParty(id) {
    const pokemon = this.ownedPokemonById(id);
    if (!pokemon) {
      return { ok: false, error: 'Owned Pokemon not found.' };
    }
    pokemon.partySlot = null;
    pokemon.boxId = DEFAULT_POKEMON_BOX_ID;
    pokemon.updatedAt = Date.now();
    this.compactPartySlots();
    this.lastUpdate = pokemon.updatedAt;
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(pokemon) };
  }

  releaseOwnedPokemon(id) {
    const index = this.ownedPokemon.findIndex((pokemon) => pokemon && pokemon.id === id);
    if (index < 0) {
      return { ok: false, error: 'Owned Pokemon not found.' };
    }

    const [released] = this.ownedPokemon.splice(index, 1);
    this.rebuildProjectTraining();
    this.trainingEvents = this.trainingEvents.filter((event) => event.ownedPokemonId !== released.id);
    this.compactPartySlots();
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(released) };
  }

  assignProjectTraining(id, projectId) {
    const pokemon = this.ownedPokemonById(id);
    if (!pokemon) {
      return { ok: false, error: 'Owned Pokemon not found.' };
    }

    const normalizedProjectId = normalizeOwnedText(projectId, 240);
    pokemon.assignedProjectId = normalizedProjectId || null;
    pokemon.updatedAt = Date.now();
    this.rebuildProjectTraining();
    this.lastUpdate = pokemon.updatedAt;
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(pokemon) };
  }

  setOwnedPokemonEvolutionHold(id, held) {
    const pokemon = this.ownedPokemonById(id);
    if (!pokemon) {
      return { ok: false, error: 'Owned Pokemon not found.' };
    }
    pokemon.evolutionHeld = !!held;
    pokemon.updatedAt = Date.now();
    this.lastUpdate = pokemon.updatedAt;
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(pokemon) };
  }

  evolutionOptionsForPokemon(pokemon) {
    if (!pokemon) {
      return [];
    }
    return evolutionOptionsForSpecies(pokemon.speciesId).map((option) => {
      const method = option.method === 'item' ? 'item' : 'level';
      const itemId = method === 'item' && isEvolutionItemId(option.itemId) ? option.itemId : null;
      const requiredLevel = method === 'level' ? Math.max(1, Math.min(100, Number(option.requiredLevel) || 1)) : null;
      const hasItem = !itemId || (this.evolutionItems.inventory[itemId] || 0) > 0;
      const levelReady = !requiredLevel || pokemon.level >= requiredLevel;
      return {
        nextSpeciesId: option.toSpeciesId,
        method,
        requiredLevel,
        itemId,
        itemNameKo: itemId ? itemNameKo(itemId) : null,
        source: option.source || null,
        canEvolve: !pokemon.evolutionHeld && levelReady && hasItem,
        hasItem,
        levelReady
      };
    });
  }

  evolutionRequirementForPokemon(pokemon) {
    const options = this.evolutionOptionsForPokemon(pokemon);
    if (options.length === 0) {
      return null;
    }
    const ready = options.find((option) => option.canEvolve) || null;
    const primary = ready || options[0];
    return {
      nextSpeciesId: primary.nextSpeciesId,
      method: primary.method,
      requiredLevel: primary.requiredLevel,
      itemId: primary.itemId,
      itemNameKo: primary.itemNameKo,
      source: primary.source,
      canEvolve: !!ready,
      candidateCount: options.length,
      options
    };
  }

  evolveOwnedPokemon(id, options = {}) {
    const pokemon = this.ownedPokemonById(id);
    if (!pokemon) {
      return { ok: false, error: 'Owned Pokemon not found.' };
    }

    const candidates = this.evolutionOptionsForPokemon(pokemon);
    if (candidates.length === 0) {
      return { ok: false, error: 'Evolution requirements are not met.' };
    }
    if (pokemon.evolutionHeld) {
      return { ok: false, error: 'Evolution is currently held.' };
    }

    const targetSpeciesId = clampPokemonId(options.targetSpeciesId || options.nextSpeciesId);
    const readyCandidates = candidates.filter((candidate) => candidate.canEvolve);
    let selected = null;
    if (targetSpeciesId) {
      selected = candidates.find((candidate) => candidate.nextSpeciesId === targetSpeciesId) || null;
    } else if (candidates.length === 1) {
      selected = candidates[0];
    } else if (readyCandidates.length === 1) {
      selected = readyCandidates[0];
    } else {
      return { ok: false, error: 'Evolution target must be selected.', candidates };
    }

    if (!selected || !selected.canEvolve) {
      return { ok: false, error: 'Evolution requirements are not met.', candidates };
    }

    if (selected.itemId && !removeInventoryItem(this.evolutionItems, selected.itemId, 1)) {
      return { ok: false, error: 'Required evolution item is missing.', candidates };
    }

    const fromSpeciesId = pokemon.speciesId;
    pokemon.speciesId = selected.nextSpeciesId;
    pokemon.evolutionHeld = false;
    pokemon.updatedAt = Date.now();
    const catchRewards = this.registerCaughtPokemon(pokemon.speciesId, {
      source: 'evolution',
      provider: 'evolution',
      ownedPokemonId: pokemon.id,
      fromSpeciesId,
      projectId: pokemon.sourceProjectId || pokemon.assignedProjectId || null,
      sessionId: pokemon.sourceSessionId || null,
      agentId: pokemon.sourceAgentId || null,
      agentName: 'Evolution'
    });
    this.lastUpdate = pokemon.updatedAt;
    this.emit('update', this.snapshot());
    return { ok: true, pokemon: cloneOwnedPokemon(pokemon), catchRewards };
  }

  setEvolutionPickupItem(itemId) {
    if (itemId === null || itemId === undefined || itemId === '') {
      this.evolutionItems.pickupItemId = null;
    } else if (isEvolutionItemId(itemId)) {
      this.evolutionItems.pickupItemId = itemId;
    } else {
      return { ok: false, error: 'Unknown evolution item.' };
    }
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return { ok: true, evolutionItems: evolutionItemSnapshot(this.evolutionItems) };
  }

  addEvolutionItem(itemId, count = 1) {
    if (!addInventoryItem(this.evolutionItems, itemId, count)) {
      return { ok: false, error: 'Unknown evolution item.' };
    }
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return { ok: true, evolutionItems: evolutionItemSnapshot(this.evolutionItems) };
  }

  pullEvolutionItem(options = {}) {
    const result = pullEvolutionItem(this.evolutionItems, options);
    if (!result.ok) {
      return result;
    }
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return { ...result, evolutionItems: evolutionItemSnapshot(this.evolutionItems) };
  }

  buyEvolutionItem(itemId, currency = 'points') {
    const result = buyEvolutionItem(this.evolutionItems, itemId, currency);
    if (!result.ok) {
      return result;
    }
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return { ...result, evolutionItems: evolutionItemSnapshot(this.evolutionItems) };
  }

  sellEvolutionItem(itemId) {
    const result = sellEvolutionItem(this.evolutionItems, itemId);
    if (!result.ok) {
      return result;
    }
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return { ...result, evolutionItems: evolutionItemSnapshot(this.evolutionItems) };
  }

  addOwnedExperience(id, amount, context = {}) {
    const pokemon = this.ownedPokemonById(id);
    const expAmount = Math.floor(Number(amount) || 0);
    if (!pokemon || expAmount <= 0) {
      return null;
    }

    pokemon.totalTrainingExp = (pokemon.totalTrainingExp || 0) + expAmount;
    pokemon.exp = (pokemon.exp || 0) + expAmount;

    while (pokemon.level < 100) {
      const needed = ownedExpToNextLevel(pokemon.level, pokemon.growthRate || 1);
      if (pokemon.exp < needed) {
        break;
      }
      pokemon.exp -= needed;
      pokemon.level += 1;
    }

    if (pokemon.level >= 100) {
      pokemon.level = 100;
      pokemon.exp = 0;
    }

    pokemon.updatedAt = Date.now();
    if (context.record !== false) {
      this.trainingEvents.push({
        id: trainingEventId(pokemon.updatedAt),
        ownedPokemonId: pokemon.id,
        projectId: context.projectId || null,
        agentId: context.agentId || null,
        sessionId: context.sessionId || null,
        exp: expAmount,
        sourceTokens: Math.max(0, Math.floor(Number(context.sourceTokens) || 0)),
        reason: context.reason || 'usage',
        createdAt: pokemon.updatedAt
      });
      this.trimHistoryBuffers();
    }

    return pokemon;
  }

  distributeTrainingExperience(agent, tokenDelta) {
    if (!agent || !agent.projectId) {
      return false;
    }

    const baseExp = Math.floor((Number(tokenDelta) || 0) / TRAINING_TOKEN_DIVISOR);
    const trainablePokemon = this.partyPokemon();
    if (baseExp <= 0 || trainablePokemon.length === 0) {
      return false;
    }

    const weights = new Map();
    const addWeight = (id, weight) => {
      if (!id || weight <= 0 || !this.ownedPokemonById(id)) return;
      weights.set(id, (weights.get(id) || 0) + weight);
    };

    for (const pokemon of trainablePokemon) {
      if (pokemon.assignedProjectId === agent.projectId) {
        addWeight(pokemon.id, 5);
      } else if (!pokemon.assignedProjectId) {
        addWeight(pokemon.id, 1);
      }
    }

    if (weights.size === 0) {
      return false;
    }

    const totalWeight = Array.from(weights.values()).reduce((sum, weight) => sum + weight, 0);
    const allocations = Array.from(weights.entries()).map(([id, weight]) => {
      const raw = baseExp * (weight / totalWeight);
      return {
        id,
        exp: Math.floor(raw),
        fraction: raw - Math.floor(raw)
      };
    });

    let remaining = baseExp - allocations.reduce((sum, item) => sum + item.exp, 0);
    allocations
      .slice()
      .sort((a, b) => b.fraction - a.fraction)
      .forEach((item) => {
        if (remaining <= 0) return;
        item.exp += 1;
        remaining -= 1;
      });

    let changed = false;
    for (const allocation of allocations) {
      if (allocation.exp <= 0) continue;
      const updated = this.addOwnedExperience(allocation.id, allocation.exp, {
        projectId: agent.projectId,
        agentId: agent.agentId,
        sessionId: agent.sessionId,
        sourceTokens: tokenDelta,
        reason: 'usage-share'
      });
      changed = !!updated || changed;
    }

    if (changed) {
      this.lastUpdate = Date.now();
    }
    return changed;
  }

  ownedPokemonSnapshot() {
    return this.ownedPokemon
      .map((pokemon) => {
        const requirement = this.evolutionRequirementForPokemon(pokemon);
        return {
          ...cloneOwnedPokemon(pokemon),
          expToNextLevel: pokemon.level >= 100 ? 0 : ownedExpToNextLevel(pokemon.level, pokemon.growthRate || 1),
          evolution: requirement
        };
      })
      .sort((a, b) => {
        const aSlot = Number.isInteger(a.partySlot) ? a.partySlot : 99;
        const bSlot = Number.isInteger(b.partySlot) ? b.partySlot : 99;
        if (aSlot !== bSlot) return aSlot - bSlot;
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
  }

  upsertAgent(agentId, ts, meta = {}) {
    let created = false;
    let agent = this.agents.get(agentId);

    if (!agent) {
      created = true;
      agent = {
        agentId,
        name: agentId,
        displayName: null,
        subagentType: null,
        assignedPokemonId: clampPokemonId(meta.assignedPokemonId),
        provider: meta.provider || 'claude',
        projectId: meta.projectId || 'unknown-project',
        sessionId: meta.sessionId || 'unknown-session',
        parentId: meta.parentId && meta.parentId !== agentId ? meta.parentId : undefined,
        childrenIds: new Set(),
        lifecycle: LIFECYCLE.ACTIVE,
        status: STATUS.THINKING,
        activity: 'Seen',
        lastTool: null,
        lastCommand: null,
        lastUserQuery: null,
        lastSeen: ts,
        createdAt: ts,
        contextUsed: meta.contextUsed || 0,
        contextMax: meta.contextMax || 200000,
        model: meta.model || null,
        selfTokens: 0,
        totalTokens: 0,
        counters: cloneCounters(DEFAULT_COUNTERS)
      };
      this.agents.set(agentId, agent);
    }

    agent.lastSeen = Math.max(agent.lastSeen || 0, ts);
    if (meta.projectId && (!isFallbackProjectId(meta.projectId) || isFallbackProjectId(agent.projectId) || agent.projectId === 'unknown-project')) {
      agent.projectId = meta.projectId;
    }
    if (meta.provider) {
      agent.provider = meta.provider;
    }
    if (meta.sessionId) {
      agent.sessionId = meta.sessionId;
    }
    if (meta.parentId && meta.parentId !== agentId) {
      agent.parentId = meta.parentId;
    }
    if (!agent.parentId) {
      const assignedPokemonId = clampPokemonId(meta.assignedPokemonId);
      if (assignedPokemonId) {
        agent.assignedPokemonId = assignedPokemonId;
      }
      this.ensureAssignedPokemon(agent, meta);
    }
    if (typeof meta.contextUsed === 'number') {
      agent.contextUsed = meta.contextUsed;
    }
    if (typeof meta.contextMax === 'number') {
      // Always adopt the parser-reported value (sourced from Claude Code statusline)
      agent.contextMax = meta.contextMax;
    }
    if (meta.model && typeof meta.model === 'string' && !agent.model) {
      agent.model = meta.model;
    }

    if (agent.parentId) {
      const parent = this.agents.get(agent.parentId);
      if (parent) {
        parent.childrenIds.add(agent.agentId);
      }
    }

    return { agent, created };
  }

  addTokenUsage(agentId, tokens, rewardTokens, options = {}) {
    const amount = Number(tokens);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    agent.selfTokens = (agent.selfTokens || 0) + amount;
    const replay = options.replay === true;
    const trainingChanged = replay ? false : this.distributeTrainingExperience(agent, amount);
    const pointGain = replay ? 0 : addEffectiveRewardTokens(this.evolutionItems, Math.floor(amount));

    let current = agent;
    let guard = 0;
    while (current && guard < 32) {
      current.totalTokens = (current.totalTokens || 0) + amount;
      if (!current.parentId) {
        break;
      }
      current = this.agents.get(current.parentId) || null;
      guard += 1;
    }

    if (trainingChanged || pointGain > 0) {
      this.emit('update', this.snapshot());
    }
  }

  pushRecentEvent(event) {
    this.recentEvents.push(event);
    if (this.recentEvents.length > this.ringSize) {
      this.recentEvents.splice(0, this.recentEvents.length - this.ringSize);
    }
  }

  ensureParentLink(parentId, childId, ts, meta = {}) {
    if (!parentId || parentId === childId) {
      return null;
    }

    const parentMeta = {
      projectId: meta.projectId,
      sessionId: meta.sessionId
    };
    const parent = this.agents.get(parentId) || this.upsertAgent(parentId, ts, parentMeta).agent;
    parent.childrenIds.add(childId);
    return parent;
  }

  applyEvent(event) {
    if (!event || !event.agentId || !event.type) {
      return;
    }

    const ts = typeof event.ts === 'number' ? event.ts : Date.now();
    const meta = event.meta || {};
    const replay = meta.replay === true;
    if (meta.rateLimits) {
      const provider = normalizeProvider(meta.provider);
      this.rateLimits = meta.rateLimits;
      this.rateLimitsByProvider[provider] = meta.rateLimits;
    }

    // Suppress sessions that were active before a hard reset / startup cleanup.
    // Only unsuppress on USER_QUERY that is genuinely new (timestamp > boxed doneAt).
    if (this.suppressedSessions.size > 0) {
      const sid = meta.sessionId;
      if (sid && this.suppressedSessions.has(sid)) {
        if (event.type !== EVENT_TYPES.USER_QUERY) {
          return;
        }
        // Check if this USER_QUERY is older than the boxing timestamp.
        // Initial tail reads replay historical events that should not unsuppress.
        const boxedEntry = newestBoxedEntryBySession(this.boxedAgents, sid);
        if (boxedEntry && boxedEntry.doneAt && ts <= boxedEntry.doneAt) {
          return; // historical USER_QUERY from before boxing — keep suppressed
        }
        if (replay && !(boxedEntry && boxedEntry.doneAt && ts > boxedEntry.doneAt)) {
          return;
        }
        this.suppressedSessions.delete(sid);
        // Fall through: a genuinely new USER_QUERY spawns or unboxes the agent.
      }
    }

    // Auto-unbox: a BOXED agent only returns to the panel on a genuinely new
    // USER_QUERY (timestamp after boxing time).  This applies uniformly to both
    // manually and automatically boxed agents — lifecycle is the single source
    // of truth for whether the agent should stay in the box.
    if (!this.agents.has(event.agentId)) {
      const boxIdx = this.boxedAgents.findIndex((b) => b.agentId === event.agentId);
      if (boxIdx >= 0) {
        const boxed = this.boxedAgents[boxIdx];
        if (boxed.lifecycle === LIFECYCLE.BOXED) {
          if (event.type !== EVENT_TYPES.USER_QUERY) return;
          if (boxed.doneAt && ts <= boxed.doneAt) return;
          if (replay && !boxed.doneAt) return;
        }
        this.boxedAgents.splice(boxIdx, 1);
        this.agents.set(event.agentId, {
          agentId: boxed.agentId,
          name: boxed.agentId,
          displayName: boxed.displayName || null,
          subagentType: boxed.subagentType || null,
          assignedPokemonId: clampPokemonId(boxed.assignedPokemonId),
          provider: boxed.provider || 'claude',
          projectId: boxed.projectId,
          sessionId: boxed.sessionId,
          parentId: undefined,
          childrenIds: new Set(),
          lifecycle: LIFECYCLE.ACTIVE,
          status: STATUS.THINKING,
          activity: 'Resumed',
          lastTool: null,
          lastCommand: boxed.lastCommand || null,
          lastUserQuery: boxed.lastUserQuery || null,
          lastSeen: ts,
          createdAt: boxed.createdAt || ts,
          contextUsed: boxed.contextUsed || 0,
          contextMax: boxed.contextMax || 200000,
          model: boxed.model || null,
          selfTokens: boxed.selfTokens || 0,
          totalTokens: boxed.totalTokens || 0,
          counters: cloneCounters(boxed.counters)
        });
      }
    }

    const existingAgent = this.agents.get(event.agentId);
    if (
      existingAgent &&
      existingAgent.lifecycle === LIFECYCLE.SLEEPING &&
      replay
    ) {
      const canReplayWakeSleeping =
        event.type === EVENT_TYPES.USER_QUERY &&
        !isStartupReplay(meta) &&
        ts > (existingAgent.lastSeen || 0);
      if (!canReplayWakeSleeping) {
        if (!existingAgent.displayName && meta.sessionDisplayName) {
          existingAgent.displayName = meta.sessionDisplayName;
        }
        if (event.type === EVENT_TYPES.USER_QUERY && meta.lastUserQuery) {
          existingAgent.lastUserQuery = meta.lastUserQuery;
        }
        return;
      }
    }

    const { agent, created } = this.upsertAgent(event.agentId, ts, meta);
    if (agent.lifecycle === LIFECYCLE.SLEEPING) {
      agent.lifecycle = LIFECYCLE.ACTIVE;
    }
    const previousStatus = agent.status;

    if (event.type === EVENT_TYPES.AGENT_SEEN) {
      agent.counters.seen += 1;
    }

    if (created && agent.parentId) {
      this.ensureParentLink(agent.parentId, agent.agentId, ts, meta);
    }

    if (created && agent.parentId && event.type !== EVENT_TYPES.SUBAGENT_SPAWN) {
      const inferredMeta = {
        ...meta,
        parentId: agent.parentId,
        inferred: true
      };

      // Apply description from meta (sourced from .meta.json via watcher)
      if (inferredMeta.agentDescription && !agent.displayName) {
        agent.displayName = inferredMeta.agentDescription;
      }
      if (inferredMeta.subagentType && !agent.subagentType) {
        agent.subagentType = inferredMeta.subagentType;
      }

      // Try parent's pending descriptions as fallback
      if (!agent.displayName || !agent.subagentType) {
        const parent = this.agents.get(agent.parentId);
        if (parent && parent._pendingChildDescriptions && parent._pendingChildDescriptions.length > 0) {
          const pending = parent._pendingChildDescriptions.shift();
          if (!agent.displayName && pending.description) agent.displayName = pending.description;
          if (!agent.subagentType && pending.subagentType) agent.subagentType = pending.subagentType;
        }
      }

      const inferredSpawn = {
        type: EVENT_TYPES.SUBAGENT_SPAWN,
        agentId: agent.agentId,
        ts,
        meta: inferredMeta
      };
      this.pushRecentEvent(inferredSpawn);
    }

    switch (event.type) {
      case EVENT_TYPES.AGENT_SEEN:
        if (agent.status === STATUS.IDLE || agent.status === STATUS.SLEEPING || !agent.status) {
          agent.status = STATUS.THINKING;
          agent.activity = 'Active';
        }
        // Apply session display name from first user message to main session agents
        if (!agent.displayName && meta.sessionDisplayName) {
          agent.displayName = meta.sessionDisplayName;
        }
        if (meta.lastUserQuery) {
          agent.lastUserQuery = meta.lastUserQuery;
        }
        break;
      case EVENT_TYPES.USER_QUERY:
        if (agent.status === STATUS.IDLE || agent.status === STATUS.SLEEPING || !agent.status) {
          agent.status = STATUS.THINKING;
          agent.activity = 'Active';
        }
        if (meta.lastUserQuery) {
          agent.lastUserQuery = meta.lastUserQuery;
        }
        break;
      case EVENT_TYPES.TOOL_START:
        agent.status = STATUS.TOOL;
        agent.activity = 'Running Tool';
        agent.lastTool = meta.toolName || agent.lastTool;
        if (meta.lastCommand) {
          agent.lastCommand = meta.lastCommand;
        }
        agent.counters.toolStarts += 1;
        // Store pending description for next child agent spawned by this parent
        if ((meta.toolName === 'Agent' || meta.toolName === 'agent' || meta.toolName === 'spawn_agent') && meta.agentDescription) {
          if (!agent._pendingChildDescriptions) agent._pendingChildDescriptions = [];
          agent._pendingChildDescriptions.push({
            description: meta.agentDescription,
            subagentType: meta.subagentType || null,
            ts
          });
        }
        break;
      case EVENT_TYPES.TOOL_END:
        agent.status = STATUS.THINKING;
        agent.activity = 'Tool Finished';
        agent.lastTool = meta.toolName || agent.lastTool;
        if (meta.lastCommand) {
          agent.lastCommand = meta.lastCommand;
        }
        agent.counters.toolEnds += 1;
        break;
      case EVENT_TYPES.ASSISTANT_OUTPUT:
        agent.status = STATUS.OUTPUT;
        agent.activity = 'Outputting';
        agent.counters.outputs += 1;
        if (typeof meta.totalTokens === 'number' && meta.totalTokens > 0) {
          this.addTokenUsage(agent.agentId, meta.totalTokens, meta.rewardTokens, {
            replay
          });
        }
        break;
      case EVENT_TYPES.WAITING:
        agent.status = STATUS.WAITING;
        agent.activity = 'Waiting';
        agent.counters.waits += 1;
        break;
      case EVENT_TYPES.SUBAGENT_SPAWN: {
        const parentId = meta.parentId;
        if (parentId) {
          this.ensureParentLink(parentId, agent.agentId, ts, meta);
          agent.parentId = parentId;
        }
        agent.status = STATUS.THINKING;
        agent.activity = 'Spawned';
        agent.counters.spawns += 1;
        // Apply description from spawn event meta
        if (meta.agentDescription && !agent.displayName) {
          agent.displayName = meta.agentDescription;
        }
        if (meta.subagentType && !agent.subagentType) {
          agent.subagentType = meta.subagentType;
        }
        // Try to get description from parent's pending list
        if (parentId && (!agent.displayName || !agent.subagentType)) {
          const parent = this.agents.get(parentId);
          if (parent && parent._pendingChildDescriptions && parent._pendingChildDescriptions.length > 0) {
            const pending = parent._pendingChildDescriptions.shift();
            if (!agent.displayName && pending.description) agent.displayName = pending.description;
            if (!agent.subagentType && pending.subagentType) agent.subagentType = pending.subagentType;
          }
        }
        break;
      }
      case EVENT_TYPES.AGENT_DONE:
        if (isSubagent(agent)) {
          this.recordSubagentHistory(agent, ts);
        } else {
          this.boxAgent(agent);
        }
        this.removeAgent(agent.agentId);
        this.pushRecentEvent(event);
        this.lastUpdate = Date.now();
        this.emit('update', this.snapshot());
        return;
      default:
        break;
    }

    this.pushRecentEvent(event);
    this.lastUpdate = Date.now();
    const pokedexChanged = replay ? false : this.recordSeenPokemon(event.agentId, ts, meta, agent);

    if (pokedexChanged || agent.status !== previousStatus || created || event.type !== EVENT_TYPES.AGENT_SEEN) {
      this.emit('update', this.snapshot());
    }
  }

  boxAgent(agent, manual = false) {
    this.boxedAgents.push({
      agentId: agent.agentId,
      lifecycle: LIFECYCLE.BOXED,
      displayName: agent.displayName || null,
      subagentType: agent.subagentType || null,
      assignedPokemonId: clampPokemonId(agent.assignedPokemonId),
      provider: agent.provider || 'claude',
      projectId: agent.projectId,
      sessionId: agent.sessionId,
      parentId: agent.parentId || null,
      contextUsed: agent.contextUsed || 0,
      contextMax: agent.contextMax || 200000,
      model: agent.model || null,
      selfTokens: agent.selfTokens || 0,
      totalTokens: agent.totalTokens || 0,
      lastCommand: agent.lastCommand || null,
      lastUserQuery: agent.lastUserQuery || null,
      createdAt: agent.createdAt,
      doneAt: Date.now(),
      counters: cloneCounters(agent.counters),
      manuallyBoxed: manual
    });
    this.trimHistoryBuffers();
  }

  recordSubagentHistory(agent, doneAt = Date.now()) {
    if (!isSubagent(agent)) return;
    const exists = this.subagentHistory.some((entry) =>
      entry.agentId === agent.agentId &&
      entry.createdAt === agent.createdAt &&
      Math.abs((entry.doneAt || 0) - doneAt) < 5000
    );
    if (exists) return;

    this.subagentHistory.push({
      agentId: agent.agentId,
      lifecycle: LIFECYCLE.DONE,
      displayName: agent.displayName || null,
      subagentType: agent.subagentType || null,
      assignedPokemonId: clampPokemonId(agent.assignedPokemonId),
      provider: agent.provider || 'claude',
      projectId: agent.projectId,
      sessionId: agent.sessionId,
      parentId: agent.parentId || null,
      contextUsed: agent.contextUsed || 0,
      contextMax: agent.contextMax || 200000,
      model: agent.model || null,
      selfTokens: agent.selfTokens || 0,
      totalTokens: agent.totalTokens || 0,
      lastCommand: agent.lastCommand || null,
      lastUserQuery: agent.lastUserQuery || null,
      createdAt: agent.createdAt,
      doneAt,
      counters: cloneCounters(agent.counters)
    });
    this.trimHistoryBuffers();
  }

  removeAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Recursively remove all children first
    for (const childId of agent.childrenIds) {
      this.removeAgent(childId);
    }

    // Remove from parent's childrenIds
    if (agent.parentId) {
      const parent = this.agents.get(agent.parentId);
      if (parent) {
        parent.childrenIds.delete(agentId);
      }
    }

    this.agents.delete(agentId);
  }

  tick(now = Date.now()) {
    let changed = false;

    for (const [agentId, agent] of this.agents.entries()) {
      const subagent = isSubagent(agent);

      if (subagent && this.boxSubagentsImmediately) { // live transcripts drop subagents aggressively to reduce stragglers
        this.recordSubagentHistory(agent, now);
        this.removeAgent(agentId);
        changed = true;
        continue;
      }

      const age = now - agent.lastSeen;

      if (subagent && age >= this.activeTimeoutMs) {
        this.recordSubagentHistory(agent, now);
        this.removeAgent(agentId);
        changed = true;
        continue;
      }

      if (age >= this.staleTimeoutMs) {
        if (!subagent) {
          this.boxAgent(agent);
        }
        this.removeAgent(agentId);
        changed = true;
        continue;
      }

      if (age >= this.activeTimeoutMs && agent.lifecycle !== LIFECYCLE.SLEEPING) {
        agent.lifecycle = LIFECYCLE.SLEEPING;
        agent.status = STATUS.SLEEPING;
        agent.activity = 'Sleeping';
        changed = true;
      }
    }

    if (changed) {
      this.lastUpdate = now;
      this.emit('update', this.snapshot());
    }
  }

  /**
   * Check live session PIDs and box agents whose session process has exited.
   * @param {Map<string,number>} sessionPidMap  sessionId → PID from ~/.claude/sessions/
   * @param {boolean} dirReadable  whether ~/.claude/sessions/ was successfully read
   */
  checkSessionPids(sessionPidMap, dirReadable = false) {
    let changed = false;

    for (const [agentId, agent] of this.agents.entries()) {
      if (agent.parentId) continue; // subagents handled elsewhere
      if (agent.provider && agent.provider !== 'claude') continue;

      const pid = sessionPidMap.get(agent.sessionId);

      if (pid === undefined) {
        // If sessions dir was readable and we previously confirmed this session alive,
        // the file being gone means the process exited and cleaned up its session file.
        if (dirReadable && this.confirmedSessionIds.has(agent.sessionId)) {
          const sid = agent.sessionId;
          this.boxAgent(agent);
          this.removeAgent(agentId);
          this.confirmedSessionIds.delete(sid);
          // Suppress to prevent trailing transcript events from auto-unboxing
          if (sid && sid !== 'unknown-session') {
            this.suppressedSessions.add(sid);
          }
          changed = true;
        }
        continue;
      }

      let alive = false;
      try {
        process.kill(pid, 0);
        alive = true;
      } catch (_) {
        // process gone
      }

      if (alive) {
        this.confirmedSessionIds.add(agent.sessionId);
      } else {
        const sid = agent.sessionId;
        this.boxAgent(agent);
        this.removeAgent(agentId);
        this.confirmedSessionIds.delete(sid);
        // Suppress to prevent trailing transcript events from auto-unboxing
        if (sid && sid !== 'unknown-session') {
          this.suppressedSessions.add(sid);
        }
        changed = true;
      }
    }

    if (changed) {
      this.lastUpdate = Date.now();
      this.emit('update', this.snapshot());
    }
  }

  boxActiveRootAgents(options = {}) {
    const provider = options.provider ? normalizeProvider(options.provider) : null;
    const suppressSessions = options.suppressSessions !== false;
    let boxedCount = 0;

    for (const [agentId, agent] of [...this.agents.entries()]) {
      if (!agent || agent.parentId) continue;
      if (provider && normalizeProvider(agent.provider) !== provider) continue;

      const sid = agent.sessionId;
      this.boxAgent(agent);
      this.removeAgent(agentId);
      if (suppressSessions && sid && sid !== 'unknown-session') {
        this.suppressedSessions.add(sid);
      }
      boxedCount += 1;
    }

    if (boxedCount > 0) {
      this.lastUpdate = Date.now();
      this.emit('update', this.snapshot());
    }

    return boxedCount;
  }

  manualBox(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    this.boxAgent(agent, true);
    this.removeAgent(agentId);
    this.lastUpdate = Date.now();
    this.emit('update', this.snapshot());
    return true;
  }

  manualUnbox(agentId) {
    const idx = this.boxedAgents.findIndex((b) => b.agentId === agentId);
    if (idx < 0) return false;
    const boxed = this.boxedAgents.splice(idx, 1)[0];
    const now = Date.now();
    const agent = {
      agentId: boxed.agentId,
      name: boxed.agentId,
      displayName: boxed.displayName || null,
      subagentType: boxed.subagentType || null,
      assignedPokemonId: clampPokemonId(boxed.assignedPokemonId),
      provider: boxed.provider || 'claude',
      projectId: boxed.projectId,
      sessionId: boxed.sessionId,
      parentId: undefined,
      childrenIds: new Set(),
      lifecycle: LIFECYCLE.SLEEPING,
      status: STATUS.SLEEPING,
      activity: 'Sleeping',
      lastTool: null,
      lastCommand: boxed.lastCommand || null,
      lastUserQuery: boxed.lastUserQuery || null,
      lastSeen: boxed.doneAt || now,
      createdAt: boxed.createdAt || now,
      contextUsed: boxed.contextUsed || 0,
      contextMax: boxed.contextMax || 200000,
      model: boxed.model || null,
      selfTokens: boxed.selfTokens || 0,
      totalTokens: boxed.totalTokens || 0,
      counters: cloneCounters(boxed.counters)
    };
    this.agents.set(agentId, agent);
    this.lastUpdate = now;
    this.emit('update', this.snapshot());
    return true;
  }

  snapshot() {
    const now = Date.now();
    const agents = Array.from(this.agents.values())
      .map((agent) => ({
        agentId: agent.agentId,
        name: agent.name,
        displayName: agent.displayName || null,
        subagentType: agent.subagentType || null,
        assignedPokemonId: clampPokemonId(agent.assignedPokemonId),
        provider: agent.provider || 'claude',
        projectId: agent.projectId,
        sessionId: agent.sessionId,
        parentId: agent.parentId,
        childrenIds: Array.from(agent.childrenIds),
        status: agent.status,
        activity: agent.activity,
        lastTool: agent.lastTool,
        lastCommand: agent.lastCommand || null,
        lastSeen: agent.lastSeen,
        createdAt: agent.createdAt,
        lifecycle: agent.lifecycle || LIFECYCLE.ACTIVE,
        isActive: (agent.lifecycle || LIFECYCLE.ACTIVE) === LIFECYCLE.ACTIVE,
        isSleeping: agent.lifecycle === LIFECYCLE.SLEEPING,
        contextUsed: agent.contextUsed || 0,
        contextMax: agent.contextMax || 200000,
        model: agent.model || null,
        selfTokens: agent.selfTokens || 0,
        totalTokens: agent.totalTokens || 0,
        lastUserQuery: agent.lastUserQuery || null,
        counters: cloneCounters(agent.counters)
      }))
      .sort((a, b) => b.lastSeen - a.lastSeen);

    return {
      now,
      lastUpdate: this.lastUpdate || now,
      activeTimeoutSec: Math.floor(this.activeTimeoutMs / 1000),
      staleTimeoutSec: Math.floor(this.staleTimeoutMs / 1000),
      explorationAreaId: this.explorationAreaId,
      activeAgentCount: agents.filter((agent) => agent.isActive).length,
      pokedex: this.pokedexSnapshot(),
      rateLimits: this.rateLimits,
      rateLimitsByProvider: cloneRateLimitsByProvider(this.rateLimitsByProvider),
      agents,
      recentEvents: this.recentEvents.slice(-80),
      boxedAgents: this.boxedAgents.slice(),
      subagentHistory: this.subagentHistory.slice(),
      ownedPokemon: this.ownedPokemonSnapshot(),
      pokemonBoxes: this.pokemonBoxes.map((box) => ({ ...box })),
      evolutionItems: evolutionItemSnapshot(this.evolutionItems),
      recruitPricing: {
        discovered: { ...RECRUIT_POINT_COSTS_DISCOVERED },
        undiscovered: { ...RECRUIT_POINT_COSTS_UNDISCOVERED },
        caughtDiscountRate: RECRUIT_CAUGHT_DISCOUNT_RATE
      },
      projectTraining: { ...this.projectTraining },
      trainingEvents: this.trainingEvents.slice(-80)
    };
  }

  serialize() {
    const agents = [];
    for (const agent of this.agents.values()) {
      agents.push({
        agentId: agent.agentId,
        lifecycle: agent.lifecycle || LIFECYCLE.ACTIVE,
        name: agent.name,
        displayName: agent.displayName || null,
        subagentType: agent.subagentType || null,
        assignedPokemonId: clampPokemonId(agent.assignedPokemonId),
        provider: agent.provider || 'claude',
        projectId: agent.projectId,
        sessionId: agent.sessionId,
        parentId: agent.parentId || null,
        childrenIds: Array.from(agent.childrenIds),
        status: agent.status,
        activity: agent.activity,
        lastTool: agent.lastTool,
        lastCommand: agent.lastCommand || null,
        lastSeen: agent.lastSeen,
        createdAt: agent.createdAt,
        contextUsed: agent.contextUsed || 0,
        contextMax: agent.contextMax || 200000,
        model: agent.model || null,
        selfTokens: agent.selfTokens || 0,
        totalTokens: agent.totalTokens || 0,
        lastUserQuery: agent.lastUserQuery || null,
        counters: cloneCounters(agent.counters)
      });
    }
    return {
      version: 1,
      pokemonCatalogMax: POKEDEX_MAX,
      savedAt: Date.now(),
      explorationAreaId: this.explorationAreaId,
      seenPokemonIds: Array.from(this.seenPokemonIds).sort((a, b) => a - b),
      caughtPokemonIds: Array.from(this.caughtPokemonIds).sort((a, b) => a - b),
      firstDiscoveryByPokemon: { ...this.firstDiscoveryByPokemon },
      firstCatchByPokemon: { ...this.firstCatchByPokemon },
      claimedCatchMilestones: Array.from(this.claimedCatchMilestones).sort(),
      claimedAreaCatchMilestones: Array.from(this.claimedAreaCatchMilestones).sort(),
      rateLimits: this.rateLimits,
      rateLimitsByProvider: cloneRateLimitsByProvider(this.rateLimitsByProvider),
      agents,
      boxedAgents: this.boxedAgents.slice(),
      subagentHistory: this.subagentHistory.slice(),
      ownedPokemon: this.ownedPokemon.map((pokemon) => cloneOwnedPokemon(pokemon)),
      pokemonBoxes: this.pokemonBoxes.map((box) => ({ ...box })),
      evolutionItems: cloneEvolutionItemState(this.evolutionItems),
      projectTraining: { ...this.projectTraining },
      trainingEvents: this.trainingEvents.slice()
    };
  }

  restore(data) {
    if (!data || data.version !== 1) return false;

    this.mergeSeenPokemonIds(data.seenPokemonIds, data.firstDiscoveryByPokemon);
    const hasPersistedCaughtProgress = Array.isArray(data.caughtPokemonIds);
    this.mergeCaughtPokemonIds(data.caughtPokemonIds, data.firstCatchByPokemon);
    this.claimedCatchMilestones = normalizeStringSet(data.claimedCatchMilestones);
    this.claimedAreaCatchMilestones = normalizeStringSet(data.claimedAreaCatchMilestones);
    const restorePokemonMax = inferLegacyPokemonCatalogMax(data);
    const discoveryByAgentId = discoveryPokemonIdsByAgent(data.firstDiscoveryByPokemon);
    const assignmentOptionsFor = (raw) => ({
      maxPokemonId: restorePokemonMax,
      inferredPokemonId: raw && raw.agentId ? discoveryByAgentId.get(String(raw.agentId)) : null
    });
    this.explorationAreaId = normalizeAreaId(data.explorationAreaId);
    this.rateLimits = data.rateLimits || null;
    this.rateLimitsByProvider = cloneRateLimitsByProvider(data.rateLimitsByProvider);
    if (this.rateLimits && Object.keys(this.rateLimitsByProvider).length === 0) {
      this.rateLimitsByProvider.codex = this.rateLimits;
    }
    this.boxedAgents = Array.isArray(data.boxedAgents)
      ? data.boxedAgents.map((b) => {
        const restored = {
          ...(b.lifecycle ? b : { ...b, lifecycle: LIFECYCLE.BOXED }),
          assignedPokemonId: clampPokemonId(b.assignedPokemonId)
        };
        this.ensureAssignedPokemon(restored, b, assignmentOptionsFor(b));
        return restored;
      })
      : [];
    this.subagentHistory = Array.isArray(data.subagentHistory)
      ? data.subagentHistory.map((h) => ({
        ...(h.lifecycle ? h : { ...h, lifecycle: LIFECYCLE.DONE }),
        assignedPokemonId: clampPokemonId(h.assignedPokemonId)
      }))
      : [];
    const now = Date.now();
    this.ownedPokemon = Array.isArray(data.ownedPokemon)
      ? data.ownedPokemon.map((entry) => normalizeOwnedPokemon(entry, now)).filter(Boolean)
      : [];
    if (!hasPersistedCaughtProgress && this.ownedPokemon.length > 0) {
      this.mergeCaughtPokemonIds(
        this.ownedPokemon.map((pokemon) => pokemon.speciesId),
        null,
        { claimLegacyMilestones: true, source: 'owned', provider: 'owned' }
      );
    }
    this.pokemonBoxes = Array.isArray(data.pokemonBoxes)
      ? data.pokemonBoxes.map((entry) => normalizePokemonBox(entry, now)).filter(Boolean)
      : [defaultPokemonBox(now)];
    this.evolutionItems = normalizeEvolutionItemState(data.evolutionItems);
    this.ensurePokemonBoxes();
    this.projectTraining = {};
    if (data.projectTraining && typeof data.projectTraining === 'object') {
      for (const [projectId, ownedPokemonIds] of Object.entries(data.projectTraining)) {
        const normalizedProjectId = normalizeOwnedText(projectId, 240);
        const ids = Array.isArray(ownedPokemonIds) ? ownedPokemonIds : [ownedPokemonIds];
        for (const ownedPokemonId of ids) {
          const pokemon = this.ownedPokemonById(ownedPokemonId);
          if (normalizedProjectId && pokemon) {
            pokemon.assignedProjectId = normalizedProjectId;
          }
        }
      }
    }
    for (const pokemon of this.ownedPokemon) {
      if (pokemon.assignedProjectId) {
        const normalizedProjectId = normalizeOwnedText(pokemon.assignedProjectId, 240);
        if (normalizedProjectId) {
          pokemon.assignedProjectId = normalizedProjectId;
        } else {
          pokemon.assignedProjectId = null;
        }
      }
    }
    this.refreshSeenPokemonFromOwned({ emit: false });
    this.rebuildProjectTraining();
    this.trainingEvents = Array.isArray(data.trainingEvents)
      ? data.trainingEvents.filter((event) => event && typeof event === 'object').map((event) => ({ ...event }))
      : [];
    this.trimHistoryBuffers();

    if (Array.isArray(data.agents)) {
      for (const raw of data.agents) {
        const agent = cloneAgentRecord(raw);
        this.ensureAssignedPokemon(agent, raw, assignmentOptionsFor(raw));
        this.agents.set(agent.agentId, agent);
      }
    }

    this.refreshSeenPokemonFromAgents({
      allowNewDiscoveries: !(Array.isArray(data.seenPokemonIds) && data.seenPokemonIds.length > 0)
    });
    this.lastUpdate = Date.now();
    return true;
  }

  reset(options = {}) {
    const now = Date.now();
    const preserveActiveRootAgents = options.preserveActiveRootAgents === true;
    // liveSessionIds: Set of sessionIds whose process is confirmed alive right now
    const liveSessionIds = options.liveSessionIds instanceof Set ? options.liveSessionIds : null;

    const preservedAgents = preserveActiveRootAgents
      ? Array.from(this.agents.values())
        .filter((agent) => {
          if (agent.parentId) return false;
          if (liveSessionIds) {
            // Only keep agents whose session process is actually running
            return liveSessionIds.has(agent.sessionId);
          }
          // Fallback: keep non-sleeping, recently active agents
          return agent.status !== STATUS.SLEEPING &&
            now - (agent.lastSeen || 0) < this.activeTimeoutMs;
        })
        .map((agent) => cloneAgentRecord(agent))
      : [];

    // Collect sessionIds of all non-preserved agents so we can suppress them
    // until a new USER_QUERY arrives (prevents ghost re-spawns from old events).
    const preservedSessionIds = new Set(preservedAgents.map((a) => a.sessionId));
    const newSuppressed = new Set();
    const allKnownAgents = [...this.agents.values(), ...this.boxedAgents];
    for (const agent of allKnownAgents) {
      const sid = agent.sessionId;
      if (sid && sid !== 'unknown-session' && !preservedSessionIds.has(sid)) {
        newSuppressed.add(sid);
      }
    }
    this.suppressedSessions = newSuppressed;

    this.agents.clear();
    this.boxedAgents = [];
    this.subagentHistory = [];
    this.ownedPokemon = [];
    this.pokemonBoxes = [defaultPokemonBox(now)];
    this.evolutionItems = normalizeEvolutionItemState();
    this.projectTraining = {};
    this.trainingEvents = [];
    this.recentEvents = [];
    this.seenPokemonIds = new Set();
    this.caughtPokemonIds = new Set();
    this.firstDiscoveryByPokemon = {};
    this.firstCatchByPokemon = {};
    this.claimedCatchMilestones = new Set();
    this.claimedAreaCatchMilestones = new Set();
    this.lastUpdate = now;

    for (const agent of preservedAgents) {
      agent.childrenIds = new Set();
      this.agents.set(agent.agentId, agent);
    }

    if (preservedAgents.length > 0) {
      this.refreshSeenPokemonFromAgents();
    }

    if (options.emit !== false) {
      this.emit('pokedex', this.pokedexSnapshot());
      this.emit('update', this.snapshot());
    }
  }
}

module.exports = {
  AgentState,
  STATUS,
  LIFECYCLE
};
