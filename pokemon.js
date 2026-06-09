'use strict';

const fs = require('fs');
const path = require('path');

const POKEDEX_MIN = 1;
const POKEDEX_MAX = 649;
const TIER_IDS = Object.freeze([1, 2, 3, 4, 5]);
const TIER_WEIGHTS = Object.freeze({ 1: 40, 2: 25, 3: 15, 4: 5, 5: 1 });
const RARE_BOOST_MULTIPLIERS = Object.freeze({
  1: Object.freeze({ 1: 1, 2: 1, 3: 1.10, 4: 1.15, 5: 1.25 }),
  2: Object.freeze({ 1: 1, 2: 1, 3: 1.15, 4: 1.25, 5: 1.40 }),
  3: Object.freeze({ 1: 1, 2: 1, 3: 1.20, 4: 1.35, 5: 1.60 })
});
const DATA_FILE = path.join(__dirname, 'data', 'pokemon_data.json');
const EVOLUTION_PATHS_FILE = path.join(__dirname, 'data', 'evolution_paths.json');
const AREA_IDS = Object.freeze([
  'mountain',
  'cave',
  'forest',
  'ruin',
  'rough_terrain',
  'grassland',
  'urban',
  'waters_edge',
  'sea'
]);
const HABITAT_TO_AREA = Object.freeze({
  mountain: 'mountain',
  cave: 'cave',
  forest: 'forest',
  rare: 'ruin',
  'rough-terrain': 'rough_terrain',
  grassland: 'grassland',
  urban: 'urban',
  'waters-edge': 'waters_edge',
  sea: 'sea'
});

let cachedCatalog = null;
let cachedEvolutionPaths = null;

function hashCode(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function clampPokemonId(value) {
  const pokemonId = Number(value);
  if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > POKEDEX_MAX) {
    return null;
  }
  return pokemonId;
}

function normalizeAreaId(areaId) {
  const normalized = String(areaId || 'all').trim();
  return AREA_IDS.includes(normalized) ? normalized : 'all';
}

function emptyTierPools() {
  return Object.fromEntries(TIER_IDS.map((tier) => [tier, []]));
}

function normalizeCaughtPokemonSet(caughtPokemonIds) {
  if (caughtPokemonIds instanceof Set) {
    return caughtPokemonIds;
  }
  if (!Array.isArray(caughtPokemonIds)) {
    return new Set();
  }
  return new Set(caughtPokemonIds.map((id) => Number(id)).filter((id) => Number.isInteger(id)));
}

function tierWeightMultiplier(tier, rareBoostLevel) {
  const level = Math.max(0, Math.min(3, Number(rareBoostLevel) || 0));
  const multipliers = RARE_BOOST_MULTIPLIERS[level];
  return multipliers ? multipliers[tier] || 1 : 1;
}

function pickSpeciesFromPool(agentId, tier, speciesPool, options = {}) {
  if (!Array.isArray(speciesPool) || speciesPool.length === 0) {
    return null;
  }

  const notCaughtMultiplier = Math.max(1, Number(options.notCaughtMultiplier) || 1);
  if (notCaughtMultiplier <= 1) {
    const speciesIndex = hashCode(`${agentId}:species:${tier}`) % speciesPool.length;
    return speciesPool[speciesIndex];
  }

  const caughtPokemonIds = normalizeCaughtPokemonSet(options.caughtPokemonIds);
  const weights = speciesPool.map((pokemonId) => (
    caughtPokemonIds.has(Number(pokemonId)) ? 1 : notCaughtMultiplier
  ));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    const speciesIndex = hashCode(`${agentId}:species:${tier}`) % speciesPool.length;
    return speciesPool[speciesIndex];
  }

  let roll = (hashCode(`${agentId}:species:${tier}:weighted`) / 0x100000000) * totalWeight;
  for (let i = 0; i < speciesPool.length; i += 1) {
    if (roll < weights[i]) {
      return speciesPool[i];
    }
    roll -= weights[i];
  }
  return speciesPool[speciesPool.length - 1];
}

