#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');

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

  process.stderr.write('[pokedata] python3 or python is required.\n');
  process.stderr.write('[pokedata] set PYTHON=/path/to/python if needed.\n');
  process.exit(1);
}

function main() {
  const python = resolvePython();
  const args = ['-m', 'dev.pokedata.main'].concat(process.argv.slice(2));
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
