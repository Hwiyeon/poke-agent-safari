#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dev', 'data', 'generated');
const SOURCE_251_PATH = path.join(OUT_DIR, 'llm_habitat_rarity_judgement_001_251.json');
const OUTPUT_PATH = path.join(OUT_DIR, 'llm_habitat_rarity_judgement_001_649.json');
const CURRENT_DATA_PATH = path.join(ROOT, 'data', 'pokemon_data.json');
const KO_NAMES_PATH = path.join(ROOT, 'data', 'pokemon_names_ko.json');
const SPECIES_DIR = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'pokemon-species');
const CHAIN_DIR = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'evolution-chain');

const TIER_LABELS = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Very Rare',
  5: 'Legendary',
};

const STARTER_BASE = new Set([252, 255, 258, 387, 390, 393, 495, 498, 501]);
const STARTER_MID = new Set([253, 256, 259, 388, 391, 394, 496, 499, 502]);
const STARTER_FINAL = new Set([254, 257, 260, 389, 392, 395, 497, 500, 503]);

const PSEUDO_BASE_MID = new Set([371, 372, 374, 375, 443, 444, 633, 634]);
const PSEUDO_FINAL = new Set([373, 376, 445, 635]);
const FOSSIL_BASE = new Set([345, 347, 408, 410, 564, 566]);
const FOSSIL_FINAL = new Set([346, 348, 409, 411, 565, 567]);

const REGIONAL_RARE = new Set([
  335, 336, 337, 338, 369, 417, 441, 455,
  511, 512, 513, 514, 515, 516, 538, 539, 550, 556, 561, 626, 631, 632,
]);

const TRADE_SPECIAL_FINAL = new Set([]);
const POPULAR_POWER_RARE = new Set([473, 530, 604, 609]);

const USER_UNCOMMON = new Set([
  280, 281, 309, 310, 313, 314, 324, 329, 357, 358, 413, 414, 417, 433, 438, 439, 455, 458,
  511, 512, 513, 514, 515, 516, 531, 550, 553, 554, 556, 576, 578, 584, 600, 614, 624,
]);
const USER_RARE = new Set([
  282, 330, 349, 367, 368, 407, 416, 429, 430, 448, 461, 462, 468, 475, 478, 534, 589, 617,
]);
const USER_VERY_RARE = new Set([442, 479, 615]);
const COMMON_FINAL = new Set([264, 267, 269, 277, 279, 398, 402, 505, 508, 521, 528, 537, 542, 545, 581, 584]);

const VERY_RARE = new Set([
  ...PSEUDO_FINAL,
  ...FOSSIL_FINAL,
  ...TRADE_SPECIAL_FINAL,
  350, 464, 466, 467, 474, 477, 612, 637,
]);

const RARE = new Set([
  ...PSEUDO_BASE_MID,
  ...FOSSIL_BASE,
  ...REGIONAL_RARE,
  ...POPULAR_POWER_RARE,
  302, 303, 309, 310, 351, 352, 359, 407, 424, 426, 433, 438, 439, 440, 442,
  446, 447, 458, 462, 463, 465, 469, 470, 471, 472, 473, 476, 479,
  523, 526, 534, 553, 554, 555, 570, 571, 576, 589, 594, 600, 601, 604, 609,
  610, 611, 614, 615, 617, 618, 621, 624, 625, 636,
]);

const UNCOMMON = new Set([
  261, 262, 273, 274, 283, 284, 285, 286, 296, 297, 299, 300, 301, 307, 308,
  311, 312, 315, 316, 317, 318, 319, 320, 321, 325, 326, 327, 328, 329, 331, 332,
  339, 340, 341, 342, 343, 344, 353, 354, 355, 356, 358, 360, 361, 362, 363, 364,
  365, 366, 370, 402, 403, 404, 405, 412, 415, 416, 419, 421, 423, 425, 427, 428,
  431, 432, 434, 435, 436, 437, 449, 450, 451, 452, 453, 454, 459, 460, 504, 505,
  506, 507, 508, 509, 510, 517, 518, 519, 520, 521, 522, 524, 525, 527, 528, 529,
  530, 531, 532, 533, 535, 536, 537, 540, 541, 542, 543, 544, 545, 546, 547, 548,
  549, 551, 552, 557, 558, 559, 560, 562, 563, 568, 569, 572, 573, 574, 575, 577,
  578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 590, 591, 592, 593, 595,
  596, 597, 598, 599, 602, 603, 605, 606, 607, 608, 613, 616, 619, 620, 622, 623,
  627, 628, 629, 630,
]);

