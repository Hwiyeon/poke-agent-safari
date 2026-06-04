'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveRenderedPokemonIdForAgent } = require('./pokemon');

const MOCK_RATE_LIMITS_BY_PROVIDER = Object.freeze({
  claude: Object.freeze({
    five_hour: Object.freeze({ used_percentage: 22, resets_at: null }),
    seven_day: Object.freeze({ used_percentage: 47, resets_at: null })
  }),
  codex: Object.freeze({
    five_hour: Object.freeze({ used_percentage: 9, resets_at: null }),
    seven_day: Object.freeze({ used_percentage: 18, resets_at: null })
  })
});

function readRateLimits(options = {}) {
  const homeDir = options.homeDir || os.homedir();
  try {
    const metaPath = path.join(homeDir, '.claude', 'context_meta', '_rate_limits.json');
    return JSON.parse(fs.readFileSync(metaPath, 'utf8')).rate_limits || null;
  } catch (_) {
    return null;
  }
}

function sourceIncludes(source, provider) {
  const normalized = String(source || 'claude').toLowerCase();
  return normalized === 'all' || normalized === provider;
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

function assignLegacyRateLimits(rateLimitsByProvider, source, rateLimits) {
  if (!rateLimits) return;
  const normalized = String(source || 'claude').toLowerCase();
  if (normalized === 'codex') {
    rateLimitsByProvider.codex = rateLimitsByProvider.codex || rateLimits;
  } else if (normalized === 'claude') {
    rateLimitsByProvider.claude = rateLimitsByProvider.claude || rateLimits;
  } else if (normalized === 'all') {
    rateLimitsByProvider.codex = rateLimitsByProvider.codex || rateLimits;
  } else if (!rateLimitsByProvider.codex && !rateLimitsByProvider.claude) {
    rateLimitsByProvider.codex = rateLimits;
  }
}

function selectRateLimitsForSource(source, rateLimitsByProvider, fallbackRateLimits) {
  const normalized = String(source || 'claude').toLowerCase();
  if (normalized === 'codex') return rateLimitsByProvider.codex || fallbackRateLimits || null;
  if (normalized === 'claude') return rateLimitsByProvider.claude || fallbackRateLimits || null;
  if (normalized === 'all') {
    return rateLimitsByProvider.claude || rateLimitsByProvider.codex || fallbackRateLimits || null;
  }
  return fallbackRateLimits || null;
}

function assignMockRateLimits(rateLimitsByProvider) {
  if (rateLimitsByProvider.claude || rateLimitsByProvider.codex) {
    return;
  }
  rateLimitsByProvider.claude = MOCK_RATE_LIMITS_BY_PROVIDER.claude;
  rateLimitsByProvider.codex = MOCK_RATE_LIMITS_BY_PROVIDER.codex;
}

function withRenderedPokemonIds(stateSnapshot) {
  const agentSources = [
    ...(Array.isArray(stateSnapshot.agents) ? stateSnapshot.agents : []),
    ...(Array.isArray(stateSnapshot.boxedAgents) ? stateSnapshot.boxedAgents : []),
    ...(Array.isArray(stateSnapshot.subagentHistory) ? stateSnapshot.subagentHistory : [])
  ];
  const byAgentId = new Map();

  for (const agent of agentSources) {
    if (!agent || !agent.agentId) continue;
    const existing = byAgentId.get(agent.agentId);
    const createdAt = typeof agent.createdAt === 'number' ? agent.createdAt : -Infinity;
    const existingCreatedAt = existing && typeof existing.createdAt === 'number' ? existing.createdAt : -Infinity;
    if (!existing || createdAt >= existingCreatedAt) {
      byAgentId.set(agent.agentId, agent);
    }
  }

  function getAgentById(agentId, options = {}) {
    const candidate = byAgentId.get(agentId);
    if (!candidate) return null;
    const beforeTs = typeof options.beforeTs === 'number' ? options.beforeTs : Infinity;
    const createdAt = typeof candidate.createdAt === 'number' ? candidate.createdAt : -Infinity;
    return createdAt <= beforeTs ? candidate : null;
  }

  function decorate(agent) {
    if (!agent || !agent.agentId) return agent;
    return {
      ...agent,
      renderedPokemonId: resolveRenderedPokemonIdForAgent(agent.agentId, {
        parentId: agent.parentId || null,
        assignedPokemonId: agent.assignedPokemonId,
        createdAt: agent.createdAt,
        getAgentById
      })
    };
  }

  return {
    ...stateSnapshot,
    agents: Array.isArray(stateSnapshot.agents) ? stateSnapshot.agents.map(decorate) : stateSnapshot.agents,
    boxedAgents: Array.isArray(stateSnapshot.boxedAgents) ? stateSnapshot.boxedAgents.map(decorate) : stateSnapshot.boxedAgents,
    subagentHistory: Array.isArray(stateSnapshot.subagentHistory) ? stateSnapshot.subagentHistory.map(decorate) : stateSnapshot.subagentHistory
  };
}

function buildPublicSnapshot(state, publicConfig = {}, options = {}) {
  const config = {
    mode: publicConfig.mode || (publicConfig.isMockMode ? 'mock' : 'watch'),
    source: publicConfig.source || (publicConfig.isMockMode ? 'mock' : 'claude'),
    enablePokeapiSprites: !!publicConfig.enablePokeapiSprites,
    isMockMode: !!publicConfig.isMockMode,
    supportsHardReset: !!publicConfig.supportsHardReset,
    explorationAreaId: state.explorationAreaId || 'all'
  };
  const stateSnapshot = withRenderedPokemonIds(state.snapshot());
  const stateRateLimits = options.rateLimits === undefined
    ? (state.rateLimits || stateSnapshot.rateLimits || null)
    : options.rateLimits;
  const rateLimitsByProvider = options.rateLimitsByProvider === undefined
    ? cloneRateLimitsByProvider(state.rateLimitsByProvider || stateSnapshot.rateLimitsByProvider)
    : cloneRateLimitsByProvider(options.rateLimitsByProvider);

  assignLegacyRateLimits(rateLimitsByProvider, config.source, stateRateLimits);
  if (config.isMockMode && !stateRateLimits) {
    assignMockRateLimits(rateLimitsByProvider);
  }

  if (sourceIncludes(config.source, 'claude')) {
    const claudeRateLimits = options.claudeRateLimits === undefined
      ? readRateLimits(options)
      : options.claudeRateLimits;
    if (claudeRateLimits) {
      rateLimitsByProvider.claude = claudeRateLimits;
    }
  }

  const rateLimits = options.rateLimits === undefined
    ? selectRateLimitsForSource(config.source, rateLimitsByProvider, stateRateLimits)
    : stateRateLimits;

  return {
    ...stateSnapshot,
    rateLimits,
    rateLimitsByProvider,
    config
  };
}

module.exports = {
  readRateLimits,
  buildPublicSnapshot
};
