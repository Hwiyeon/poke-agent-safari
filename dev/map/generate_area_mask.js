#!/usr/bin/env node
'use strict';

/**
 * Generates app-space map assets from the authored reference images:
 * - dev/data/generated/island_map_cc.png : 480x320 nearest-neighbor resize
 * - dev/data/generated/area_mask.png     : 480x320 color-coded region mask
 *
 * The mask is extracted from the dashed region borders in area_map.png by
 * diffing it against island_map.png, keeping the small bright boundary dots,
 * dilating them into solid separators, and flood-filling from one seed per area.
 */

const fs = require('fs');
const path = require('path');

const { AREA_DEFS, TARGET_HEIGHT, TARGET_WIDTH, hexToRgb } = require('./lib/area_regions');
const { PixelBuffer, decodePNG, encodePNG, resizeNearest } = require('./lib/png');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REFERENCE_DIR = path.join(DATA_DIR, 'reference');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');
const INPUT_ISLAND = path.join(GENERATED_DIR, 'island_map.png');
const INPUT_AREA = path.join(REFERENCE_DIR, 'area_map.png');
const OUTPUT_ISLAND = path.join(GENERATED_DIR, 'island_map_cc.png');
const OUTPUT_MASK = path.join(GENERATED_DIR, 'area_mask.png');
const DEBUG_DOTS = path.join(GENERATED_DIR, 'area_boundary_dots_debug.png');
const DEBUG_BORDER = path.join(GENERATED_DIR, 'area_boundary_border_debug.png');

function brightness(r, g, b) {
  return (r + g + b) / 3;
}

function findComponents(mask, width, height) {
  const labels = new Int32Array(width * height);
  labels.fill(-1);
  const components = [];
  const queue = new Int32Array(width * height);
  const neighbors = [-1, 0, 1];

  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || labels[start] !== -1) continue;
    const id = components.length;
    let head = 0;
    let tail = 0;
    let size = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    const pixels = [];

    labels[start] = id;
    queue[tail++] = start;

    while (head < tail) {
      const idx = queue[head++];
      const x = idx % width;
      const y = (idx / width) | 0;
      pixels.push(idx);
      size++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      for (let yi = 0; yi < neighbors.length; yi++) {
        for (let xi = 0; xi < neighbors.length; xi++) {
          const dx = neighbors[xi];
          const dy = neighbors[yi];
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (!mask[next] || labels[next] !== -1) continue;
          labels[next] = id;
          queue[tail++] = next;
        }
      }
    }

    components.push({
      id,
      size,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      pixels,
    });
  }

  return { labels, components };
}

function dilate(mask, width, height, radius) {
  const out = new Uint8Array(mask.length);
  const offsets = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) offsets.push([dx, dy]);
    }
  }

  for (let idx = 0; idx < mask.length; idx++) {
    if (!mask[idx]) continue;
    const x = idx % width;
    const y = (idx / width) | 0;
    for (let i = 0; i < offsets.length; i++) {
      const nx = x + offsets[i][0];
      const ny = y + offsets[i][1];
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      out[ny * width + nx] = 1;
    }
  }

  return out;
}

function snapSeed(borderMask, width, height, x, y) {
  const startX = Math.max(0, Math.min(width - 1, x));
  const startY = Math.max(0, Math.min(height - 1, y));
  for (let radius = 0; radius <= 24; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = startX + dx;
        const ny = startY + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        if (!borderMask[ny * width + nx]) return [nx, ny];
      }
    }
  }
  throw new Error(`Unable to place seed near (${x}, ${y})`);
}

function imageWidth(image) {
  return image.width || image.w;
}

function imageHeight(image) {
  return image.height || image.h;
}

function imageChannels(image) {
  return image.channels || 4;
}

