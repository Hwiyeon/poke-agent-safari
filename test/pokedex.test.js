'use strict';

const { test, run } = require('./runner');
const assert = require('assert').strict;

const { EVENT_TYPES } = require('../parser');
const { AgentState } = require('../state');
const { getPokemonAreaId, getPokemonRarityTier, getPokemonIdForAgent, resolveRenderedPokemonIdForAgent } = require('../pokemon');

test('state tracks discovered pokemon in snapshot and serialization', () => {
  const state = new AgentState({
    resolvePokemonId(agentId) {
      return agentId === 'agent-a' ? 25 : 133;
    }
  });

  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'agent-a',
    ts: 1,
    meta: { projectId: 'proj-a', sessionId: 'sess-a' }
  });
  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'agent-b',
    ts: 2,
    meta: { projectId: 'proj-b', sessionId: 'sess-b', sessionDisplayName: 'Main Session' }
  });
  state.applyEvent({
    type: EVENT_TYPES.TOOL_START,
    agentId: 'agent-a',
    ts: 3,
    meta: {}
  });

  assert.deepEqual(state.snapshot().pokedex.seenPokemonIds, [25, 133]);
  assert.equal(state.snapshot().pokedex.discoveredCount, 2);
  assert.deepEqual(state.serialize().seenPokemonIds, [25, 133]);
  assert.equal(state.snapshot().pokedex.firstDiscoveryByPokemon[25].projectId, 'proj-a');
  assert.equal(state.snapshot().pokedex.firstDiscoveryByPokemon[133].sessionId, 'sess-b');
});

test('state tracks caught pokemon separately from seen progress', () => {
  const state = new AgentState({});
  state.evolutionItems.itemPoints = 5000;
  state.mergeSeenPokemonIds([25, 133]);

  const result = state.adoptOwnedPokemon({ speciesId: 25, inParty: false });
  const snapshot = state.snapshot();

  assert.equal(result.ok, true);
  assert.deepEqual(snapshot.pokedex.seenPokemonIds, [25, 133]);
  assert.deepEqual(snapshot.pokedex.caughtPokemonIds, [25]);
  assert.equal(snapshot.pokedex.seenCount, 2);
  assert.equal(snapshot.pokedex.caughtCount, 1);
  assert.equal(snapshot.pokedex.discoveredCount, 2);
  assert.deepEqual(state.serialize().caughtPokemonIds, [25]);
  assert.equal(snapshot.pokedex.firstCatchByPokemon[25].source, 'recruit');
});

test('state restore preserves caught pokemon and claimed catch milestones', () => {
  const state = new AgentState({});
  const restored = state.restore({
    version: 1,
    seenPokemonIds: [25, 133],
    caughtPokemonIds: [25],
    firstCatchByPokemon: {
      25: { speciesId: 25, source: 'recruit', caughtAt: 100 }
    },
    claimedCatchMilestones: ['caught-1'],
    claimedAreaCatchMilestones: ['forest:L1'],
    agents: [],
    boxedAgents: [],
    subagentHistory: []
  });
  const snapshot = state.snapshot();

  assert.equal(restored, true);
  assert.deepEqual(snapshot.pokedex.caughtPokemonIds, [25]);
  assert.equal(snapshot.pokedex.firstCatchByPokemon[25].caughtAt, 100);
  assert.equal(snapshot.pokedex.catchMilestones.find((entry) => entry.id === 'caught-1').claimed, true);
  assert.equal(state.serialize().claimedAreaCatchMilestones.includes('forest:L1'), true);
});

test('catch milestones are manually claimed for points', () => {
  const state = new AgentState({});

  const result = state.registerCaughtPokemon(25, { source: 'test' });

  assert.equal(result.isNewCatch, true);
  assert.equal(result.rewards.some((reward) => reward.type === 'catch-milestone'), false);

  let milestone = state.snapshot().pokedex.catchMilestones.find((entry) => entry.id === 'caught-1');
  assert.equal(milestone.reached, true);
  assert.equal(milestone.claimed, false);
  assert.equal(milestone.claimable, true);

  const before = state.snapshot().evolutionItems.itemPoints;
  const claimed = state.claimPokedexReward('catch', 'caught-1');
  assert.equal(claimed.ok, true);
  assert.equal(claimed.reward.pointReward, 100);
  assert.equal(state.snapshot().evolutionItems.itemPoints, before + 100);

  milestone = state.snapshot().pokedex.catchMilestones.find((entry) => entry.id === 'caught-1');
  assert.equal(milestone.claimed, true);
  assert.equal(milestone.claimable, false);

  const duplicate = state.claimPokedexReward('catch', 'caught-1');
  assert.equal(duplicate.ok, false);
  assert.equal(state.snapshot().evolutionItems.itemPoints, before + 100);
});

