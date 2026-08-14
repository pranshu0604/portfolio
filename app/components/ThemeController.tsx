'use client'

import { useEffect } from 'react'
import {
  KEYS,
  PALETTES,
  css,
  mixNum,
  themeWeight,
  toNum,
  trip,
  type NumPalette,
  type PaletteName,
} from '../lib/palettes'

/**
 * Continuous theming.
 *
 * Each project scene owns a share of the viewport; that share is shaped by
 * `themeWeight` into a *wide plateau with a narrow ramp*, so a project reads as
 * fully itself for most of its time on screen and the muddy in-between state is
 * crossed quickly.
 *
 * Everything painted here — palette channels, bloom position, bloom strength —
 * is eased toward its target every frame rather than assigned, so nothing can
 * pop, including the bloom drifting back to centre when the projects end.
 */
export default function ThemeController() {
  useEffect(() => {
    const root = document.documentElement
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const forced = new URLSearchParams(window.location.search).get('theme') as PaletteName | null

    const basis = () => toNum(root.getAttribute('data-mode') === 'dark' ? PALETTES.baseDark : PALETTES.base)

    // target state, recomputed on scroll
    let target: NumPalette = basis()
    let tx = 50
    let ty = 40
    let dominant = 'base'

    // displayed state, eased toward the target every frame
    let cur: NumPalette = target
    let cx = tx
    let cy = ty
    let started = false

    function computeTarget() {
      const vh = window.innerHeight
      const base = basis()

      if (forced && PALETTES[forced]) {
        target = toNum(PALETTES[forced])
        dominant = forced === 'baseDark' ? 'base' : forced
        return
      }

      let out = base
      let best = 0
      let bestName = 'base'
      let haveOrigin = false

      for (const s of document.querySelectorAll<HTMLElement>('[data-scene]')) {
        const name = (s.dataset.theme || 'base') as PaletteName
        if (name === 'base' || !PALETTES[name]) continue
        const r = s.getBoundingClientRect()
        const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
        if (visible <= 0) continue
        const w = themeWeight(visible / vh)
        if (w <= 0) continue
        out = mixNum(out, toNum(PALETTES[name]), w)
        if (w > best) {
          best = w
          bestName = name
          const el = s.querySelector<HTMLElement>('[data-flood-origin]')
          if (el) {
            const o = el.getBoundingClientRect()
            tx = ((o.left + o.width / 2) / window.innerWidth) * 100
            ty = ((o.top + o.height / 2) / vh) * 100
            haveOrigin = true
          }
        }
      }

      // no project on screen: let the bloom drift to a neutral spot rather than jump
      if (!haveOrigin) {
        tx = 50
        ty = 30
      }
      ty = Math.max(-15, Math.min(115, ty))
      target = out
      dominant = best > 0.5 ? bestName : 'base'
    }

    function paint() {
      const s = root.style
      const c = cur.c
      s.setProperty('--ground', css(c.ground))
      s.setProperty('--paper', css(c.paper))
      s.setProperty('--paper-2', css(c.paper2))
      s.setProperty('--ink', css(c.ink))
      s.setProperty('--body', css(c.body))
      s.setProperty('--sub', css(c.sub))
      s.setProperty('--faint', css(c.faint))
      s.setProperty('--accent', css(c.accent))
      s.setProperty('--accent-2', css(c.accent2))
      s.setProperty('--accent-rgb', trip(c.accent))
      s.setProperty('--good', css(c.good))
      s.setProperty('--accent-soft', `rgb(${trip(c.accent)} / 0.16)`)
      s.setProperty('--line', `rgb(${trip(c.ink)} / 0.12)`)
      s.setProperty('--line-2', `rgb(${trip(c.ink)} / 0.22)`)
      s.setProperty('--grid', `rgb(${trip(c.accent)} / 0.09)`)
      s.setProperty('--bloom-color', css(c.accent))
      s.setProperty('--bloom-x', `${cx.toFixed(2)}%`)
      s.setProperty('--bloom-y', `${cy.toFixed(2)}%`)
      s.setProperty('--bloom-alpha', cur.bloom.toFixed(3))
      if (root.getAttribute('data-theme') !== dominant) root.setAttribute('data-theme', dominant)
    }

    let raf = 0
    let settleFrames = 0

    function tick() {
      // ease displayed → target; slow enough to feel like light moving
      const k = 0.12
      const before = cur
      cur = mixNum(cur, target, k)
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      paint()

      // stop the loop once we have effectively arrived, restart on next scroll
      let delta = Math.abs(tx - cx) + Math.abs(ty - cy) + Math.abs(target.bloom - cur.bloom) * 100
      for (const key of KEYS) delta += Math.abs(before.c[key][0] - target.c[key][0])
      if (delta < 0.6) {
        settleFrames++
        if (settleFrames > 6) {
          raf = 0
          return
        }
      } else settleFrames = 0

      raf = requestAnimationFrame(tick)
    }

    function kick() {
      computeTarget()
      if (reduce) {
        cur = target
        cx = tx
        cy = ty
        paint()
        return
      }
      settleFrames = 0
      if (!raf) raf = requestAnimationFrame(tick)
    }

    // first paint lands immediately so there is no fade-in on load
    computeTarget()
    cur = target
    cx = tx
    cy = ty
    paint()
    started = true

    let queued = false
    const onScroll = () => {
      if (queued || !started) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        kick()
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('pran:mode', kick)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pran:mode', kick)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
