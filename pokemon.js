'use strict';

const fs = require('fs');
const path = require('path');

const POKEDEX_MIN = 1;
const POKEDEX_MAX = 649;
const TIER_WEIGHTS = Object.freeze({ 1: 40, 2: 25, 3: 15, 4: 5, 5: 1 });
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

function loadPokemonCatalog() {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  let weightedPool = [];
  let areaWeightedPools = Object.fromEntries(AREA_IDS.map((areaId) => [areaId, []]));
  let pokemonAreaIds = {};
  let pokemonRarityTiers = {};

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.pokemon)) {
      for (const pokemon of data.pokemon) {
        const pokemonId = Number(pokemon && pokemon.pokemon_id);
        if (!Number.isInteger(pokemonId) || pokemonId < POKEDEX_MIN || pokemonId > POKEDEX_MAX) {
          continue;
        }
        const weight = TIER_WEIGHTS[pokemon.final_tier] || 1;
        const tier = Number(pokemon.final_tier);
        pokemonRarityTiers[pokemonId] = Number.isInteger(tier) && tier >= 1 && tier <= 5 ? tier : 1;
        const areaId = HABITAT_TO_AREA[pokemon.habitat] || null;
        if (areaId) {
          pokemonAreaIds[pokemonId] = areaId;
        }
        for (let i = 0; i < weight; i += 1) {
          weightedPool.push(pokemonId);
          if (areaId && areaWeightedPools[areaId]) {
            areaWeightedPools[areaId].push(pokemonId);
          }
        }
      }
    }
  } catch (_) {
    weightedPool = [];
    areaWeightedPools = Object.fromEntries(AREA_IDS.map((areaId) => [areaId, []]));
    pokemonAreaIds = {};
    pokemonRarityTiers = {};
  }

  if (weightedPool.length === 0) {
    for (let pokemonId = POKEDEX_MIN; pokemonId <= POKEDEX_MAX; pokemonId += 1) {
      weightedPool.push(pokemonId);
    }
  }

  cachedCatalog = { weightedPool, areaWeightedPools, pokemonAreaIds, pokemonRarityTiers };
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

function getPokemonIdForAgent(agentId, options = {}) {
  if (!agentId) {
    return POKEDEX_MIN;
  }

  const catalog = loadPokemonCatalog();
  const maxPokemonId = Number(options.maxPokemonId);
  const areaId = normalizeAreaId(options.areaId);
  let pool = areaId !== 'all' && catalog.areaWeightedPools[areaId] && catalog.areaWeightedPools[areaId].length > 0
    ? catalog.areaWeightedPools[areaId]
    : catalog.weightedPool;
  if (Number.isInteger(maxPokemonId) && maxPokemonId >= POKEDEX_MIN && maxPokemonId < POKEDEX_MAX) {
    pool = pool.filter((pokemonId) => pokemonId <= maxPokemonId);
    if (pool.length === 0) {
      pool = [];
      for (let pokemonId = POKEDEX_MIN; pokemonId <= maxPokemonId; pokemonId += 1) {
        pool.push(pokemonId);
      }
    }
  }
  const index = hashCode(String(agentId)) % pool.length;
  return pool[index];
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
  getPokemonRarityTier,
  getPokemonIdForAgent,
  getEvolutionPath,
  getNextEvolution,
  resolveRenderedPokemonIdForAgent
};
