'use strict';

const assert = require('assert').strict;
const { test, run } = require('./runner');
const { EVENT_TYPES } = require('../parser');
const { AgentState } = require('../state');

function createState(pokemonByAgent) {
  return new AgentState({
    resolvePokemonId(agentId) {
      return pokemonByAgent[agentId] || null;
    }
  });
}

function discover(state, agentId, pokemonId, projectId = 'project-a') {
  state.resolvePokemonId = (id) => (id === agentId ? pokemonId : null);
  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId,
    ts: 1,
    meta: { projectId, sessionId: `${projectId}-session` }
  });
}

test('owned pokemon can be adopted from discovered encounters and restored', () => {
  const state = createState({ 'agent-a': 194 });
  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'agent-a',
    ts: 10,
    meta: { projectId: 'mud-project', sessionId: 'session-a' }
  });

  const result = state.adoptOwnedPokemon({ agentId: 'agent-a', nickname: 'Muddy' });

  assert.equal(result.ok, true);
  assert.equal(result.pokemon.speciesId, 194);
  assert.equal(result.pokemon.nickname, 'Muddy');
  assert.equal(result.pokemon.partySlot, 0);
  assert.equal(result.pokemon.sourceProjectId, 'mud-project');

  const restored = createState({ 'agent-a': 194 });
  assert.equal(restored.restore(state.serialize()), true);
  assert.equal(restored.snapshot().ownedPokemon.length, 1);
  assert.equal(restored.snapshot().ownedPokemon[0].nickname, 'Muddy');
});

test('party membership is capped at six owned pokemon', () => {
  const state = createState({});

  for (let i = 1; i <= 7; i += 1) {
    state.mergeSeenPokemonIds([i]);
    const result = state.adoptOwnedPokemon({ speciesId: i });
    assert.equal(result.ok, true);
  }

  const party = state.snapshot().ownedPokemon.filter((pokemon) => Number.isInteger(pokemon.partySlot));
  const boxed = state.snapshot().ownedPokemon.filter((pokemon) => !Number.isInteger(pokemon.partySlot));

  assert.equal(party.length, 6);
  assert.equal(boxed.length, 1);
});

test('recruited pokemon can go directly to the owned box', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([25]);

  const result = state.adoptOwnedPokemon({ speciesId: 25, inParty: false });

  assert.equal(result.ok, true);
  assert.equal(result.pokemon.speciesId, 25);
  assert.equal(result.pokemon.partySlot, null);
  assert.equal(state.snapshot().ownedPokemon[0].partySlot, null);
});

test('party slots compact after boxing or releasing pokemon', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([1, 4, 7]);

  const bulbasaur = state.adoptOwnedPokemon({ speciesId: 1 }).pokemon;
  const charmander = state.adoptOwnedPokemon({ speciesId: 4 }).pokemon;
  const squirtle = state.adoptOwnedPokemon({ speciesId: 7 }).pokemon;

  state.removeOwnedPokemonFromParty(charmander.id);
  let party = state.snapshot().ownedPokemon
    .filter((pokemon) => Number.isInteger(pokemon.partySlot))
    .sort((a, b) => a.partySlot - b.partySlot);
  assert.deepEqual(party.map((pokemon) => pokemon.id), [bulbasaur.id, squirtle.id]);
  assert.deepEqual(party.map((pokemon) => pokemon.partySlot), [0, 1]);

  state.releaseOwnedPokemon(bulbasaur.id);
  party = state.snapshot().ownedPokemon
    .filter((pokemon) => Number.isInteger(pokemon.partySlot))
    .sort((a, b) => a.partySlot - b.partySlot);
  assert.deepEqual(party.map((pokemon) => pokemon.id), [squirtle.id]);
  assert.deepEqual(party.map((pokemon) => pokemon.partySlot), [0]);
});

test('party pokemon can be reordered by target slot', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([1, 4, 7]);

  const bulbasaur = state.adoptOwnedPokemon({ speciesId: 1 }).pokemon;
  const charmander = state.adoptOwnedPokemon({ speciesId: 4 }).pokemon;
  const squirtle = state.adoptOwnedPokemon({ speciesId: 7 }).pokemon;

  state.setOwnedPokemonParty(bulbasaur.id, 2);

  const party = state.snapshot().ownedPokemon
    .filter((pokemon) => Number.isInteger(pokemon.partySlot))
    .sort((a, b) => a.partySlot - b.partySlot);
  assert.deepEqual(party.map((pokemon) => pokemon.id), [charmander.id, squirtle.id, bulbasaur.id]);
});

