/**
 * Palettes as numbers so they can be *blended* rather than swapped. Scrolling
 * mixes a project's colours into the base palette in proportion to how much of
 * the viewport that project owns — so a theme arrives and leaves as a gradient,
 * never as a cut.
 */

export type PaletteName = 'base' | 'baseDark' | 'eilms' | 'hq' | 'pran'

export type Palette = {
  ground: string
  paper: string
  paper2: string
  ink: string
  body: string
  sub: string
  faint: string
  accent: string
  accent2: string
  good: string
  /** how strongly this palette tints the bloom behind the content */
  bloom: number
}

export const PALETTES: Record<PaletteName, Palette> = {
  base: {
    ground: '#dcdde1', paper: '#f4f3f1', paper2: '#ecebe7',
    ink: '#16161a', body: '#3b3b43', sub: '#6a6a72', faint: '#9a9aa4',
    accent: '#6a5cff', accent2: '#4f46e5', good: '#1fb872', bloom: 0.1,
  },
  baseDark: {
    ground: '#101014', paper: '#17171d', paper2: '#1e1e26',
    ink: '#f4f3f1', body: '#c3c3cd', sub: '#9092a0', faint: '#63656f',
    accent: '#8b7dff', accent2: '#6a5cff', good: '#34d399', bloom: 0.16,
  },
  eilms: {
    ground: '#0e0d13', paper: '#17151f', paper2: '#201b2e',
    ink: '#f5f3fa', body: '#cbc6d9', sub: '#9a93ae', faint: '#6d6683',
    accent: '#8b5cf6', accent2: '#4f46e5', good: '#10b981', bloom: 0.3,
  },
  hq: {
    ground: '#0f1115', paper: '#1a1e25', paper2: '#242a33',
    ink: '#f2f0eb', body: '#aeb4bf', sub: '#989ea9', faint: '#71767f',
    accent: '#b77932', accent2: '#d08a3f', good: '#6bbf8a', bloom: 0.26,
  },
  pran: {
    ground: '#030712', paper: '#0a0f1e', paper2: '#0d1526',
    ink: '#f9fafb', body: '#c3ccd8', sub: '#8b95a5', faint: '#566173',
    accent: '#22d3ee', accent2: '#3b82f6', good: '#34d399', bloom: 0.28,
  },
}

export type RGB = [number, number, number]

const CACHE = new Map<string, RGB>()

export function hexToRgb(hex: string): RGB {
  const hit = CACHE.get(hex)
  if (hit) return hit
  const h = hex.replace('#', '')
  const rgb: RGB = [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
  CACHE.set(hex, rgb)
  return rgb
}

const mixChannel = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

export function mixHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return `rgb(${mixChannel(r1, r2, t)} ${mixChannel(g1, g2, t)} ${mixChannel(b1, b2, t)})`
}

export function rgbTriplet(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  return `${r} ${g} ${b}`
}

export const KEYS: (keyof Omit<Palette, 'bloom'>)[] = [
  'ground', 'paper', 'paper2', 'ink', 'body', 'sub', 'faint', 'accent', 'accent2', 'good',
]

/** Numeric form of a palette, so it can be eased channel-by-channel per frame. */
export type NumPalette = { c: Record<string, RGB>; bloom: number }

export function toNum(p: Palette): NumPalette {
  const c: Record<string, RGB> = {}
  for (const k of KEYS) c[k] = parseAny(p[k])
  return { c, bloom: p.bloom }
}

export function mixNum(a: NumPalette, b: NumPalette, t: number): NumPalette {
  const c: Record<string, RGB> = {}
  for (const k of KEYS) {
    const [r1, g1, b1] = a.c[k]
    const [r2, g2, b2] = b.c[k]
    c[k] = [r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]
  }
  return { c, bloom: a.bloom + (b.bloom - a.bloom) * t }
}

export const css = (v: RGB) => `rgb(${Math.round(v[0])} ${Math.round(v[1])} ${Math.round(v[2])})`
export const trip = (v: RGB) => `${Math.round(v[0])} ${Math.round(v[1])} ${Math.round(v[2])}`

/**
 * Wide plateau, narrow ramp. A project reads as fully themed for most of the
 * time it owns the screen; the blended in-between state — where contrast is
 * necessarily muddy — is crossed quickly.
 */
export function themeWeight(coverage: number) {
  const t = (coverage - 0.28) / 0.24 // ramps 28% → 52% coverage, full beyond
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c) // smoothstep
}

/** Weighted blend of several palettes. Weights need not sum to 1; the remainder falls to `basis`. */
export function blend(basis: Palette, parts: { palette: Palette; weight: number }[]): Palette {
  let out: Palette = { ...basis }
  let bloom = basis.bloom
  for (const { palette, weight } of parts) {
    if (weight <= 0) continue
    const t = Math.min(weight, 1)
    const next = { ...out }
    for (const k of KEYS) next[k] = mixRaw(out[k], palette[k], t)
    bloom = bloom + (palette.bloom - bloom) * t
    out = next
  }
  return { ...out, bloom }
}

/** Blend two colours that may already be rgb() strings, returning a hex-ish rgb() string. */
function mixRaw(a: string, b: string, t: number): string {
  const pa = parseAny(a)
  const pb = parseAny(b)
  return `rgb(${mixChannel(pa[0], pb[0], t)} ${mixChannel(pa[1], pb[1], t)} ${mixChannel(pa[2], pb[2], t)})`
}

function parseAny(c: string): RGB {
  if (c.startsWith('#')) return hexToRgb(c)
  const m = c.match(/-?\d+(\.\d+)?/g)
  if (!m) return [0, 0, 0]
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}

export function toTriplet(c: string): string {
  const [r, g, b] = parseAny(c)
  return `${r} ${g} ${b}`
}
