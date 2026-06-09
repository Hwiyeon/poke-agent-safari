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

const EVOLUTION_ITEM_WEIGHTS = Object.freeze({
  'dawn-stone': 45,
  'deep-sea-scale': 20,
  'deep-sea-tooth': 20,
  'dragon-scale': 15,
  'dubious-disc': 20,
  'dusk-stone': 45,
  'electirizer': 20,
  'fire-stone': 70,
  'ice-stone': 70,
  'kings-rock': 30,
  'leaf-stone': 70,
  'magmarizer': 20,
  'metal-coat': 35,
  'moon-stone': 60,
  'oval-stone': 30,
  'prism-scale': 20,
  'protector': 15,
  'razor-claw': 25,
  'razor-fang': 25,
  'reaper-cloth': 15,
  'shiny-stone': 45,
  'sun-stone': 60,
  'thunder-stone': 70,
  'up-grade': 25,
  'water-stone': 70,
  'linking-cord': 60
});

const EVOLUTION_ITEM_IDS = new Set(EVOLUTION_ITEM_POOL.map((item) => item.id));
const EVOLUTION_ITEM_WEIGHT_TOTAL = EVOLUTION_ITEM_POOL.reduce(
  (total, item) => total + (EVOLUTION_ITEM_WEIGHTS[item.id] || 0),
  0
);

const TOKEN_PER_ITEM_POINT = 10000;
const PULL_SUCCESS_RATE = 0.3;
const PICKUP_WEIGHT_MULTIPLIER = 2.5;
const RANDOM_PULL_POINT_COST = 250;
const PULL_FAILURE_POINT_REFUND = 0;
const ITEM_SELL_POINT_VALUE = 10;
const ITEM_BUY_POINT_COST = null;
const ITEM_CLAIM_TICKET_COST = 20;
const MAX_PULL_HISTORY = 40;
const PULL_SUCCESS_REWARD_POOL = Object.freeze([
  Object.freeze({ type: 'item', weight: 80 }),
  Object.freeze({ type: 'ticket', minTier: 1, weight: 10 }),
  Object.freeze({ type: 'ticket', minTier: 2, weight: 6 }),
  Object.freeze({ type: 'ticket', minTier: 3, weight: 3 }),
  Object.freeze({ type: 'ticket', minTier: 4, weight: 1 })
]);
const TICKET_TIER_LABELS = Object.freeze({
  1: 'Common+',
  2: 'Uncommon+',
  3: 'Rare+',
  4: 'Very Rare+',
  5: 'Legend'
});
const RECRUIT_TICKET_POOL = Object.freeze([
  Object.freeze({ id: 'recruit-ticket-common', nameEn: 'Common+ Recruit Ticket', nameKo: 'Common+ 영입 티켓', minTier: 1 }),
  Object.freeze({ id: 'recruit-ticket-uncommon', nameEn: 'Uncommon+ Recruit Ticket', nameKo: 'Uncommon+ 영입 티켓', minTier: 2 }),
  Object.freeze({ id: 'recruit-ticket-rare', nameEn: 'Rare+ Recruit Ticket', nameKo: 'Rare+ 영입 티켓', minTier: 3 }),
  Object.freeze({ id: 'recruit-ticket-very-rare', nameEn: 'Very Rare+ Recruit Ticket', nameKo: 'Very Rare+ 영입 티켓', minTier: 4 }),
  Object.freeze({ id: 'recruit-ticket-legend', nameEn: 'Legend Recruit Ticket', nameKo: 'Legend 영입 티켓', minTier: 5 })
]);

let cachedEvolutionRules = null;

function isEvolutionItemId(itemId) {
  return EVOLUTION_ITEM_IDS.has(String(itemId || ''));
}

const RECRUIT_TICKET_IDS = new Set(RECRUIT_TICKET_POOL.map((item) => item.id));
const INVENTORY_ITEM_IDS = new Set([
  ...EVOLUTION_ITEM_POOL.map((item) => item.id),
  ...RECRUIT_TICKET_POOL.map((item) => item.id)
]);

