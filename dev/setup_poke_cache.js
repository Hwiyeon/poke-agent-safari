#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DEFAULT_RANGE = '1-649';

function hasOption(argv, name) {
  return argv.includes(name) || argv.some((arg) => arg.startsWith(name + '='));
}

function buildCachePrimeArgs(argv) {
  const userArgs = Array.isArray(argv) ? argv.slice() : [];
  const args = ['-m', 'dev.pokedata.cache_prime'];
  const hasHelp = hasOption(userArgs, '--help') || userArgs.includes('-h');
  if (!hasHelp && !hasOption(userArgs, '--range')) {
    args.push('--range', DEFAULT_RANGE);
  }
  return args.concat(userArgs);
}

function resolvePython() {
  const candidates = [];
  if (process.env.PYTHON) {
    candidates.push(process.env.PYTHON);
  }
  candidates.push('python3', 'python');

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['--version'], {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    if (result.status === 0) {
      return candidate;
    }
  }

  process.stderr.write('[poke-cache] python3 or python is required.\n');
  process.stderr.write('[poke-cache] set PYTHON=/path/to/python if needed.\n');
  process.exit(1);
}

function main() {
  const python = resolvePython();
  const args = buildCachePrimeArgs(process.argv.slice(2));
  const result = spawnSync(python, args, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  process.exit(result.status || 0);
}

if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_RANGE,
  buildCachePrimeArgs
};
