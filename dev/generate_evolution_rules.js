'use strict';

const fs = require('fs');
const path = require('path');
const { EVOLUTION_ITEM_POOL } = require('../evolutionItems');

const ROOT = path.resolve(__dirname, '..');
const CHAIN_DIR = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'evolution-chain');
const OUTPUT_FILE = path.join(ROOT, 'data', 'evolution_rules.json');
const POKEDEX_MIN = 1;
const POKEDEX_MAX = 649;
const ITEM_IDS = new Set(EVOLUTION_ITEM_POOL.map((item) => item.id));

function item(toSpeciesId, itemId, source = 'special-item') {
  return { toSpeciesId, method: 'item', itemId, source };
}

function level(toSpeciesId, requiredLevel, source = 'special-level') {
  return { toSpeciesId, method: 'level', requiredLevel, source };
}

const SPECIAL_RULES = Object.freeze({
  '25>26': item(26, 'thunder-stone'),
  '30>31': item(31, 'moon-stone'),
  '33>34': item(34, 'moon-stone'),
  '35>36': item(36, 'moon-stone'),
  '37>38': item(38, 'fire-stone'),
  '39>40': item(40, 'moon-stone'),
  '42>169': level(169, 36),
  '44>45': item(45, 'leaf-stone'),
  '44>182': item(182, 'sun-stone'),
  '58>59': item(59, 'fire-stone'),
  '61>62': item(62, 'water-stone'),
  '61>186': item(186, 'kings-rock', 'special-held-item'),
  '64>65': item(65, 'linking-cord', 'special-trade'),
  '67>68': item(68, 'linking-cord', 'special-trade'),
  '70>71': item(71, 'leaf-stone'),
  '75>76': item(76, 'linking-cord', 'special-trade'),
  '79>199': item(199, 'kings-rock', 'special-held-item'),
  '82>462': item(462, 'thunder-stone'),
  '90>91': item(91, 'water-stone'),
  '93>94': item(94, 'linking-cord', 'special-trade'),
  '95>208': item(208, 'metal-coat', 'special-held-item'),
  '102>103': item(103, 'leaf-stone'),
  '108>463': level(463, 30),
  '112>464': item(464, 'protector', 'special-held-item'),
  '113>242': level(242, 36),
  '114>465': level(465, 30),
  '117>230': item(230, 'dragon-scale', 'special-held-item'),
  '120>121': item(121, 'water-stone'),
  '123>212': item(212, 'metal-coat', 'special-held-item'),
  '125>466': item(466, 'electirizer', 'special-held-item'),
  '126>467': item(467, 'magmarizer', 'special-held-item'),
  '133>134': item(134, 'water-stone'),
  '133>135': item(135, 'thunder-stone'),
  '133>136': item(136, 'fire-stone'),
  '133>196': item(196, 'sun-stone'),
  '133>197': item(197, 'moon-stone'),
  '133>470': item(470, 'leaf-stone'),
  '133>471': item(471, 'ice-stone'),
  '137>233': item(233, 'up-grade', 'special-held-item'),
  '172>25': level(25, 10),
  '173>35': level(35, 10),
  '174>39': level(39, 10),
  '175>176': level(176, 20),
  '176>468': item(468, 'shiny-stone'),
  '190>424': level(424, 30),
  '191>192': item(192, 'sun-stone'),
  '193>469': level(469, 30),
  '198>430': item(430, 'dusk-stone'),
  '200>429': item(429, 'dusk-stone'),
  '207>472': item(472, 'razor-fang', 'special-held-item'),
  '215>461': item(461, 'razor-claw', 'special-held-item'),
  '221>473': level(473, 36),
  '233>474': item(474, 'dubious-disc', 'special-held-item'),
  '236>106': level(106, 20, 'special-branch'),
  '236>107': level(107, 20, 'special-branch'),
  '236>237': level(237, 20, 'special-branch'),
  '271>272': item(272, 'water-stone'),
  '274>275': item(275, 'leaf-stone'),
  '281>475': item(475, 'dawn-stone'),
  '290>292': level(292, 20, 'special-branch'),
  '298>183': level(183, 10),
  '299>476': item(476, 'thunder-stone'),
  '300>301': item(301, 'moon-stone'),
  '315>407': item(407, 'shiny-stone'),
  '349>350': item(350, 'prism-scale', 'special-held-item'),
  '356>477': item(477, 'reaper-cloth', 'special-held-item'),
  '361>478': item(478, 'dawn-stone'),
  '366>367': item(367, 'deep-sea-tooth', 'special-held-item'),
  '366>368': item(368, 'deep-sea-scale', 'special-held-item'),
  '406>315': level(315, 15),
  '412>413': level(413, 20, 'special-branch'),
  '412>414': level(414, 20, 'special-branch'),
  '415>416': level(416, 21, 'special-branch'),
  '427>428': level(428, 20),
  '433>358': level(358, 20),
  '438>185': level(185, 15),
  '439>122': level(122, 15),
  '440>113': item(113, 'oval-stone', 'special-held-item'),
  '446>143': level(143, 30),
  '447>448': level(448, 30),
  '458>226': level(226, 20),
  '511>512': item(512, 'leaf-stone'),
  '513>514': item(514, 'fire-stone'),
  '515>516': item(516, 'water-stone'),
  '517>518': item(518, 'moon-stone'),
  '525>526': item(526, 'linking-cord', 'special-trade'),
  '527>528': level(528, 20),
  '533>534': item(534, 'linking-cord', 'special-trade'),
  '541>542': level(542, 36),
  '546>547': item(547, 'sun-stone'),
  '548>549': item(549, 'sun-stone'),
  '572>573': item(573, 'shiny-stone'),
  '588>589': item(589, 'linking-cord', 'special-trade'),
  '603>604': item(604, 'thunder-stone'),
  '608>609': item(609, 'dusk-stone'),
  '616>617': item(617, 'linking-cord', 'special-trade')
});