function extractBoundaryDots(areaMap, islandMap) {
  const width = imageWidth(areaMap);
  const height = imageHeight(areaMap);
  const areaChannels = imageChannels(areaMap);
  const islandChannels = imageChannels(islandMap);
  const overlayDiff = new Uint8Array(width * height);

  for (let idx = 0; idx < overlayDiff.length; idx++) {
    const areaOffset = idx * areaChannels;
    const islandOffset = idx * islandChannels;
    const ar = areaMap.data[areaOffset];
    const ag = areaMap.data[areaOffset + 1];
    const ab = areaMap.data[areaOffset + 2];
    const ir = islandMap.data[islandOffset];
    const ig = islandMap.data[islandOffset + 1];
    const ib = islandMap.data[islandOffset + 2];
    const diff = Math.abs(ar - ir) + Math.abs(ag - ig) + Math.abs(ab - ib);
    const max = Math.max(ar, ag, ab);
    const min = Math.min(ar, ag, ab);
    const light = brightness(ar, ag, ab);
    if (diff >= 35 && (max - min) <= 52 && (light <= 112 || light >= 180)) {
      overlayDiff[idx] = 1;
    }
  }

  const { components } = findComponents(overlayDiff, width, height);
  const borderDots = new Uint8Array(overlayDiff.length);
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    if (comp.size < 2 || comp.size > 110) continue;
    if (comp.width > 12 || comp.height > 12) continue;
    const ratio = comp.width > comp.height ? comp.width / comp.height : comp.height / comp.width;
    if (ratio > 2.6) continue;
    const density = comp.size / (comp.width * comp.height);
    if (density < 0.34) continue;
    for (let j = 0; j < comp.pixels.length; j++) borderDots[comp.pixels[j]] = 1;
  }
  return borderDots;
}

function scaleSeed(area, width, height) {
  return [
    Math.min(width - 1, Math.floor(area.seed[0] * width / TARGET_WIDTH)),
    Math.min(height - 1, Math.floor(area.seed[1] * height / TARGET_HEIGHT)),
  ];
}

function propagateAreas(borderMask, width, height) {
  const owners = new Int16Array(width * height);
  owners.fill(-2);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;
  const neighbors = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];

  function enqueue(x, y, owner) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (borderMask[idx] || owners[idx] !== -2) return;
    owners[idx] = owner;
    queue[tail++] = idx;
  }

  const outsideSeeds = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  for (let i = 0; i < outsideSeeds.length; i++) enqueue(outsideSeeds[i][0], outsideSeeds[i][1], -1);
  for (let i = 0; i < AREA_DEFS.length; i++) {
    const area = AREA_DEFS[i];
    const scaledSeed = scaleSeed(area, width, height);
    const snapped = snapSeed(borderMask, width, height, scaledSeed[0], scaledSeed[1]);
    enqueue(snapped[0], snapped[1], i);
  }

  while (head < tail) {
    const idx = queue[head++];
    const owner = owners[idx];
    const x = idx % width;
    const y = (idx / width) | 0;
    for (let i = 0; i < neighbors.length; i++) {
      const nx = x + neighbors[i][0];
      const ny = y + neighbors[i][1];
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const next = ny * width + nx;
      if (borderMask[next] || owners[next] !== -2) continue;
      owners[next] = owner;
      queue[tail++] = next;
    }
  }

  return owners;
}

function fillOwnerGaps(owners, width, height, iterations) {
  const filled = new Int16Array(owners);
  const neighbors = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];

  for (let pass = 0; pass < iterations; pass++) {
    const next = new Int16Array(filled);
    for (let idx = 0; idx < filled.length; idx++) {
      if (filled[idx] !== -2) continue;
      const x = idx % width;
      const y = (idx / width) | 0;
      const counts = new Int16Array(AREA_DEFS.length);
      let outsideHits = 0;
      for (let i = 0; i < neighbors.length; i++) {
        const nx = x + neighbors[i][0];
        const ny = y + neighbors[i][1];
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const owner = filled[ny * width + nx];
        if (owner >= 0) counts[owner] += 1;
        else if (owner === -1) outsideHits += 1;
      }
      let bestOwner = -2;
      let bestHits = 0;
      for (let i = 0; i < counts.length; i++) {
        if (counts[i] > bestHits) {
          bestHits = counts[i];
          bestOwner = i;
        }
      }
      if (bestOwner >= 0) next[idx] = bestOwner;
      else if (outsideHits > 0) next[idx] = -1;
    }
    filled.set(next);
  }

  return filled;
}

