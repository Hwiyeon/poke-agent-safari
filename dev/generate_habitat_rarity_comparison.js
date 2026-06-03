#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dev', 'data', 'generated');
const CURRENT_DATA_PATH = path.join(ROOT, 'data', 'pokemon_data.json');
const KO_NAMES_PATH = path.join(ROOT, 'data', 'pokemon_names_ko.json');
const START_ID = 1;
const END_ID = 649;
const RANGE_LABEL = '001-649';
const RANGE_FILE_LABEL = '001_649';
const LLM_PATH = path.join(OUT_DIR, `llm_habitat_rarity_judgement_${RANGE_FILE_LABEL}.json`);
const SCENARIO2_PATH = path.join(OUT_DIR, `all_metadata_habitat_scenario_${RANGE_FILE_LABEL}.json`);
const COMPARISON_MD_PATH = path.join(OUT_DIR, `pokemon_habitat_rarity_comparison_${RANGE_FILE_LABEL}.ko.md`);
const NOTES_MD_PATH = path.join(OUT_DIR, `llm_habitat_rarity_notes_${RANGE_FILE_LABEL}.ko.md`);

const HABITAT_KO = {
  cave: '동굴',
  forest: '숲',
  grassland: '초원',
  mountain: '산악',
  rare: '희귀/특수',
  'rough-terrain': '험지',
  sea: '바다',
  urban: '도시',
  'waters-edge': '물가',
};

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

const LOCATION_KEYWORDS_TO_HABITAT = {
  cave: 'cave', tunnel: 'cave', cavern: 'cave', mine: 'cave',
  'rock-tunnel': 'cave', 'ice-path': 'cave', 'dark-cave': 'cave',
  'mt-moon': 'cave', 'mt-mortar': 'cave', 'whirl-islands': 'cave',
  'union-cave': 'cave', 'slowpoke-well': 'cave', 'digletts-cave': 'cave',
  'cerulean-cave': 'cave', 'seafoam-islands': 'cave', 'victory-road': 'cave',
  'silver-cave': 'cave', 'cliff-cave': 'cave',
  forest: 'forest', woods: 'forest', grove: 'forest',
  'viridian-forest': 'forest', 'ilex-forest': 'forest',
  'national-park': 'forest',
  grass: 'grassland', plain: 'grassland', meadow: 'grassland',
  field: 'grassland', ranch: 'grassland', route: 'grassland',
  'safari-zone': 'grassland',
  mountain: 'mountain', 'mt-': 'mountain', volcano: 'mountain',
  'mt-silver': 'mountain', 'tin-tower': 'mountain',
  trophy: 'rare', 'pal-park': 'rare',
  terrain: 'rough-terrain', canyon: 'rough-terrain',
  desert: 'rough-terrain', wasteland: 'rough-terrain',
  ruins: 'rough-terrain', 'burned-tower': 'rough-terrain',
  sea: 'sea', ocean: 'sea', underwater: 'sea',
  marine: 'sea', dive: 'sea',
  city: 'urban', town: 'urban', building: 'urban',
  mansion: 'urban', house: 'urban', gym: 'urban',
  'power-plant': 'urban', celadon: 'urban', goldenrod: 'urban',
  'pokemon-tower': 'urban', 'radio-tower': 'urban',
  department: 'urban', 'game-corner': 'urban',
  lake: 'waters-edge', pond: 'waters-edge', river: 'waters-edge',
  stream: 'waters-edge', marsh: 'waters-edge', swamp: 'waters-edge',
  beach: 'waters-edge', shore: 'waters-edge', bay: 'waters-edge',
  falls: 'waters-edge', spring: 'waters-edge', fishing: 'waters-edge',
};

