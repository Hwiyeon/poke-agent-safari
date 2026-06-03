#!/usr/bin/env node
'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const http = require('http');
const url = require('url');
const { spawnSync } = require('child_process');

const { AREA_DEFS, TARGET_HEIGHT, TARGET_WIDTH } = require('./lib/area_regions');
const { decodePNG } = require('./lib/png');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
};

const ROOT = path.join(__dirname, '..');
const STATIC_DIR = path.join(__dirname, 'mask-editor');
const DATA_DIR = path.join(ROOT, 'data');
const REFERENCE_DIR = path.join(DATA_DIR, 'reference');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');
const MASK_PATH = path.join(GENERATED_DIR, 'area_mask.png');
const BACKUP_PATH = path.join(GENERATED_DIR, 'area_mask.backup.png');
const VIZ_SCRIPT_PATH = path.join(__dirname, 'generate_spawn_viz.js');

function parseArgs(argv) {
  const out = { host: '127.0.0.1', port: 8790 };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      out.help = true;
      continue;
    }
    if (token === '--host' && argv[i + 1]) {
      out.host = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--port' && argv[i + 1]) {
      out.port = Number(argv[i + 1]) || out.port;
      i += 1;
    }
  }
  return out;
}

function usage() {
  return [
    'Usage:',
    '  node dev/map/mask_editor.js [--host 127.0.0.1] [--port 8790]',
    '',
    'Opens a local browser editor for painting dev/data/generated/area_mask.png.',
  ].join('\n');
}

async function readRequestBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 10 * 1024 * 1024) {
      throw new Error('Request body too large');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function serveFile(filePath, res, cacheControl) {
  const ext = path.extname(filePath).toLowerCase();
  const body = await fsp.readFile(filePath);
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', cacheControl || 'no-store');
  res.end(body);
}

async function saveMask(buffer) {
  const decoded = decodePNG(buffer);
  if (decoded.width !== TARGET_WIDTH || decoded.height !== TARGET_HEIGHT) {
    throw new Error(`Mask must be ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
  }

  try {
    await fsp.copyFile(MASK_PATH, BACKUP_PATH);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  await fsp.writeFile(MASK_PATH, buffer);

  const viz = spawnSync(process.execPath, [VIZ_SCRIPT_PATH], {
    cwd: ROOT,
    encoding: 'utf8',
  });

  return {
    vizOk: viz.status === 0,
    vizStdout: viz.stdout || '',
    vizStderr: viz.stderr || '',
  };
}

async function route(req, res) {
  const parsed = url.parse(req.url || '/', true);
  const pathname = parsed.pathname || '/';

  if (pathname === '/api/config') {
    sendJson(res, 200, {
      areaDefs: AREA_DEFS,
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      files: {
        island: '/data/island_map_cc.png',
        mask: '/data/area_mask.png',
        areaMap: '/data/area_map.png',
        viz: '/data/spawn_regions_viz.png',
      },
    });
    return;
  }

  if (pathname === '/api/save-mask' && req.method === 'POST') {
    try {
      const body = await readRequestBody(req);
      const result = await saveMask(body);
      sendJson(res, 200, {
        ok: true,
        backupPath: 'dev/data/generated/area_mask.backup.png',
        vizUpdated: result.vizOk,
        vizStdout: result.vizStdout.trim(),
        vizStderr: result.vizStderr.trim(),
      });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: error.message });
    }
    return;
  }

  if (pathname.startsWith('/data/')) {
    const safeName = path.basename(pathname);
    const baseDir = safeName === 'area_map.png' ? REFERENCE_DIR : GENERATED_DIR;
    const filePath = path.join(baseDir, safeName);
    if (!filePath.startsWith(baseDir)) {
      sendJson(res, 403, { error: 'Forbidden' });
      return;
    }
    try {
      await serveFile(filePath, res, 'no-store');
    } catch (error) {
      if (error.code === 'ENOENT') sendJson(res, 404, { error: 'Not found' });
      else throw error;
    }
    return;
  }

  const staticPath = pathname === '/' ? '/index.html' : pathname;
  const cleaned = path.normalize(staticPath.replace(/^\/+/, ''));
  const absolute = path.join(STATIC_DIR, cleaned);
  if (!absolute.startsWith(STATIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  try {
    await serveFile(absolute, res, 'no-store');
  } catch (error) {
    if (error.code === 'ENOENT') sendJson(res, 404, { error: 'Not found' });
    else throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const server = http.createServer((req, res) => {
    route(req, res).catch((error) => {
      sendJson(res, 500, { error: error.message });
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(args.port, args.host, resolve);
  });

  process.stdout.write(`mask editor listening on http://${args.host}:${args.port}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
