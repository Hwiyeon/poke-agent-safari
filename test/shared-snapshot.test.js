'use strict';

const assert = require('assert').strict;
const { test, run } = require('./runner');
const { DashboardServer } = require('../server');
const { buildPublicSnapshot } = require('../snapshotPayload');

test('dashboard server snapshot payload uses the shared public snapshot builder', () => {
  const state = {
    on() {},
    off() {},
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 1,
        pokedex: { seenPokemonIds: [25], firstDiscoveryByPokemon: {}, discoveredCount: 1, totalCount: 251 },
        agents: [{ agentId: 'a-1' }],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const publicConfig = {
    mode: 'mock',
    enablePokeapiSprites: true,
    isMockMode: true,
    supportsHardReset: true
  };

  const server = new DashboardServer({
    state,
    publicConfig
  });

  assert.deepEqual(
    server.snapshotPayload(),
    buildPublicSnapshot(state, publicConfig)
  );
});

test('public snapshot keeps Claude and Codex rate limits separate for all-source dashboards', () => {
  const codexLimits = {
    five_hour: { used_percentage: 7, resets_at: 1 },
    seven_day: { used_percentage: 11, resets_at: 2 }
  };
  const claudeLimits = {
    five_hour: { used_percentage: 20, resets_at: 3 },
    seven_day: { used_percentage: 40, resets_at: 4 }
  };
  const state = {
    rateLimits: codexLimits,
    rateLimitsByProvider: { codex: codexLimits },
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 0,
        pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, discoveredCount: 0, totalCount: 251 },
        rateLimits: codexLimits,
        rateLimitsByProvider: { codex: codexLimits },
        agents: [],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const snapshot = buildPublicSnapshot(
    state,
    { source: 'all' },
    { claudeRateLimits: claudeLimits }
  );

  assert.equal(snapshot.rateLimitsByProvider.claude.five_hour.used_percentage, 20);
  assert.equal(snapshot.rateLimitsByProvider.codex.five_hour.used_percentage, 7);
});

test('mock public snapshot includes synthetic Claude and Codex budgets', () => {
  const state = {
    snapshot() {
      return {
        now: 1,
        lastUpdate: 2,
        activeTimeoutSec: 10,
        staleTimeoutSec: 20,
        activeAgentCount: 0,
        pokedex: { seenPokemonIds: [], firstDiscoveryByPokemon: {}, discoveredCount: 0, totalCount: 251 },
        agents: [],
        recentEvents: [],
        boxedAgents: [],
        subagentHistory: []
      };
    }
  };

  const snapshot = buildPublicSnapshot(state, {
    mode: 'mock',
    source: 'mock',
    isMockMode: true
  });

  assert.equal(snapshot.rateLimitsByProvider.claude.five_hour.used_percentage, 22);
  assert.equal(snapshot.rateLimitsByProvider.codex.five_hour.used_percentage, 9);
});

run();