const EVENT_FIXED_LOCATION_KEYWORDS_TO_HABITAT = {
  'hall-of-origin': 'rare',
  'birth-island': 'rare',
  'faraway-island': 'rare',
  'navel-rock': 'rare',
  'southern-island': 'rare',
  'newmoon-island': 'rare',
  'flower-paradise': 'forest',
  'liberty-garden': 'rare',
  'spear-pillar': 'rare',
  'sinjoh-ruins': 'rare',
  'abundant-shrine': 'rare',
  'embedded-tower': 'rare',
  'bell-tower': 'rare',
  'tin-tower': 'rare',
  'burned-tower': 'rare',
  'sky-pillar': 'rare',
  'cave-of-origin': 'rare',
  'sealed-chamber': 'rare',
  'desert-ruins': 'rare',
  'ancient-tomb': 'rare',
  'relic-castle': 'rare',
  'dragonspiral-tower': 'rare',
  'ns-castle': 'rare',
  'snowpoint-temple': 'rare',
  'underground-ruins': 'rare',
  'nature-sanctuary': 'rare',
  'lake-acuity-cavern': 'cave',
  'lake-valor-cavern': 'cave',
  'lake-verity-cavern': 'cave',
  'stark-mountain': 'mountain',
  'reversal-mountain': 'mountain',
  'twist-mountain': 'mountain',
  'mistralton-cave': 'cave',
  'nameless-cavern': 'cave',
  'fabled-cave': 'cave',
  'gnarled-den': 'cave',
  'scorched-slab': 'mountain',
  'giant-chasm': 'cave',
  'pinwheel-forest': 'forest',
  'lostlorn-forest': 'forest',
  'sea-spirits-den': 'sea',
  'marine-cave': 'sea',
  'terra-cave': 'rough-terrain',
  'pathless-plain': 'grassland',
  'trackless-forest': 'forest',
  'crescent-isle': 'waters-edge',
};

const EVENT_FIXED_METHODS = new Set([
  'only-one',
  'roaming-grass', 'roaming-water', 'roaming',
  'overworld-special', 'overworld-flying-special', 'overworld-water-special',
  'devon-scope', 'pokeflute', 'squirt-bottle', 'wailmer-pail',
  'gift', 'gift-egg', 'npc-trade',
  'pokemon-ranger',
  'colosseum-bonus-disc-jpn', 'colosseum-bonus-disc-us',
  'pokemon-channel-pal',
  'snag', 'snag-rematch',
]);

const WALK_METHODS = new Set([
  'walk', 'grass', 'tall-grass', 'dark-grass',
  'yellow-flowers', 'red-flowers', 'purple-flowers',
  'rough-terrain', 'headbutt',
]);

const AQUATIC_METHODS = new Set([
  'surf', 'old-rod', 'good-rod', 'super-rod', 'dive',
]);

const VERSION_TO_GENERATION = {
  red: 1, blue: 1, yellow: 1,
  gold: 2, silver: 2, crystal: 2,
  ruby: 3, sapphire: 3, emerald: 3,
  firered: 3, leafgreen: 3,
  colosseum: 3, xd: 3,
  diamond: 4, pearl: 4, platinum: 4,
  heartgold: 4, soulsilver: 4,
  black: 5, white: 5, 'black-2': 5, 'white-2': 5,
  x: 6, y: 6, 'omega-ruby': 6, 'alpha-sapphire': 6,
  sun: 7, moon: 7, 'ultra-sun': 7, 'ultra-moon': 7,
  'lets-go-pikachu': 7, 'lets-go-eevee': 7,
  sword: 8, shield: 8,
  'brilliant-diamond': 8, 'shining-pearl': 8,
  'legends-arceus': 8,
  scarlet: 9, violet: 9,
};

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf8');
}

function cacheJson(category, id) {
  return readJson(path.join(ROOT, 'dev', '.cache', 'pokeapi', category, `${id}.json`), null);
}

