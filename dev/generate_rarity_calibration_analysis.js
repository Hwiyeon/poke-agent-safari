#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dev', 'data', 'generated');
const LLM_PATH = path.join(OUT_DIR, 'llm_habitat_rarity_judgement_001_649.json');
const OUTPUT_PATH = path.join(OUT_DIR, 'llm_rarity_calibration_backtest_001_649.ko.md');
const CHAIN_DIR = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'evolution-chain');

const TIER_LABELS = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Very Rare',
  5: 'Legendary',
};

const TIER_KO = {
  1: '흔함',
  2: '보통',
  3: '희귀',
  4: '매우 희귀',
  5: '전설/환상',
};

const REQUESTED_TARGETS = [
  [83, 3, '파오리 rare'],
  [132, 3, '메타몽 rare'],
  [133, 3, '이브이 시리즈 rare'],
  [134, 3, '이브이 시리즈 rare'],
  [135, 3, '이브이 시리즈 rare'],
  [136, 3, '이브이 시리즈 rare'],
  [196, 3, '이브이 시리즈 rare'],
  [197, 3, '이브이 시리즈 rare'],
  [143, 3, '잠만보 rare'],
  [130, 2, '갸라도스 uncommon'],
  [137, 3, '폴리곤 rare'],
  [138, 3, '암나이트 rare'],
  [140, 3, '투구 rare'],
  [185, 3, '꼬지모 rare'],
  [186, 3, '왕구리 rare'],
  [193, 2, '왕자리 uncommon'],
  [199, 4, '야도킹 very rare'],
  [201, 1, '안농 common'],
  [202, 3, '마자용 rare'],
  [203, 2, '키링키 uncommon'],
  [206, 3, '노고치 rare'],
  [207, 2, '글라이거 uncommon'],
  [211, 2, '침바루 uncommon'],
  [212, 4, '핫삼 very rare'],
  [213, 2, '단단지 uncommon'],
  [225, 3, '딜리버드 rare'],
  [226, 3, '만타인 rare'],
  [227, 3, '무장조 rare'],
  [230, 4, '킹드라 very rare'],
  [232, 2, '코리갑 uncommon'],
  [234, 2, '노라키 uncommon'],
  [235, 3, '루브도 rare'],
  [236, 3, '배루키 rare'],
  [280, 2, '랄토스 uncommon'],
  [281, 2, '킬리아 uncommon'],
  [282, 3, '가디안 rare'],
  [309, 1, '썬더라이 common'],
  [310, 2, '썬더볼트 uncommon'],
  [313, 2, '볼비트 uncommon'],
  [314, 2, '네오비트 uncommon'],
  [324, 2, '코터스 uncommon'],
  [329, 2, '비브라바 uncommon'],
  [330, 3, '플라이곤 rare'],
  [349, 3, '빈티나 rare'],
  [357, 2, '트로피우스 uncommon'],
  [358, 2, '치렁 uncommon'],
  [367, 3, '헌테일 rare'],
  [368, 3, '분홍장이 rare'],
  [407, 3, '로즈레이드 rare'],
  [413, 2, '도롱마담 uncommon'],
  [414, 2, '나메일 uncommon'],
  [416, 3, '비퀸 rare'],
  [417, 2, '파치리스 uncommon'],
  [429, 3, '무우마직 rare'],
  [430, 3, '돈크로우 rare'],
  [438, 2, '꼬지지 uncommon'],
  [439, 2, '흉내내 uncommon'],
  [442, 4, '화강돌 very rare'],
  [448, 3, '루카리오 rare'],
  [455, 2, '무스틈니 uncommon'],
  [458, 2, '타만타 uncommon'],
  [461, 3, '포푸니라 rare'],
  [462, 4, '자포코일 very rare'],
  [468, 4, '토게키스 very rare'],
  [475, 3, '엘레이드 rare'],
  [478, 3, '눈여아 rare'],
  [479, 4, '로토무 very rare'],
  [511, 2, '야나프 uncommon'],
  [512, 2, '야나키 uncommon'],
  [513, 2, '바오프 uncommon'],
  [514, 2, '바오키 uncommon'],
  [515, 2, '앗차프 uncommon'],
  [516, 2, '앗차키 uncommon'],
  [531, 2, '다부니 uncommon'],
  [534, 3, '노보청 rare'],
  [550, 2, '배쓰나이 uncommon'],
  [553, 2, '악비아르 uncommon'],
  [554, 2, '달막화 uncommon'],
  [556, 2, '마라카치 uncommon'],
  [576, 2, '고디모아젤 uncommon'],
  [578, 2, '듀란 uncommon'],
  [584, 2, '배바닐라 uncommon'],
  [589, 4, '슈바르고 very rare'],
  [600, 2, '기기어르 uncommon'],
  [614, 2, '툰베어 uncommon'],
  [615, 3, '프리지오 rare'],
  [617, 4, '어지리더 very rare'],
  [624, 2, '자망칼 uncommon'],
  [49, 2, '도나리 uncommon'],
  [57, 2, '성원숭 uncommon'],
  [85, 2, '두트리오 uncommon'],
  [86, 1, '쥬쥬 common'],
  [113, 3, '럭키 rare'],
  [119, 1, '왕콘치 common'],
  [131, 3, '라프라스 rare'],
  [169, 3, '크로뱃 rare'],
  [222, 2, '코산호 uncommon'],
  [229, 2, '헬가 uncommon'],
  [331, 1, '선인왕 common'],
  [398, 2, '찌르호크 uncommon'],
  [412, 1, '도롱충이 common'],
  [453, 1, '삐딱구리 common'],
  [508, 2, '바랜드 uncommon'],
  [521, 2, '켄호로우 uncommon'],
  [522, 1, '줄뮤마 common'],
  [523, 2, '제브라이카 uncommon'],
  [530, 2, '몰드류 uncommon'],
  [537, 2, '두빅굴 uncommon'],
  [545, 2, '펜드라 uncommon'],
];

