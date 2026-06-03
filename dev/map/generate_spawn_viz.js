#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const { PixelBuffer, copyInto, decodePNG, encodePNG, resizeNearest } = require('./lib/png');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REFERENCE_DIR = path.join(DATA_DIR, 'reference');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');
const ISLAND_PATH = path.join(GENERATED_DIR, 'island_map_cc.png');
const AREA_MASK_PATH = path.join(GENERATED_DIR, 'area_mask.png');
const AREA_MAP_PATH = path.join(REFERENCE_DIR, 'area_map.png');
const OUTPUT_PATH = path.join(GENERATED_DIR, 'spawn_regions_viz.png');

const PANEL_W = 480;
const PANEL_H = 320;
const GAP = 20;
const PAD = 12;

function ensureRgba(image) {
  if (image.channels === 4) return resizeNearest(image, image.width, image.height);
  return resizeNearest(image, image.width || image.w, image.height || image.h);
}

function overlayMask(base, mask) {
  const out = new PixelBuffer(base.w, base.h);
  copyInto(out, base, 0, 0);

  for (let y = 0; y < mask.h; y++) {
    for (let x = 0; x < mask.w; x++) {
      const idx = (y * mask.w + x) * 4;
      if (mask.data[idx + 3] === 0) continue;
      out.blendPixel(x, y, mask.data[idx], mask.data[idx + 1], mask.data[idx + 2], 96);

      const here = `${mask.data[idx]},${mask.data[idx + 1]},${mask.data[idx + 2]},${mask.data[idx + 3]}`;
      let edge = false;
      if (x > 0) {
        const left = idx - 4;
        const leftKey = `${mask.data[left]},${mask.data[left + 1]},${mask.data[left + 2]},${mask.data[left + 3]}`;
        if (leftKey !== here) edge = true;
      }
      if (!edge && y > 0) {
        const up = idx - mask.w * 4;
        const upKey = `${mask.data[up]},${mask.data[up + 1]},${mask.data[up + 2]},${mask.data[up + 3]}`;
        if (upKey !== here) edge = true;
      }
      if (edge) out.setPixel(x, y, 255, 255, 255, 255);
    }
  }

  return out;
}

const island = ensureRgba(decodePNG(fs.readFileSync(ISLAND_PATH)));
const areaMask = ensureRgba(decodePNG(fs.readFileSync(AREA_MASK_PATH)));
const areaMap = resizeNearest(decodePNG(fs.readFileSync(AREA_MAP_PATH)), PANEL_W, PANEL_H);

const leftPanel = overlayMask(island, areaMask);
const out = new PixelBuffer(PAD * 2 + PANEL_W * 2 + GAP, PAD * 2 + PANEL_H);
out.fillRect(0, 0, out.w, out.h, 10, 16, 24, 255);

copyInto(out, leftPanel, PAD, PAD);
copyInto(out, areaMap, PAD + PANEL_W + GAP, PAD);

for (let y = PAD - 1; y <= PAD + PANEL_H; y++) {
  out.setPixel(PAD - 1, y, 255, 255, 255, 255);
  out.setPixel(PAD + PANEL_W, y, 255, 255, 255, 255);
  out.setPixel(PAD + PANEL_W + GAP - 1, y, 255, 255, 255, 120);
  out.setPixel(PAD + PANEL_W + GAP, y, 255, 255, 255, 120);
  out.setPixel(PAD + PANEL_W + GAP + PANEL_W, y, 255, 255, 255, 255);
}
for (let x = PAD - 1; x <= PAD + PANEL_W; x++) {
  out.setPixel(x, PAD - 1, 255, 255, 255, 255);
  out.setPixel(x, PAD + PANEL_H, 255, 255, 255, 255);
}
for (let x = PAD + PANEL_W + GAP - 1; x <= PAD + PANEL_W + GAP + PANEL_W; x++) {
  out.setPixel(x, PAD - 1, 255, 255, 255, 255);
  out.setPixel(x, PAD + PANEL_H, 255, 255, 255, 255);
}

fs.writeFileSync(OUTPUT_PATH, encodePNG(out));
console.log(`wrote ${OUTPUT_PATH}`);