test('project training grants usage exp to assigned pokemon and party', () => {
  const state = createState({ worker: 25 });
  state.mergeSeenPokemonIds([25, 133, 194]);

  const pikachu = state.adoptOwnedPokemon({ speciesId: 25 }).pokemon;
  const eevee = state.adoptOwnedPokemon({ speciesId: 133 }).pokemon;
  const wooper = state.adoptOwnedPokemon({ speciesId: 194 }).pokemon;

  state.assignProjectTraining(wooper.id, 'project-a');
  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'worker',
    ts: 20,
    meta: { projectId: 'project-a', sessionId: 'session-a' }
  });
  state.applyEvent({
    type: EVENT_TYPES.ASSISTANT_OUTPUT,
    agentId: 'worker',
    ts: 21,
    meta: { totalTokens: 100000 }
  });

  const byId = new Map(state.snapshot().ownedPokemon.map((pokemon) => [pokemon.id, pokemon]));
  assert.ok(byId.get(wooper.id).totalTrainingExp > byId.get(pikachu.id).totalTrainingExp);
  assert.equal(byId.get(pikachu.id).totalTrainingExp, 500);
  assert.equal(
    byId.get(wooper.id).totalTrainingExp + byId.get(pikachu.id).totalTrainingExp + byId.get(eevee.id).totalTrainingExp,
    2000
  );
  assert.equal(state.snapshot().trainingEvents.length, 3);
});

test('project training weights assigned pokemon above unassigned pokemon', () => {
  const state = createState({ worker: 25 });
  state.mergeSeenPokemonIds([1, 4, 7, 25]);

  const bulbasaur = state.adoptOwnedPokemon({ speciesId: 1 }).pokemon;
  const charmander = state.adoptOwnedPokemon({ speciesId: 4 }).pokemon;
  const squirtle = state.adoptOwnedPokemon({ speciesId: 7 }).pokemon;
  const pikachu = state.adoptOwnedPokemon({ speciesId: 25 }).pokemon;

  state.assignProjectTraining(bulbasaur.id, 'project-a');
  state.assignProjectTraining(charmander.id, 'project-a');
  state.assignProjectTraining(squirtle.id, 'project-b');
  state.applyEvent({
    type: EVENT_TYPES.AGENT_SEEN,
    agentId: 'worker',
    ts: 20,
    meta: { projectId: 'project-a', sessionId: 'session-a' }
  });
  state.applyEvent({
    type: EVENT_TYPES.ASSISTANT_OUTPUT,
    agentId: 'worker',
    ts: 21,
    meta: { totalTokens: 100000 }
  });

  const byId = new Map(state.snapshot().ownedPokemon.map((pokemon) => [pokemon.id, pokemon]));
  assert.equal(byId.get(bulbasaur.id).totalTrainingExp, 800);
  assert.equal(byId.get(charmander.id).totalTrainingExp, 800);
  assert.equal(byId.get(pikachu.id).totalTrainingExp, 400);
  assert.equal(byId.get(squirtle.id).totalTrainingExp, 0);
  assert.deepEqual(state.snapshot().projectTraining['project-a'].sort(), [bulbasaur.id, charmander.id].sort());
});

test('owned pokemon can hold and perform level evolution', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([1]);
  const bulbasaur = state.adoptOwnedPokemon({ speciesId: 1 }).pokemon;

  state.addOwnedExperience(bulbasaur.id, 1539000, { record: false });
  let current = state.snapshot().ownedPokemon[0];
  assert.ok(current.level >= 16);
  assert.equal(current.evolution.nextSpeciesId, 2);

  assert.equal(state.setOwnedPokemonEvolutionHold(current.id, true).ok, true);
  assert.equal(state.evolveOwnedPokemon(current.id).ok, false);
  assert.equal(state.setOwnedPokemonEvolutionHold(current.id, false).ok, true);
  assert.equal(state.evolveOwnedPokemon(current.id).ok, true);
  assert.equal(state.snapshot().ownedPokemon[0].speciesId, 2);
});

test('hard reset clears owned pokemon and training state', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([25]);
  const owned = state.adoptOwnedPokemon({ speciesId: 25 }).pokemon;
  state.assignProjectTraining(owned.id, 'project-a');
  state.addOwnedExperience(owned.id, 100, { projectId: 'project-a' });

  state.reset({ emit: false });

  const snapshot = state.snapshot();
  assert.deepEqual(snapshot.ownedPokemon, []);
  assert.deepEqual(snapshot.projectTraining, {});
  assert.deepEqual(snapshot.trainingEvents, []);
});

test('released pokemon are removed from project training state', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([25]);
  const owned = state.adoptOwnedPokemon({ speciesId: 25, inParty: false }).pokemon;
  state.assignProjectTraining(owned.id, 'project-a');
  state.addOwnedExperience(owned.id, 100, { projectId: 'project-a' });

  const result = state.releaseOwnedPokemon(owned.id);

  assert.equal(result.ok, true);
  assert.deepEqual(state.snapshot().ownedPokemon, []);
  assert.deepEqual(state.snapshot().projectTraining, {});
  assert.deepEqual(state.snapshot().trainingEvents, []);
});

run();