function pickPokemonFromTierPools(agentId, tierPools, maxPokemonId, options = {}) {
  const normalizedMax = Number(maxPokemonId);
  const shouldFilterMax = Number.isInteger(normalizedMax) && normalizedMax >= POKEDEX_MIN && normalizedMax < POKEDEX_MAX;
  const speciesPoolsByTier = {};
  const effectiveWeights = {};

  for (const tier of TIER_IDS) {
    const pool = Array.isArray(tierPools && tierPools[tier]) ? tierPools[tier] : [];
    speciesPoolsByTier[tier] = shouldFilterMax
      ? pool.filter((pokemonId) => pokemonId <= normalizedMax)
      : pool;
    effectiveWeights[tier] = speciesPoolsByTier[tier].length > 0
      ? (TIER_WEIGHTS[tier] || 1) * tierWeightMultiplier(tier, options.rareBoostLevel)
      : 0;
  }

  for (const tier of TIER_IDS) {
    if (speciesPoolsByTier[tier].length > 0) {
      continue;
    }
    const missingWeight = (TIER_WEIGHTS[tier] || 1) * tierWeightMultiplier(tier, options.rareBoostLevel);
    for (let lowerTier = tier - 1; lowerTier >= 1; lowerTier -= 1) {
      if (speciesPoolsByTier[lowerTier] && speciesPoolsByTier[lowerTier].length > 0) {
        effectiveWeights[lowerTier] += missingWeight;
        break;
      }
    }
  }

  const entries = TIER_IDS
    .filter((tier) => speciesPoolsByTier[tier].length > 0 && effectiveWeights[tier] > 0)
    .map((tier) => ({
      tier,
      speciesPool: speciesPoolsByTier[tier],
      weight: effectiveWeights[tier]
    }));

  if (entries.length === 0) {
    return null;
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = hashCode(`${agentId}:tier`) % totalWeight;
  let selected = entries[entries.length - 1];
  for (const entry of entries) {
    if (roll < entry.weight) {
      selected = entry;
      break;
    }
    roll -= entry.weight;
  }

  return pickSpeciesFromPool(agentId, selected.tier, selected.speciesPool, options);
}

function loadPokemonCatalog() {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  let tierPools = emptyTierPools();
  let areaTierPools = Object.fromEntries(AREA_IDS.map((areaId) => [areaId, emptyTierPools()]));
  let pokemonAreaIds = {};
  let pokemonRarityTiers = {};
  let areaTotals = Object.fromEntries(AREA_IDS.map((areaId) => [areaId, 0]));

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.pokemon)) {
      for (const pokemon of data.pokemon) {
        const pokemonId = Number(pokemon && pokemon.pokemon_id);
        if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > POKEDEX_MAX) {
          continue;
        }
        const tier = Number(pokemon.final_tier);
        const normalizedTier = Number.isInteger(tier) && tier >= 1 && tier <= 5 ? tier : 1;
        pokemonRarityTiers[pokemonId] = normalizedTier;
        const areaId = HABITAT_TO_AREA[pokemon.habitat] || null;
        if (areaId) {
          pokemonAreaIds[pokemonId] = areaId;
          areaTotals[areaId] += 1;
        }
        tierPools[normalizedTier].push(pokemonId);
        if (areaId && areaTierPools[areaId]) {
          areaTierPools[areaId][normalizedTier].push(pokemonId);
        }
      }
    }
  } catch (_) {
    tierPools = emptyTierPools();
    areaTierPools = Object.fromEntries(AREA_IDS.map((areaId) => [areaId, emptyTierPools()]));
    pokemonAreaIds = {};
    pokemonRarityTiers = {};
    areaTotals = Object.fromEntries(AREA_IDS.map((areaId) => [areaId, 0]));
  }

  cachedCatalog = {
    tierPools,
    areaTierPools,
    pokemonAreaIds,
    pokemonRarityTiers,
    areaTotals
  };
  return cachedCatalog;
}

function getPokemonAreaId(pokemonId) {
  const catalog = loadPokemonCatalog();
  return catalog.pokemonAreaIds[Number(pokemonId)] || null;
}

function getPokemonRarityTier(pokemonId) {
  const catalog = loadPokemonCatalog();
  return catalog.pokemonRarityTiers[Number(pokemonId)] || 1;
}