function speciesIdFromUrl(url) {
  const match = String(url || '').match(/\/pokemon-species\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
}

function inRange(speciesId) {
  return Number.isInteger(speciesId) && speciesId >= POKEDEX_MIN && speciesId <= POKEDEX_MAX;
}

function inferRule(fromSpeciesId, toSpeciesId, detail) {
  if (detail && (detail.region || detail.base_form)) {
    return null;
  }

  const trigger = detail && detail.trigger && detail.trigger.name;
  if (trigger === 'use-item' && detail.item && ITEM_IDS.has(detail.item.name)) {
    return item(toSpeciesId, detail.item.name, 'pokeapi-use-item');
  }
  if (trigger === 'trade') {
    const heldItemId = detail.held_item && detail.held_item.name;
    return heldItemId && ITEM_IDS.has(heldItemId)
      ? item(toSpeciesId, heldItemId, 'pokeapi-trade-held-item')
      : item(toSpeciesId, 'linking-cord', 'pokeapi-trade');
  }
  if (trigger === 'level-up') {
    const heldItemId = detail.held_item && detail.held_item.name;
    if (heldItemId && ITEM_IDS.has(heldItemId)) {
      return item(toSpeciesId, heldItemId, 'pokeapi-level-held-item');
    }
    const minLevel = Number(detail.min_level);
    if (Number.isInteger(minLevel) && minLevel > 0) {
      return level(toSpeciesId, minLevel, 'pokeapi-level');
    }
  }
  if (trigger === 'shed') {
    const special = SPECIAL_RULES[`${fromSpeciesId}>${toSpeciesId}`];
    return special ? { ...special } : null;
  }
  return null;
}

function rulePreference(rule) {
  const source = String(rule && rule.source || '');
  let score = 0;
  if (source.startsWith('special-')) score += 100;
  if (rule.method === 'level') score += 20;
  if (rule.method === 'item') score += 10;
  if (source.startsWith('pokeapi-')) score += 1;
  return score;
}

function shouldReplaceRule(existing, next) {
  const existingScore = rulePreference(existing);
  const nextScore = rulePreference(next);
  if (nextScore !== existingScore) {
    return nextScore > existingScore;
  }
  if (existing.method === 'level' && next.method === 'level') {
    return Number(next.requiredLevel) < Number(existing.requiredLevel);
  }
  return false;
}

function addRule(rules, fromSpeciesId, rawRule) {
  if (!rawRule || !inRange(fromSpeciesId) || !inRange(rawRule.toSpeciesId)) {
    return;
  }
  if (!rules[fromSpeciesId]) {
    rules[fromSpeciesId] = [];
  }
  const normalized = {
    toSpeciesId: rawRule.toSpeciesId,
    method: rawRule.method,
    source: rawRule.source
  };
  if (rawRule.method === 'level') {
    normalized.requiredLevel = rawRule.requiredLevel;
  } else if (rawRule.method === 'item') {
    normalized.itemId = rawRule.itemId;
  } else {
    return;
  }

  const sameTargetIndex = rules[fromSpeciesId].findIndex((rule) => rule.toSpeciesId === normalized.toSpeciesId);
  if (sameTargetIndex >= 0) {
    if (shouldReplaceRule(rules[fromSpeciesId][sameTargetIndex], normalized)) {
      rules[fromSpeciesId][sameTargetIndex] = normalized;
    }
    return;
  }

  const key = [
    normalized.toSpeciesId,
    normalized.method,
    normalized.requiredLevel || '',
    normalized.itemId || ''
  ].join(':');
  if (!rules[fromSpeciesId].some((rule) => [
    rule.toSpeciesId,
    rule.method,
    rule.requiredLevel || '',
    rule.itemId || ''
  ].join(':') === key)) {
    rules[fromSpeciesId].push(normalized);
  }
}

function walkNode(node, rules) {
  const fromSpeciesId = speciesIdFromUrl(node && node.species && node.species.url);
  if (!inRange(fromSpeciesId)) {
    return;
  }

  for (const evo of node.evolves_to || []) {
    const toSpeciesId = speciesIdFromUrl(evo && evo.species && evo.species.url);
    if (!inRange(toSpeciesId)) {
      continue;
    }

    const special = SPECIAL_RULES[`${fromSpeciesId}>${toSpeciesId}`];
    if (special) {
      addRule(rules, fromSpeciesId, { ...special });
    } else {
      for (const detail of evo.evolution_details || []) {
        addRule(rules, fromSpeciesId, inferRule(fromSpeciesId, toSpeciesId, detail));
      }
    }
    walkNode(evo, rules);
  }
}

function sortRules(rules) {
  const sorted = {};
  for (const fromSpeciesId of Object.keys(rules).sort((a, b) => Number(a) - Number(b))) {
    sorted[fromSpeciesId] = rules[fromSpeciesId].sort((a, b) => {
      if (a.toSpeciesId !== b.toSpeciesId) return a.toSpeciesId - b.toSpeciesId;
      if (a.method !== b.method) return a.method.localeCompare(b.method);
      return String(a.itemId || a.requiredLevel || '').localeCompare(String(b.itemId || b.requiredLevel || ''));
    });
  }
  return sorted;
}

function main() {
  const rules = {};
  const fileNames = fs.readdirSync(CHAIN_DIR).filter((name) => name.endsWith('.json'));
  for (const fileName of fileNames) {
    const data = JSON.parse(fs.readFileSync(path.join(CHAIN_DIR, fileName), 'utf8'));
    if (data && data.chain) {
      walkNode(data.chain, rules);
    }
  }

  const payload = {
    generated_at: new Date().toISOString(),
    source: 'dev/.cache/pokeapi/evolution-chain',
    range: '1-649',
    special_rule_count: Object.keys(SPECIAL_RULES).length,
    total_from_species: Object.keys(rules).length,
    total_rules: Object.values(rules).reduce((sum, list) => sum + list.length, 0),
    rules: sortRules(rules)
  };

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`wrote ${OUTPUT_FILE}`);
  console.log(`${payload.total_rules} rules from ${payload.total_from_species} species (${payload.special_rule_count} special)`);
}

if (require.main === module) {
  main();
}

module.exports = {
  SPECIAL_RULES,
  inferRule,
  addRule,
  walkNode
};
