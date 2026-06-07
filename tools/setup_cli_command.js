#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { PROJECT_ROOT } = require('../paths');

const COMMAND_NAME = 'poke-as';
const CLI_PATH = path.join(PROJECT_ROOT, 'cli.js');

function hasArg(name) {
  return process.argv.slice(2).includes(name);
}

function runNpmConfigPrefix() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(npmCommand, ['config', 'get', 'prefix'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'npm config get prefix failed').trim());
  }

  return result.stdout.trim();
}

function resolveNpmPrefix(env = process.env) {
  if (env.POKE_AS_NPM_PREFIX) {
    return env.POKE_AS_NPM_PREFIX;
  }

  if (env.npm_config_prefix) {
    return env.npm_config_prefix;
  }

  if (process.platform === 'win32' && env.APPDATA) {
    return path.join(env.APPDATA, 'npm');
  }

  return runNpmConfigPrefix();
}

function resolveBinDir(env = process.env) {
  if (env.POKE_AS_BIN_DIR) {
    return path.resolve(env.POKE_AS_BIN_DIR);
  }

  const prefix = path.resolve(resolveNpmPrefix(env));
  if (process.platform === 'win32') {
    return prefix;
  }

  return path.basename(prefix) === 'bin' ? prefix : path.join(prefix, 'bin');
}

function splitPath(pathValue) {
  return String(pathValue || '')
    .split(path.delimiter)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeForPathCompare(dirPath) {
  const resolved = path.resolve(dirPath);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isDirOnPath(dirPath, env = process.env) {
  const target = normalizeForPathCompare(dirPath);
  return splitPath(env.PATH || env.Path).some((entry) => normalizeForPathCompare(entry) === target);
}

function quoteCmdPath(filePath) {
  return `"${String(filePath).replace(/"/g, '""')}"`;
}

function buildWindowsCmdShim(cliPath = CLI_PATH) {
  return [
    '@ECHO off',
    'SETLOCAL',
    `node ${quoteCmdPath(cliPath)} %*`,
    ''
  ].join('\r\n');
}

function quoteShPath(filePath) {
  return `'${String(filePath).replace(/'/g, `'\\''`)}'`;
}

function buildUnixShim(cliPath = CLI_PATH) {
  return [
    '#!/bin/sh',
    `exec node ${quoteShPath(cliPath)} "$@"`,
    ''
  ].join('\n');
}

function removeWindowsPowerShellShim(binDir) {
  const ps1Path = path.join(binDir, `${COMMAND_NAME}.ps1`);
  if (!fs.existsSync(ps1Path)) {
    return false;
  }

  fs.rmSync(ps1Path);
  return true;
}

function writeShim(binDir = resolveBinDir()) {
  if (!fs.existsSync(CLI_PATH)) {
    throw new Error(`CLI entrypoint not found: ${CLI_PATH}`);
  }

  fs.mkdirSync(binDir, { recursive: true });

  if (process.platform === 'win32') {
    const targetPath = path.join(binDir, `${COMMAND_NAME}.cmd`);
    fs.writeFileSync(targetPath, buildWindowsCmdShim(), 'utf8');
    const removedPs1 = removeWindowsPowerShellShim(binDir);
    return { targetPath, removedPs1 };
  }

  const targetPath = path.join(binDir, COMMAND_NAME);
  fs.writeFileSync(targetPath, buildUnixShim(), 'utf8');
  fs.chmodSync(targetPath, 0o755);
  return { targetPath, removedPs1: false };
}

function main() {
  if (process.env.POKE_AS_SKIP_CLI_SETUP === '1') {
    process.stdout.write('[cli] skipped poke-as command setup because POKE_AS_SKIP_CLI_SETUP=1\n');
    return;
  }

  const bestEffort = hasArg('--best-effort');

  try {
    const binDir = resolveBinDir();
    const result = writeShim(binDir);
    process.stdout.write(`[cli] registered ${COMMAND_NAME} at ${result.targetPath}\n`);
    if (result.removedPs1) {
      process.stdout.write('[cli] removed stale PowerShell shim so execution policy does not block poke-as\n');
    }
    if (!isDirOnPath(binDir)) {
      process.stdout.write(`[cli] warning: ${binDir} is not on PATH yet; add it or open a fresh terminal if PATH was just updated\n`);
    }
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    process.stderr.write(`[cli] could not register ${COMMAND_NAME}: ${message}\n`);
    process.stderr.write('[cli] run "npm run setup:cli" after fixing permissions, or use "node cli.js" from this directory.\n');
    if (!bestEffort) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  buildUnixShim,
  buildWindowsCmdShim,
  isDirOnPath,
  resolveBinDir,
  resolveNpmPrefix,
  writeShim
};