const HABITAT_OVERRIDES = {
  393: 'waters-edge', 394: 'waters-edge', 395: 'waters-edge',
  495: 'grassland', 496: 'grassland', 497: 'grassland',
  498: 'grassland', 499: 'grassland', 500: 'grassland',
  501: 'waters-edge', 502: 'waters-edge', 503: 'waters-edge',
};

const LATEST_TIER_OVERRIDES = {
  49: { tier: 2, reason: '최신 보정: 도나리는 숲 곤충 최종형으로 보통권' },
  57: { tier: 2, reason: '최신 보정: 성원숭은 일반 격투 최종형으로 보통권' },
  85: { tier: 2, reason: '최신 보정: 두트리오는 일반 조류 최종형으로 보통권' },
  86: { tier: 1, reason: '최신 보정: 쥬쥬는 일반 해양 기본종으로 흔함' },
  88: { tier: 1, reason: '분포 보정: 질퍽이는 일반 오염지 기본종으로 흔함' },
  113: { tier: 3, reason: '최신 보정: 럭키는 희귀하지만 Very Rare까지는 아님' },
  119: { tier: 1, reason: '최신 보정: 왕콘치는 일반 수중 진화체로 흔함' },
  131: { tier: 3, reason: '최신 보정: 라프라스는 상징적 희귀종' },
  169: { tier: 3, reason: '최신 보정: 크로뱃은 친밀도 최종형 프리미엄' },
  186: { tier: 3, reason: '최신 보정: 왕구리는 분기 진화체지만 희귀권으로 제한' },
  201: { tier: 1, reason: '최신 보정: 안농은 이벤트성보다 일반 수집 기준을 낮게 평가' },
  206: { tier: 3, reason: '최신 보정: 노고치는 단독종 특이성과 체감 수집 프리미엄을 반영해 Rare' },
  222: { tier: 2, reason: '최신 보정: 코산호는 지역/해안 조건성이 있으나 보통권' },
  229: { tier: 2, reason: '최신 보정: 헬가는 일반 악/불꽃 진화체로 보통권' },
  309: { tier: 1, reason: '최신 보정: 썬더라이는 일반 전기 기본종으로 흔함' },
  331: { tier: 1, reason: '최신 보정: 선인왕은 일반 사막 기본종으로 흔함' },
  398: { tier: 2, reason: '최신 보정: 찌르호크는 일반 조류 최종형으로 보통권' },
  412: { tier: 1, reason: '최신 보정: 도롱충이는 흔한 기본 벌레 포켓몬' },
  453: { tier: 1, reason: '최신 보정: 삐딱구리는 일반 독/격투 기본종으로 흔함' },
  462: { tier: 4, reason: '최신 보정: 자포코일은 특수 진화 최종형 프리미엄' },
  468: { tier: 4, reason: '최신 보정: 토게키스는 높은 수집/진화 프리미엄' },
  508: { tier: 2, reason: '최신 보정: 바랜드는 일반 최종형으로 보통권' },
  521: { tier: 2, reason: '최신 보정: 켄호로우는 일반 조류 최종형으로 보통권' },
  522: { tier: 1, reason: '최신 보정: 줄뮤마는 일반 전기 기본종으로 흔함' },
  523: { tier: 2, reason: '최신 보정: 제브라이카는 일반 전기 최종형으로 보통권' },
  530: { tier: 2, reason: '최신 보정: 몰드류는 강하지만 일반 최종형으로 보통권' },
  537: { tier: 2, reason: '최신 보정: 두빅굴은 일반 최종형으로 보통권' },
  545: { tier: 2, reason: '최신 보정: 펜드라는 일반 최종형으로 보통권' },
  589: { tier: 4, reason: '최신 보정: 슈바르고는 교환/특수 진화 최종형 프리미엄' },
  615: { tier: 3, reason: '최신 보정: 프리지오는 희귀하지만 Very Rare까지는 아님' },
  617: { tier: 4, reason: '최신 보정: 어지리더는 교환/특수 진화 최종형 프리미엄' },
};

