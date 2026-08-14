// Pure-Node PNG background remover: edge flood-fill of near-white → transparent.
// Usage: node rmbg.mjs <in.png> <out.png> [threshold=238] [tol=14]
import fs from 'node:fs'
import zlib from 'node:zlib'

// Usage: node rmbg.mjs <in> <out> [mode=white|black] [threshold] [tol]
const [,, inPath, outPath, modeArg, thrArg, tolArg] = process.argv
const MODE = modeArg === 'black' ? 'black' : 'white'
const THR = Number(thrArg ?? (MODE === 'black' ? 20 : 238)) // white: min>=THR ; black: max<=THR
const TOL = Number(tolArg ?? (MODE === 'black' ? 20 : 14))  // low saturation (max-min spread)

const buf = fs.readFileSync(inPath)
if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG')

// --- parse chunks ---
let off = 8, ihdr = null
const idat = []
while (off < buf.length) {
  const len = buf.readUInt32BE(off)
  const type = buf.toString('ascii', off + 4, off + 8)
  const data = buf.subarray(off + 8, off + 8 + len)
  if (type === 'IHDR') ihdr = data
  else if (type === 'IDAT') idat.push(data)
  off += 12 + len
}
const width = ihdr.readUInt32BE(0), height = ihdr.readUInt32BE(4)
const bitDepth = ihdr[8], colorType = ihdr[9], interlace = ihdr[12]
if (bitDepth !== 8 || interlace !== 0 || (colorType !== 2 && colorType !== 6))
  throw new Error(`unsupported PNG: depth=${bitDepth} color=${colorType} interlace=${interlace}`)

const srcBpp = colorType === 6 ? 4 : 3
const raw = zlib.inflateSync(Buffer.concat(idat))
const stride = width * srcBpp

// --- unfilter into RGBA ---
const rgba = Buffer.alloc(width * height * 4)
const prev = Buffer.alloc(stride)
const cur = Buffer.alloc(stride)
const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}
let p = 0
for (let y = 0; y < height; y++) {
  const filter = raw[p++]
  for (let x = 0; x < stride; x++) {
    const rawByte = raw[p++]
    const a = x >= srcBpp ? cur[x - srcBpp] : 0
    const b = prev[x]
    const c = x >= srcBpp ? prev[x - srcBpp] : 0
    let v
    switch (filter) {
      case 0: v = rawByte; break
      case 1: v = rawByte + a; break
      case 2: v = rawByte + b; break
      case 3: v = rawByte + ((a + b) >> 1); break
      case 4: v = rawByte + paeth(a, b, c); break
      default: throw new Error('bad filter ' + filter)
    }
    cur[x] = v & 0xff
  }
  for (let x = 0; x < width; x++) {
    const s = x * srcBpp, d = (y * width + x) * 4
    rgba[d] = cur[s]; rgba[d + 1] = cur[s + 1]; rgba[d + 2] = cur[s + 2]
    rgba[d + 3] = srcBpp === 4 ? cur[s + 3] : 255
  }
  cur.copy(prev)
}

// --- edge flood-fill: clear background connected to the border ---
const isWhiteish = (i) => {
  const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2]
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b)
  return MODE === 'black' ? (mx <= THR && (mx - mn) <= TOL) : (mn >= THR && (mx - mn) <= TOL)
}
const METHOD = process.argv[7] === 'global' ? 'global' : 'edge'
let cleared = 0
if (METHOD === 'global') {
  // clear every bg-colored pixel (handles background pockets the doodle rings wall off).
  // Relies on a tight threshold so the subject's dark/light details aren't the bg color.
  for (let pi = 0; pi < width * height; pi++) {
    if (isWhiteish(pi * 4)) { rgba[pi * 4 + 3] = 0; cleared++ }
  }
} else {
  const seen = new Uint8Array(width * height)
  const stack = []
  const pushIf = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const pi = y * width + x
    if (seen[pi]) return
    if (!isWhiteish(pi * 4)) return
    seen[pi] = 1; stack.push(pi)
  }
  for (let x = 0; x < width; x++) { pushIf(x, 0); pushIf(x, height - 1) }
  for (let y = 0; y < height; y++) { pushIf(0, y); pushIf(width - 1, y) }
  while (stack.length) {
    const pi = stack.pop()
    rgba[pi * 4 + 3] = 0; cleared++
    const x = pi % width, y = (pi / width) | 0
    pushIf(x + 1, y); pushIf(x - 1, y); pushIf(x, y + 1); pushIf(x, y - 1)
  }
}
// refill small enclosed transparent islands — holes the threshold punched in dark hair /
// bright glasses that aren't the real background (which is large and/or touches the border).
{
  const HOLE_MAX = Math.round(width * height * 0.004)
  const visited = new Uint8Array(width * height)
  for (let start = 0; start < width * height; start++) {
    if (visited[start] || rgba[start * 4 + 3] !== 0) continue
    const comp = []
    const st = [start]; visited[start] = 1
    let touchesBorder = false
    while (st.length) {
      const pi = st.pop(); comp.push(pi)
      const x = pi % width, y = (pi / width) | 0
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) touchesBorder = true
      const nb = [pi - 1, pi + 1, pi - width, pi + width]
      const nx = [x - 1, x + 1, x, x]
      for (let k = 0; k < 4; k++) {
        const ni = nb[k]
        if (ni < 0 || ni >= width * height) continue
        if (k < 2 && nx[k] !== ((ni % width))) continue // guard horizontal wrap
        if (visited[ni] || rgba[ni * 4 + 3] !== 0) continue
        visited[ni] = 1; st.push(ni)
      }
    }
    if (!touchesBorder && comp.length <= HOLE_MAX) {
      for (const pi of comp) rgba[pi * 4 + 3] = 255 // restore original color (RGB was kept)
      cleared -= comp.length
    }
  }
}

