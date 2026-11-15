const fs = require('fs');
const zlib = require('zlib');

function decodePNG(file) {
  const buf = fs.readFileSync(file);
  let pos = 8;
  let w = 0, h = 0, depth = 0, ctype = 0, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; ctype = data[9];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = ctype === 6 ? 4 : ctype === 2 ? 3 : 1;
  const bpp = ch * (depth / 8);
  const stride = w * bpp;
  const out = Buffer.alloc(w * h * ch);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = Buffer.from(line);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let v = cur[x];
      if (f === 1) v = (v + a) & 255;
      else if (f === 2) v = (v + b) & 255;
      else if (f === 3) v = (v + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
      cur[x] = v;
    }
    cur.copy(out, y * w * ch);
    prev = cur;
  }
  return { w, h, ch, data: out };
}

const RAMP = ' .:-=+*#%@';

function ascii(file, cols = 72) {
  const img = decodePNG(file);
  const rows = Math.max(1, Math.round((cols * img.h) / img.w * 0.5));
  const cw = img.w / cols, rh = img.h / rows;
  let out = '';
  const stats = { min: 255, max: 0, sum: 0, n: 0, sat: 0 };
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      let R = 0, G = 0, B = 0, n = 0;
      for (let y = Math.floor(r * rh); y < Math.min(img.h, Math.floor((r + 1) * rh)); y += 2) {
        for (let x = Math.floor(c * cw); x < Math.min(img.w, Math.floor((c + 1) * cw)); x += 2) {
          const i = (y * img.w + x) * img.ch;
          R += img.data[i]; G += img.data[i + 1]; B += img.data[i + 2]; n++;
        }
      }
      if (!n) n = 1;
      R /= n; G /= n; B /= n;
      const lum = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      stats.min = Math.min(stats.min, lum); stats.max = Math.max(stats.max, lum);
      stats.sum += lum; stats.n++;
      stats.sat += (Math.max(R, G, B) - Math.min(R, G, B)) / 255;
      line += RAMP[Math.min(RAMP.length - 1, Math.floor((lum / 255) * RAMP.length))];
    }
    out += line + '\n';
  }
  return { art: out, stats: { min: +stats.min.toFixed(1), max: +stats.max.toFixed(1), mean: +(stats.sum / stats.n).toFixed(1), sat: +(stats.sat / stats.n).toFixed(3) } };
}

function regions(file) {
  const img = decodePNG(file);
  const box = (x0, y0, x1, y1) => {
    let R = 0, G = 0, B = 0, n = 0, l2 = 0;
    for (let y = Math.floor(y0 * img.h); y < Math.floor(y1 * img.h); y += 2) {
      for (let x = Math.floor(x0 * img.w); x < Math.floor(x1 * img.w); x += 2) {
        const i = (y * img.w + x) * img.ch;
        const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
        R += r; G += g; B += b; n++;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        l2 += lum * lum;
      }
    }
    R /= n; G /= n; B /= n;
    const mean = (0.2126 * R + 0.7152 * G + 0.0722 * B);
    const sd = Math.sqrt(Math.max(0, l2 / n - mean * mean));
    return { rgb: [R | 0, G | 0, B | 0], lum: +mean.toFixed(0), sd: +sd.toFixed(0) };
  };
  return {
    skyTL: box(0.02, 0.02, 0.18, 0.16),
    skyHorizon: box(0.3, 0.30, 0.7, 0.38),
    center: box(0.38, 0.42, 0.62, 0.58),
    ground: box(0.3, 0.82, 0.7, 0.96),
    edgeR: box(0.84, 0.42, 0.98, 0.58),
  };
}

function colorGrid(file, cols = 10, rows = 8) {
  const img = decodePNG(file);
  const out = [];
  for (let ry = 0; ry < rows; ry++) {
    const row = [];
    for (let rx = 0; rx < cols; rx++) {
      let R = 0, G = 0, B = 0, n = 0;
      const x0 = Math.floor((rx / cols) * img.w), x1 = Math.floor(((rx + 1) / cols) * img.w);
      const y0 = Math.floor((ry / rows) * img.h), y1 = Math.floor(((ry + 1) / rows) * img.h);
      for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) {
        const i = (y * img.w + x) * img.ch;
        R += img.data[i]; G += img.data[i + 1]; B += img.data[i + 2]; n++;
      }
      R /= n; G /= n; B /= n;
      const hex = (v) => Math.round(v).toString(16).padStart(2, '0');
      row.push(hex(R) + hex(G) + hex(B));
    }
    out.push(row.join(' '));
  }
  return out.join('\n');
}

module.exports = { decodePNG, ascii, regions, colorGrid };

if (require.main === module) {
  for (const f of process.argv.slice(2)) {
    const r = ascii(f, 76);
    console.log('=== ' + f + ' ' + JSON.stringify(r.stats));
    console.log(r.art);
  }
}