function renderMask(owners, width, height) {
  const out = new PixelBuffer(width, height);
  for (let idx = 0; idx < owners.length; idx++) {
    const owner = owners[idx];
    if (owner < 0) continue;
    const color = hexToRgb(AREA_DEFS[owner].color);
    const x = idx % width;
    const y = (idx / width) | 0;
    out.setPixel(x, y, color[0], color[1], color[2], 255);
  }
  return out;
}

function renderBinary(mask, width, height, on, off) {
  const out = new PixelBuffer(width, height);
  for (let idx = 0; idx < mask.length; idx++) {
    const color = mask[idx] ? on : off;
    const x = idx % width;
    const y = (idx / width) | 0;
    out.setPixel(x, y, color[0], color[1], color[2], color[3]);
  }
  return out;
}

function fillTransparentPixels(pb, iterations) {
  for (let pass = 0; pass < iterations; pass++) {
    const next = new Uint8Array(pb.data);
    for (let y = 0; y < pb.h; y++) {
      for (let x = 0; x < pb.w; x++) {
        const idx = (y * pb.w + x) * 4;
        if (pb.data[idx + 3] !== 0) continue;
        const hits = Object.create(null);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= pb.w || ny < 0 || ny >= pb.h) continue;
            const nIdx = (ny * pb.w + nx) * 4;
            if (pb.data[nIdx + 3] === 0) continue;
            const key = `${pb.data[nIdx]},${pb.data[nIdx + 1]},${pb.data[nIdx + 2]},${pb.data[nIdx + 3]}`;
            hits[key] = (hits[key] || 0) + 1;
          }
        }
        let bestKey = null;
        let bestHits = 0;
        for (const key in hits) {
          if (hits[key] > bestHits) {
            bestKey = key;
            bestHits = hits[key];
          }
        }
        if (!bestKey || bestHits < 4) continue;
        const parts = bestKey.split(',').map(Number);
        next[idx] = parts[0];
        next[idx + 1] = parts[1];
        next[idx + 2] = parts[2];
        next[idx + 3] = parts[3];
      }
    }
    pb.data.set(next);
  }
}

const islandSource = decodePNG(fs.readFileSync(INPUT_ISLAND));
const areaSource = decodePNG(fs.readFileSync(INPUT_AREA));
const islandMap = resizeNearest(islandSource, TARGET_WIDTH, TARGET_HEIGHT);

fs.writeFileSync(OUTPUT_ISLAND, encodePNG(islandMap));

const boundaryDots = extractBoundaryDots(areaSource, islandSource);
const radius = 2;
const borderMask = dilate(boundaryDots, areaSource.width, areaSource.height, radius);
const owners = propagateAreas(borderMask, areaSource.width, areaSource.height);
const smoothedOwners = fillOwnerGaps(owners, areaSource.width, areaSource.height, 3);
const areaMaskSource = renderMask(smoothedOwners, areaSource.width, areaSource.height);
const areaMask = resizeNearest(areaMaskSource, TARGET_WIDTH, TARGET_HEIGHT);
fillTransparentPixels(areaMask, 2);

fs.writeFileSync(OUTPUT_MASK, encodePNG(areaMask));
fs.writeFileSync(DEBUG_DOTS, encodePNG(resizeNearest(renderBinary(boundaryDots, areaSource.width, areaSource.height, [255, 255, 255, 255], [0, 0, 0, 255]), TARGET_WIDTH, TARGET_HEIGHT)));
fs.writeFileSync(DEBUG_BORDER, encodePNG(resizeNearest(renderBinary(borderMask, areaSource.width, areaSource.height, [255, 255, 255, 255], [0, 0, 0, 255]), TARGET_WIDTH, TARGET_HEIGHT)));

const summary = AREA_DEFS.map((area) => {
  let count = 0;
  const areaIndex = AREA_DEFS.indexOf(area);
  for (let idx = 0; idx < smoothedOwners.length; idx++) {
    if (smoothedOwners[idx] === areaIndex) count++;
  }
  return `${area.id}:${count}`;
}).join(', ');

console.log(`wrote ${OUTPUT_ISLAND}`);
console.log(`wrote ${OUTPUT_MASK}`);
console.log(`wrote ${DEBUG_DOTS}`);
console.log(`wrote ${DEBUG_BORDER}`);
console.log(`boundary dilation radius=${radius}`);
console.log(summary);
