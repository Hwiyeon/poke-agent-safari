'use strict';

const assert = require('assert').strict;
const { test, run } = require('./runner');
const { EVENT_TYPES } = require('../parser');
const { AgentState } = require('../state');

function createState(pokemonByAgent) {
  const state = new AgentState({
    resolvePokemonId(agentId) {
      return pokemonByAgent[agentId] || null;
    }
  });
  state.evolutionItems.itemPoints = 100000;
  return state;
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
  assert.equal(byId.get(wooper.id).totalTrainingExp, 7143);
  assert.ok([1428, 1429].includes(byId.get(pikachu.id).totalTrainingExp));
  assert.ok([1428, 1429].includes(byId.get(eevee.id).totalTrainingExp));
  assert.equal(
    byId.get(wooper.id).totalTrainingExp + byId.get(pikachu.id).totalTrainingExp + byId.get(eevee.id).totalTrainingExp,
    10000
  );
  assert.equal(state.snapshot().trainingEvents.length, 3);
});

test('owned pokemon use scaled medium fast experience thresholds', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([1]);
  const bulbasaur = state.adoptOwnedPokemon({ speciesId: 1 }).pokemon;

  let current = state.snapshot().ownedPokemon[0];
  assert.equal(current.expToNextLevel, 241);

  state.addOwnedExperience(bulbasaur.id, 123354, { record: false });
  current = state.snapshot().ownedPokemon[0];
  assert.equal(current.level, 16);
  assert.equal(current.exp, 0);
  assert.equal(current.expToNextLevel, 24605);

  state.addOwnedExperience(bulbasaur.id, 1405083 - 123354, { record: false });
  current = state.snapshot().ownedPokemon[0];
  assert.equal(current.level, 36);
  assert.equal(current.exp, 0);
  assert.equal(current.expToNextLevel, 120373);
});

test('project training does not grant usage exp to boxed pokemon', () => {
  const state = createState({ worker: 25 });
  state.mergeSeenPokemonIds([1, 4, 7, 25, 52, 54, 133, 194]);

  const party = [1, 4, 7, 25, 52, 54].map((speciesId) => (
    state.adoptOwnedPokemon({ speciesId }).pokemon
  ));
  const boxedUnassigned = state.adoptOwnedPokemon({ speciesId: 133 }).pokemon;
  const boxedAssigned = state.adoptOwnedPokemon({ speciesId: 194 }).pokemon;

  assert.equal(boxedUnassigned.partySlot, null);
  assert.equal(boxedAssigned.partySlot, null);
  state.assignProjectTraining(boxedAssigned.id, 'project-a');
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
  assert.equal(byId.get(boxedUnassigned.id).totalTrainingExp, 0);
  assert.equal(byId.get(boxedAssigned.id).totalTrainingExp, 0);
  assert.equal(
    party.reduce((sum, pokemon) => sum + byId.get(pokemon.id).totalTrainingExp, 0),
    10000
  );
  assert.equal(state.snapshot().trainingEvents.length, 6);
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
  assert.equal(byId.get(bulbasaur.id).totalTrainingExp + byId.get(charmander.id).totalTrainingExp, 9091);
  assert.ok(Math.abs(byId.get(bulbasaur.id).totalTrainingExp - byId.get(charmander.id).totalTrainingExp) <= 1);
  assert.equal(byId.get(pikachu.id).totalTrainingExp, 909);
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

test('total tokens accrue evolution item points', () => {
  const state = createState({ worker: 25 });
  state.evolutionItems.itemPoints = 0;
  state.evolutionItems.rewardTokenRemainder = 0;
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
    meta: { totalTokens: 700000, rewardTokens: 679999 }
  });

  const snapshot = state.snapshot();
  assert.equal(snapshot.agents[0].totalTokens, 700000);
  assert.equal(snapshot.evolutionItems.itemPoints, 70);
  assert.equal(snapshot.evolutionItems.rewardTokenRemainder, 0);
  assert.equal(snapshot.evolutionItems.tokenPerItemPoint, 10000);
});

