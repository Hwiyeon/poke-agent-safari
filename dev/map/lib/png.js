'use strict';

const zlib = require('zlib');

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
    x = x | 0;
    y = y | 0;
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const idx = this._idx(x, y);
    this.data[idx] = r;
    this.data[idx + 1] = g;
    this.data[idx + 2] = b;
    this.data[idx + 3] = a === undefined ? 255 : a;
  }

  blendPixel(x, y, r, g, b, a) {
    x = x | 0;
    y = y | 0;
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    const idx = this._idx(x, y);
    const alpha = (a === undefined ? 255 : a) / 255;
    const inv = 1 - alpha;
    this.data[idx] = (this.data[idx] * inv + r * alpha) | 0;
    this.data[idx + 1] = (this.data[idx + 1] * inv + g * alpha) | 0;
    this.data[idx + 2] = (this.data[idx + 2] * inv + b * alpha) | 0;
    this.data[idx + 3] = 255;
  }

  px(x, y, r, g, b, a) {
    if (a === undefined || a >= 255) this.setPixel(x, y, r, g, b, a);
    else this.blendPixel(x, y, r, g, b, a);
  }

  fillRect(x, y, w, h, r, g, b, a) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) this.px(px, py, r, g, b, a);
    }
  }

  fillCircle(cx, cy, radius, r, g, b, a) {
    const r2 = radius * radius;
    for (let py = (cy - radius) | 0; py <= ((cy + radius) | 0); py++) {
      for (let px = (cx - radius) | 0; px <= ((cx + radius) | 0); px++) {
        const dx = px - cx;
        const dy = py - cy;
        if (dx * dx + dy * dy <= r2) this.px(px, py, r, g, b, a);
      }
    }
  }

  line(x0, y0, x1, y1, r, g, b, a) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      this.px(x0, y0, r, g, b, a);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    crc = crcTable[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function encodePNG(pb) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(pb.w, 0);
  ihdr.writeUInt32BE(pb.h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([lenBuf, body, crcBuf]);
  }

  const rowBytes = 1 + pb.w * 4;
  const raw = Buffer.alloc(pb.h * rowBytes);
  for (let y = 0; y < pb.h; y++) {
    raw[y * rowBytes] = 0;
    for (let x = 0; x < pb.w * 4; x++) {
      raw[y * rowBytes + 1 + x] = pb.data[y * pb.w * 4 + x];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePNG(buffer) {
  if (buffer.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('Invalid PNG signature');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.slice(offset + 4, offset + 8).toString('ascii');
    const data = buffer.slice(offset + 8, offset + 8 + length);
    offset += 12 + length;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  if (bitDepth !== 8 || interlace !== 0) {
    throw new Error('Only non-interlaced 8-bit PNGs are supported');
  }

  const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : 0;
  if (!channels) throw new Error(`Unsupported PNG color type: ${colorType}`);

  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const data = new Uint8Array(width * height * channels);
  let inOffset = 0;
  let outOffset = 0;

  for (let y = 0; y < height; y++) {
    const filter = inflated[inOffset++];
    for (let x = 0; x < stride; x++) {
      const raw = inflated[inOffset++];
      const left = x >= channels ? data[outOffset + x - channels] : 0;
      const up = y > 0 ? data[outOffset + x - stride] : 0;
      const upLeft = (y > 0 && x >= channels) ? data[outOffset + x - stride - channels] : 0;
      let value = raw;
      if (filter === 1) value = (raw + left) & 0xFF;
      else if (filter === 2) value = (raw + up) & 0xFF;
      else if (filter === 3) value = (raw + Math.floor((left + up) / 2)) & 0xFF;
      else if (filter === 4) value = (raw + paethPredictor(left, up, upLeft)) & 0xFF;
      data[outOffset + x] = value;
    }
    outOffset += stride;
  }

  return { width, height, channels, data };
}

function resizeNearest(image, targetWidth, targetHeight) {
  const out = new PixelBuffer(targetWidth, targetHeight);
  const srcW = image.width || image.w;
  const srcH = image.height || image.h;
  const channels = image.channels || 4;

  for (let y = 0; y < targetHeight; y++) {
    const srcY = Math.min(srcH - 1, Math.floor(y * srcH / targetHeight));
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.min(srcW - 1, Math.floor(x * srcW / targetWidth));
      const idx = (srcY * srcW + srcX) * channels;
      out.setPixel(
        x,
        y,
        image.data[idx],
        image.data[idx + 1],
        image.data[idx + 2],
        channels === 4 ? image.data[idx + 3] : 255
      );
    }
  }
  return out;
}

function copyInto(target, source, destX, destY) {
  for (let y = 0; y < source.h; y++) {
    for (let x = 0; x < source.w; x++) {
      const idx = (y * source.w + x) * 4;
      target.setPixel(
        destX + x,
        destY + y,
        source.data[idx],
        source.data[idx + 1],
        source.data[idx + 2],
        source.data[idx + 3]
      );
    }
  }
}

module.exports = {
  PixelBuffer,
  copyInto,
  decodePNG,
  encodePNG,
  resizeNearest,
};
