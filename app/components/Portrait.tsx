'use client'

import { useEffect, useRef } from 'react'

/**
 * Two-layer avatar: a calm 3D "Memoji" at rest that glitches — Spider-Verse
 * style, scattered chromatic noise blocks — into the techy "focus mode" render
 * on hover, and back again on leave. Falls back to an instant swap under
 * prefers-reduced-motion.
 */
export default function Portrait({
  normalSrc,
  techSrc,
}: {
  normalSrc: string
  techSrc: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const normRef = useRef<HTMLImageElement>(null)
  const techRef = useRef<HTMLImageElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const portrait = rootRef.current
    const norm = normRef.current
    const real = techRef.current
    const layer = layerRef.current
    if (!portrait || !norm || !real || !layer) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const DUR = 340
    const STEP = 26
    let raf = 0
    let t0 = 0
    let lastStep = 0
    let dir = 1

    const R = (a: number, b: number) => a + Math.random() * (b - a)

    // one scattered noise block: a small window onto a position-displaced crop of
    // `src`, some tinted to a single channel (red/cyan) + screen-blended for RGB fringing.
    function makeBlock(W: number, H: number, src: string) {
      const w = R(0.1, 0.4) * W
      const h = R(0.022, 0.11) * H
      const x = R(0, W - w)
      const y = R(0, H - h)
      const dx = Math.random() < 0.78 ? R(-0.055, 0.055) * W : 0
      const dy = Math.random() < 0.32 ? R(-0.03, 0.03) * H : 0
      const blk = document.createElement('div')
      blk.className = 'blk'
      blk.style.left = `${x}px`
      blk.style.top = `${y}px`
      blk.style.width = `${w}px`
      blk.style.height = `${h}px`
      const im = document.createElement('img')
      im.src = src
      im.alt = ''
      im.style.width = `${W}px`
      im.style.height = `${H}px`
      im.style.left = `${-x + dx}px`
      im.style.top = `${-y + dy}px`
      const roll = Math.random()
      if (roll < 0.3) {
        im.style.filter = 'url(#gRed)'
        blk.style.mixBlendMode = 'screen'
      } else if (roll < 0.58) {
        im.style.filter = 'url(#gCyan)'
        blk.style.mixBlendMode = 'screen'
      }
      blk.appendChild(im)
      return blk
    }

    function step(now: number) {
      if (!norm || !real || !layer || !portrait) return
      if (!t0) {
        t0 = now
        lastStep = 0
      }
      const p = (now - t0) / DUR
      if (p >= 1) {
        layer.textContent = ''
        real.style.opacity = dir > 0 ? '1' : '0'
        norm.style.opacity = dir > 0 ? '0' : '1'
        raf = 0
        return
      }
      if (now - lastStep >= STEP) {
        lastStep = now
        const target = dir > 0 ? 1 : 0
        // base identity flickers between the two states for the first ~60%, then settles
        const flick = p < 0.6 ? (Math.random() < 0.5 ? target : 1 - target) : target
        real.style.opacity = String(flick)
        norm.style.opacity = String(1 - flick)
        const W = portrait.clientWidth
        const H = portrait.clientHeight
        const frag = document.createDocumentFragment()
        const N = 6 + ((Math.random() * 9) | 0)
        for (let i = 0; i < N; i++) {
          const src =
            Math.random() < 0.82 ? (dir > 0 ? techSrc : normalSrc) : dir > 0 ? normalSrc : techSrc
          frag.appendChild(makeBlock(W, H, src))
        }
        layer.textContent = ''
        layer.appendChild(frag)
      }
      raf = requestAnimationFrame(step)
    }

    function run(d: number) {
      if (!norm || !real || !layer) return
      dir = d
      if (reduce) {
        layer.textContent = ''
        real.style.opacity = d > 0 ? '1' : '0'
        norm.style.opacity = d > 0 ? '0' : '1'
        return
      }
      t0 = 0
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(step)
    }

    // gaze: the avatar leans toward the cursor, and jitters during an incident
    let gazeRaf = 0
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let panicking = false
    const onGaze = (e: MouseEvent) => {
      const r = portrait.getBoundingClientRect()
      const nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)
      const ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)
      tx = Math.max(-1, Math.min(1, nx))
      ty = Math.max(-1, Math.min(1, ny))
    }
    const gazeLoop = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      const jit = panicking ? (Math.random() - 0.5) * 6 : 0
      portrait.style.transform = `translate3d(${cx * 9 + jit}px, ${cy * 6}px, 0) rotate(${cx * 1.4}deg)`
      gazeRaf = requestAnimationFrame(gazeLoop)
    }
    if (!reduce) {
      window.addEventListener('mousemove', onGaze, { passive: true })
      gazeRaf = requestAnimationFrame(gazeLoop)
    }
    const onIncident = (e: Event) => {
      panicking = Boolean((e as CustomEvent).detail)
      if (panicking) run(1)
    }
    window.addEventListener('pran:incident', onIncident)

    const enter = () => run(1)
    const leave = () => run(-1)
    portrait.addEventListener('mouseenter', enter)
    portrait.addEventListener('mouseleave', leave)
    portrait.addEventListener('focusin', enter)
    portrait.addEventListener('focusout', leave)
    return () => {
      portrait.removeEventListener('mouseenter', enter)
      portrait.removeEventListener('mouseleave', leave)
      portrait.removeEventListener('focusin', enter)
      portrait.removeEventListener('focusout', leave)
      window.removeEventListener('mousemove', onGaze)
      window.removeEventListener('pran:incident', onIncident)
      if (raf) cancelAnimationFrame(raf)
      if (gazeRaf) cancelAnimationFrame(gazeRaf)
    }
  }, [normalSrc, techSrc])

  return (
    <div
      ref={rootRef}
      className="portrait"
      tabIndex={0}
      data-cursor="focus mode"
      aria-label="Portrait of Pranshu Pandey — hover to reveal focus mode"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={normRef} className="p-cartoon" src={normalSrc} alt="Pranshu Pandey, 3D avatar" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={techRef} className="p-real" src={techSrc} alt="Pranshu Pandey in focus mode" />
      <div ref={layerRef} className="glitch" aria-hidden="true" />
      <span className="hint">{'// hover'}</span>

      {/* channel-split filters for the chromatic glitch pieces */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="gRed" x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
        </filter>
        <filter id="gCyan" x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
        </filter>
      </svg>
    </div>
  )
}
