#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'dev', 'data', 'generated');
const CURRENT_DATA_PATH = path.join(ROOT, 'data', 'pokemon_data.json');
const KO_NAMES_PATH = path.join(ROOT, 'data', 'pokemon_names_ko.json');
const LLM_PATH = path.join(OUT_DIR, 'llm_habitat_rarity_judgement_001_649.json');
const POKEMON_CACHE_DIR = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'pokemon');
const EVOLUTION_CHAIN_DIR = path.join(ROOT, 'dev', '.cache', 'pokeapi', 'evolution-chain');
const EVOLUTION_PATHS_PATH = path.join(ROOT, 'data', 'evolution_paths.json');

const TABLE_MD_PATH = path.join(OUT_DIR, 'pokemon_table.md');
const TABLE_KO_MD_PATH = path.join(OUT_DIR, 'pokemon_table.ko.md');
const RARITY_JSON_PATH = path.join(OUT_DIR, 'pokemon_rarity_order.json');
const RARITY_MD_PATH = path.join(OUT_DIR, 'pokemon_rarity_order.md');
const RARITY_KO_MD_PATH = path.join(OUT_DIR, 'pokemon_rarity_order.ko.md');
const RARITY_ALIAS_MD_PATH = path.join(OUT_DIR, 'rarity_order.md');
const RARITY_ALIAS_KO_MD_PATH = path.join(OUT_DIR, 'rarity_order.ko.md');

const TIER_LABELS = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Very Rare',
  5: 'Legendary',
};

const TIER_LABELS_KO = {
  1: '흔함',
  2: '보통',
  3: '희귀',
  4: '매우 희귀',
  5: '전설/환상',
};

const TIER_EMOJI = {
  1: '⚪',
  2: '🟢',
  3: '🔵',
  4: '🟣',
  5: '🔴',
};

const HABITAT_LABELS = {
  cave: 'Cave',
  forest: 'Forest',
  grassland: 'Grassland',
  mountain: 'Mountain',
  rare: 'Rare/Special',
  'rough-terrain': 'Rough Terrain',
  sea: 'Sea',
  urban: 'Urban',
  'waters-edge': 'Waters Edge',
};