test('initial replay token events do not accrue item points or training exp', () => {
  const state = createState({ worker: 25 });
  state.mergeSeenPokemonIds([25]);
  const pikachu = state.adoptOwnedPokemon({ speciesId: 25 }).pokemon;
  state.evolutionItems.itemPoints = 0;
  state.evolutionItems.rewardTokenRemainder = 0;

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
    meta: { totalTokens: 700000, replay: true }
  });

  const snapshot = state.snapshot();
  const restoredPikachu = snapshot.ownedPokemon.find((pokemon) => pokemon.id === pikachu.id);
  assert.equal(snapshot.agents[0].totalTokens, 700000);
  assert.equal(snapshot.evolutionItems.itemPoints, 0);
  assert.equal(snapshot.evolutionItems.rewardTokenRemainder, 0);
  assert.equal(restoredPikachu.totalTrainingExp, 0);
  assert.equal(snapshot.trainingEvents.length, 0);
});

test('evolution item draw table uses v2 weights', () => {
  const state = createState({});
  const snapshot = state.snapshot().evolutionItems;
  const weights = new Map(snapshot.pool.map((item) => [item.id, item.weight]));

  assert.equal(snapshot.itemWeightTotal, 1000);
  assert.equal(snapshot.pickupWeightMultiplier, 2.5);
  for (const itemId of ['leaf-stone', 'water-stone', 'fire-stone', 'thunder-stone', 'ice-stone']) {
    assert.equal(weights.get(itemId), 70);
  }
  assert.equal(weights.get('sun-stone'), 60);
  assert.equal(weights.get('moon-stone'), 60);
  assert.equal(weights.get('linking-cord'), 60);
  for (const itemId of ['shiny-stone', 'dusk-stone', 'dawn-stone']) {
    assert.equal(weights.get(itemId), 45);
  }
  assert.equal(weights.get('up-grade'), 25);
  assert.equal(weights.get('dubious-disc'), 20);
});

test('evolution item pulls, ticket claims, and selling update the item wallet', () => {
  const state = createState({});
  state.evolutionItems.itemPoints = 250;

  const failedPull = state.pullEvolutionItem({ rng: () => 0.99 });
  assert.equal(failedPull.ok, true);
  assert.equal(failedPull.success, false);
  assert.equal(failedPull.source, 'points');
  assert.equal(state.snapshot().evolutionItems.itemPoints, 0);

  state.evolutionItems.itemPoints = 250;
  state.evolutionItems.pickupItemId = 'thunder-stone';
  const rolls = [0.1, 0.5];
  const missedTarget = state.pullEvolutionItem({ rng: () => rolls.shift() });
  assert.equal(missedTarget.ok, true);
  assert.equal(missedTarget.success, true);
  assert.notEqual(missedTarget.itemId, 'thunder-stone');
  assert.equal(state.snapshot().evolutionItems.targetTickets, 1);

  state.evolutionItems.itemPoints = 250;
  const hitRolls = [0.1, 0.75];
  const hitTarget = state.pullEvolutionItem({ rng: () => hitRolls.shift() });
  assert.equal(hitTarget.ok, true);
  assert.equal(hitTarget.success, true);
  assert.equal(hitTarget.itemId, 'thunder-stone');
  assert.equal(state.snapshot().evolutionItems.targetTickets, 1);

  state.evolutionItems.itemPoints = 35;
  const bought = state.buyEvolutionItem('linking-cord', 'points');
  assert.equal(bought.ok, false);
  assert.equal(state.snapshot().evolutionItems.inventory['linking-cord'], undefined);

  state.addEvolutionItem('linking-cord');

  const sold = state.sellEvolutionItem('linking-cord');
  assert.equal(sold.ok, true);
  assert.equal(state.snapshot().evolutionItems.inventory['linking-cord'], undefined);
  assert.equal(state.snapshot().evolutionItems.itemPoints, 45);

  state.evolutionItems.targetTickets = 20;
  const claimed = state.buyEvolutionItem('thunder-stone', 'ticket');
  assert.equal(claimed.ok, true);
  assert.equal(state.snapshot().evolutionItems.inventory['thunder-stone'], 2);
  assert.equal(state.snapshot().evolutionItems.targetTickets, 0);
});

