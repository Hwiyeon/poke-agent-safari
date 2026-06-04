'use strict';

const fs = require('fs');
const path = require('path');

const EVOLUTION_RULES_FILE = path.join(__dirname, 'data', 'evolution_rules.json');

const EVOLUTION_ITEM_POOL = Object.freeze([
  { id: 'dawn-stone', nameEn: 'Dawn Stone', nameKo: '각성의돌' },
  { id: 'deep-sea-scale', nameEn: 'Deep Sea Scale', nameKo: '심해의비늘' },
  { id: 'deep-sea-tooth', nameEn: 'Deep Sea Tooth', nameKo: '심해의이빨' },
  { id: 'dragon-scale', nameEn: 'Dragon Scale', nameKo: '용의비늘' },
  { id: 'dubious-disc', nameEn: 'Dubious Disc', nameKo: '괴상한패치' },
  { id: 'dusk-stone', nameEn: 'Dusk Stone', nameKo: '어둠의돌' },
  { id: 'electirizer', nameEn: 'Electirizer', nameKo: '에레키부스터' },
  { id: 'fire-stone', nameEn: 'Fire Stone', nameKo: '불꽃의돌' },
  { id: 'ice-stone', nameEn: 'Ice Stone', nameKo: '얼음의돌' },
  { id: 'kings-rock', nameEn: "King's Rock", nameKo: '왕의징표석' },
  { id: 'leaf-stone', nameEn: 'Leaf Stone', nameKo: '리프의돌' },
  { id: 'magmarizer', nameEn: 'Magmarizer', nameKo: '마그마부스터' },
  { id: 'metal-coat', nameEn: 'Metal Coat', nameKo: '금속코트' },
  { id: 'moon-stone', nameEn: 'Moon Stone', nameKo: '달의돌' },
  { id: 'oval-stone', nameEn: 'Oval Stone', nameKo: '동글동글돌' },
  { id: 'prism-scale', nameEn: 'Prism Scale', nameKo: '고운비늘' },
  { id: 'protector', nameEn: 'Protector', nameKo: '프로텍터' },
  { id: 'razor-claw', nameEn: 'Razor Claw', nameKo: '예리한손톱' },
  { id: 'razor-fang', nameEn: 'Razor Fang', nameKo: '예리한이빨' },
  { id: 'reaper-cloth', nameEn: 'Reaper Cloth', nameKo: '영계의천' },
  { id: 'shiny-stone', nameEn: 'Shiny Stone', nameKo: '빛의돌' },
  { id: 'sun-stone', nameEn: 'Sun Stone', nameKo: '태양의돌' },
  { id: 'thunder-stone', nameEn: 'Thunder Stone', nameKo: '천둥의돌' },
  { id: 'up-grade', nameEn: 'Up-Grade', nameKo: '업그레이드' },
  { id: 'water-stone', nameEn: 'Water Stone', nameKo: '물의돌' },
  { id: 'linking-cord', nameEn: 'Linking Cord', nameKo: '연결의끈' }
]);

const EVOLUTION_ITEM_IDS = new Set(EVOLUTION_ITEM_POOL.map((item) => item.id));

const TOKEN_PER_ITEM_POINT = 10000;
const PULL_SUCCESS_RATE = 0.3;
const PICKUP_SUCCESS_RATE = 0.15;
const RANDOM_PULL_POINT_COST = 250;
const PULL_FAILURE_POINT_REFUND = 0;
const ITEM_SELL_POINT_VALUE = 10;
const ITEM_BUY_POINT_COST = null;
const ITEM_CLAIM_TICKET_COST = 20;
const MAX_PULL_HISTORY = 40;

let cachedEvolutionRules = null;

function isEvolutionItemId(itemId) {
  return EVOLUTION_ITEM_IDS.has(String(itemId || ''));
}

function itemNameKo(itemId) {
  const item = EVOLUTION_ITEM_POOL.find((candidate) => candidate.id === itemId);
  return item ? item.nameKo : String(itemId || '');
}

function clampNonNegativeInteger(value) {
  const number = Math.floor(Number(value) || 0);
  return number > 0 ? number : 0;
}

function normalizeInventory(rawInventory) {
  const inventory = {};
  if (!rawInventory || typeof rawInventory !== 'object') {
    return inventory;
  }
  for (const [itemId, count] of Object.entries(rawInventory)) {
    if (!isEvolutionItemId(itemId)) continue;
    const normalizedCount = clampNonNegativeInteger(count);
    if (normalizedCount > 0) {
      inventory[itemId] = normalizedCount;
    }
  }
  return inventory;
}

function normalizePullHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) {
    return [];
  }
  return rawHistory
    .filter((entry) => entry && typeof entry === 'object')
    .slice(-MAX_PULL_HISTORY)
    .map((entry) => ({
      id: typeof entry.id === 'string' && entry.id ? entry.id : `pull-${Date.now().toString(36)}`,
      createdAt: Number.isFinite(Number(entry.createdAt)) ? Number(entry.createdAt) : Date.now(),
      success: !!entry.success,
      itemId: isEvolutionItemId(entry.itemId) ? entry.itemId : null,
      source: entry.source === 'ticket' ? 'ticket' : 'points',
      pickupItemId: isEvolutionItemId(entry.pickupItemId) ? entry.pickupItemId : null
    }));
}

function normalizeEvolutionItemState(rawState = {}) {
  const pickupItemId = isEvolutionItemId(rawState.pickupItemId) ? rawState.pickupItemId : null;
  const legacyPullTickets = clampNonNegativeInteger(rawState.pullTickets);
  const rawTargetTickets = rawState.targetTickets !== undefined
    ? rawState.targetTickets
    : (rawState.pickupTickets !== undefined ? rawState.pickupTickets : rawState.pickupPoints);
  return {
    inventory: normalizeInventory(rawState.inventory),
    itemPoints: clampNonNegativeInteger(rawState.itemPoints) + legacyPullTickets * RANDOM_PULL_POINT_COST,
    targetTickets: clampNonNegativeInteger(rawTargetTickets),
    rewardTokenRemainder: clampNonNegativeInteger(rawState.rewardTokenRemainder),
    pickupItemId,
    pullHistory: normalizePullHistory(rawState.pullHistory)
  };
}

function cloneEvolutionItemState(state) {
  const normalized = normalizeEvolutionItemState(state);
  return {
    ...normalized,
    inventory: { ...normalized.inventory },
    pullHistory: normalized.pullHistory.map((entry) => ({ ...entry }))
  };
}

function addEffectiveRewardTokens(state, tokens) {
  const amount = clampNonNegativeInteger(tokens);
  if (amount <= 0) {
    return 0;
  }
  const total = state.rewardTokenRemainder + amount;
  const gainedPoints = Math.floor(total / TOKEN_PER_ITEM_POINT);
  state.rewardTokenRemainder = total % TOKEN_PER_ITEM_POINT;
  if (gainedPoints > 0) {
    state.itemPoints += gainedPoints;
  }
  return gainedPoints;
}

function addInventoryItem(state, itemId, count = 1) {
  if (!isEvolutionItemId(itemId)) {
    return false;
  }
  const amount = clampNonNegativeInteger(count);
  if (amount <= 0) {
    return false;
  }
  state.inventory[itemId] = (state.inventory[itemId] || 0) + amount;
  return true;
}

function removeInventoryItem(state, itemId, count = 1) {
  if (!isEvolutionItemId(itemId)) {
    return false;
  }
  const amount = clampNonNegativeInteger(count);
  if (amount <= 0 || (state.inventory[itemId] || 0) < amount) {
    return false;
  }
  state.inventory[itemId] -= amount;
  if (state.inventory[itemId] <= 0) {
    delete state.inventory[itemId];
  }
  return true;
}