function main() {
  const rows = JSON.parse(fs.readFileSync(LLM_PATH, 'utf8'));
  const byId = new Map(rows.map((row) => [row.id, row]));
  const byName = new Map(rows.map((row) => [row.name, row]));

  const requestedRows = REQUESTED_TARGETS.map(([id, tier, request]) => {
    const row = byId.get(id);
    if (!row) throw new Error(`Missing row #${id}`);
    return {
      id,
      nameKo: row.name_ko,
      name: row.name,
      request,
      expected: tier,
      actual: row.llm_tier,
      pass: row.llm_tier === tier,
    };
  });

  const tierViolations = [];
  const habitatViolations = [];
  for (const fileName of fs.readdirSync(CHAIN_DIR)) {
    if (!fileName.endsWith('.json')) continue;
    const chain = JSON.parse(fs.readFileSync(path.join(CHAIN_DIR, fileName), 'utf8'));
    walkChain(chain.chain, null, byName, tierViolations);
    const names = collectNames(chain.chain).filter((name) => byName.has(name));
    if (names.length > 1) {
      const habitats = [...new Set(names.map((name) => byName.get(name).llm_habitat))];
      if (habitats.length > 1) habitatViolations.push({ names, habitats });
    }
  }

  const distribution = {};
  for (const row of rows) distribution[row.llm_tier] = (distribution[row.llm_tier] || 0) + 1;

  const md = buildMarkdown({
    rows,
    requestedRows,
    distribution,
    tierViolations,
    habitatViolations,
  });
  fs.writeFileSync(OUTPUT_PATH, md, 'utf8');

  const failedRequested = requestedRows.filter((row) => !row.pass);
  process.stdout.write(JSON.stringify({
    output: path.relative(ROOT, OUTPUT_PATH),
    pokemon: rows.length,
    requested_targets: requestedRows.length,
    requested_mismatches: failedRequested.length,
    gen1_to_5_requested_targets: requestedRows.filter((row) => row.id <= 649).length,
    gen1_to_5_requested_mismatches: requestedRows.filter((row) => row.id <= 649 && !row.pass).length,
    tier_distribution: distribution,
    evolution_tier_violations: tierViolations.length,
    evolution_habitat_violations: habitatViolations.length,
  }, null, 2) + '\n');

  if (failedRequested.length || tierViolations.length || habitatViolations.length) {
    process.exitCode = 1;
  }
}

