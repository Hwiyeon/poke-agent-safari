#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const OWNER_DIR_BITS = 0o700;
const OWNER_FILE_BITS = 0o600;
const MAX_SCAN_DEPTH = 6;

function runtimePermissionTargets(homeDir = os.homedir()) {
  return [
    {
      label: 'Claude projects',
      path: path.join(homeDir, '.claude', 'projects'),
      filePattern: /\.(jsonl|meta\.json)$/i
    },
    {
      label: 'Claude sessions',
      path: path.join(homeDir, '.claude', 'sessions'),
      filePattern: /\.json$/i
    },
    {
      label: 'Codex sessions',
      path: path.join(homeDir, '.codex', 'sessions'),
      filePattern: /\.jsonl$/i
    }
  ];
}

function staleSymlinkTargets(homeDir = os.homedir()) {
  return [
    path.join(homeDir, '.claude', 'debug', 'latest')
  ];
}

function hasArg(name) {
  return process.argv.slice(2).includes(name);
}

function currentUid() {
  return typeof process.getuid === 'function' ? process.getuid() : null;
}

function isOwnedByCurrentUser(stats, uid = currentUid()) {
  return uid === null || stats.uid === uid;
}

function modeWithUserBits(mode, bits) {
  return mode | bits;
}

function noop() {}

function repairPathPermissions(targetPath, requiredBits, options = {}) {
  const log = options.log || noop;
  let stats;
  try {
    stats = fs.lstatSync(targetPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { status: 'missing', path: targetPath };
    }
    log(`[permissions] cannot stat ${targetPath}: ${error.message}`);
    return { status: 'error', path: targetPath, error };
  }

  if (stats.isSymbolicLink()) {
    return { status: 'skipped-symlink', path: targetPath };
  }
  if (!isOwnedByCurrentUser(stats, options.uid)) {
    log(`[permissions] not owned by current user, leaving unchanged: ${targetPath}`);
    return { status: 'skipped-owner', path: targetPath };
  }

  const nextMode = modeWithUserBits(stats.mode, requiredBits);
  if (nextMode === stats.mode) {
    return { status: 'ok', path: targetPath };
  }

  try {
    fs.chmodSync(targetPath, nextMode);
    return { status: 'fixed', path: targetPath };
  } catch (error) {
    log(`[permissions] chmod failed for ${targetPath}: ${error.message}`);
    return { status: 'error', path: targetPath, error };
  }
}

function repairBrokenSymlink(linkPath, options = {}) {
  const log = options.log || noop;
  let stats;
  try {
    stats = fs.lstatSync(linkPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { status: 'missing', path: linkPath };
    }
    log(`[permissions] cannot stat ${linkPath}: ${error.message}`);
    return { status: 'error', path: linkPath, error };
  }

  if (!stats.isSymbolicLink()) {
    return { status: 'not-symlink', path: linkPath };
  }
  if (!isOwnedByCurrentUser(stats, options.uid)) {
    log(`[permissions] stale symlink is not owned by current user, leaving unchanged: ${linkPath}`);
    return { status: 'skipped-owner', path: linkPath };
  }
  if (fs.existsSync(linkPath)) {
    return { status: 'ok', path: linkPath };
  }

  try {
    fs.unlinkSync(linkPath);
    log(`[permissions] removed stale symlink: ${linkPath}`);
    return { status: 'fixed', path: linkPath };
  } catch (error) {
    log(`[permissions] failed to remove stale symlink ${linkPath}: ${error.message}`);
    return { status: 'error', path: linkPath, error };
  }
}

function scanRuntimeTree(rootPath, filePattern, options = {}) {
  const log = options.log || noop;
  const summary = { checked: 0, fixed: 0, warnings: 0 };
  const rootResult = repairPathPermissions(rootPath, OWNER_DIR_BITS, options);
  if (rootResult.status === 'missing') {
    return summary;
  }
  summary.checked += 1;
  if (rootResult.status === 'fixed') summary.fixed += 1;
  if (rootResult.status === 'error' || rootResult.status === 'skipped-owner') summary.warnings += 1;

  const stack = [{ dirPath: rootPath, depth: 0 }];
  while (stack.length > 0) {
    const { dirPath, depth } = stack.pop();
    let dirents;
    try {
      dirents = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (error) {
      log(`[permissions] cannot read ${dirPath}: ${error.message}`);
      summary.warnings += 1;
      continue;
    }

    for (const dirent of dirents) {
      const itemPath = path.join(dirPath, dirent.name);
      if (dirent.isDirectory()) {
        const result = repairPathPermissions(itemPath, OWNER_DIR_BITS, options);
        summary.checked += 1;
        if (result.status === 'fixed') summary.fixed += 1;
        if (result.status === 'error' || result.status === 'skipped-owner') summary.warnings += 1;
        if (depth + 1 < MAX_SCAN_DEPTH) {
          stack.push({ dirPath: itemPath, depth: depth + 1 });
        }
      } else if (dirent.isFile() && filePattern.test(dirent.name)) {
        const result = repairPathPermissions(itemPath, OWNER_FILE_BITS, options);
        summary.checked += 1;
        if (result.status === 'fixed') summary.fixed += 1;
        if (result.status === 'error' || result.status === 'skipped-owner') summary.warnings += 1;
      }
    }
  }

  return summary;
}

function setupRuntimePermissions(options = {}) {
  const homeDir = options.homeDir || os.homedir();
  const log = options.log || ((message) => process.stdout.write(`${message}\n`));
  const uid = options.uid == null ? currentUid() : options.uid;
  const summary = { checked: 0, fixed: 0, warnings: 0 };

  for (const linkPath of staleSymlinkTargets(homeDir)) {
    const result = repairBrokenSymlink(linkPath, { log, uid });
    summary.checked += result.status === 'missing' ? 0 : 1;
    if (result.status === 'fixed') summary.fixed += 1;
    if (result.status === 'error' || result.status === 'skipped-owner') summary.warnings += 1;
  }

  for (const target of runtimePermissionTargets(homeDir)) {
    const targetSummary = scanRuntimeTree(target.path, target.filePattern, { log, uid });
    summary.checked += targetSummary.checked;
    summary.fixed += targetSummary.fixed;
    summary.warnings += targetSummary.warnings;
  }

  log(`[permissions] checked ${summary.checked} runtime path(s), fixed ${summary.fixed}, warnings ${summary.warnings}`);
  return summary;
}

function main() {
  const bestEffort = hasArg('--best-effort');
  try {
    const summary = setupRuntimePermissions();
    if (summary.warnings > 0 && !bestEffort) {
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    process.stderr.write(`[permissions] setup failed: ${message}\n`);
    if (!bestEffort) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  OWNER_DIR_BITS,
  OWNER_FILE_BITS,
  modeWithUserBits,
  repairBrokenSymlink,
  repairPathPermissions,
  runtimePermissionTargets,
  setupRuntimePermissions,
  staleSymlinkTargets
};
