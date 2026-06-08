'use strict';

const { test, run } = require('./runner');
const assert = require('assert').strict;
const fs = require('fs');
const os = require('os');
const path = require('path');
const packageJson = require('../package.json');
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
  buildUnixShim,
  buildWindowsCmdShim,
  isDirOnPath
} = require('../tools/setup_cli_command');

const {
  OWNER_DIR_BITS,
  OWNER_FILE_BITS,
  modeWithUserBits,
  repairBrokenSymlink,
  repairPathPermissions,
  setupRuntimePermissions
} = require('../tools/setup_runtime_permissions');

const {
  REQUIRED_EVOLUTION_ITEM_SPRITES,
  REQUIRED_MAP_ASSETS,
  REQUIRED_POKEAPI_SAMPLE_FILES,
  SPRITE_SPARSE_PATHS,
  parseGitLinkCommit
} = require('../tools/setup_poke_assets');

function createSymlinkIfSupported(targetPath, linkPath) {
  try {
    fs.symlinkSync(targetPath, linkPath);
    return true;
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'EINVAL')) {
      return false;
    }
    throw error;
  }
}

function assertOwnerPermissionBits(targetPath, requiredBits) {
  const effectiveBits = process.platform === 'win32' ? (requiredBits & OWNER_FILE_BITS) : requiredBits;
  assert.ok((fs.statSync(targetPath).mode & effectiveBits) === effectiveBits);
}

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

test('package files include setup and packaged runtime entry dependencies', () => {
  for (const filePath of [
    'cli.js',
    'server.js',
    'tools/setup_cli_command.js',
    'tools/setup_runtime_permissions.js',
    'tools/setup_poke_assets.js',
    'data/map_assets/*.png',
    'public/item-sprites/*.png'
  ]) {
    assert.ok(packageJson.files.includes(filePath), `${filePath} should be packaged`);
  }
});

test('runtime permission setup adds owner-only access bits', () => {
  assert.equal(modeWithUserBits(0o040, OWNER_DIR_BITS) & 0o777, 0o740);
  assert.equal(modeWithUserBits(0o000, OWNER_FILE_BITS) & 0o777, 0o600);
});

test('runtime permission setup repairs owned paths and stale debug symlink', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'poke-agents-perms-'));
  const homeDir = path.join(tempRoot, 'home');
  const claudeProjects = path.join(homeDir, '.claude', 'projects', 'project-a');
  const claudeSessions = path.join(homeDir, '.claude', 'sessions');
  const codexSessions = path.join(homeDir, '.codex', 'sessions', '2026', '06', '08');
  const debugDir = path.join(homeDir, '.claude', 'debug');
  const transcriptPath = path.join(claudeProjects, 'session-a.jsonl');
  const claudeSessionPath = path.join(claudeSessions, 'session-a.json');
  const codexTranscriptPath = path.join(codexSessions, 'session-b.jsonl');
  const latestLink = path.join(debugDir, 'latest');

  fs.mkdirSync(claudeProjects, { recursive: true });
  fs.mkdirSync(claudeSessions, { recursive: true });
  fs.mkdirSync(codexSessions, { recursive: true });
  fs.mkdirSync(debugDir, { recursive: true });
  fs.writeFileSync(transcriptPath, '{}\n', { mode: 0o000 });
  fs.writeFileSync(claudeSessionPath, '{}\n', { mode: 0o000 });
  fs.writeFileSync(codexTranscriptPath, '{}\n', { mode: 0o000 });
  const symlinkCreated = createSymlinkIfSupported(path.join(debugDir, 'missing.txt'), latestLink);

  const result = setupRuntimePermissions({ homeDir, log: () => {} });

  assert.equal(fs.existsSync(latestLink), false);
  assertOwnerPermissionBits(transcriptPath, OWNER_FILE_BITS);
  assertOwnerPermissionBits(claudeSessionPath, OWNER_FILE_BITS);
  assertOwnerPermissionBits(codexTranscriptPath, OWNER_FILE_BITS);
  assertOwnerPermissionBits(claudeProjects, OWNER_DIR_BITS);
  assert.ok(result.fixed >= (symlinkCreated ? 4 : 3));
});

test('runtime permission helpers report direct repairs', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'poke-agents-path-perms-'));
  const filePath = path.join(tempRoot, 'session.jsonl');
  fs.writeFileSync(filePath, '{}\n', { mode: 0o000 });

  assert.equal(repairPathPermissions(filePath, OWNER_FILE_BITS).status, 'fixed');
  assertOwnerPermissionBits(filePath, OWNER_FILE_BITS);

  const linkPath = path.join(tempRoot, 'latest');
  const symlinkCreated = createSymlinkIfSupported(path.join(tempRoot, 'missing.txt'), linkPath);
  assert.equal(repairBrokenSymlink(linkPath).status, symlinkCreated ? 'fixed' : 'missing');
  assert.equal(fs.existsSync(linkPath), false);
});

test('package exposes the poke-as executable', () => {
  assert.deepEqual(packageJson.bin, {
    'poke-as': './cli.js'
  });
});

test('cli setup shims invoke cli with forwarded args', () => {
  const cliPath = 'C:\\Agent Safari\\cli.js';

  assert.equal(buildWindowsCmdShim(cliPath), [
    '@ECHO off',
    'SETLOCAL',
    'node "C:\\Agent Safari\\cli.js" %*',
    ''
  ].join('\r\n'));

  assert.equal(buildUnixShim("/tmp/agent safari/cli's.js"), [
    '#!/bin/sh',
    "exec node '/tmp/agent safari/cli'\\''s.js' \"$@\"",
    ''
  ].join('\n'));
});

test('cli setup detects bin directory on PATH', () => {
  const first = path.resolve('tmp', 'bin');
  const second = path.resolve('other', 'bin');
  const env = { PATH: [second, first].join(path.delimiter) };
  assert.equal(isDirOnPath(first, env), true);
  assert.equal(isDirOnPath(path.resolve('missing', 'bin'), env), false);
});

run();