function main() {
  const sourceRows = JSON.parse(fs.readFileSync(SOURCE_251_PATH, 'utf8'));
  const currentRows = JSON.parse(fs.readFileSync(CURRENT_DATA_PATH, 'utf8')).pokemon;
  const namesKo = JSON.parse(fs.readFileSync(KO_NAMES_PATH, 'utf8'));
  const currentById = new Map(currentRows.map((row) => [row.pokemon_id, row]));

  const generatedRows = [];
  for (let id = 252; id <= 649; id += 1) {
    const current = currentById.get(id);
    if (!current) throw new Error(`Missing current data for #${id}`);
    const species = readSpecies(id);
    const judgement = classify(current, species);
    generatedRows.push({
      id,
      name: current.name,
      name_ko: namesKo[id] || current.name,
      llm_habitat: HABITAT_OVERRIDES[id] || current.habitat,
      llm_tier: judgement.tier,
      llm_tier_label: TIER_LABELS[judgement.tier],
      memo_ko: judgement.memo,
    });
  }

  const rows = sourceRows
    .filter((row) => row.id >= 1 && row.id <= 251)
    .concat(generatedRows)
    .sort((a, b) => a.id - b.id);

  applyLatestTierOverrides(rows);
  enforceEvolutionConstraints(rows);
  validateRows(rows);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(rows, null, 2) + '\n', 'utf8');

  const dist = {};
  for (const row of rows) dist[row.llm_tier] = (dist[row.llm_tier] || 0) + 1;
  process.stdout.write(JSON.stringify({ rows: rows.length, tier_distribution: dist }, null, 2) + '\n');
}

function applyLatestTierOverrides(rows) {
  for (const row of rows) {
    const override = LATEST_TIER_OVERRIDES[row.id];
    if (!override) continue;
    row.llm_tier = override.tier;
    row.llm_tier_label = TIER_LABELS[override.tier];
    row.memo_ko = override.reason;
  }
}

function classify(current, species) {
  const id = current.pokemon_id;
  if (species.is_legendary || species.is_mythical) {
    return { tier: 5, memo: '공식 전설/환상 포켓몬으로 별도 격' };
  }
  if (USER_RARE.has(id)) {
    return { tier: 3, memo: userRareMemo(id) };
  }
  if (USER_VERY_RARE.has(id)) {
    return { tier: 4, memo: userVeryRareMemo(id) };
  }
  if (USER_UNCOMMON.has(id)) {
    return { tier: 2, memo: userUncommonMemo(id) };
  }
  if (COMMON_FINAL.has(id)) {
    return { tier: 1, memo: '흔한 일반 계열의 진화체라 Common으로 완화' };
  }
  if (VERY_RARE.has(id)) {
    return { tier: 4, memo: veryRareMemo(id) };
  }
  if (STARTER_FINAL.has(id)) {
    return { tier: 3, memo: '스타터 최종형이라 희귀권 유지' };
  }
  if (STARTER_BASE.has(id)) {
    return { tier: 2, memo: '스타터 기본종이라 흔한 일반종보다 높게 평가' };
  }
  if (STARTER_MID.has(id)) {
    return { tier: 2, memo: '스타터 중간형이나 접근성을 고려해 보통권' };
  }
  if (RARE.has(id)) {
    return { tier: 3, memo: rareMemo(id) };
  }
  if (current.final_tier === 1) {
    return { tier: 1, memo: '반복 출현 체감이 강한 일반 생태계 포켓몬' };
  }
  if (UNCOMMON.has(id)) {
    return { tier: 2, memo: '조건성이나 진화 단계가 있지만 트로피급은 아닌 보통권' };
  }
  if (current.final_tier >= 4) {
    return { tier: 3, memo: '기존 산출은 높지만 새 기준상 특수 정체성은 희귀권으로 제한' };
  }
  if (current.final_tier === 3) {
    return { tier: 3, memo: '강한 정체성이나 낮은 포획률을 반영한 희귀권' };
  }
  if (current.final_tier === 2) {
    return { tier: 2, memo: '일반종보다 조건성이 있는 보통권' };
  }
  return { tier: 1, memo: '반복 출현 체감이 강한 일반 생태계 포켓몬' };
}