test('area catch milestones become claimable and award points once', () => {
  const state = new AgentState({});
  const ruinIds = [];
  for (let pokemonId = 1; pokemonId <= 649 && ruinIds.length < 3; pokemonId += 1) {
    if (getPokemonAreaId(pokemonId) === 'ruin') {
      ruinIds.push(pokemonId);
    }
  }
  assert.equal(ruinIds.length, 3);

  let last = null;
  for (const pokemonId of ruinIds) {
    last = state.registerCaughtPokemon(pokemonId, { source: 'test' });
  }

  assert.equal(last.rewards.some((reward) => reward.type === 'area-catch-milestone'), false);

  let areaMilestone = state.snapshot().pokedex.areaCatchProgress
    .find((entry) => entry.areaId === 'ruin')
    .milestones[0];
  assert.equal(areaMilestone.reached, true);
  assert.equal(areaMilestone.claimed, false);
  assert.equal(areaMilestone.claimable, true);

  const before = state.snapshot().evolutionItems.itemPoints;
  const claimed = state.claimPokedexReward('area', areaMilestone.id);
  assert.equal(claimed.ok, true);
  assert.equal(claimed.reward.areaId, 'ruin');
  assert.equal(claimed.reward.pointReward, 50);
  assert.equal(state.snapshot().evolutionItems.itemPoints, before + 50);

  areaMilestone = state.snapshot().pokedex.areaCatchProgress
    .find((entry) => entry.areaId === 'ruin')
    .milestones[0];
  assert.equal(areaMilestone.claimed, true);
  assert.equal(areaMilestone.claimable, false);

  const duplicate = state.claimPokedexReward('area', areaMilestone.id);
  assert.equal(duplicate.ok, false);
  assert.equal(state.snapshot().evolutionItems.itemPoints, before + 50);

  const duplicateCatch = state.registerCaughtPokemon(ruinIds[0], { source: 'test' });
  assert.equal(duplicateCatch.isNewCatch, false);
  assert.equal(state.snapshot().evolutionItems.itemPoints, before + 50);
});

test('state restore backfills discovered pokemon from restored agents', () => {
  const state = new AgentState({
    resolvePokemonId(agentId) {
      return agentId === 'boxed-agent' ? 152 : 7;
    }
  });

  const restored = state.restore({
    version: 1,
    agents: [
      {
        agentId: 'live-agent',
        name: 'live-agent',
        childrenIds: [],
        status: 'Thinking',
        activity: 'Active',
        lastSeen: 10,
        createdAt: 5,
        counters: {}
      }
    ],
    boxedAgents: [
      {
        agentId: 'boxed-agent'
      }
    ]
  });

  assert.equal(restored, true);
  assert.deepEqual(state.snapshot().pokedex.seenPokemonIds, [7, 152]);
  assert.equal(state.snapshot().pokedex.firstDiscoveryByPokemon[7].agentId, 'live-agent');
});

test('state restore does not expand legacy pokedex progress with current catalog ids', () => {
  const state = new AgentState({
    resolvePokemonId() {
      return 500;
    }
  });

  const restored = state.restore({
    version: 1,
    savedAt: 100,
    seenPokemonIds: [25],
    firstDiscoveryByPokemon: {
      25: {
        agentId: 'legacy-root',
        agentName: 'Legacy Root',
        projectId: 'proj-a',
        sessionId: 'sess-a',
        discoveredAt: 90
      }
    },
    agents: [],
    boxedAgents: [
      {
        agentId: 'legacy-root',
        projectId: 'proj-a',
        sessionId: 'sess-a',
        parentId: null,
        createdAt: 10,
        doneAt: 20,
        counters: {}
      },
      {
        agentId: 'legacy-other',
        projectId: 'proj-a',
        sessionId: 'sess-b',
        parentId: null,
        createdAt: 30,
        doneAt: 40,
        counters: {}
      }
    ],
    subagentHistory: [
      {
        agentId: 'legacy-child',
        projectId: 'proj-a',
        sessionId: 'sess-a',
        parentId: 'legacy-root',
        createdAt: 15,
        doneAt: 18,
        counters: {}
      }
    ]
  });

  const snapshot = state.snapshot();
  const legacyRoot = snapshot.boxedAgents.find((agent) => agent.agentId === 'legacy-root');
  const legacyOther = snapshot.boxedAgents.find((agent) => agent.agentId === 'legacy-other');

  assert.equal(restored, true);
  assert.deepEqual(snapshot.pokedex.seenPokemonIds, [25]);
  assert.equal(legacyRoot.assignedPokemonId, 25);
  assert.ok(legacyOther.assignedPokemonId >= 1 && legacyOther.assignedPokemonId <= 251);
});