function isRecruitTicketItemId(itemId) {
  return RECRUIT_TICKET_IDS.has(String(itemId || ''));
}

function isInventoryItemId(itemId) {
  return INVENTORY_ITEM_IDS.has(String(itemId || ''));
}

function inventoryItemById(itemId) {
  const id = String(itemId || '');
  return EVOLUTION_ITEM_POOL.find((item) => item.id === id) ||
    RECRUIT_TICKET_POOL.find((item) => item.id === id) ||
    null;
}

function itemNameKo(itemId) {
  const item = inventoryItemById(itemId);
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
    if (!isInventoryItemId(itemId)) continue;
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
      rewardType: entry.rewardType === 'ticket' ? 'ticket' : 'item',
      ticketMinTier: normalizeTicketMinTier(entry.ticketMinTier),
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
  if (!isInventoryItemId(itemId)) {
    return false;
  }
  const amount = clampNonNegativeInteger(count);
  if (amount <= 0) {
    return false;
  }
  state.inventory[itemId] = (state.inventory[itemId] || 0) + amount;
  return true;
}

function normalizeTicketMinTier(value) {
  const tier = Math.floor(Number(value) || 0);
  return tier >= 1 && tier <= 5 ? tier : null;
}

function ticketRewardForMinTier(minTier, count = 1) {
  const normalizedMinTier = normalizeTicketMinTier(minTier);
  if (!normalizedMinTier) {
    return null;
  }
  return {
    type: 'random-recruit-ticket',
    minTier: normalizedMinTier,
    count: Math.max(1, clampNonNegativeInteger(count) || 1),
    label: TICKET_TIER_LABELS[normalizedMinTier] || 'Common+'
  };
}

function recruitTicketItemForMinTier(minTier) {
  const normalizedMinTier = normalizeTicketMinTier(minTier);
  if (!normalizedMinTier) {
    return null;
  }
  const item = RECRUIT_TICKET_POOL.find((candidate) => candidate.minTier === normalizedMinTier);
  return item ? { ...item, label: TICKET_TIER_LABELS[normalizedMinTier] || 'Common+' } : null;
}

function ticketRewardForItemId(itemId) {
  const item = RECRUIT_TICKET_POOL.find((candidate) => candidate.id === String(itemId || ''));
  return item ? ticketRewardForMinTier(item.minTier, 1) : null;
}

function removeInventoryItem(state, itemId, count = 1) {
  if (!isInventoryItemId(itemId)) {
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
    rewardType: entry.rewardType === 'ticket' ? 'ticket' : 'item',
    ticketMinTier: normalizeTicketMinTier(entry.ticketMinTier),
    source: entry.source === 'ticket' ? 'ticket' : 'points',
    pickupItemId: entry.pickupItemId || null
  });
  if (state.pullHistory.length > MAX_PULL_HISTORY) {
    state.pullHistory.splice(0, state.pullHistory.length - MAX_PULL_HISTORY);
  }
}

function itemWeight(itemId) {
  return EVOLUTION_ITEM_WEIGHTS[itemId] || 0;
}

function pickWeightedItem(pool, rng, options = {}) {
  if (!Array.isArray(pool) || pool.length === 0) {
    return null;
  }
  const pickupItemId = isEvolutionItemId(options.pickupItemId) ? options.pickupItemId : null;
  const weightedPool = pool
    .map((itemId) => {
      const id = String(itemId || '');
      const multiplier = pickupItemId && id === pickupItemId ? PICKUP_WEIGHT_MULTIPLIER : 1;
      return { id, weight: itemWeight(id) * multiplier };
    })
    .filter((item) => isEvolutionItemId(item.id) && item.weight > 0);
  const totalWeight = weightedPool.reduce((total, item) => total + item.weight, 0);
  if (totalWeight <= 0) {
    return null;
  }
  const roll = Math.max(0, Math.min(0.999999999, Number(rng()) || 0)) * totalWeight;
  let cursor = 0;
  for (const item of weightedPool) {
    cursor += item.weight;
    if (roll < cursor) {
      return item.id;
    }
  }
  return weightedPool[weightedPool.length - 1].id;
}

