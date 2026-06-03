#!/usr/bin/env node
'use strict';

/**
 * Pure Node.js Pokemon-style island map generator.
 * No external dependencies — uses built-in zlib for PNG compression.
 *
 * Usage:  node dev/map/generate_map.js
 * Output: dev/data/generated/island_map.png (480x320 pixel art)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const WIDTH = 480;
const HEIGHT = 320;

// ════════════════════════════════════════════════════════════
//  Pixel Buffer — minimal 2D drawing on a flat RGBA array
// ════════════════════════════════════════════════════════════

class PixelBuffer {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
  }

  _idx(x, y) {
    return (y * this.w + x) * 4;
  }

  setPixel(x, y, r, g, b, a) {
    x = x | 0; y = y | 0;
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    var i = this._idx(x, y);
    this.data[i] = r; this.data[i + 1] = g;
    this.data[i + 2] = b; this.data[i + 3] = a;
  }

  blendPixel(x, y, r, g, b, a) {
    x = x | 0; y = y | 0;
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    var i = this._idx(x, y);
    var alpha = a / 255;
    var inv = 1 - alpha;
    this.data[i]     = (this.data[i] * inv + r * alpha) | 0;
    this.data[i + 1] = (this.data[i + 1] * inv + g * alpha) | 0;
    this.data[i + 2] = (this.data[i + 2] * inv + b * alpha) | 0;
    this.data[i + 3] = Math.min(255, this.data[i + 3] + a);
  }

  px(x, y, r, g, b, a) {
    if (a === undefined) a = 255;
    if (a < 255) this.blendPixel(x, y, r, g, b, a);
    else this.setPixel(x, y, r, g, b, a);
  }

  fillRect(x, y, w, h, r, g, b, a) {
    if (a === undefined) a = 255;
    for (var py = y; py < y + h; py++)
      for (var px = x; px < x + w; px++)
        this.px(px, py, r, g, b, a);
  }

  fillCircle(cx, cy, radius, r, g, b, a) {
    if (a === undefined) a = 255;
    var r2 = radius * radius;
    for (var py = (cy - radius) | 0; py <= ((cy + radius) | 0); py++)
      for (var px = (cx - radius) | 0; px <= ((cx + radius) | 0); px++) {
        var dx = px - cx, dy = py - cy;
        if (dx * dx + dy * dy <= r2) this.px(px, py, r, g, b, a);
      }
  }

  fillEllipse(cx, cy, rx, ry, r, g, b, a) {
    if (a === undefined) a = 255;
    for (var py = (cy - ry) | 0; py <= ((cy + ry) | 0); py++)
      for (var px = (cx - rx) | 0; px <= ((cx + rx) | 0); px++) {
        var dx = (px - cx) / rx, dy = (py - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.px(px, py, r, g, b, a);
      }
  }

  fillPolygon(points, r, g, b, a) {
    if (a === undefined) a = 255;
    if (points.length < 3) return;
    var minY = Infinity, maxY = -Infinity;
    for (var k = 0; k < points.length; k++) {
      if (points[k][1] < minY) minY = points[k][1];
      if (points[k][1] > maxY) maxY = points[k][1];
    }
    minY = Math.max(0, minY | 0);
    maxY = Math.min(this.h - 1, Math.ceil(maxY));
    for (var y = minY; y <= maxY; y++) {
      var xs = [];
      for (var i = 0; i < points.length; i++) {
        var j = (i + 1) % points.length;
        var y0 = points[i][1], y1 = points[j][1];
        var x0 = points[i][0], x1 = points[j][0];
        if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
          xs.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0));
        }
      }
      xs.sort(function (a, b) { return a - b; });
      for (var i = 0; i < xs.length - 1; i += 2) {
        var xS = Math.max(0, Math.ceil(xs[i]));
        var xE = Math.min(this.w - 1, xs[i + 1] | 0);
        for (var x = xS; x <= xE; x++) this.px(x, y, r, g, b, a);
      }
    }
  }

  fillTriangle(x0, y0, x1, y1, x2, y2, r, g, b, a) {
    this.fillPolygon([[x0, y0], [x1, y1], [x2, y2]], r, g, b, a);
  }

  // Horizontal line
  hline(x0, x1, y, r, g, b, a) {
    if (a === undefined) a = 255;
    if (x0 > x1) { var t = x0; x0 = x1; x1 = t; }
    for (var x = x0; x <= x1; x++) this.px(x, y, r, g, b, a);
  }
}

// ════════════════════════════════════════════════════════════
//  Seeded PRNG
// ════════════════════════════════════════════════════════════

function rng(seed) {
  var s = seed | 0;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 16) / 32768;
  };
}

// ════════════════════════════════════════════════════════════
//  Minimal PNG encoder (zlib built-in, CRC32 inline)
// ════════════════════════════════════════════════════════════

var crcTable = new Uint32Array(256);
for (var n = 0; n < 256; n++) {
  var c = n;
  for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}
function crc32(buf) {
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function encodePNG(pb) {
  var w = pb.w, h = pb.h, data = pb.data;
  var sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

  function chunk(type, d) {
    var tb = Buffer.from(type, 'ascii');
    var len = Buffer.alloc(4); len.writeUInt32BE(d.length, 0);
    var body = Buffer.concat([tb, d]);
    var cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, cb]);
  }

  // Raw scanlines: filter=0 (None) per row
  var rowBytes = 1 + w * 4;
  var raw = Buffer.alloc(h * rowBytes);
  for (var y = 0; y < h; y++) {
    raw[y * rowBytes] = 0;
    data.copy ? Buffer.from(data.buffer, data.byteOffset + y * w * 4, w * 4).copy(raw, y * rowBytes + 1)
      : (function () { for (var x = 0; x < w * 4; x++) raw[y * rowBytes + 1 + x] = data[y * w * 4 + x]; })();
  }

  var compressed = zlib.deflateSync(Buffer.from(raw), { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

// ════════════════════════════════════════════════════════════
//  Hex color helper
// ════════════════════════════════════════════════════════════

function hex(str) {
  var v = parseInt(str.replace('#', ''), 16);
  return [(v >> 16) & 0xFF, (v >> 8) & 0xFF, v & 0xFF];
}

// ════════════════════════════════════════════════════════════
//  Island coastline polygon (organic, matching reference)
// ════════════════════════════════════════════════════════════

var COAST = [
  // Bottom-left, going clockwise
  [48, 268], [35, 258], [20, 240], [12, 218], [7, 195],
  [4, 170], [5, 145], [8, 118], [12, 95], [15, 72],
  [20, 50], [30, 30], [45, 16], [65, 6], [95, 2],
  [130, 4], [165, 7], [195, 10], [225, 8], [255, 5],
  [285, 3], [315, 4], [345, 6], [370, 10], [392, 18],
  [412, 30], [430, 45], [445, 62], [456, 82],
  [463, 105], [467, 130], [468, 158], [465, 185],
  [460, 208], [452, 228], [440, 245], [425, 258],
  [408, 268], [380, 272], [345, 273], [310, 272],
  [275, 271], [240, 270], [200, 269], [160, 268],
  [120, 267], [85, 267]
];

// ════════════════════════════════════════════════════════════
//  Helper: expand/contract polygon from centroid
// ════════════════════════════════════════════════════════════

function expandPoly(points, amount) {
  var cx = 0, cy = 0;
  for (var i = 0; i < points.length; i++) { cx += points[i][0]; cy += points[i][1]; }
  cx /= points.length; cy /= points.length;
  return points.map(function (p) {
    var dx = p[0] - cx, dy = p[1] - cy;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    return [cx + dx * (1 + amount / len), cy + dy * (1 + amount / len)];
  });
}

// Helper: draw thick polyline border
function drawPolyBorder(buf, points, r, g, b, a, thickness) {
  for (var i = 0; i < points.length; i++) {
    var j = (i + 1) % points.length;
    var x0 = points[i][0], y0 = points[i][1];
    var x1 = points[j][0], y1 = points[j][1];
    var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    var steps = Math.max(dx, dy) | 0;
    for (var s = 0; s <= steps; s++) {
      var t = steps === 0 ? 0 : s / steps;
      var x = (x0 + (x1 - x0) * t) | 0;
      var y = (y0 + (y1 - y0) * t) | 0;
      for (var ty = -thickness; ty <= thickness; ty++)
        for (var tx = -thickness; tx <= thickness; tx++)
          if (tx * tx + ty * ty <= thickness * thickness + 1)
            buf.px(x + tx, y + ty, r, g, b, a);
    }
  }
}

// ════════════════════════════════════════════════════════════
//  Draw the map
// ════════════════════════════════════════════════════════════

function drawMap() {
  var buf = new PixelBuffer(WIDTH, HEIGHT);
  var rand;

  // ── 1. Deep ocean ──
  buf.fillRect(0, 0, WIDTH, HEIGHT, 0x18, 0x58, 0xA0, 255);

  // Ocean wave rows
  rand = rng(10);
  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x += 3) {
      var phase = ((x + y * 7) & 15);
      if (phase < 3) buf.px(x, y, 0x20, 0x68, 0xB0, 90);
      else if (phase < 5) buf.px(x, y, 0x14, 0x50, 0x95, 70);
    }
  }
  // Foam specks
  for (var i = 0; i < 300; i++) {
    buf.px((rand() * WIDTH) | 0, (rand() * HEIGHT) | 0, 0x50, 0x90, 0xD0, 100);
  }

  // ── 2. Shallow water shelf ──
  buf.fillPolygon(expandPoly(COAST, 15), 0x20, 0x70, 0xB8, 255);
  rand = rng(12);
  for (var y = 0; y < HEIGHT; y += 2)
    for (var x = 0; x < WIDTH; x += 3)
      if (rand() > 0.6) buf.px(x, y, 0x28, 0x78, 0xC5, 50);

  // ── 3. Beach / sand ring ──
  buf.fillPolygon(expandPoly(COAST, 6), 0xD8, 0xC8, 0x88, 255);
  rand = rng(13);
  for (var y = 0; y < HEIGHT; y++)
    for (var x = 0; x < WIDTH; x += 2)
      if (rand() > 0.8) buf.px(x, y, 0xE8, 0xD8, 0x98, 35);

  // ── 4. Island base grass ──
  buf.fillPolygon(COAST, 0x78, 0xB8, 0x60, 255);
  rand = rng(100);
  for (var y = 0; y < HEIGHT; y += 2)
    for (var x = 0; x < WIDTH; x += 2) {
      var v = rand();
      if (v > 0.6) buf.px(x, y, 0x80, 0xC0, 0x68, 30);
      else if (v > 0.4) buf.px(x, y, 0x70, 0xB0, 0x58, 25);
    }

  // ── 5-12. Draw terrain areas (order matters for overlap) ──
  drawMountain(buf);
  drawHardTerrain(buf);
  drawGrassland(buf);
  drawRuin(buf);     // after grassland so it's not covered
  drawCave(buf);     // cave is prominent, draw on top
  drawUrban(buf);
  drawForest(buf);
  drawWatersEdge(buf);

  // ── 13. Cliff edges between areas ──
  drawCliffEdges(buf);

  // ── 14. Coast border ──
  drawPolyBorder(buf, COAST, 0x38, 0x28, 0x18, 180, 1);

  // ── 15. Small islands ──
  drawSmallIslands(buf);

  // ── 16. Clouds & sun ──
  drawClouds(buf);

  return buf;
}

// ────────────────────────────────────────────
//  Mountain (top-left) — dominant snow-capped peaks
// ────────────────────────────────────────────
function drawMountain(buf) {
  var rand = rng(200);

  // Extended rocky base (covers entire top-left quadrant)
  var mtPoly = [
    [5, 95], [8, 72], [12, 50], [20, 30], [35, 16],
    [55, 6], [85, 2], [120, 2], [155, 5], [185, 12],
    [200, 25], [210, 50], [210, 95]
  ];
  buf.fillPolygon(mtPoly, 0x68, 0x60, 0x58, 255);

  // Layered rock texture
  for (var y = 2; y < 98; y++) {
    for (var x = 5; x < 212; x += 2) {
      var v = rand();
      if (v > 0.7) buf.px(x, y, 0x5C, 0x55, 0x4E, 35);
      else if (v > 0.5) buf.px(x, y, 0x74, 0x6C, 0x64, 28);
      else if (v > 0.42) buf.px(x, y, 0x50, 0x48, 0x40, 22);
    }
  }

  // Darker base band
  buf.fillPolygon([
    [5, 95], [8, 78], [45, 70], [90, 76], [140, 68],
    [180, 74], [210, 70], [210, 95]
  ], 0x55, 0x4D, 0x45, 210);

  // ═══ Main peak (HUGE, center — dominates the view) ═══
  // Outer rock silhouette
  buf.fillPolygon([
    [100, -5], [40, 82], [160, 82]
  ], 0x65, 0x5D, 0x55, 255);
  // Left face (darker)
  buf.fillPolygon([
    [100, -5], [40, 82], [100, 82]
  ], 0x5D, 0x55, 0x4D, 200);
  // Right face (lighter)
  buf.fillPolygon([
    [100, -5], [100, 82], [160, 82]
  ], 0x72, 0x6A, 0x62, 180);
  // Mid-face detail
  buf.fillPolygon([
    [100, -5], [75, 50], [125, 50]
  ], 0x7A, 0x72, 0x6A, 160);

  // Snow cap (BIG, irregular)
  buf.fillPolygon([
    [100, -5], [70, 38], [65, 45], [72, 48], [82, 40],
    [92, 46], [100, 42], [108, 46], [118, 40],
    [125, 48], [132, 44], [135, 38]
  ], 0xE8, 0xE8, 0xF0, 255);
  // Bright white upper snow
  buf.fillPolygon([
    [100, -5], [78, 28], [85, 32], [95, 26], [100, 30],
    [105, 26], [115, 32], [122, 28]
  ], 0xF8, 0xF8, 0xFF, 255);
  // Pure white peak tip
  buf.fillTriangle(100, -5, 90, 18, 110, 18, 0xFF, 0xFF, 0xFF, 255);
  // Snow drip tongues
  buf.fillPolygon([[65, 45], [60, 55], [68, 52], [72, 48]], 0xE0, 0xE0, 0xE8, 255);
  buf.fillPolygon([[135, 38], [132, 50], [140, 46]], 0xE0, 0xE0, 0xE8, 255);

  // ═══ Left peak (medium) ═══
  buf.fillTriangle(40, 14, 15, 78, 68, 78, 0x5D, 0x55, 0x4D, 255);
  buf.fillTriangle(40, 14, 28, 55, 55, 55, 0x68, 0x60, 0x58, 255);
  // Snow
  buf.fillPolygon([
    [40, 14], [30, 40], [35, 44], [42, 38], [48, 42], [50, 38]
  ], 0xE8, 0xE8, 0xF0, 255);
  buf.fillTriangle(40, 14, 35, 30, 46, 30, 0xF8, 0xF8, 0xFF, 255);

  // ═══ Right peak (tall) ═══
  buf.fillTriangle(170, 8, 140, 82, 200, 82, 0x5D, 0x55, 0x4D, 255);
  buf.fillTriangle(170, 8, 152, 55, 188, 55, 0x68, 0x60, 0x58, 255);
  // Snow
  buf.fillPolygon([
    [170, 8], [158, 35], [163, 40], [172, 34], [178, 38], [182, 34]
  ], 0xE0, 0xE0, 0xE8, 255);
  buf.fillTriangle(170, 8, 162, 26, 178, 26, 0xF0, 0xF0, 0xF8, 255);

  // ═══ Small saddle peak (far left) ═══
  buf.fillTriangle(18, 35, 8, 72, 32, 72, 0x58, 0x50, 0x48, 255);
  buf.fillTriangle(18, 35, 14, 50, 24, 50, 0xD8, 0xD8, 0xE0, 255);

  // Ridge line connecting peaks
  buf.fillPolygon([
    [68, 78], [72, 60], [90, 65], [110, 58], [130, 62],
    [140, 65], [140, 82], [68, 82]
  ], 0x60, 0x58, 0x50, 200);

  // Rock ledge details
  for (var i = 0; i < 10; i++) {
    var lx = 20 + (rand() * 175) | 0;
    var ly = 50 + (rand() * 40) | 0;
    var lw = 8 + (rand() * 18) | 0;
    buf.hline(lx, lx + lw, ly, 0x4A, 0x42, 0x3A, 140);
    buf.hline(lx + 1, lx + lw - 1, ly + 1, 0x70, 0x68, 0x60, 90);
  }
}

// ────────────────────────────────────────────
//  Cave (center) — large cavern entrance
// ────────────────────────────────────────────
function drawCave(buf) {
  var rand = rng(300);

  // Rocky surround polygon
  var cvPoly = [
    [95, 90], [110, 82], [160, 78], [230, 78], [275, 82],
    [285, 90], [288, 130], [286, 170], [280, 175],
    [120, 175], [100, 170], [94, 140]
  ];
  buf.fillPolygon(cvPoly, 0x58, 0x48, 0x38, 255);

  // Rock texture layers
  for (var y = 78; y < 178; y++) {
    for (var x = 94; x < 290; x += 2) {
      var v = rand();
      if (v > 0.65) buf.px(x, y, 0x60, 0x50, 0x40, 30);
      else if (v > 0.5) buf.px(x, y, 0x50, 0x40, 0x30, 25);
      else if (v > 0.45) buf.px(x, y, 0x68, 0x58, 0x48, 20);
    }
  }

  // Upper rocky overhang (arch shape)
  buf.fillPolygon([
    [125, 115], [135, 95], [160, 88], [195, 85], [230, 88],
    [255, 95], [262, 115], [255, 118], [200, 110], [145, 114]
  ], 0x50, 0x40, 0x30, 255);
  // Lighter overhang edge
  buf.fillPolygon([
    [130, 110], [140, 95], [165, 88], [195, 86], [225, 88],
    [250, 95], [255, 108], [250, 106], [200, 100], [148, 105]
  ], 0x60, 0x50, 0x40, 200);

  // Cave mouth — dark elliptical opening
  buf.fillEllipse(195, 140, 52, 38, 0x18, 0x10, 0x10, 255);
  buf.fillEllipse(195, 143, 44, 32, 0x0C, 0x08, 0x08, 255);
  buf.fillEllipse(195, 146, 34, 24, 0x04, 0x02, 0x02, 255);

  // Stalactites from overhang
  var stalacs = [[145, 112], [160, 106], [175, 104], [195, 102],
                 [215, 103], [235, 106], [250, 112]];
  for (var si = 0; si < stalacs.length; si++) {
    var sx = stalacs[si][0], sy = stalacs[si][1];
    var sh = 6 + (rand() * 10) | 0;
    buf.fillTriangle(sx, sy + sh, sx - 2, sy, sx + 2, sy, 0x48, 0x38, 0x28, 255);
    buf.px(sx, sy + sh, 0x58, 0x48, 0x38, 200);
  }

  // Stalagmites at cave floor
  var stalags = [[160, 168], [172, 163], [185, 167], [205, 165],
                 [220, 168], [235, 164], [250, 170]];
  for (var si = 0; si < stalags.length; si++) {
    var sx = stalags[si][0], sy = stalags[si][1];
    buf.fillTriangle(sx, sy - 8, sx - 3, sy + 2, sx + 3, sy + 2, 0x40, 0x30, 0x20, 255);
  }

  // Crystal sparkles inside darkness
  var sparkles = [
    [178, 130, 0x60, 0xC0, 0xF0], [200, 125, 0x80, 0xD0, 0xFF],
    [188, 142, 0x50, 0xA0, 0xE0], [210, 135, 0x70, 0xC8, 0xF8],
    [172, 138, 0x90, 0xD8, 0xFF], [220, 128, 0x60, 0xB0, 0xE8]
  ];
  for (var sp = 0; sp < sparkles.length; sp++) {
    var s = sparkles[sp];
    buf.px(s[0], s[1], s[2], s[3], s[4], 220);
    buf.px(s[0] + 1, s[1], s[2], s[3], s[4], 140);
    buf.px(s[0], s[1] - 1, s[2], s[3], s[4], 120);
    buf.px(s[0] - 1, s[1], s[2], s[3], s[4], 100);
  }

  // Boulders flanking entrance
  var boulders = [[130, 158, 7], [260, 155, 6], [120, 140, 5],
                  [268, 140, 5], [140, 170, 5], [252, 168, 5]];
  for (var bi = 0; bi < boulders.length; bi++) {
    var bx = boulders[bi][0], by = boulders[bi][1], br = boulders[bi][2];
    buf.fillEllipse(bx, by, br, br * 0.7, 0x48, 0x38, 0x28, 255);
    buf.fillEllipse(bx - 1, by - 1, br - 1, br * 0.6, 0x58, 0x48, 0x38, 200);
  }
}

// ────────────────────────────────────────────
//  Ruin (top-right) — ancient crumbling fortress
// ────────────────────────────────────────────
function drawRuin(buf) {
  var rand = rng(400);

  // Stone floor base polygon (larger, darker for contrast)
  var ruPoly = [
    [265, 90], [272, 48], [282, 22], [300, 10], [340, 4],
    [378, 5], [398, 14], [412, 30], [418, 58], [418, 90]
  ];
  buf.fillPolygon(ruPoly, 0x58, 0x60, 0x68, 255);

  // Stone tile texture
  for (var y = 5; y < 92; y += 4) {
    for (var x = 270; x < 418; x += 4) {
      var v = rand();
      if (v > 0.4) {
        var shade = v > 0.7 ? 0x60 : 0x78;
        buf.fillRect(x, y, 3, 3, shade, shade + 8, shade + 0x10, 50);
        buf.hline(x, x + 3, y, 0x58, 0x60, 0x68, 35);
      }
    }
  }

  // ── Back wall (crumbling) ──
  buf.fillRect(285, 18, 115, 6, 0x60, 0x68, 0x70, 255);
  // Wall segments (broken)
  buf.fillRect(305, 15, 40, 10, 0x68, 0x70, 0x78, 255);
  buf.fillRect(360, 12, 30, 13, 0x68, 0x70, 0x78, 255);

  // ── Left tower (tall, partially intact) ──
  buf.fillRect(282, 8, 20, 70, 0x70, 0x78, 0x80, 255);
  buf.fillRect(284, 8, 16, 70, 0x78, 0x80, 0x88, 255);
  // Battlements
  for (var bx = 280; bx < 305; bx += 6) {
    buf.fillRect(bx, 4, 4, 8, 0x68, 0x70, 0x78, 255);
  }
  // Windows
  buf.fillRect(289, 22, 5, 7, 0x20, 0x18, 0x28, 255);
  buf.fillRect(289, 40, 5, 7, 0x20, 0x18, 0x28, 255);
  buf.fillRect(289, 55, 5, 5, 0x20, 0x18, 0x28, 255);

  // ── Right tower (taller, crumbled top) ──
  buf.fillRect(392, 5, 22, 75, 0x70, 0x78, 0x80, 255);
  buf.fillRect(394, 5, 18, 75, 0x78, 0x80, 0x88, 255);
  // Jagged/crumbled top
  buf.fillRect(390, 2, 5, 7, 0x68, 0x70, 0x78, 255);
  buf.fillRect(398, 0, 6, 9, 0x68, 0x70, 0x78, 255);
  buf.fillRect(407, 3, 5, 6, 0x68, 0x70, 0x78, 255);
  // Windows
  buf.fillRect(400, 18, 5, 7, 0x20, 0x18, 0x28, 255);
  buf.fillRect(400, 35, 5, 7, 0x20, 0x18, 0x28, 255);
  buf.fillRect(400, 52, 5, 5, 0x20, 0x18, 0x28, 255);

  // ── Center gate structure (large arch, crumbled) ──
  buf.fillRect(335, 10, 30, 60, 0x70, 0x78, 0x80, 255);
  buf.fillRect(337, 10, 26, 60, 0x78, 0x80, 0x88, 255);
  // Gate arch opening
  buf.fillEllipse(350, 52, 10, 15, 0x20, 0x18, 0x28, 255);
  // Crumbled top pieces
  buf.fillRect(333, 6, 7, 8, 0x68, 0x70, 0x78, 255);
  buf.fillRect(344, 4, 9, 10, 0x68, 0x70, 0x78, 255);
  buf.fillRect(358, 7, 7, 7, 0x68, 0x70, 0x78, 255);

  // ── Connecting wall segments ──
  buf.fillRect(302, 22, 33, 4, 0x68, 0x70, 0x78, 255);
  buf.fillRect(365, 20, 27, 4, 0x68, 0x70, 0x78, 255);

  // ── Rubble piles ──
  for (var ri = 0; ri < 16; ri++) {
    var rx = 278 + (rand() * 130) | 0;
    var ry = 62 + (rand() * 22) | 0;
    var rs = 2 + (rand() * 3) | 0;
    buf.fillEllipse(rx, ry, rs, rs * 0.6, 0x60, 0x68, 0x70, 180);
    buf.fillEllipse(rx - 1, ry - 1, rs - 1, rs * 0.5, 0x70, 0x78, 0x80, 140);
  }

  // ── Vines / moss ──
  for (var vi = 0; vi < 12; vi++) {
    var vx = 284 + (rand() * 125) | 0;
    var vy = 12 + (rand() * 60) | 0;
    for (var vk = 0; vk < 3; vk++) {
      buf.px(vx + ((rand() * 3) | 0) - 1, vy + vk, 0x48, 0x78, 0x38, 100);
    }
  }

  // ── Purple mysterious glow ──
  buf.fillEllipse(350, 60, 25, 12, 0x70, 0x40, 0xA0, 25);
  buf.fillEllipse(350, 60, 15, 8, 0x80, 0x50, 0xB0, 20);
}

// ────────────────────────────────────────────
//  Hard Terrain (left side)
// ────────────────────────────────────────────
function drawHardTerrain(buf) {
  var rand = rng(500);

  // Rough brown-tan base
  var htBase = [
    [8, 120], [14, 92], [100, 88], [115, 92],
    [118, 170], [105, 172], [20, 170], [10, 150]
  ];
  buf.fillPolygon(htBase, 0xA0, 0x88, 0x68, 255);

  // Cracked ground texture
  for (var y = 88; y < 175; y += 2) {
    for (var x = 8; x < 120; x += 3) {
      if (rand() > 0.4) buf.px(x, y, 0x90, 0x78, 0x58, 40);
      if (rand() > 0.7) buf.px(x + 1, y + 1, 0xB0, 0x98, 0x78, 35);
    }
  }

  // Crack lines
  for (var ci = 0; ci < 10; ci++) {
    var cx = 15 + (rand() * 95) | 0;
    var cy = 95 + (rand() * 65) | 0;
    var clen = 8 + (rand() * 15) | 0;
    var dir = rand() > 0.5;
    for (var k = 0; k < clen; k++) {
      if (dir) buf.px(cx + k, cy + ((rand() * 3) | 0) - 1, 0x78, 0x60, 0x40, 180);
      else buf.px(cx + ((rand() * 3) | 0) - 1, cy + k, 0x78, 0x60, 0x40, 180);
    }
  }

  // Boulders
  var boulders = [
    [30, 105, 7], [65, 120, 5], [90, 145, 6],
    [45, 155, 5], [20, 140, 4], [80, 100, 4],
    [55, 135, 6], [100, 160, 4]
  ];
  for (var bi = 0; bi < boulders.length; bi++) {
    var bx = boulders[bi][0], by = boulders[bi][1], br = boulders[bi][2];
    buf.fillEllipse(bx, by, br, br * 0.7, 0x70, 0x60, 0x48, 255);
    buf.fillEllipse(bx - 1, by - 1, br - 1, br * 0.6, 0x80, 0x70, 0x58, 200);
    // Highlight
    buf.px(bx - 2, by - 2, 0x98, 0x88, 0x70, 150);
  }

  // Dead grass tufts
  for (var gi = 0; gi < 10; gi++) {
    var gx = 15 + (rand() * 95) | 0;
    var gy = 92 + (rand() * 72) | 0;
    buf.px(gx, gy, 0xB8, 0xA8, 0x78, 200);
    buf.px(gx + 1, gy - 1, 0xC0, 0xB0, 0x80, 180);
    buf.px(gx - 1, gy - 1, 0xA8, 0x98, 0x68, 160);
  }
}

// ────────────────────────────────────────────
//  Grassland (right side) — meadows and fields
// ────────────────────────────────────────────
function drawGrassland(buf) {
  var rand = rng(600);

  // Bright green base (below the ruin area, right side of island)
  var glPoly = [
    [290, 92], [418, 92], [450, 92], [462, 100],
    [467, 130], [468, 158], [465, 180], [460, 195],
    [310, 195], [298, 178], [290, 145]
  ];
  buf.fillPolygon(glPoly, 0x70, 0xB8, 0x50, 255);

  // Grass texture (varied greens)
  for (var y = 92; y < 198; y++) {
    for (var x = 288; x < 470; x += 2) {
      var v = rand();
      if (v > 0.6) buf.px(x, y, 0x68, 0xB0, 0x48, 30);
      else if (v > 0.45) buf.px(x, y, 0x80, 0xC8, 0x60, 25);
      else if (v > 0.4) buf.px(x, y, 0x60, 0xA0, 0x40, 20);
    }
  }

  // Tall grass patches
  for (var ti = 0; ti < 35; ti++) {
    var tx = 305 + (rand() * 145) | 0;
    var ty = 95 + (rand() * 90) | 0;
    buf.px(tx, ty, 0x58, 0xA0, 0x38, 200);
    buf.px(tx + 1, ty - 1, 0x60, 0xA8, 0x40, 180);
    buf.px(tx - 1, ty - 1, 0x50, 0x98, 0x30, 160);
  }

  // Flower clusters
  var fColors = [[0xF0, 0x50, 0x50], [0xF0, 0xE0, 0x40], [0xF0, 0x80, 0xD0], [0xF0, 0xA0, 0x30], [0xFF, 0xFF, 0x80]];
  for (var fi = 0; fi < 24; fi++) {
    var fx = 310 + (rand() * 135) | 0;
    var fy = 95 + (rand() * 90) | 0;
    var fc = fColors[(rand() * fColors.length) | 0];
    buf.px(fx, fy, fc[0], fc[1], fc[2], 255);
    buf.px(fx + 1, fy, fc[0], fc[1], fc[2], 200);
    buf.px(fx, fy + 1, 0x40, 0x80, 0x30, 180);
  }

  // Fence sections
  var fences = [[320, 110, 55], [330, 140, 50], [345, 170, 40]];
  for (var fi = 0; fi < fences.length; fi++) {
    var fxS = fences[fi][0], fy = fences[fi][1], fLen = fences[fi][2];
    // Rails
    buf.hline(fxS, fxS + fLen, fy, 0x88, 0x68, 0x38, 230);
    buf.hline(fxS, fxS + fLen, fy + 2, 0x80, 0x60, 0x30, 210);
    // Posts
    for (var fp = fxS; fp <= fxS + fLen; fp += 10) {
      buf.fillRect(fp, fy - 2, 2, 6, 0x78, 0x58, 0x28, 240);
    }
  }

  // Dirt path (winding)
  for (var py = 95; py < 192; py++) {
    var px = 370 + Math.sin(py * 0.06) * 12;
    buf.fillRect(px | 0, py, 5, 1, 0xC0, 0xB0, 0x88, 140);
    buf.fillRect((px + 1) | 0, py, 3, 1, 0xC8, 0xB8, 0x90, 120);
  }
}

// ────────────────────────────────────────────
//  Urban (center-bottom) — colorful town
// ────────────────────────────────────────────
function drawUrban(buf) {
  var rand = rng(700);

  // Paved ground
  var ubPoly = [
    [112, 175], [295, 173], [302, 180], [306, 205],
    [300, 238], [115, 240], [108, 215], [108, 190]
  ];
  buf.fillPolygon(ubPoly, 0xC0, 0xB8, 0xA0, 255);

  // Pavement tile texture
  for (var y = 173; y < 242; y += 3) {
    for (var x = 108; x < 308; x += 3) {
      if (rand() > 0.5)
        buf.fillRect(x, y, 2, 2, rand() > 0.5 ? 0xB8 : 0xC8, 0xB0, 0xA0, 30);
    }
  }

  // Main road (horizontal)
  buf.fillRect(110, 205, 195, 5, 0x88, 0x80, 0x70, 255);
  for (var mx = 115; mx < 305; mx += 10)
    buf.fillRect(mx, 207, 5, 1, 0xC8, 0xC0, 0xA8, 200);

  // Cross road (vertical)
  buf.fillRect(207, 175, 5, 65, 0x88, 0x80, 0x70, 255);

  // Buildings
  var buildings = [
    [118, 180, 24, 22, 0xD0, 0x48, 0x38],
    [148, 182, 20, 20, 0x40, 0x70, 0xB0],
    [174, 178, 26, 24, 0xE0, 0x98, 0x28],
    [118, 213, 22, 22, 0x50, 0xA0, 0x50],
    [146, 215, 26, 20, 0xD0, 0x48, 0x38],
    [178, 211, 22, 24, 0x40, 0x70, 0xB0],
    [216, 180, 24, 22, 0xE0, 0xB8, 0x38],
    [246, 178, 28, 24, 0xD0, 0x48, 0x38],
    [280, 182, 20, 20, 0x50, 0xA0, 0x50],
    [216, 213, 26, 22, 0x88, 0x68, 0xA8],
    [248, 215, 22, 20, 0xE0, 0x98, 0x28],
    [276, 213, 24, 22, 0x40, 0x70, 0xB0],
  ];

  for (var bi = 0; bi < buildings.length; bi++) {
    var b = buildings[bi], bx = b[0], by = b[1], bw = b[2], bh = b[3];
    // Wall
    buf.fillRect(bx + 1, by + 4, bw - 2, bh - 4, 0xE8, 0xE0, 0xD0, 255);
    // Roof
    buf.fillRect(bx, by, bw, 5, b[4], b[5], b[6], 255);
    buf.fillRect(bx + 1, by + 1, bw - 2, 3, b[4] + 0x10, b[5] + 0x10, b[6] + 0x10, 100);
    // Shadow under roof
    buf.fillRect(bx + 1, by + 5, bw - 2, 1, 0xC8, 0xC0, 0xB0, 120);
    // Windows
    buf.fillRect(bx + 3, by + 9, 3, 3, 0x70, 0xC8, 0xF0, 255);
    buf.fillRect(bx + bw - 6, by + 9, 3, 3, 0x70, 0xC8, 0xF0, 255);
    // Door
    buf.fillRect(bx + (bw / 2 | 0) - 2, by + bh - 5, 4, 5, 0x58, 0x40, 0x28, 255);
  }
}

// ────────────────────────────────────────────
//  Forest (bottom-right) — dense canopy
// ────────────────────────────────────────────
function drawForest(buf) {
  var rand = rng(800);

  // Dark green base
  var frPoly = [
    [302, 195], [458, 195], [462, 215], [460, 240],
    [452, 255], [312, 255], [304, 238], [300, 215]
  ];
  buf.fillPolygon(frPoly, 0x28, 0x70, 0x20, 255);

  // Forest floor texture
  for (var y = 195; y < 258; y++) {
    for (var x = 300; x < 464; x += 2) {
      var v = rand();
      if (v > 0.6) buf.px(x, y, 0x20, 0x60, 0x18, 35);
      else if (v > 0.45) buf.px(x, y, 0x30, 0x80, 0x28, 25);
    }
  }

  // Trees sorted by depth (y)
  var trees = [];
  for (var ti = 0; ti < 35; ti++) {
    trees.push([
      308 + (rand() * 145) | 0,
      198 + (rand() * 48) | 0,
      5 + (rand() * 7) | 0
    ]);
  }
  trees.sort(function (a, b) { return a[1] - b[1]; });

  for (var ti = 0; ti < trees.length; ti++) {
    var tx = trees[ti][0], ty = trees[ti][1], tr = trees[ti][2];
    // Trunk
    buf.fillRect(tx - 1, ty + tr - 2, 2, 5, 0x48, 0x30, 0x18, 255);
    // Canopy layers
    buf.fillCircle(tx, ty, tr, 0x20, 0x60, 0x18, 255);
    buf.fillCircle(tx - 1, ty - 1, tr - 1, 0x30, 0x78, 0x28, 230);
    buf.fillCircle(tx - 2, ty - 2, (tr * 0.5) | 0, 0x40, 0x90, 0x30, 160);
  }

  // Narrow path through trees
  for (var py = 198; py < 252; py++) {
    var px = 385 + Math.sin(py * 0.1) * 6;
    buf.fillRect(px | 0, py, 4, 1, 0x60, 0x50, 0x30, 110);
  }
}

// ────────────────────────────────────────────
//  Water's Edge / Beach (bottom beach strip)
// ────────────────────────────────────────────
function drawWatersEdge(buf) {
  var rand = rng(900);

  // Sandy beach polygon (wider, organic)
  var bchPoly = [
    [40, 252], [52, 242], [100, 238], [180, 240],
    [260, 238], [350, 240], [420, 244], [435, 252],
    [438, 272], [425, 274], [340, 275], [250, 274],
    [160, 273], [80, 271], [48, 268]
  ];
  buf.fillPolygon(bchPoly, 0xE0, 0xD0, 0x90, 255);

  // Sand texture
  for (var y = 238; y < 278; y++) {
    for (var x = 38; x < 442; x += 2) {
      var v = rand();
      if (v > 0.55) buf.px(x, y, 0xD8, 0xC8, 0x88, 30);
      else if (v > 0.45) buf.px(x + 1, y, 0xF0, 0xE0, 0xA8, 22);
    }
  }

  // Wet sand near water line
  for (var x = 48; x < 435; x += 2) {
    var wy = 266 + Math.sin(x * 0.07) * 2;
    buf.fillRect(x, wy | 0, 2, 3, 0xB8, 0xB0, 0x78, 100);
  }

  // Wave foam line
  for (var x = 48; x < 435; x++) {
    var wy = 269 + Math.sin(x * 0.09) * 2;
    buf.px(x, wy | 0, 0x60, 0xB0, 0xD8, 210);
    buf.px(x, (wy + 1) | 0, 0x80, 0xC8, 0xE8, 160);
    if (rand() > 0.8) buf.px(x, (wy - 1) | 0, 0xA0, 0xD8, 0xF0, 100);
  }

  // Palm trees
  var palms = [[85, 248], [145, 245], [215, 247], [290, 245], [360, 247], [415, 250]];
  for (var pi = 0; pi < palms.length; pi++) {
    var px = palms[pi][0], py = palms[pi][1];
    // Trunk
    for (var k = 0; k < 14; k++) {
      var lean = k > 8 ? 1 : 0;
      buf.px(px + lean, py - k, 0x78, 0x58, 0x28, 255);
      buf.px(px + lean + 1, py - k, 0x88, 0x68, 0x38, 200);
    }
    // Fronds
    var top = py - 14;
    buf.fillCircle(px + 1, top, 4, 0x38, 0x88, 0x28, 210);
    buf.px(px - 4, top - 1, 0x30, 0x78, 0x20, 200);
    buf.px(px + 6, top - 1, 0x30, 0x78, 0x20, 200);
    buf.px(px - 3, top - 3, 0x40, 0x90, 0x30, 180);
    buf.px(px + 5, top - 3, 0x40, 0x90, 0x30, 180);
    buf.px(px + 1, top - 5, 0x48, 0x98, 0x38, 170);
  }

  // Shells / pebbles
  for (var si = 0; si < 18; si++) {
    var sx = 55 + (rand() * 370) | 0;
    var sy = 250 + (rand() * 15) | 0;
    buf.px(sx, sy, 0xC8, rand() > 0.5 ? 0xA8 : 0xC0, rand() > 0.5 ? 0x70 : 0xB0, 180);
  }
}

// ────────────────────────────────────────────
//  Cliff edges between terrain areas
// ────────────────────────────────────────────
function drawCliffEdges(buf) {
  var rand = rng(950);

  // Dark brown cliff line between Mountain and Cave
  for (var x = 15; x < 200; x++) {
    var y = 90 + Math.sin(x * 0.08) * 2;
    buf.fillRect(x, y | 0, 1, 3, 0x40, 0x30, 0x20, 180);
    buf.px(x, (y + 3) | 0, 0x50, 0x40, 0x30, 100);
  }

  // Cliff between Mountain/Hard Terrain and Cave (left vertical)
  for (var y = 88; y < 175; y++) {
    var x = 100 + Math.sin(y * 0.06) * 3;
    buf.fillRect(x | 0, y, 3, 1, 0x40, 0x30, 0x20, 160);
  }

  // Cliff between Cave and Grassland (right of cave)
  for (var y = 85; y < 180; y++) {
    var x = 288 + Math.sin(y * 0.05) * 2;
    buf.fillRect(x | 0, y, 3, 1, 0x40, 0x30, 0x20, 150);
  }

  // Cliff between Ruin and Grassland (between top sections)
  for (var y = 10; y < 90; y++) {
    var x = 278 + Math.sin(y * 0.1) * 2;
    buf.fillRect(x | 0, y, 2, 1, 0x48, 0x38, 0x28, 140);
  }

  // Bottom cliff (above urban/beach)
  for (var x = 108; x < 305; x++) {
    var y = 172 + Math.sin(x * 0.06) * 1.5;
    buf.fillRect(x, y | 0, 1, 2, 0x50, 0x40, 0x28, 140);
  }

  // Forest top edge
  for (var x = 302; x < 460; x++) {
    var y = 194 + Math.sin(x * 0.08) * 1;
    buf.px(x, y | 0, 0x38, 0x58, 0x28, 120);
  }
}

// ────────────────────────────────────────────
//  Small islands in ocean
// ────────────────────────────────────────────
function drawSmallIslands(buf) {
  // Top-right rocky island
  buf.fillEllipse(448, 12, 7, 5, 0xD0, 0xC0, 0x80, 255);
  buf.fillCircle(448, 10, 4, 0x68, 0x60, 0x50, 255);
  buf.fillCircle(447, 9, 2, 0x78, 0x70, 0x60, 200);
  // tiny tree
  buf.fillRect(449, 6, 1, 4, 0x60, 0x40, 0x20, 200);
  buf.fillCircle(449, 5, 2, 0x40, 0x80, 0x30, 200);

  // Bottom-left tiny island
  buf.fillEllipse(22, 290, 8, 4, 0xD8, 0xC8, 0x88, 255);
  buf.fillEllipse(22, 288, 5, 3, 0x70, 0xA8, 0x58, 255);

  // Right side tiny rocks
  buf.fillCircle(474, 155, 3, 0x58, 0x50, 0x40, 255);
  buf.fillCircle(476, 153, 2, 0x68, 0x60, 0x50, 200);

  // Top-left tiny rock
  buf.fillCircle(8, 25, 2, 0x60, 0x58, 0x48, 200);
}

// ────────────────────────────────────────────
//  Clouds & sun
// ────────────────────────────────────────────
function drawClouds(buf) {
  // Cloud groups
  var cloudGroups = [
    [[55, 14, 20, 9], [68, 11, 14, 7], [80, 13, 10, 6]],
    [[350, 10, 16, 8], [365, 8, 13, 7], [376, 10, 8, 5]],
    [[210, 5, 11, 5]]
  ];
  for (var gi = 0; gi < cloudGroups.length; gi++) {
    var grp = cloudGroups[gi];
    for (var ci = 0; ci < grp.length; ci++) {
      var c = grp[ci];
      buf.fillEllipse(c[0], c[1], c[2], c[3], 0xFF, 0xFF, 0xFF, 130);
      buf.fillEllipse(c[0], c[1], c[2] - 3, c[3] - 2, 0xFF, 0xFF, 0xFF, 90);
    }
  }

  // Sun
  buf.fillCircle(18, 10, 7, 0xFF, 0xF0, 0x58, 200);
  buf.fillCircle(18, 10, 5, 0xFF, 0xF8, 0x88, 180);
  buf.fillCircle(18, 10, 3, 0xFF, 0xFF, 0xB8, 220);
  // Sun rays (subtle)
  for (var r = 0; r < 8; r++) {
    var angle = r * Math.PI / 4;
    var rx = 18 + Math.cos(angle) * 10;
    var ry = 10 + Math.sin(angle) * 10;
    buf.px(rx | 0, ry | 0, 0xFF, 0xF8, 0x80, 100);
  }
}

// ════════════════════════════════════════════════════════════
//  Main: generate and save
// ════════════════════════════════════════════════════════════

console.log('Generating island map (' + WIDTH + 'x' + HEIGHT + ')...');
var mapBuffer = drawMap();
var pngData = encodePNG(mapBuffer);

var outDir = path.join(__dirname, '..', 'data', 'generated');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

var outPath = path.join(outDir, 'island_map.png');
fs.writeFileSync(outPath, pngData);
console.log('Saved: ' + outPath + ' (' + pngData.length + ' bytes)');