// soft edge: pixels adjacent to transparency that are still light get partial alpha
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const pi = y * width + x, d = pi * 4
  if (rgba[d + 3] === 0) continue
  const bgish = MODE === 'black'
    ? Math.max(rgba[d], rgba[d + 1], rgba[d + 2]) <= THR + 6
    : Math.min(rgba[d], rgba[d + 1], rgba[d + 2]) >= THR - 6
  if (!bgish) continue
  let nearHole = false
  if (x > 0 && rgba[(pi - 1) * 4 + 3] === 0) nearHole = true
  if (x < width - 1 && rgba[(pi + 1) * 4 + 3] === 0) nearHole = true
  if (y > 0 && rgba[(pi - width) * 4 + 3] === 0) nearHole = true
  if (y < height - 1 && rgba[(pi + width) * 4 + 3] === 0) nearHole = true
  if (nearHole) rgba[d + 3] = 128
}

// optional erase. 'auto' = find the small isolated opaque island in the bottom-right
// (a corner watermark) and wipe only its tight bbox; else a normalized x0,y0,x1,y1 rect.
const eraseArg = process.argv[8]
if (eraseArg === 'auto') {
  const vis = new Uint8Array(width * height)
  let best = null
  for (let start = 0; start < width * height; start++) {
    if (vis[start] || rgba[start * 4 + 3] === 0) continue
    const st = [start]; vis[start] = 1
    let size = 0, minx = 1e9, miny = 1e9, maxx = -1, maxy = -1
    while (st.length) {
      const q = st.pop(); size++
      const x = q % width, y = (q / width) | 0
      if (x < minx) minx = x; if (x > maxx) maxx = x
      if (y < miny) miny = y; if (y > maxy) maxy = y
      const nb = [q - 1, q + 1, q - width, q + width]
      for (let k = 0; k < 4; k++) {
        const ni = nb[k]
        if (ni < 0 || ni >= width * height) continue
        if (k === 0 && q % width === 0) continue
        if (k === 1 && q % width === width - 1) continue
        if (vis[ni] || rgba[ni * 4 + 3] === 0) continue
        vis[ni] = 1; st.push(ni)
      }
    }
    const cx = (minx + maxx) / 2 / width, cy = (miny + maxy) / 2 / height
    if (size >= 20 && size <= 4000 && cx > 0.6 && cy > 0.6) {
      if (!best || size < best.size) best = { size, minx, miny, maxx, maxy }
    }
  }
  if (best) {
    const pad = 4
    for (let y = Math.max(0, best.miny - pad); y <= Math.min(height - 1, best.maxy + pad); y++)
      for (let x = Math.max(0, best.minx - pad); x <= Math.min(width - 1, best.maxx + pad); x++)
        rgba[(y * width + x) * 4 + 3] = 0
    console.log(`auto-erased watermark ${best.minx},${best.miny}..${best.maxx},${best.maxy} (size ${best.size})`)
  } else console.log('no isolated watermark island found in bottom-right')
} else if (eraseArg) {
  const [x0, y0, x1, y1] = eraseArg.split(',').map(Number)
  const X0 = Math.max(0, Math.floor(x0 * width)), X1 = Math.min(width, Math.ceil(x1 * width))
  const Y0 = Math.max(0, Math.floor(y0 * height)), Y1 = Math.min(height, Math.ceil(y1 * height))
  for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) rgba[(y * width + x) * 4 + 3] = 0
  console.log(`erased rect ${X0},${Y0}..${X1},${Y1}`)
}

// --- re-encode as RGBA, filter 0 ---
const outStride = width * 4
const filtered = Buffer.alloc((outStride + 1) * height)
for (let y = 0; y < height; y++) {
  filtered[y * (outStride + 1)] = 0
  rgba.copy(filtered, y * (outStride + 1) + 1, y * outStride, (y + 1) * outStride)
}
const compressed = zlib.deflateSync(filtered, { level: 9 })

// CRC32
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 }
  return t
})()
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const newIhdr = Buffer.alloc(13)
newIhdr.writeUInt32BE(width, 0); newIhdr.writeUInt32BE(height, 4)
newIhdr[8] = 8; newIhdr[9] = 6; newIhdr[10] = 0; newIhdr[11] = 0; newIhdr[12] = 0
const out = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', newIhdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0)),
])
fs.writeFileSync(outPath, out)
console.log(`${width}x${height} color=${colorType} → cleared ${cleared} bg px (${(cleared / (width * height) * 100).toFixed(1)}%) → ${outPath}`)