function veryRareMemo(id) {
  if (PSEUDO_FINAL.has(id)) return '준전설급 600족 최종형으로 매우 희귀';
  if (FOSSIL_FINAL.has(id)) return '복원 화석 최종형으로 수집 프리미엄이 큼';
  if (id === 350) return '아름다움/희귀 입수 이미지가 강한 특수 최종형';
  if (id === 448) return '높은 팬 인식과 전투 위상이 겹치는 프리미엄 최종형';
  if (id === 612) return '드래곤 최종형과 강한 전투 이미지가 겹침';
  if (id === 637) return '후반 희귀종 이미지와 강한 최종형 프리미엄';
  if (TRADE_SPECIAL_FINAL.has(id)) return '교환/특수 진화 조건이 있는 프리미엄 최종형';
  return '아이템/분기/특수 최종 진화체 프리미엄';
}

function userRareMemo(id) {
  if (id === 282) return '인기와 전투 위상은 높지만 일반 최종형이라 희귀로 제한';
  if (id === 330) return '팬 인식은 높지만 일반 최종형이라 희귀로 제한';
  if (id === 349) return '낮은 종족값이어도 특수 입수감이 강한 희귀 기본종';
  if (id === 367 || id === 368) return '분기 진화체지만 수집 프리미엄은 희귀권으로 제한';
  if (id === 407) return '강한 풀 최종형이지만 Very Rare까지는 아닌 희귀';
  if (id === 416) return '암컷 조건 최종형이라 희귀';
  if (id === 429 || id === 430 || id === 461 || id === 462 || id === 468 || id === 475 || id === 478) {
    return '아이템/분기 최종형이지만 Very Rare가 아닌 희귀';
  }
  if (id === 448) return '높은 팬 인식과 전투 위상은 Rare로 제한';
  if (id === 534 || id === 589 || id === 617) return '교환/특수 진화 최종형이지만 Very Rare가 아닌 희귀';
  return '사용자 보정 기준상 희귀';
}

function userVeryRareMemo(id) {
  if (id === 442) return '봉인/조건 입수 기믹이 레어도의 본질인 특수 단독종';
  if (id === 479) return '폼 변환과 가전 기믹이 강한 특수 단독종';
  if (id === 615) return '얼음 결정 단독종의 희귀 이미지가 강해 Very Rare';
  return '사용자 보정 기준상 매우 희귀';
}

function userUncommonMemo(id) {
  if (id === 280 || id === 281) return '가디안 계열 초기 단계라 보통권';
  if (id === 309 || id === 310) return '전기 야생 계열로 희귀권까지는 아님';
  if (id === 313 || id === 314 || id === 324 || id === 357) return '지역/조건성은 있으나 트로피급 수집 장벽은 아님';
  if (id === 329) return '플라이곤 계열 중간형이라 보통권';
  if (id === 413 || id === 414) return '도롱충이 분기 결과지만 수집 프리미엄은 보통권';
  if (id === 417 || id === 455) return '지역/조건성은 있으나 희귀권까지는 아님';
  if (id === 438 || id === 439 || id === 458) return '아기 포켓몬이나 계열 기준상 보통권';
  if (id === 358 || id === 433) return '소리/종 이미지가 특이하지만 희귀권까지는 아님';
  if (id >= 511 && id <= 516) return '원숭이 지역/조건성은 있으나 희귀권까지는 아님';
  if (id === 531) return '회복 기믹은 있지만 일반 단독종으로 보통권';
  if (id === 550 || id === 553 || id === 554 || id === 556) return '지역/조건성 또는 강한 일반종 이미지가 있지만 보통권';
  if (id === 576 || id === 578 || id === 584 || id === 600 || id === 614 || id === 624) {
    return '특이한 계열이지만 수집 프리미엄은 보통권';
  }
  return '사용자 보정 기준상 보통권';
}