const HABITAT_LABELS_KO = {
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

const HABITAT_EMOJI = {
  cave: '🕳️',
  forest: '🌲',
  grassland: '🌿',
  mountain: '🏔️',
  rare: '✨',
  'rough-terrain': '🏜️',
  sea: '🌊',
  urban: '🏙️',
  'waters-edge': '🏖️',
};

const TYPE_LABELS_KO = {
  normal: '노말',
  fire: '불꽃',
  water: '물',
  electric: '전기',
  grass: '풀',
  ice: '얼음',
  fighting: '격투',
  poison: '독',
  ground: '땅',
  flying: '비행',
  psychic: '에스퍼',
  bug: '벌레',
  rock: '바위',
  ghost: '고스트',
  dragon: '드래곤',
  dark: '악',
  steel: '강철',
  fairy: '페어리',
};

const HABITAT_ORDER = ['cave', 'forest', 'grassland', 'mountain', 'rare', 'rough-terrain', 'sea', 'urban', 'waters-edge'];

function main() {
  const currentData = JSON.parse(fs.readFileSync(CURRENT_DATA_PATH, 'utf8'));
  const currentRows = currentData.pokemon;
  const namesKo = JSON.parse(fs.readFileSync(KO_NAMES_PATH, 'utf8'));
  const llmRows = JSON.parse(fs.readFileSync(LLM_PATH, 'utf8'));
  const llmById = new Map(llmRows.map((row) => [row.id, row]));

  const rows = currentRows.map((current) => mergeRow(current, llmById.get(current.pokemon_id), namesKo));
  validateRows(rows);

  const tierDist = countBy(rows, (row) => row.final_tier);
  fs.writeFileSync(CURRENT_DATA_PATH, JSON.stringify(buildRuntimeData(rows, tierDist), null, 2) + '\n', 'utf8');
  fs.writeFileSync(EVOLUTION_PATHS_PATH, JSON.stringify(buildEvolutionPaths(rows), null, 2) + '\n', 'utf8');

  const rarityRows = rows
    .slice()
    .sort((a, b) => b.final_tier - a.final_tier || a.pokemon_id - b.pokemon_id)
    .map((row, index) => ({ ...row, rank: index + 1 }));

  fs.writeFileSync(TABLE_MD_PATH, buildPokemonTableMd(rows, tierDist, false), 'utf8');
  fs.writeFileSync(TABLE_KO_MD_PATH, buildPokemonTableMd(rows, tierDist, true), 'utf8');
  fs.writeFileSync(RARITY_JSON_PATH, JSON.stringify(buildRarityJson(rarityRows), null, 2) + '\n', 'utf8');
  const rarityMd = buildRarityOrderMd(rarityRows, tierDist, false);
  const rarityKoMd = buildRarityOrderMd(rarityRows, tierDist, true);
  fs.writeFileSync(RARITY_MD_PATH, rarityMd, 'utf8');
  fs.writeFileSync(RARITY_KO_MD_PATH, rarityKoMd, 'utf8');
  fs.writeFileSync(RARITY_ALIAS_MD_PATH, rarityMd, 'utf8');
  fs.writeFileSync(RARITY_ALIAS_KO_MD_PATH, rarityKoMd, 'utf8');

  process.stdout.write(JSON.stringify({
    rows: rows.length,
    tier_distribution: tierDist,
    outputs: [
      path.relative(ROOT, CURRENT_DATA_PATH),
      path.relative(ROOT, EVOLUTION_PATHS_PATH),
      path.relative(ROOT, TABLE_MD_PATH),
      path.relative(ROOT, TABLE_KO_MD_PATH),
      path.relative(ROOT, RARITY_JSON_PATH),
      path.relative(ROOT, RARITY_MD_PATH),
      path.relative(ROOT, RARITY_KO_MD_PATH),
      path.relative(ROOT, RARITY_ALIAS_MD_PATH),
      path.relative(ROOT, RARITY_ALIAS_KO_MD_PATH),
    ],
  }, null, 2) + '\n');
}

function mergeRow(current, llm, namesKo) {
  if (!llm) throw new Error(`Missing LLM row for #${current.pokemon_id}`);
  const types = readPokemonTypes(current.pokemon_id);
  return {
    pokemon_id: current.pokemon_id,
    name: current.name,
    name_ko: llm.name_ko || namesKo[String(current.pokemon_id)] || current.name,
    habitat: llm.llm_habitat,
    capture_rate: current.capture_rate,
    base_stat_total: current.base_stat_total,
    primary_type: types[0] || current.primary_type,
    types,
    final_tier: llm.llm_tier,
    tier_label: TIER_LABELS[llm.llm_tier],
    tier_label_ko: TIER_LABELS_KO[llm.llm_tier],
    memo_ko: llm.memo_ko || '',
  };
}

function readPokemonTypes(id) {
  const cachePath = path.join(POKEMON_CACHE_DIR, `${id}.json`);
  if (!fs.existsSync(cachePath)) return [];
  const pokemon = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  return (pokemon.types || [])
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((row) => row.type && row.type.name)
    .filter(Boolean);
}

function buildPokemonTableMd(rows, tierDist, ko) {
  const lines = [];
  lines.push(ko ? '# 포켓몬 서식지 & 레어도 표 (#1-#649)' : '# Pokemon Habitat & Rarity Table (#1-#649)');
  lines.push('');
  lines.push(ko ? '- 기준: LLM 보정 결과 (`llm_habitat_rarity_judgement_001_649.json`)' : '- Source: LLM-calibrated result (`llm_habitat_rarity_judgement_001_649.json`)');
  lines.push('');
  lines.push(ko ? '## 요약' : '## Summary');
  lines.push('');
  lines.push(ko ? '| 레어도 | 라벨 | 수 |' : '| Tier | Label | Count |');
  lines.push('|---|---|---:|');
  for (const tier of [1, 2, 3, 4, 5]) {
    lines.push(`| ${tierDisplay(tier, ko)} | ${ko ? TIER_LABELS_KO[tier] : TIER_LABELS[tier]} | ${tierDist[tier] || 0} |`);
  }
  lines.push('');

  for (const habitat of HABITAT_ORDER) {
    const group = rows.filter((row) => row.habitat === habitat).sort((a, b) => a.pokemon_id - b.pokemon_id);
    if (!group.length) continue;
    lines.push(`## ${habitatDisplay(habitat, ko)}`);
    lines.push('');
    lines.push(ko ? '| # | 스프라이트 | 아이콘 | 이름 | 타입 | 포획률 | 레어도 |' : '| # | Sprite | Icon | Name | Type | Capture Rate | Tier |');
    lines.push('|---:|---|---|---|---|---:|---|');
    for (const row of group) {
      lines.push([
        row.pokemon_id,
        spriteMarkdown(row),
        iconMarkdown(row),
        markdownEscape(ko ? row.name_ko : titleName(row.name)),
        markdownEscape(typeDisplay(row, ko)),
        row.capture_rate,
        tierDisplay(row.final_tier, ko),
      ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
    }
    lines.push('');
  }

  lines.push(ko ? '## 전체 목록' : '## Full List');
  lines.push('');
  lines.push(ko ? '| # | 스프라이트 | 아이콘 | 이름 | 서식지 | 타입 | 포획률 | 레어도 |' : '| # | Sprite | Icon | Name | Habitat | Type | Capture Rate | Tier |');
  lines.push('|---:|---|---|---|---|---|---:|---|');
  for (const row of rows.slice().sort((a, b) => a.pokemon_id - b.pokemon_id)) {
    lines.push([
      row.pokemon_id,
      spriteMarkdown(row),
      iconMarkdown(row),
      markdownEscape(ko ? row.name_ko : titleName(row.name)),
      markdownEscape(habitatDisplay(row.habitat, ko)),
      markdownEscape(typeDisplay(row, ko)),
      row.capture_rate,
      tierDisplay(row.final_tier, ko),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('');

  return lines.join('\n');
}

function buildRarityOrderMd(rarityRows, tierDist, ko) {
  const lines = [];
  lines.push(ko ? '# 포켓몬 레어도순 배열 (#1-#649)' : '# Pokemon Rarity Order (#1-#649)');
  lines.push('');
  lines.push(ko ? '- 기준: LLM 보정 결과' : '- Source: LLM-calibrated result');
  lines.push(ko ? '- 정렬: 레어도 높은 순, 같은 레어도에서는 전국도감 번호 오름차순' : '- Sort: highest rarity first, then National Dex ID ascending');
  lines.push('');
  lines.push(ko ? '## 레어도별 개수' : '## Counts by Tier');
  lines.push('');
  lines.push(ko ? '| 레어도 | 라벨 | 수 |' : '| Tier | Label | Count |');
  lines.push('|---|---|---:|');
  for (const tier of [5, 4, 3, 2, 1]) {
    lines.push(`| ${tierDisplay(tier, ko)} | ${ko ? TIER_LABELS_KO[tier] : TIER_LABELS[tier]} | ${tierDist[tier] || 0} |`);
  }
  lines.push('');
  lines.push(ko ? '## 전체 ID 배열' : '## Full ID Array');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(rarityRows.map((row) => row.pokemon_id)));
  lines.push('```');
  lines.push('');

  for (const tier of [5, 4, 3, 2, 1]) {
    const group = rarityRows.filter((row) => row.final_tier === tier);
    if (!group.length) continue;
    lines.push(ko ? `## ${tierDisplay(tier, true)}` : `## ${tierDisplay(tier, false)}`);
    lines.push('');
    lines.push(ko ? '| 순위 | # | 스프라이트 | 아이콘 | 이름 | 영문 | 서식지 | 타입 | 포획률 | 종족값 |' : '| Rank | # | Sprite | Icon | Name | Habitat | Type | Capture Rate | BST |');
    lines.push(ko ? '|---:|---:|---|---|---|---|---|---|---:|---:|' : '|---:|---:|---|---|---|---|---|---:|---:|');
    for (const row of group) {
      const values = ko
        ? [
            row.rank,
            row.pokemon_id,
            spriteMarkdown(row),
            iconMarkdown(row),
            markdownEscape(row.name_ko),
            markdownEscape(row.name),
            markdownEscape(habitatDisplay(row.habitat, true)),
            markdownEscape(typeDisplay(row, true)),
            row.capture_rate,
            row.base_stat_total,
          ]
        : [
            row.rank,
            row.pokemon_id,
            spriteMarkdown(row),
            iconMarkdown(row),
            markdownEscape(titleName(row.name)),
            markdownEscape(habitatDisplay(row.habitat, false)),
            markdownEscape(typeDisplay(row, false)),
            row.capture_rate,
            row.base_stat_total,
          ];
      lines.push(values.join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
    }
    lines.push('');
  }

  return lines.join('\n');
}

function buildRuntimeData(rows, tierDist) {
  return {
    generated_at: new Date().toISOString(),
    range: '1-649',
    total: rows.length,
    skipped: [],
    source: path.relative(ROOT, LLM_PATH).replace(/\\/g, '/'),
    tier_distribution: tierDist,
    pokemon: rows.map((row) => ({
      pokemon_id: row.pokemon_id,
      name: row.name,
      name_ko: row.name_ko,
      habitat: row.habitat,
      capture_rate: row.capture_rate,
      base_stat_total: row.base_stat_total,
      primary_type: row.primary_type,
      types: row.types,
      final_tier: row.final_tier,
      tier_label: row.tier_label,
      tier_label_ko: row.tier_label_ko,
      memo_ko: row.memo_ko,
    })),
  };
}

function buildEvolutionPaths(rows) {
  const idByName = new Map(rows.map((row) => [row.name, row.pokemon_id]));
  const paths = {};
  for (const row of rows) {
    paths[row.pokemon_id] = [row.pokemon_id];
  }

  if (fs.existsSync(EVOLUTION_CHAIN_DIR)) {
    for (const fileName of fs.readdirSync(EVOLUTION_CHAIN_DIR)) {
      if (!fileName.endsWith('.json')) continue;
      const chain = JSON.parse(fs.readFileSync(path.join(EVOLUTION_CHAIN_DIR, fileName), 'utf8'));
      walkEvolutionChain(chain.chain, [], idByName, paths);
    }
  }

  const normalized = {};
  for (let id = 1; id <= 649; id += 1) {
    const pathIds = (paths[id] || [id])
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 649);
    normalized[id] = pathIds.length ? pathIds : [id];
  }

  return {
    generated_at: new Date().toISOString(),
    source: path.relative(ROOT, EVOLUTION_CHAIN_DIR).replace(/\\/g, '/'),
    range: '1-649',
    total: rows.length,
    paths: normalized,
  };
}

function walkEvolutionChain(node, lineage, idByName, paths) {
  if (!node || !node.species) return;
  const id = idByName.get(node.species.name);
  const nextLineage = id ? lineage.concat(id) : lineage.slice();
  if (id) {
    paths[id] = nextLineage;
  }
  for (const child of node.evolves_to || []) {
    walkEvolutionChain(child, nextLineage, idByName, paths);
  }
}

function buildRarityJson(rarityRows) {
  return {
    generated_at: new Date().toISOString(),
    source: path.relative(ROOT, LLM_PATH).replace(/\\/g, '/'),
    source_range: '1-649',
    total: rarityRows.length,
    sort: 'final_tier desc, pokemon_id asc',
    pokemon_ids: rarityRows.map((row) => row.pokemon_id),
    pokemon: rarityRows.map((row) => ({
      rank: row.rank,
      pokemon_id: row.pokemon_id,
      name: row.name,
      name_ko: row.name_ko,
      final_tier: row.final_tier,
      tier_label: row.tier_label,
      tier_label_ko: row.tier_label_ko,
      habitat: row.habitat,
      habitat_ko: HABITAT_LABELS_KO[row.habitat] || row.habitat,
      capture_rate: row.capture_rate,
      base_stat_total: row.base_stat_total,
      primary_type: row.primary_type,
      types: row.types,
      types_ko: typeDisplay(row, true),
    })),
  };
}

function spriteMarkdown(row) {
  return `![${row.name}](${spritePath('animated', row.pokemon_id)})`;
}

function iconMarkdown(row) {
  return `![${row.name} icon](${spritePath('icon', row.pokemon_id)})`;
}

function spritePath(kind, id) {
  const base = kind === 'icon'
    ? '../../../public/vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/icons'
    : '../../../public/vendor/pokeapi-sprites/sprites/pokemon/versions/generation-v/black-white/animated';
  return `${base}/${id}.${kind === 'icon' ? 'png' : 'gif'}`;
}

function tierDisplay(tier, ko) {
  const value = Number(tier);
  return `${TIER_EMOJI[value] || ''} ${ko ? `티어 ${value} ${TIER_LABELS_KO[value]}` : `${value} ${TIER_LABELS[value]}`}`.trim();
}

function habitatDisplay(habitat, ko) {
  return `${HABITAT_EMOJI[habitat] || ''} ${ko ? (HABITAT_LABELS_KO[habitat] || habitat) : (HABITAT_LABELS[habitat] || habitat)}`.trim();
}

function typeDisplay(row, ko) {
  if (!ko) return row.types.join('/') || row.primary_type;
  return (row.types.length ? row.types : [row.primary_type]).map((type) => TYPE_LABELS_KO[type] || type).join('/');
}

function countBy(rows, keyFn) {
  const counts = {};
  for (const row of rows) {
    const key = keyFn(row);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function titleName(name) {
  return String(name)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

function markdownEscape(value) {
  return String(value == null ? '' : value)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, '<br>');
}

function validateRows(rows) {
  if (rows.length !== 649) throw new Error(`Expected 649 rows, found ${rows.length}`);
  for (let id = 1; id <= 649; id += 1) {
    const row = rows[id - 1];
    if (!row || row.pokemon_id !== id) throw new Error(`Missing or out-of-order row for #${id}`);
    if (!TIER_LABELS[row.final_tier]) throw new Error(`Invalid tier for #${id}: ${row.final_tier}`);
    if (!row.habitat) throw new Error(`Missing habitat for #${id}`);
  }
}

if (require.main === module) {
  main();
}