function pickPullSuccessReward(rng) {
  const totalWeight = PULL_SUCCESS_REWARD_POOL.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.max(0, Math.min(0.999999999, Number(rng()) || 0)) * totalWeight;
  for (const entry of PULL_SUCCESS_REWARD_POOL) {
    if (roll < entry.weight) {
      return entry;
    }
    roll -= entry.weight;
  }
  return PULL_SUCCESS_REWARD_POOL[PULL_SUCCESS_REWARD_POOL.length - 1];
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

  const rewardEntry = pickPullSuccessReward(rng);
  if (rewardEntry.type === 'ticket') {
    const ticketReward = ticketRewardForMinTier(rewardEntry.minTier, 1);
    const ticketItem = recruitTicketItemForMinTier(rewardEntry.minTier);
    if (ticketItem) {
      addInventoryItem(state, ticketItem.id, 1);
    }
    pushPullHistory(state, {
      success: true,
      rewardType: 'ticket',
      ticketMinTier: rewardEntry.minTier,
      source,
      pickupItemId: state.pickupItemId
    });
    return { ok: true, success: true, source, rewardType: 'ticket', itemId: ticketItem ? ticketItem.id : null, ticketReward };
  }

  const pickupItemId = state.pickupItemId;
  const itemId = pickWeightedItem(
    EVOLUTION_ITEM_POOL.map((item) => item.id),
    rng,
    { pickupItemId }
  );

  addInventoryItem(state, itemId, 1);
  if (pickupItemId && itemId !== pickupItemId) {
    state.targetTickets += 1;
  }
  pushPullHistory(state, { success: true, rewardType: 'item', itemId, source, pickupItemId });
  return { ok: true, success: true, source, rewardType: 'item', itemId };
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
  if (!isEvolutionItemId(itemId)) {
    return { ok: false, error: 'Item cannot be sold.' };
  }
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
    pool: EVOLUTION_ITEM_POOL.map((item) => ({ ...item, weight: itemWeight(item.id) })),
    recruitTickets: RECRUIT_TICKET_POOL.map((item) => ({
      ...item,
      label: TICKET_TIER_LABELS[item.minTier] || item.nameEn
    })),
    itemWeightTotal: EVOLUTION_ITEM_WEIGHT_TOTAL,
    pickupWeightMultiplier: PICKUP_WEIGHT_MULTIPLIER,
    tokenPerItemPoint: TOKEN_PER_ITEM_POINT,
    randomPullPointCost: RANDOM_PULL_POINT_COST,
    pullSuccessRate: PULL_SUCCESS_RATE,
    pullFailurePointRefund: PULL_FAILURE_POINT_REFUND,
    pullSuccessRewardPool: PULL_SUCCESS_REWARD_POOL.map((entry) => ({ ...entry })),
    itemSellPointValue: ITEM_SELL_POINT_VALUE,
    itemBuyPointCost: ITEM_BUY_POINT_COST,
    itemBuyPickupPointCost: ITEM_CLAIM_TICKET_COST,
    itemClaimTicketCost: ITEM_CLAIM_TICKET_COST
  };
}

module.exports = {
  EVOLUTION_ITEM_POOL,
  EVOLUTION_ITEM_WEIGHTS,
  EVOLUTION_ITEM_WEIGHT_TOTAL,
  PICKUP_WEIGHT_MULTIPLIER,
  TOKEN_PER_ITEM_POINT,
  PULL_SUCCESS_RATE,
  RANDOM_PULL_POINT_COST,
  PULL_FAILURE_POINT_REFUND,
  ITEM_SELL_POINT_VALUE,
  ITEM_BUY_POINT_COST,
  ITEM_CLAIM_TICKET_COST,
  ITEM_BUY_PICKUP_POINT_COST: ITEM_CLAIM_TICKET_COST,
  PULL_SUCCESS_REWARD_POOL,
  TICKET_TIER_LABELS,
  RECRUIT_TICKET_POOL,
  ticketRewardForMinTier,
  recruitTicketItemForMinTier,
  ticketRewardForItemId,
  isEvolutionItemId,
  isRecruitTicketItemId,
  isInventoryItemId,
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