function buildMarkdown({ rows, requestedRows, distribution, tierViolations, habitatViolations }) {
  const total = rows.length;
  const passCount = requestedRows.filter((row) => row.pass).length;
  const gen1To5Requested = requestedRows.filter((row) => row.id <= 649);
  const gen1To5PassCount = gen1To5Requested.filter((row) => row.pass).length;
  const rarePlus = (distribution[3] || 0) + (distribution[4] || 0) + (distribution[5] || 0);
  const commonPlusUncommon = (distribution[1] || 0) + (distribution[2] || 0);
  const ordinaryRarePlus = (distribution[3] || 0) + (distribution[4] || 0);

  const lines = [];
  lines.push('# LLM 레어도 보정 기준 백테스트 (001-649)');
  lines.push('');
  lines.push(`생성 시각: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## 결론');
  lines.push('');
  lines.push('이번 보정은 "포켓몬GO 스폰 접근성"보다 "수집 게임에서의 개체 정체성, 특수 입수감, 진화/기믹 프리미엄"을 더 크게 보는 쪽입니다.');
  lines.push('다만 강함이나 진화체라는 이유만으로 무조건 희귀를 올리지는 않습니다. 갸라도스와 코리갑처럼 접근성이 높거나 일반 진화 최종형인 경우는 보통권까지 낮출 수 있습니다.');
  lines.push('5세대 재보정 이후에는 지역/조건성, 강한 일반 최종형, 일반 단독 기믹을 더 자주 Uncommon으로 둡니다. Rare는 교환/특수 진화 최종형이나 뚜렷한 수집 프리미엄에 쓰고, Very Rare는 준전설급 600족, 화석 최종형, 그리고 기믹/입수 정체성이 레어도의 본질인 특수 단독종으로 좁혔습니다.');
  lines.push('공식 전설/환상은 세대가 늘수록 개수가 많아지므로 일반 피라미드와 분리합니다. 일반 티어는 `Common/Uncommon`이 넓고 `Rare/Very Rare`가 좁아지는 완만한 피라미드로 보되, 개별 체감 희귀도가 더 중요합니다.');
  lines.push('');
  lines.push('채택 기준은 다음처럼 잡는 것이 가장 잘 맞습니다.');
  lines.push('');
  lines.push('| 티어 | 기준 | 대표 예시 |');
  lines.push('|---|---|---|');
  lines.push('| 5 전설/환상 | 공식 전설/환상/전설 짐승처럼 세계관상 별도 격인 포켓몬 | 뮤츠, 라이코, 루기아, 세레비 |');
  lines.push('| 4 매우 희귀 | 준전설급 600족 최종형, 화석 최종형, 기믹/입수 정체성이 레어도의 본질인 특수 단독종 | 보만다, 메타그로스, 한카리아스, 화강돌, 로토무 |');
  lines.push('| 3 희귀 | 특수 입수감, 강한 상징성, 이브이 시리즈, 일반 인기 최종형, 교환/특수 진화 최종형 | 파오리, 가디안, 플라이곤, 루카리오, 노보청, 슈바르고 |');
  lines.push('| 2 보통 | 특이하거나 조건성이 있지만 트로피급은 아닌 기본종/중간형/단독종/아기 포켓몬/지역성 일반종 | 랄토스, 코터스, 파치리스, 야나프, 다부니, 악비아르 |');
  lines.push('| 1 흔함 | 초반 루트, 일반 생태계 채움, 반복 출현 체감이 강한 계열 | 캐터피, 구구, 꼬렛, 우파 |');
  lines.push('');
  lines.push('## 가설 정제');
  lines.push('');
  lines.push('| 단계 | 가설 | 백테스트 결과 | 판정 |');
  lines.push('|---|---|---|---|');
  lines.push('| V0 | 포켓몬GO 접근성이 높으면 낮춘다 | 이브이 시리즈, 메타몽, 루브도, 딜리버드에서 사용자 보정과 충돌 | 기각 |');
  lines.push('| V1 | 이벤트/특수 입수면 무조건 매우 희귀로 올린다 | 안농, 폴리곤, 잠만보, 화석 기본종에서 과대평가 발생 | 기각 |');
  lines.push('| V2 | 특수성은 Rare의 핵심 신호지만, Very Rare는 프리미엄 최종형/분기·아이템·드래곤급에 제한한다 | 명시 보정 전부 통과, 001-251 분포도 완만한 피라미드 유지 | 채택 |');
  lines.push('| V3 | Gen5까지는 공식 전설/환상이 많으므로 Very Rare를 팬 인식/전투 위상/특수진화 최종형까지 확장한다 | 일반 인기 최종형이 과대평가됨 | 기각 |');
  lines.push('| V4 | 일반 프리미엄 최종형은 Rare로 제한하고, Very Rare는 준전설급/화석 최종형/특수진화 최종형 중 강한 수집 프리미엄에만 쓴다 | 4세대 아이템/분기 최종형에서 과대평가 발생 | 기각 |');
  lines.push('| V5 | 아이템/분기 최종형도 대부분 Rare로 제한하고, Very Rare는 준전설급/화석 최종형/특수 단독 기믹에만 쓴다 | 1~4세대 명시 보정 통과, 완만한 일반 티어 분포와 전체 진화규칙 통과 | 채택 |');
  lines.push('| V6 | 5세대 지역/조건성 일반종과 강한 일반 최종형은 더 자주 Uncommon으로 둔다 | 1~5세대 명시 보정 통과, 완만한 일반 티어 분포와 전체 진화규칙 통과 | 채택 |');
  lines.push('');
  lines.push('## 백테스트 요약');
  lines.push('');
  lines.push('| 항목 | 결과 |');
  lines.push('|---|---:|');
  lines.push(`| 대상 포켓몬 | ${total} |`);
  lines.push(`| 사용자 명시 보정 일치 | ${passCount}/${requestedRows.length} |`);
  lines.push(`| 1~5세대 명시 보정 일치 | ${gen1To5PassCount}/${gen1To5Requested.length} |`);
  lines.push(`| 진화 후 레어도 역전 | ${tierViolations.length} |`);
  lines.push(`| 진화계열 서식지 불일치 | ${habitatViolations.length} |`);
  lines.push(`| Common+Uncommon 비중 | ${commonPlusUncommon}/${total} (${percent(commonPlusUncommon, total)}) |`);
  lines.push(`| Rare 이상 비중 | ${rarePlus}/${total} (${percent(rarePlus, total)}) |`);
  lines.push(`| 일반 Rare 이상 비중(전설/환상 제외) | ${ordinaryRarePlus}/${total} (${percent(ordinaryRarePlus, total)}) |`);
  lines.push('');
  lines.push('| 티어 | 개수 | 비중 |');
  lines.push('|---|---:|---:|');
  for (const tier of [1, 2, 3, 4, 5]) {
    const count = distribution[tier] || 0;
    lines.push(`| ${formatTier(tier)} | ${count} | ${percent(count, total)} |`);
  }
  lines.push('');
  lines.push('## 명시 보정 검증');
  lines.push('');
  lines.push('| # | 이름 | 영문 | 요청 | 최종 LLM 레어도 | 결과 |');
  lines.push('|---:|---|---|---|---|---|');
  for (const row of requestedRows) {
    lines.push(`| ${row.id} | ${row.nameKo} | ${row.name} | ${markdownEscape(row.request)} | ${formatTier(row.actual)} | ${row.pass ? '통과' : '불일치'} |`);
  }
  lines.push('');
  lines.push('## 운용 규칙');
  lines.push('');
  lines.push('1. 먼저 공식 전설/환상 여부를 분리한다. 이 그룹은 5티어로 고정한다.');
  lines.push('2. 일반 포켓몬은 "출현 빈도"보다 "수집자가 특별하게 느끼는 정체성"을 먼저 본다. 단독 기믹, 화석, 인공 포켓몬, 지역/교환 이미지, 계절성은 Rare 신호다.');
  lines.push('3. Very Rare는 아낀다. 분기/아이템 최종 진화체, 드래곤 최종형, 강한 팬 프리미엄이 겹칠 때만 올린다.');
  lines.push('4. 강함이나 최종 진화만으로 Rare 이상을 주지 않는다. 접근성이 높은 일반 진화 최종형은 Uncommon까지 낮출 수 있다.');
  lines.push('5. 이벤트 의존성만으로 Very Rare를 주지 않는다. 안농처럼 이벤트 장벽은 있어도 전투/진화/수집 프리미엄이 낮으면 Uncommon까지 낮춘다.');
  lines.push('6. 진화계열 규칙은 마지막에 적용한다. 진화체 레어도는 이전 단계보다 낮지 않게 하되, 사용자가 직접 낮춘 일반 최종형은 기본종보다만 높거나 같으면 허용한다.');
  lines.push('7. 전체 분포는 Common과 Uncommon이 가장 넓고, Rare 이상은 수집 포인트가 분명한 포켓몬에만 쓴다.');
  lines.push('');
  return lines.join('\n') + '\n';
}

function walkChain(node, parent, byName, violations) {
  const current = byName.get(node.species && node.species.name);
  const previous = parent ? byName.get(parent.species && parent.species.name) : null;
  if (current && previous && current.llm_tier < previous.llm_tier) {
    violations.push(`${previous.name}->${current.name}`);
  }
  for (const child of node.evolves_to || []) walkChain(child, node, byName, violations);
}

function collectNames(node, names = []) {
  if (node.species && node.species.name) names.push(node.species.name);
  for (const child of node.evolves_to || []) collectNames(child, names);
  return names;
}

function formatTier(tier) {
  return `${tier} ${TIER_KO[tier]}(${TIER_LABELS[tier]})`;
}

function percent(count, total) {
  return `${((count / total) * 100).toFixed(1)}%`;
}

function markdownEscape(value) {
  return String(value).replace(/\|/g, '\\|');
}

if (require.main === module) {
  main();
}