function getRandomPokemonByMinTier(minTier = 1, options = {}) {
  const catalog = loadPokemonCatalog();
  const rng = typeof options.rng === 'function' ? options.rng : Math.random;
  const normalizedMinTier = Math.max(1, Math.min(5, Math.floor(Number(minTier) || 1)));
  const entries = TIER_IDS
    .filter((tier) => tier >= normalizedMinTier)
    .map((tier) => ({
      tier,
      pool: Array.isArray(catalog.tierPools[tier]) ? catalog.tierPools[tier] : [],
      weight: TIER_WEIGHTS[tier] || 0
    }))
    .filter((entry) => entry.pool.length > 0 && entry.weight > 0);

  if (entries.length === 0) {
    return POKEDEX_MIN;
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let tierRoll = Math.max(0, Math.min(0.999999999, Number(rng()) || 0)) * totalWeight;
  let selected = entries[entries.length - 1];
  for (const entry of entries) {
    if (tierRoll < entry.weight) {
      selected = entry;
      break;
    }
    tierRoll -= entry.weight;
  }

  const speciesRoll = Math.max(0, Math.min(0.999999999, Number(rng()) || 0));
  return selected.pool[Math.floor(speciesRoll * selected.pool.length)] || selected.pool[0] || POKEDEX_MIN;
}

function getPokemonAreaTotals() {
  const catalog = loadPokemonCatalog();
  return { ...catalog.areaTotals };
}

function getPokemonIdForAgent(agentId, options = {}) {
  if (!agentId) {
    return POKEDEX_MIN;
  }

  const catalog = loadPokemonCatalog();
  const maxPokemonId = Number(options.maxPokemonId);
  const areaId = normalizeAreaId(options.areaId);
  const areaTierPools = areaId !== 'all' ? catalog.areaTierPools[areaId] : null;
  const spawnOptions = {
    caughtPokemonIds: options.caughtPokemonIds,
    notCaughtMultiplier: Math.max(1, Number(options.notCaughtMultiplier) || 1),
    rareBoostLevel: Math.max(0, Math.min(3, Number(options.rareBoostLevel) || 0))
  };
  let pokemonId = areaTierPools
    ? pickPokemonFromTierPools(agentId, areaTierPools, maxPokemonId, spawnOptions)
    : null;
  if (!pokemonId) {
    pokemonId = pickPokemonFromTierPools(agentId, catalog.tierPools, maxPokemonId, spawnOptions);
  }
  if (pokemonId) {
    return pokemonId;
  }

  const fallbackMax = Number.isInteger(maxPokemonId) && maxPokemonId >= POKEDEX_MIN && maxPokemonId < POKEDEX_MAX
    ? maxPokemonId
    : POKEDEX_MAX;
  return (hashCode(String(agentId)) % (fallbackMax - POKEDEX_MIN + 1)) + POKEDEX_MIN;
}

function loadEvolutionPaths() {
  if (cachedEvolutionPaths) {
    return cachedEvolutionPaths;
  }

  let paths = {};
  try {
    const raw = fs.readFileSync(EVOLUTION_PATHS_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (data && data.paths && typeof data.paths === 'object') {
      paths = data.paths;
    }
  } catch (_) {
    paths = {};
  }

  cachedEvolutionPaths = paths;
  return cachedEvolutionPaths;
}

function getEvolutionPath(pokemonId) {
  const normalizedId = Number(pokemonId);
  const paths = loadEvolutionPaths();
  const path = paths[String(normalizedId)] || paths[normalizedId];
  return Array.isArray(path) && path.length > 0 ? path : [normalizedId];
}

function getNextEvolution(pokemonId) {
  const normalizedId = Number(pokemonId);
  if (!Number.isInteger(normalizedId)) {
    return null;
  }

  for (const path of Object.values(loadEvolutionPaths())) {
    const index = path.indexOf(normalizedId);
    if (index >= 0 && index < path.length - 1) {
      return path[index + 1];
    }
  }

  return null;
}

function resolveRenderedPokemonIdForAgent(agentId, options = {}) {
  if (!agentId) {
    return POKEDEX_MIN;
  }

  const parentId = options.parentId || null;
  if (!parentId) {
    return clampPokemonId(options.assignedPokemonId) || getPokemonIdForAgent(agentId, { areaId: options.areaId });
  }

  const getAgentById = typeof options.getAgentById === 'function' ? options.getAgentById : null;
  const lookupTs = typeof options.createdAt === 'number'
    ? options.createdAt
    : (typeof options.ts === 'number' ? options.ts : Infinity);
  let parentPokemonId = null;

  if (getAgentById) {
    const parentAgent = getAgentById(parentId, { beforeTs: lookupTs });
    if (parentAgent) {
      parentPokemonId = resolveRenderedPokemonIdForAgent(parentId, {
        parentId: parentAgent.parentId || null,
        assignedPokemonId: parentAgent.assignedPokemonId,
        getAgentById,
        createdAt: typeof parentAgent.createdAt === 'number' ? parentAgent.createdAt : lookupTs
      });
    }
  }

  if (!parentPokemonId) {
    parentPokemonId = getPokemonIdForAgent(parentId);
  }

  const candidates = getEvolutionPath(parentPokemonId);
  return candidates[hashCode(String(agentId)) % candidates.length];
}

module.exports = {
  POKEDEX_MIN,
  POKEDEX_MAX,
  AREA_IDS,
  normalizeAreaId,
  getPokemonAreaId,
  getPokemonAreaTotals,
  getPokemonRarityTier,
  getRandomPokemonByMinTier,
  getPokemonIdForAgent,
  getEvolutionPath,
  getNextEvolution,
  resolveRenderedPokemonIdForAgent
};