test('recruit pricing spends points and discovers unknown pokemon', () => {
  const state = createState({});
  state.evolutionItems.itemPoints = 800;
  state.mergeSeenPokemonIds([10]);

  const discovered = state.adoptOwnedPokemon({ speciesId: 10, inParty: false });
  assert.equal(discovered.ok, true);
  assert.deepEqual(discovered.recruitCost, { tier: 1, discovered: true, pointCost: 100 });
  assert.equal(state.snapshot().evolutionItems.itemPoints, 700);

  state.evolutionItems.itemPoints = 500;
  const undiscovered = state.adoptOwnedPokemon({ speciesId: 13, inParty: false, skipRecruitCost: true });
  assert.equal(undiscovered.ok, true);
  assert.deepEqual(undiscovered.recruitCost, { tier: 1, discovered: false, pointCost: 500 });
  let snapshot = state.snapshot();
  assert.equal(snapshot.evolutionItems.itemPoints, 0);
  assert.ok(snapshot.pokedex.seenPokemonIds.includes(13));

  state.evolutionItems.itemPoints = 499;
  const insufficient = state.adoptOwnedPokemon({ speciesId: 16, inParty: false });
  assert.equal(insufficient.ok, false);
  assert.deepEqual(insufficient.recruitCost, { tier: 1, discovered: false, pointCost: 500 });
  snapshot = state.snapshot();
  assert.equal(snapshot.evolutionItems.itemPoints, 499);
  assert.equal(snapshot.recruitPricing.discovered[1], 100);
  assert.equal(snapshot.recruitPricing.undiscovered[5], 10000);
});

test('item evolutions consume the required item', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([25]);
  const pikachu = state.adoptOwnedPokemon({ speciesId: 25 }).pokemon;

  let current = state.snapshot().ownedPokemon[0];
  assert.equal(current.evolution.method, 'item');
  assert.equal(current.evolution.itemId, 'thunder-stone');
  assert.equal(current.evolution.canEvolve, false);
  assert.equal(state.evolveOwnedPokemon(pikachu.id).ok, false);

  state.addEvolutionItem('thunder-stone');
  current = state.snapshot().ownedPokemon[0];
  assert.equal(current.evolution.canEvolve, true);
  const evolved = state.evolveOwnedPokemon(pikachu.id);

  assert.equal(evolved.ok, true);
  assert.equal(state.snapshot().ownedPokemon[0].speciesId, 26);
  assert.equal(state.snapshot().evolutionItems.inventory['thunder-stone'], undefined);
});

test('trade evolutions use linking cord and branched evolutions require a target', () => {
  const state = createState({});
  state.mergeSeenPokemonIds([64, 61]);
  const kadabra = state.adoptOwnedPokemon({ speciesId: 64 }).pokemon;
  const poliwhirl = state.adoptOwnedPokemon({ speciesId: 61 }).pokemon;

  state.addEvolutionItem('linking-cord');
  assert.equal(state.evolveOwnedPokemon(kadabra.id).ok, true);
  assert.equal(state.snapshot().ownedPokemon.find((pokemon) => pokemon.id === kadabra.id).speciesId, 65);

  state.addEvolutionItem('water-stone');
  state.addEvolutionItem('kings-rock');
  assert.equal(state.evolveOwnedPokemon(poliwhirl.id).ok, false);
  assert.equal(state.evolveOwnedPokemon(poliwhirl.id, { targetSpeciesId: 186 }).ok, true);

  const snapshot = state.snapshot();
  assert.equal(snapshot.ownedPokemon.find((pokemon) => pokemon.id === poliwhirl.id).speciesId, 186);
  assert.equal(snapshot.evolutionItems.inventory['kings-rock'], undefined);
  assert.equal(snapshot.evolutionItems.inventory['water-stone'], 1);
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
  assert.deepEqual(snapshot.evolutionItems.inventory, {});
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
