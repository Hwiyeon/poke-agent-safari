'use strict';

const { test, run } = require('./runner');
const assert = require('assert').strict;
const path = require('path');
const { EVOLUTION_ITEM_POOL } = require('../evolutionItems');
const {
  DATA_DIR,
  GEN5_STATIC_DIR,
  GEN5_ANIMATED_DIR,
  GEN5_ICON_DIR,
  GEN5_ICON_ANIMATED_DIR,
  POKEAPI_SPRITES_DIR
} = require('../paths');

const {
  REQUIRED_EVOLUTION_ITEM_SPRITES,
  REQUIRED_MAP_ASSETS,
  REQUIRED_POKEAPI_SAMPLE_FILES,
  SPRITE_SPARSE_PATHS,
  parseGitLinkCommit
} = require('../tools/setup_poke_assets');

test('asset setup sparse paths cover runtime sprites plus items', () => {
  assert.deepEqual(SPRITE_SPARSE_PATHS, [
    'sprites/pokemon/versions/generation-v/black-white',
    'sprites/pokemon/versions/generation-v/icons',
    'sprites/items'
  ]);
});

test('asset setup tracks every bundled evolution item sprite', () => {
  assert.deepEqual(
    REQUIRED_EVOLUTION_ITEM_SPRITES,
    EVOLUTION_ITEM_POOL.map((item) => `${item.id}.png`)
  );
  assert.ok(REQUIRED_EVOLUTION_ITEM_SPRITES.includes('linking-cord.png'));
});

test('asset setup validates current dashboard map assets', () => {
  assert.deepEqual(REQUIRED_MAP_ASSETS, [
    'area_mask.png',
    'island_map_cc.png',
    'cave_detail_v2.png',
    'forest_detail_v2.png',
    'grassland_detail_v2.png',
    'mountain_detail_v2.png',
    'rough_terrain_detail_v2.png',
    'ruin_detail_v2.png',
    'sea_detail_v2.png',
    'urban_detail_v2.png',
    'waters_edge_detail_v2.png'
  ]);
  const firstMapAssetPath = path.join(DATA_DIR, 'map_assets', REQUIRED_MAP_ASSETS[0]);
  assert.equal(firstMapAssetPath.endsWith(path.join('data', 'map_assets', 'area_mask.png')), true);
});

test('asset setup validates samples from each downloaded sprite family', () => {
  assert.deepEqual(REQUIRED_POKEAPI_SAMPLE_FILES, [
    path.join(GEN5_STATIC_DIR, '1.png'),
    path.join(GEN5_ANIMATED_DIR, '1.gif'),
    path.join(GEN5_ICON_DIR, '1.png'),
    path.join(GEN5_ICON_ANIMATED_DIR, '1.png'),
    path.join(POKEAPI_SPRITES_DIR, 'sprites', 'items', 'water-stone.png')
  ]);
});

test('asset setup parses pinned gitlink commits from ls-tree output', () => {
  const sha = '0123456789abcdef0123456789abcdef01234567';
  const stdout = `160000 commit ${sha}\tpublic/vendor/pokeapi-sprites\n`;
  assert.equal(parseGitLinkCommit(stdout), sha);
  assert.equal(parseGitLinkCommit('100644 blob abc\tREADME.md\n'), null);
});

run();