function rareMemo(id) {
  if (PSEUDO_BASE_MID.has(id)) return '준전설급 계열의 기본/중간 단계라 희귀';
  if (FOSSIL_BASE.has(id)) return '복원 화석 기본종은 희귀';
  if (REGIONAL_RARE.has(id)) return '포켓몬GO 지역한정/수집 장벽을 반영한 희귀';
  if (POPULAR_POWER_RARE.has(id)) return '강한 일반 최종형이지만 Very Rare가 아닌 희귀로 제한';
  if (id === 470 || id === 471) return '이브이 시리즈 전체 희귀 보정';
  if (id === 479) return '폼 변환 기믹이 강한 특수 단독종';
  if (id === 570 || id === 571) return '환영/변신 기믹과 이벤트 이미지가 강한 희귀종';
  if (id === 446) return '잠만보 계열 아기 포켓몬으로 수집 가치가 큼';
  if (id === 447 || id === 448) return '루카리오 계열의 높은 팬 인식 반영';
  if (id === 636) return '불카모스 계열 기본종이라 희귀';
  return '단독 기믹, 낮은 포획률, 특수 입수감 중 하나가 뚜렷한 희귀종';
}

function readSpecies(id) {
  return JSON.parse(fs.readFileSync(path.join(SPECIES_DIR, `${id}.json`), 'utf8'));
}

function enforceEvolutionConstraints(rows) {
  const byName = new Map(rows.map((row) => [row.name, row]));
  for (const fileName of fs.readdirSync(CHAIN_DIR)) {
    if (!fileName.endsWith('.json')) continue;
    const chain = JSON.parse(fs.readFileSync(path.join(CHAIN_DIR, fileName), 'utf8'));
    const stages = flattenChain(chain).map((stage) => stage.filter((name) => byName.has(name))).filter((stage) => stage.length);
    if (stages.length <= 1) continue;

    const baseName = stages.flat().find((name) => byName.has(name));
    const baseHabitat = byName.get(baseName).llm_habitat;
    for (const stage of stages) {
      for (const name of stage) byName.get(name).llm_habitat = baseHabitat;
    }

    let previousMaxTier = Math.max(...stages[0].map((name) => byName.get(name).llm_tier));
    for (let stageIndex = 1; stageIndex < stages.length; stageIndex += 1) {
      for (const name of stages[stageIndex]) {
        const row = byName.get(name);
        if (row.llm_tier < previousMaxTier) {
          row.llm_tier = previousMaxTier;
          row.llm_tier_label = TIER_LABELS[previousMaxTier];
          row.memo_ko = `${row.memo_ko}; 진화계열 레어도 역전 방지로 상향`;
        }
      }
      previousMaxTier = Math.max(previousMaxTier, ...stages[stageIndex].map((name) => byName.get(name).llm_tier));
    }
  }
}

function flattenChain(chainData) {
  if (!chainData || !chainData.chain) return [];
  const stages = [];
  let current = [chainData.chain];
  while (current.length) {
    const names = [];
    const next = [];
    for (const node of current) {
      if (node.species && node.species.name) names.push(node.species.name);
      for (const child of node.evolves_to || []) next.push(child);
    }
    if (names.length) stages.push(names);
    current = next;
  }
  return stages;
}

function validateRows(rows) {
  if (rows.length !== 649) throw new Error(`Expected 649 rows, found ${rows.length}`);
  for (let id = 1; id <= 649; id += 1) {
    const row = rows[id - 1];
    if (!row || row.id !== id) throw new Error(`Missing or out-of-order row for #${id}`);
    if (!TIER_LABELS[row.llm_tier]) throw new Error(`Invalid tier for #${id}: ${row.llm_tier}`);
    row.llm_tier_label = TIER_LABELS[row.llm_tier];
  }
}

if (require.main === module) {
  main();
}