test('replayed transcript events do not create pokedex discoveries', () => {
  const state = new AgentState({
    resolvePokemonId() {
      return 500;
    }
  });

  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'historical-agent',
    ts: 10,
    meta: { projectId: 'proj-a', sessionId: 'sess-a', replay: true }
  });

  assert.deepEqual(state.snapshot().pokedex.seenPokemonIds, []);
});

test('state reset clears agents, boxed entries, and pokedex progress', () => {
  const state = new AgentState({
    resolvePokemonId(agentId) {
      return agentId === 'live-agent' ? 7 : 25;
    }
  });

  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'live-agent',
    ts: 1,
    meta: { projectId: 'proj-a', sessionId: 'sess-a' }
  });
  state.applyEvent({
    type: EVENT_TYPES.AGENT_DONE,
    agentId: 'live-agent',
    ts: 2,
    meta: {}
  });

  state.reset({ emit: false });

  assert.deepEqual(state.snapshot().agents, []);
  assert.deepEqual(state.snapshot().boxedAgents, []);
  assert.deepEqual(state.snapshot().pokedex.seenPokemonIds, []);
  assert.equal(state.snapshot().pokedex.discoveredCount, 0);
});

test('area-specific pokemon pool matches the selected exploration area', () => {
  const cavePokemonId = getPokemonIdForAgent('area-pool-agent-cave', { areaId: 'cave' });
  const forestPokemonId = getPokemonIdForAgent('area-pool-agent-forest', { areaId: 'forest' });

  assert.equal(getPokemonAreaId(cavePokemonId), 'cave');
  assert.equal(getPokemonAreaId(forestPokemonId), 'forest');
});

test('area spawn rolls missing rarity weight down to lower tiers', () => {
  const sampleSize = 6100;
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  for (let i = 0; i < sampleSize; i += 1) {
    const pokemonId = getPokemonIdForAgent('ruin-rarity-sample-' + i, { areaId: 'ruin' });
    assert.equal(getPokemonAreaId(pokemonId), 'ruin');
    counts[getPokemonRarityTier(pokemonId)] += 1;
  }

  assert.equal(counts[2], 0);
  assert.ok(counts[1] > 4300, 'missing uncommon weight should be absorbed by common ruin encounters');
  assert.ok(counts[3] + counts[4] + counts[5] < 1700, 'missing uncommon weight should not inflate rare-or-higher ruin encounters');
  assert.ok(counts[5] < 250, 'legendary species count should not dominate the ruin area pool');
});

test('state fixes root pokemon at spawn using the current exploration area', () => {
  const state = new AgentState({
    resolvePokemonId(agentId, context = {}) {
      const agent = context.agent || null;
      const meta = context.meta || {};
      return resolveRenderedPokemonIdForAgent(agentId, {
        parentId: (agent && agent.parentId) || meta.parentId || null,
        assignedPokemonId: agent && agent.assignedPokemonId,
        areaId: context.areaId,
        getAgentById: context.getAgentById,
        createdAt: (agent && agent.createdAt) || context.ts
      });
    }
  });

  state.setExplorationArea('cave');
  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'spawned-in-cave',
    ts: 1,
    meta: { projectId: 'proj-a', sessionId: 'sess-a' }
  });

  state.setExplorationArea('forest');
  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'spawned-in-forest',
    ts: 2,
    meta: { projectId: 'proj-a', sessionId: 'sess-b' }
  });

  const snapshot = state.snapshot();
  const caveAgent = snapshot.agents.find((agent) => agent.agentId === 'spawned-in-cave');
  const forestAgent = snapshot.agents.find((agent) => agent.agentId === 'spawned-in-forest');

  assert.equal(getPokemonAreaId(caveAgent.assignedPokemonId), 'cave');
  assert.equal(getPokemonAreaId(forestAgent.assignedPokemonId), 'forest');
  assert.equal(snapshot.explorationAreaId, 'forest');
  assert.equal(state.serialize().explorationAreaId, 'forest');
});

