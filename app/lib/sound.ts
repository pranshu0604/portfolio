'use client'

/**
 * Tiny Web Audio blip engine. Synthesised — no asset downloads.
 * Off by default; the user opts in (state persists for the session).
 */

type Voice = 'key' | 'tick' | 'boot' | 'ok' | 'error' | 'eat' | 'open'

const SPEC: Record<Voice, { freq: number; dur: number; type: OscillatorType; gain: number; slide?: number }> = {
  key: { freq: 1650, dur: 0.022, type: 'square', gain: 0.035 },
  tick: { freq: 900, dur: 0.02, type: 'sine', gain: 0.03 },
  boot: { freq: 420, dur: 0.09, type: 'sine', gain: 0.05, slide: 780 },
  ok: { freq: 660, dur: 0.11, type: 'triangle', gain: 0.06, slide: 990 },
  error: { freq: 220, dur: 0.14, type: 'sawtooth', gain: 0.05, slide: 120 },
  eat: { freq: 880, dur: 0.05, type: 'square', gain: 0.045, slide: 1320 },
  open: { freq: 300, dur: 0.13, type: 'sine', gain: 0.05, slide: 620 },
}

let ctx: AudioContext | null = null
let enabled = false

export function isSoundOn() {
  return enabled
}

export function setSoundOn(on: boolean) {
  enabled = on
  try {
    sessionStorage.setItem('pran.sound', on ? '1' : '0')
  } catch {}
  if (on) {
    ensureCtx()?.resume()
    play('ok')
    window.dispatchEvent(new CustomEvent('pran:sound-on'))
  }
  window.dispatchEvent(new CustomEvent('pran:sound', { detail: on }))
}

export function restoreSound() {
  try {
    enabled = sessionStorage.getItem('pran.sound') === '1'
  } catch {}
  return enabled
}

function ensureCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

export function play(voice: Voice) {
  if (!enabled) return
  const ac = ensureCtx()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume()
  const s = SPEC[voice]
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = s.type
  osc.frequency.setValueAtTime(s.freq, t)
  if (s.slide) osc.frequency.exponentialRampToValueAtTime(s.slide, t + s.dur)
  gain.gain.setValueAtTime(s.gain, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + s.dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + s.dur + 0.02)
}
