'use strict';

const assert = require('assert');
const { test, run } = require('./runner');
const evolutionRules = require('../data/evolution_rules.json');
const { addRule, inferRule } = require('../dev/generate_evolution_rules');

test('generated evolution rules do not duplicate the same target species', () => {
  for (const [fromSpeciesId, rules] of Object.entries(evolutionRules.rules)) {
    const seenTargets = new Set();
    for (const rule of rules) {
      assert.equal(
        seenTargets.has(rule.toSpeciesId),
        false,
        `duplicate ${fromSpeciesId}>${rule.toSpeciesId}`
      );
      seenTargets.add(rule.toSpeciesId);
    }
  }
});

test('regional evolution details are ignored for species-level rules', () => {
  const detail = {
    trigger: { name: 'level-up' },
    min_level: 17,
    region: { name: 'hisui' }
  };

  assert.equal(inferRule(155, 156, detail), null);
});

test('same target species keeps the base level rule over regional item variants', () => {
  const rules = {};

  addRule(rules, 27, {
    toSpeciesId: 28,
    method: 'item',
    source: 'pokeapi-use-item',
    itemId: 'ice-stone'
  });
  addRule(rules, 27, {
    toSpeciesId: 28,
    method: 'level',
    source: 'pokeapi-level',
    requiredLevel: 22
  });

  assert.deepEqual(rules[27], [
    {
      toSpeciesId: 28,
      method: 'level',
      source: 'pokeapi-level',
      requiredLevel: 22
    }
  ]);
});

if (require.main === module) {
  run();
}