test('subagent discoveries record rendered unevolved pokemon and parent info', () => {
  let lineage = null;

  for (let i = 1; i <= 500; i += 1) {
    const parentId = 'parent-agent-' + i;
    const childId = 'child-agent-' + i;
    const parentPokemonId = getPokemonIdForAgent(parentId);
    const childPokemonId = resolveRenderedPokemonIdForAgent(childId, { parentId });
    if (childPokemonId !== parentPokemonId) {
      lineage = { parentId, childId, childPokemonId };
      break;
    }
  }

  assert.ok(lineage, 'expected to find a deterministic parent/child lineage with different pokemon');

  const state = new AgentState({
    resolvePokemonId(agentId, context = {}) {
      const agent = context.agent || null;
      const meta = context.meta || {};
      return resolveRenderedPokemonIdForAgent(agentId, {
        parentId: (agent && agent.parentId) || meta.parentId || null,
        getAgentById: context.getAgentById,
        createdAt: (agent && agent.createdAt) || context.ts
      });
    }
  });

  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: lineage.parentId,
    ts: 1,
    meta: { projectId: 'proj-a', sessionId: 'sess-a', sessionDisplayName: 'Main Agent' }
  });

  state.applyEvent({
    type: EVENT_TYPES.SUBAGENT_SPAWN,
    agentId: lineage.childId,
    ts: 2,
    meta: { parentId: lineage.parentId, projectId: 'proj-a', sessionId: 'sess-a', agentDescription: 'Worker Child' }
  });

  const pokedex = state.snapshot().pokedex;
  const childPokemonId = resolveRenderedPokemonIdForAgent(lineage.childId, {
    parentId: lineage.parentId,
    getAgentById(id) {
      return state.agents.get(id) || null;
    }
  });

  assert.ok(pokedex.seenPokemonIds.includes(childPokemonId));
  assert.equal(pokedex.firstDiscoveryByPokemon[childPokemonId].viaSubagent, true);
  assert.equal(pokedex.firstDiscoveryByPokemon[childPokemonId].parentId, lineage.parentId);
});

test('state restore backfills deep historical subagent lineages from history records', () => {
  let chain = null;

  for (let i = 1; i <= 500; i += 1) {
    const parentId = 'root-' + i;
    const childId = 'child-' + i;
    const grandchildId = 'grandchild-' + i;
    const parentPokemonId = getPokemonIdForAgent(parentId);
    const childPokemonId = resolveRenderedPokemonIdForAgent(childId, { parentId });
    const childBasePokemonId = getPokemonIdForAgent(childId);
    const grandchildCorrectPokemonId = resolveRenderedPokemonIdForAgent(grandchildId, {
      parentId: childId,
      createdAt: 30,
      getAgentById(id, options = {}) {
        const beforeTs = typeof options.beforeTs === 'number' ? options.beforeTs : Infinity;
        if (id === parentId && 10 <= beforeTs) {
          return { agentId: parentId, createdAt: 10 };
        }
        if (id === childId && 20 <= beforeTs) {
          return { agentId: childId, parentId, createdAt: 20 };
        }
        return null;
      }
    });
    const grandchildFallbackPokemonId = resolveRenderedPokemonIdForAgent(grandchildId, {
      parentId: childId,
      createdAt: 30
    });

    if (
      childPokemonId !== parentPokemonId &&
      childPokemonId !== childBasePokemonId &&
      grandchildCorrectPokemonId !== parentPokemonId &&
      grandchildCorrectPokemonId !== childPokemonId &&
      grandchildCorrectPokemonId !== grandchildFallbackPokemonId
    ) {
      chain = {
        parentId,
        childId,
        grandchildId,
        parentPokemonId,
        childPokemonId,
        grandchildCorrectPokemonId
      };
      break;
    }
  }

  assert.ok(chain, 'expected to find a deterministic deep lineage test chain');

  const state = new AgentState({
    resolvePokemonId(agentId, context = {}) {
      const agent = context.agent || null;
      const meta = context.meta || {};
      return resolveRenderedPokemonIdForAgent(agentId, {
        parentId: (agent && agent.parentId) || meta.parentId || null,
        getAgentById: context.getAgentById,
        createdAt: (agent && agent.createdAt) || context.ts
      });
    }
  });

  const restored = state.restore({
    version: 1,
    savedAt: 100,
    seenPokemonIds: [],
    firstDiscoveryByPokemon: {},
    agents: [],
    boxedAgents: [
      {
        agentId: chain.parentId,
        projectId: 'proj-a',
        sessionId: 'sess-a',
        parentId: null,
        createdAt: 10,
        doneAt: 15,
        counters: {}
      }
    ],
    subagentHistory: [
      {
        agentId: chain.childId,
        projectId: 'proj-a',
        sessionId: 'sess-a',
        parentId: chain.parentId,
        createdAt: 20,
        doneAt: 25,
        counters: {}
      },
      {
        agentId: chain.grandchildId,
        projectId: 'proj-a',
        sessionId: 'sess-a',
        parentId: chain.childId,
        createdAt: 30,
        doneAt: 35,
        counters: {}
      }
    ]
  });

  const pokedex = state.snapshot().pokedex;
  assert.equal(restored, true);
  assert.ok(pokedex.seenPokemonIds.includes(chain.parentPokemonId));
  assert.ok(pokedex.seenPokemonIds.includes(chain.childPokemonId));
  assert.ok(pokedex.seenPokemonIds.includes(chain.grandchildCorrectPokemonId));
  assert.equal(pokedex.firstDiscoveryByPokemon[chain.childPokemonId].parentId, chain.parentId);
  assert.equal(pokedex.firstDiscoveryByPokemon[chain.grandchildCorrectPokemonId].parentId, chain.childId);
});

run();