function pushPullHistory(state, entry) {
  state.pullHistory.push({
    id: entry.id || `pull-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: entry.createdAt || Date.now(),
    success: !!entry.success,
    itemId: entry.itemId || null,
    source: entry.source === 'ticket' ? 'ticket' : 'points',
    pickupItemId: entry.pickupItemId || null
  });
  if (state.pullHistory.length > MAX_PULL_HISTORY) {
    state.pullHistory.splice(0, state.pullHistory.length - MAX_PULL_HISTORY);
  }
}

function pickRandomItem(pool, rng) {
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }
  const roll = Math.max(0, Math.min(0.999999999, Number(rng()) || 0));
  return pool[Math.floor(roll * pool.length)] || pool[0];
}

function pullEvolutionItem(state, options = {}) {
  const source = 'points';
  if (state.itemPoints < RANDOM_PULL_POINT_COST) {
    return { ok: false, error: 'Not enough item points.' };
  }
  state.itemPoints -= RANDOM_PULL_POINT_COST;

  const rng = typeof options.rng === 'function' ? options.rng : Math.random;
  const success = (Number(rng()) || 0) < PULL_SUCCESS_RATE;
  if (!success) {
    if (PULL_FAILURE_POINT_REFUND > 0) {
      state.itemPoints += PULL_FAILURE_POINT_REFUND;
    }
    pushPullHistory(state, { success: false, source, pickupItemId: state.pickupItemId });
    return { ok: true, success: false, source, itemId: null };
  }

  let itemId = null;
  const pickupItemId = state.pickupItemId;
  if (pickupItemId && (Number(rng()) || 0) < PICKUP_SUCCESS_RATE) {
    itemId = pickupItemId;
  } else {
    const pool = pickupItemId
      ? EVOLUTION_ITEM_POOL.filter((item) => item.id !== pickupItemId).map((item) => item.id)
      : EVOLUTION_ITEM_POOL.map((item) => item.id);
    itemId = pickRandomItem(pool, rng);
  }

  addInventoryItem(state, itemId, 1);
  if (pickupItemId && itemId !== pickupItemId) {
    state.targetTickets += 1;
  }
  pushPullHistory(state, { success: true, itemId, source, pickupItemId });
  return { ok: true, success: true, source, itemId };
}

function buyEvolutionItem(state, itemId, currency = 'points') {
  if (!isEvolutionItemId(itemId)) {
    return { ok: false, error: 'Unknown evolution item.' };
  }
  if (currency === 'ticket' || currency === 'pickup') {
    if (state.targetTickets < ITEM_CLAIM_TICKET_COST) {
      return { ok: false, error: 'Not enough target tickets.' };
    }
    state.targetTickets -= ITEM_CLAIM_TICKET_COST;
  } else {
    return { ok: false, error: 'Point buying is disabled.' };
  }
  addInventoryItem(state, itemId, 1);
  return { ok: true, itemId, currency: 'ticket' };
}

function sellEvolutionItem(state, itemId) {
  if (!removeInventoryItem(state, itemId, 1)) {
    return { ok: false, error: 'Item is not in inventory.' };
  }
  state.itemPoints += ITEM_SELL_POINT_VALUE;
  return { ok: true, itemId, itemPoints: state.itemPoints };
}

function loadEvolutionRules() {
  if (cachedEvolutionRules) {
    return cachedEvolutionRules;
  }
  try {
    const raw = fs.readFileSync(EVOLUTION_RULES_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (data && data.rules && typeof data.rules === 'object') {
      cachedEvolutionRules = data.rules;
      return cachedEvolutionRules;
    }
  } catch (_) {
    // Missing generated rules only disables explicit evolution candidates.
  }
  cachedEvolutionRules = {};
  return cachedEvolutionRules;
}

function evolutionOptionsForSpecies(speciesId) {
  const normalizedId = Number(speciesId);
  if (!Number.isInteger(normalizedId)) {
    return [];
  }
  const rules = loadEvolutionRules();
  const options = rules[String(normalizedId)] || [];
  return Array.isArray(options) ? options.map((option) => ({ ...option })) : [];
}

function evolutionItemSnapshot(state) {
  const normalized = cloneEvolutionItemState(state);
  return {
    ...normalized,
    pool: EVOLUTION_ITEM_POOL.map((item) => ({ ...item })),
    tokenPerItemPoint: TOKEN_PER_ITEM_POINT,
    randomPullPointCost: RANDOM_PULL_POINT_COST,
    pullFailurePointRefund: PULL_FAILURE_POINT_REFUND,
    itemSellPointValue: ITEM_SELL_POINT_VALUE,
    itemBuyPointCost: ITEM_BUY_POINT_COST,
    itemBuyPickupPointCost: ITEM_CLAIM_TICKET_COST,
    itemClaimTicketCost: ITEM_CLAIM_TICKET_COST
  };
}

module.exports = {
  EVOLUTION_ITEM_POOL,
  TOKEN_PER_ITEM_POINT,
  RANDOM_PULL_POINT_COST,
  PULL_FAILURE_POINT_REFUND,
  ITEM_SELL_POINT_VALUE,
  ITEM_BUY_POINT_COST,
  ITEM_CLAIM_TICKET_COST,
  ITEM_BUY_PICKUP_POINT_COST: ITEM_CLAIM_TICKET_COST,
  isEvolutionItemId,
  itemNameKo,
  normalizeEvolutionItemState,
  cloneEvolutionItemState,
  evolutionItemSnapshot,
  addEffectiveRewardTokens,
  addInventoryItem,
  removeInventoryItem,
  pullEvolutionItem,
  buyEvolutionItem,
  sellEvolutionItem,
  evolutionOptionsForSpecies
};