function resourceId(ref) {
  if (!ref) return null;
  if (typeof ref === 'number') return String(ref);
  if (typeof ref === 'string') return ref.replace(/\/$/, '').split('/').pop();
  if (ref.url) return ref.url.replace(/\/$/, '').split('/').pop();
  return ref.name || null;
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function localizedNames(data) {
  if (!data || !Array.isArray(data.names)) return [];
  return data.names.map((row) => row && row.name).filter(Boolean);
}

function englishName(data) {
  if (!data || !Array.isArray(data.names)) return '';
  const row = data.names.find((item) => item.language && item.language.name === 'en');
  return row ? row.name : '';
}

function matchKeyword(texts) {
  const maps = [
    { source: 'special-location', values: EVENT_FIXED_LOCATION_KEYWORDS_TO_HABITAT },
    { source: 'location', values: LOCATION_KEYWORDS_TO_HABITAT },
  ];
  const normalizedTexts = texts.map((text) => ({ original: text, normalized: normalize(text) }));
  for (const map of maps) {
    const entries = Object.entries(map.values).sort((a, b) => b[0].length - a[0].length);
    for (const [keyword, habitat] of entries) {
      const normalizedKeyword = normalize(keyword);
      for (const text of normalizedTexts) {
        if (text.normalized.includes(normalizedKeyword)) {
          return {
            keyword,
            habitat,
            source: map.source,
            matched_text: text.original,
          };
        }
      }
    }
  }
  return null;
}

function encounterMethodsAndVersions(locationRow) {
  const methods = new Set();
  const versions = new Set();
  const generations = new Set();
  for (const versionDetail of locationRow.version_details || []) {
    const versionName = versionDetail.version && versionDetail.version.name;
    if (versionName) {
      versions.add(versionName);
      if (VERSION_TO_GENERATION[versionName]) generations.add(VERSION_TO_GENERATION[versionName]);
    }
    for (const detail of versionDetail.encounter_details || []) {
      if (detail.method && detail.method.name) methods.add(detail.method.name);
    }
  }
  return {
    methods: Array.from(methods).sort(),
    versions: Array.from(versions).sort(),
    min_generation: generations.size ? Math.min(...generations) : null,
  };
}

function locationTexts(areaRef) {
  const areaId = resourceId(areaRef);
  const area = areaId ? cacheJson('location-area', areaId) : null;
  const locationId = area && area.location ? resourceId(area.location) : null;
  const location = locationId ? cacheJson('location', locationId) : null;
  const texts = [
    areaRef && areaRef.name,
    area && area.name,
    location && location.name,
    location && location.region && location.region.name,
    englishName(area),
    englishName(location),
    ...localizedNames(area),
    ...localizedNames(location),
  ].filter(Boolean);
  return {
    areaId,
    area,
    location,
    texts: Array.from(new Set(texts)),
  };
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

function scenario2ForPokemon(currentRow) {
  const encounters = cacheJson('pokemon-encounters', currentRow.pokemon_id) || [];
  const counts = {};
  const matchedRows = [];
  const unmatchedRows = [];
  const seenAreas = new Set();

  for (const locationRow of encounters) {
    const areaRef = locationRow.location_area || {};
    const key = resourceId(areaRef) || areaRef.name;
    if (!key || seenAreas.has(key)) continue;
    seenAreas.add(key);

    const detail = locationTexts(areaRef);
    const ev = encounterMethodsAndVersions(locationRow);
    const nonFixedMethods = ev.methods.filter((method) => !EVENT_FIXED_METHODS.has(method));
    if (!nonFixedMethods.length) {
      continue;
    }

    const match = habitatMatchForOrdinaryLocation(detail.texts, nonFixedMethods);
    const displayName = englishName(detail.area) || englishName(detail.location) || areaRef.name || '';
    if (match) {
      counts[match.habitat] = (counts[match.habitat] || 0) + 1;
      matchedRows.push({
        area: areaRef.name || '',
        display_name: displayName,
        location: detail.location ? detail.location.name : '',
        habitat: match.habitat,
        keyword: match.keyword,
        match_source: match.source,
        matched_text: match.matched_text,
        methods: ev.methods,
        versions: ev.versions.slice(0, 8),
        min_generation: ev.min_generation,
      });
    } else {
      unmatchedRows.push(areaRef.name || '');
    }
  }

  const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  let habitat = currentRow.habitat;
  let source = 'metadata-none-current';
  let decision = '위치 메타데이터 매칭 없음, 기존 유지';
  if (sortedCounts.length) {
    const topCount = sortedCounts[0][1];
    const tied = sortedCounts.filter((item) => item[1] === topCount).map((item) => item[0]);
    if (tied.length === 1) {
      habitat = tied[0];
      source = 'all-location-metadata';
      decision = `${formatHabitat(tied[0])} ${topCount}개 위치가 최다`;
    } else {
      habitat = currentRow.habitat;
      source = 'metadata-tie-current';
      decision = `${tied.map(formatHabitat).join('/')} 동률, 기존 유지`;
    }
  }

  return {
    pokemon_id: currentRow.pokemon_id,
    name: currentRow.name,
    metadata_habitat: habitat,
    metadata_habitat_source: source,
    metadata_tier: currentRow.final_tier,
    metadata_tier_label: currentRow.tier_label,
    decision,
    habitat_counts: Object.fromEntries(sortedCounts),
    top_evidence: matchedRows.slice(0, 5),
    unmatched_area_count: unmatchedRows.length,
  };
}

function habitatMatchForOrdinaryLocation(texts, methods) {
  const methodSet = new Set(methods);
  const hasWalk = Array.from(methodSet).some((method) => WALK_METHODS.has(method));
  const hasAquatic = Array.from(methodSet).some((method) => AQUATIC_METHODS.has(method));
  if (hasAquatic && !hasWalk) {
    const normalizedTexts = texts.map(normalize);
    const seaKeywords = ['sea', 'ocean', 'underwater', 'marine', 'dive', 'whirl-islands', 'seafoam-islands'];
    const isSea = normalizedTexts.some((text) => seaKeywords.some((keyword) => text.includes(keyword)));
    return {
      keyword: isSea ? 'aquatic-sea-method' : 'aquatic-water-method',
      habitat: isSea ? 'sea' : 'waters-edge',
      source: 'encounter-method',
      matched_text: methods.join(','),
    };
  }
  return matchKeyword(texts);
}

function applyEvolutionHabitatInheritance(rowsByName) {
  const changed = [];
  const chainDir = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'evolution-chain');
  if (!fs.existsSync(chainDir)) return changed;
  for (const fileName of fs.readdirSync(chainDir)) {
    if (!fileName.endsWith('.json')) continue;
    const chainData = readJson(path.join(chainDir, fileName), null);
    const stages = flattenChain(chainData);
    if (stages.length <= 1) continue;
    let baseName = null;
    for (const stage of stages) {
      baseName = stage.find((name) => rowsByName.has(name));
      if (baseName) break;
    }
    if (!baseName) continue;

    const base = rowsByName.get(baseName);
    for (const stage of stages) {
      for (const name of stage) {
        if (!rowsByName.has(name)) continue;
        const row = rowsByName.get(name);
        if (row.metadata_habitat !== base.metadata_habitat) {
          changed.push({
            name,
            base_name: baseName,
            old_habitat: row.metadata_habitat,
            new_habitat: base.metadata_habitat,
          });
          row.metadata_habitat = base.metadata_habitat;
          row.metadata_habitat_source = `evolution-base:${baseName}`;
          row.decision = `진화계열 기준(${baseName})으로 ${formatHabitat(base.metadata_habitat)} 상속`;
        }
      }
    }
  }
  return changed;
}

function formatHabitat(habitat) {
  return `${HABITAT_KO[habitat] || habitat}(${habitat})`;
}

function formatTier(tier, label) {
  const value = Number(tier);
  return `${value} ${TIER_KO[value] || ''}(${label || TIER_LABELS[value] || ''})`;
}

function shortHabitat(habitat) {
  return HABITAT_KO[habitat] || habitat;
}

function shortTier(tier) {
  const value = Number(tier);
  return `${value} ${TIER_KO[value] || TIER_LABELS[value] || ''}`;
}

function markdownEscape(value) {
  return String(value == null ? '' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function loadLlmRows() {
  const rows = readJson(LLM_PATH, []);
  const byId = new Map();
  for (const row of rows || []) {
    if (!row || !row.id) continue;
    byId.set(Number(row.id), row);
  }
  return byId;
}

function briefDiff(current, scenario2, llm) {
  const parts = [];
  if (current.habitat !== scenario2.metadata_habitat) {
    parts.push(`2번 서식지 ${formatHabitat(current.habitat)} -> ${formatHabitat(scenario2.metadata_habitat)}`);
  }
  if (llm && current.habitat !== llm.llm_habitat) {
    parts.push(`3번 서식지 ${formatHabitat(current.habitat)} -> ${formatHabitat(llm.llm_habitat)}`);
  }
  if (llm && Number(current.final_tier) !== Number(llm.llm_tier)) {
    parts.push(`3번 레어도 ${formatTier(current.final_tier, current.tier_label)} -> ${formatTier(llm.llm_tier, llm.llm_tier_label)}`);
  }
  return parts.length ? parts.join('<br>') : '동일';
}

function buildComparisonMd(currentRows, scenarioRows, llmById, namesKo, evolutionChanges) {
  const scenarioById = new Map(scenarioRows.map((row) => [row.pokemon_id, row]));
  const llmRows = currentRows.map((row) => llmById.get(row.pokemon_id)).filter(Boolean);
  const scenarioHabitatChanges = currentRows.filter((row) => {
    const scenario = scenarioById.get(row.pokemon_id);
    return scenario && scenario.metadata_habitat !== row.habitat;
  }).length;
  const llmHabitatChanges = llmRows.filter((row) => {
    const current = currentRows.find((item) => item.pokemon_id === Number(row.id));
    return current && current.habitat !== row.llm_habitat;
  }).length;
  const llmTierChanges = llmRows.filter((row) => {
    const current = currentRows.find((item) => item.pokemon_id === Number(row.id));
    return current && Number(current.final_tier) !== Number(row.llm_tier);
  }).length;

  const lines = [];
  lines.push(`# 포켓몬 서식지/레어도 비교 (${RANGE_LABEL})`);
  lines.push('');
  lines.push(`생성 시각: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## 기준');
  lines.push('');
  lines.push('- 1번 현재값: `data/pokemon_data.json`의 현재 서식지와 최종 레어도.');
  lines.push('- 2번 메타데이터 확장: 모든 인카운터 위치에 `location-area`/상위 `location` 메타데이터와 위치명 키워드를 적용한 별도 시나리오.');
  lines.push('- 2번 레어도: 현재 레어도 알고리즘이 서식지를 점수 입력으로 쓰지 않으므로 기존 티어를 유지.');
  lines.push('- 3번 LLM 판단: 캐시 데이터, 일반 포켓몬 지식, 웹에서 확인한 팬 인식/포켓몬고 체감 희귀도를 함께 고려한 정성 판단.');
  lines.push('- 3번 레어도 보정: 포켓몬고식 관대한 체감과 완만한 피라미드 분포를 반영하되, 공식 전설/환상은 별도 버킷으로 분리. 일반 티어는 개별 체감 희귀도를 우선해 재분포.');
  lines.push('- 3번 진화 제약: 진화 후 레어도는 이전 단계보다 낮아지지 않으며, 기본 서식지는 진화계열 기준을 따른다.');
  lines.push('');
  lines.push('## 웹/포켓몬고 참고');
  lines.push('');
  lines.push('- [Pokémon GO Hub - Region Exclusive Pokémon](https://pokemongohub.net/post/wiki/regional-pokemon-list/): 지역한정 포켓몬은 현지 출현성과 별개로 전체 수집 장벽이 큼.');
  lines.push('- [Pokémon GO Wiki - Region-exclusive Pokémon](https://pokemongo.fandom.com/wiki/Region-exclusive_Pok%C3%A9mon): Hoenn/Sinnoh/Unova 지역한정과 이벤트 예외 참고.');
  lines.push('- [Pocket Tactics - Pokémon Go regional Pokémon](https://www.pockettactics.com/pokemon-go/regional-pokemon): Gen3-5 지역한정 위치 교차 확인.');
  lines.push('- [Pokemon Go Wiki - Spawn Chance](https://pkmngotrading.com/wiki/Spawn_Chance): 2016년 Poke Radar 1억 스폰 기반 자료. 오래된 데이터라 절대값이 아니라 흔함/희귀함의 큰 방향만 참고.');
  lines.push('- [GamePress Q&A - What is rare and common for you?](https://pogo.gamepress.gg/q-a/what-rare-and-common-you): 지역별 체감 희귀도 편차 참고용 커뮤니티 자료.');
  lines.push('- [Pokémon of the Year 2020 results](https://pokemon2020.pokemon.com/en-us/): Kanto 인기 상위권 포켓몬의 팬 인식 참고.');
  lines.push('');
  lines.push('## 요약');
  lines.push('');
  lines.push('| 항목 | 값 |');
  lines.push('|---|---:|');
  lines.push(`| 2번 서식지 변경 | ${scenarioHabitatChanges} |`);
  lines.push(`| 2번 진화계열 상속 변경 | ${evolutionChanges.length} |`);
  lines.push(`| 3번 LLM 서식지 변경 | ${llmHabitatChanges} |`);
  lines.push(`| 3번 LLM 레어도 변경 | ${llmTierChanges} |`);
  lines.push(`| 3번 판단 입력 완료 | ${llmRows.length} / ${currentRows.length} |`);
  lines.push('');
  lines.push('## 비교표');
  lines.push('');
  lines.push('세대별로 표를 나누어 Markdown 뷰어에서 안정적으로 열리도록 구성했습니다. 상세한 2번 시나리오 근거는 같은 폴더의 `all_metadata_habitat_scenario_001_649.json`을 참고하세요.');
  lines.push('');
  const groups = [
    ['1세대', 1, 151],
    ['2세대', 152, 251],
    ['3세대', 252, 386],
    ['4세대', 387, 493],
    ['5세대', 494, 649],
  ];
  for (const [label, start, end] of groups) {
    const groupRows = currentRows.filter((row) => row.pokemon_id >= start && row.pokemon_id <= end);
    if (!groupRows.length) continue;
    lines.push(`### ${label} (#${String(start).padStart(3, '0')}-#${String(end).padStart(3, '0')})`);
    lines.push('');
    lines.push('| # | 이름 | 1 현재 | 2 메타데이터 확장 | 3 LLM 판단 | 핵심 차이 |');
    lines.push('|---:|---|---|---|---|---|');
    for (const current of groupRows) {
      const scenario = scenarioById.get(current.pokemon_id);
      const llm = llmById.get(current.pokemon_id);
      const llmCell = llm
        ? `${shortHabitat(llm.llm_habitat)} / ${shortTier(llm.llm_tier)}`
        : '미입력';
      lines.push([
        current.pokemon_id,
        markdownEscape(namesKo[String(current.pokemon_id)] || current.name),
        markdownEscape(`${shortHabitat(current.habitat)} / ${shortTier(current.final_tier)}`),
        markdownEscape(`${shortHabitat(scenario.metadata_habitat)} / ${shortTier(scenario.metadata_tier)}`),
        markdownEscape(llmCell),
        markdownEscape(briefDiff(current, scenario, llm)),
      ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
    }
    lines.push('');
  }
  return lines.join('\n') + '\n';
}

function buildNotesMd(currentRows, scenarioRows, llmById, namesKo) {
  const scenarioById = new Map(scenarioRows.map((row) => [row.pokemon_id, row]));
  const lines = [];
  lines.push(`# LLM 판단 메모 (${RANGE_LABEL})`);
  lines.push('');
  lines.push('각 포켓몬의 3번 판단에 대한 짧은 근거 메모입니다. 판단은 캐시된 PokeAPI 데이터, 타입/진화/종족값/인카운터, 웹에서 확인한 팬 인식, 포켓몬고의 지역한정/스폰 체감 자료를 종합한 정성 판단입니다.');
  lines.push('');
  lines.push('포켓몬고 자료는 시즌과 이벤트에 따라 바뀌므로 절대 스폰표로 쓰지 않고, 지역한정 여부와 장기적인 체감 희귀도 방향만 참고했습니다. 최종 레어도는 완만한 피라미드 분포를 참고하되 개별 체감 희귀도를 우선해 관대하게 보정했습니다.');
  lines.push('');
  lines.push('진화 계열 제약도 함께 적용했습니다. 진화 후 레어도는 이전 단계보다 낮아지지 않고, 기본 서식지는 같은 진화계열의 기준 서식지를 따릅니다.');
  lines.push('');
  lines.push('| # | 이름 | 영문 | LLM 서식지 | LLM 레어도 | 메모 | 참고 데이터 |');
  lines.push('|---:|---|---|---|---|---|---|');
  for (const current of currentRows) {
    const llm = llmById.get(current.pokemon_id);
    const scenario = scenarioById.get(current.pokemon_id);
    const pokemon = cacheJson('pokemon', current.pokemon_id) || {};
    const types = (pokemon.types || [])
      .sort((a, b) => a.slot - b.slot)
      .map((row) => row.type && row.type.name)
      .filter(Boolean)
      .join('/');
    const ref = [
      `타입 ${types || current.primary_type}`,
      `BST ${current.base_stat_total}`,
      `포획률 ${current.capture_rate}`,
      `현재 ${formatHabitat(current.habitat)} ${formatTier(current.final_tier, current.tier_label)}`,
      `2번 ${formatHabitat(scenario.metadata_habitat)} ${formatTier(scenario.metadata_tier, scenario.metadata_tier_label)}`,
    ].join(', ');
    lines.push([
      current.pokemon_id,
      markdownEscape(namesKo[String(current.pokemon_id)] || ''),
      markdownEscape(current.name),
      markdownEscape(llm ? formatHabitat(llm.llm_habitat) : '미입력'),
      markdownEscape(llm ? formatTier(llm.llm_tier, llm.llm_tier_label) : '미입력'),
      markdownEscape(llm ? llm.memo_ko : '미입력'),
      markdownEscape(ref),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  return lines.join('\n') + '\n';
}

function main() {
  const data = readJson(CURRENT_DATA_PATH, null);
  const namesKo = readJson(KO_NAMES_PATH, {});
  if (!data || !Array.isArray(data.pokemon)) {
    throw new Error(`Unable to read ${CURRENT_DATA_PATH}`);
  }

  const currentRows = data.pokemon
    .filter((row) => row.pokemon_id >= START_ID && row.pokemon_id <= END_ID)
    .sort((a, b) => a.pokemon_id - b.pokemon_id);
  const scenarioRows = currentRows.map(scenario2ForPokemon);
  const scenarioByName = new Map(scenarioRows.map((row) => [row.name, row]));
  const evolutionChanges = applyEvolutionHabitatInheritance(scenarioByName);
  const llmById = loadLlmRows();

  const scenarioOutput = {
    generated_at: new Date().toISOString(),
    range: `${START_ID}-${END_ID}`,
    algorithm: 'all encounter location-area/location metadata keyword matching; final tier unchanged because rarity scoring does not consume habitat',
    evolution_habitat_inheritance_changes: evolutionChanges,
    pokemon: scenarioRows.sort((a, b) => a.pokemon_id - b.pokemon_id),
  };

  writeJson(SCENARIO2_PATH, scenarioOutput);
  writeText(COMPARISON_MD_PATH, buildComparisonMd(currentRows, scenarioRows, llmById, namesKo, evolutionChanges));
  writeText(NOTES_MD_PATH, buildNotesMd(currentRows, scenarioRows, llmById, namesKo));
  process.stdout.write([
    `Scenario 2 JSON: ${path.relative(ROOT, SCENARIO2_PATH)}`,
    `Comparison MD: ${path.relative(ROOT, COMPARISON_MD_PATH)}`,
    `LLM notes MD: ${path.relative(ROOT, NOTES_MD_PATH)}`,
    `LLM rows loaded: ${llmById.size}`,
  ].join('\n') + '\n');
}

if (require.main === module) {
  main();
}
