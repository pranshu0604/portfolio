'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The EI-LMS story, playable: drag the worker count and watch a sequential
 * 27-second job collapse toward sub-second as work fans out across workers
 * behind a queue. Canvas shows requests flowing in, queueing, and draining.
 *
 * The model is illustrative — it reproduces the shape of the real result
 * (8s sequential → <1s distributed), not a benchmark.
 */

const SEQ_SECONDS = 8 // the real "before" number
const ARRIVAL_MS = 90 // how often a new request shows up

type Req = { id: number; x: number; y: number; state: 'queue' | 'work' | 'done'; worker: number; t: number }

export default function LatencySim() {
  const [workers, setWorkers] = useState(1)
  const [running, setRunning] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workersRef = useRef(workers)
  const runningRef = useRef(running)
  const [readout, setReadout] = useState({ latency: SEQ_SECONDS, done: 0, queued: 0 })

  workersRef.current = workers
  runningRef.current = running

  // latency model: parallelism cuts the serial time, with a small coordination
  // cost so it flattens out instead of dividing forever.
  const latencyFor = (n: number) => Math.max(0.42, SEQ_SECONDS / n + n * 0.012)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let last = performance.now()
    let spawnAcc = 0
    let nextId = 1
    let reqs: Req[] = []
    let doneCount = 0

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      const n = workersRef.current

      if (runningRef.current) {
        // spawn
        spawnAcc += dt
        while (spawnAcc > ARRIVAL_MS) {
          spawnAcc -= ARRIVAL_MS
          reqs.push({ id: nextId++, x: 0, y: H / 2, state: 'queue', worker: -1, t: 0 })
        }
        // service time per request scales down as workers go up
        const serviceMs = reduce ? 260 : Math.max(120, (latencyFor(n) / SEQ_SECONDS) * 2600)
        const busy = new Set(reqs.filter((r) => r.state === 'work').map((r) => r.worker))
        for (const r of reqs) {
          if (r.state === 'queue') {
            r.x += (dt / 1000) * (W * 0.36)
            const gate = W * 0.34
            if (r.x >= gate) {
              // claim a free worker lane
              let free = -1
              for (let i = 0; i < n; i++) if (!busy.has(i)) { free = i; break }
              if (free >= 0) {
                busy.add(free)
                r.state = 'work'
                r.worker = free
                r.t = 0
              } else {
                r.x = gate // wait at the queue gate
              }
            }
          } else if (r.state === 'work') {
            r.t += dt
            const laneY = H * (0.5 - 0.34) + ((r.worker + 0.5) / n) * (H * 0.68)
            r.y += (laneY - r.y) * 0.18
            const p = Math.min(r.t / serviceMs, 1)
            r.x = W * 0.34 + p * (W * 0.42)
            if (p >= 1) {
              r.state = 'done'
              doneCount++
            }
          } else {
            r.x += (dt / 1000) * (W * 0.55)
            r.y += (H / 2 - r.y) * 0.12
          }
        }
        reqs = reqs.filter((r) => r.x < W + 30)
        if (reqs.length > 260) reqs = reqs.slice(-260)
      }

      // ---- draw ----
      ctx.clearRect(0, 0, W, H)
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#8b5cf6'

      // worker lanes
      for (let i = 0; i < n; i++) {
        const laneY = H * (0.5 - 0.34) + ((i + 0.5) / n) * (H * 0.68)
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(W * 0.34, laneY)
        ctx.lineTo(W * 0.76, laneY)
        ctx.stroke()
      }
      // queue gate
      ctx.strokeStyle = 'rgba(255,255,255,0.16)'
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      ctx.moveTo(W * 0.34, H * 0.1)
      ctx.lineTo(W * 0.34, H * 0.9)
      ctx.stroke()
      ctx.setLineDash([])

      for (const r of reqs) {
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.state === 'done' ? 2.4 : 3.1, 0, Math.PI * 2)
        ctx.fillStyle =
          r.state === 'done' ? 'rgba(52,211,153,0.9)' : r.state === 'work' ? accent : 'rgba(255,255,255,0.4)'
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const readoutTimer = window.setInterval(() => {
      setReadout({
        latency: latencyFor(workersRef.current),
        done: doneCount,
        queued: reqs.filter((r) => r.state === 'queue').length,
      })
    }, 180)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(readoutTimer)
      ro.disconnect()
    }
  }, [])

  const lat = readout.latency
  const latText = lat >= 1 ? `${lat.toFixed(1)}s` : `${(lat * 1000) | 0}ms`

  return (
    <div className="shot-frame relative overflow-hidden" style={{ background: 'var(--paper)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-sub">
          Latency lab · interactive
        </span>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="mono text-[10px] uppercase tracking-[0.16em] text-sub transition-colors hover:text-accent"
        >
          {running ? '❚❚ pause' : '▶ run'}
        </button>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div className="flex items-baseline gap-3">
            <span
              className="font-display text-[clamp(30px,5vw,52px)] font-semibold leading-none tabular-nums"
              style={{ color: workers > 1 ? 'var(--accent)' : 'var(--ink)' }}
            >
              {latText}
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-faint">
              {workers === 1 ? 'sequential' : 'distributed'}
            </span>
          </div>
          <div className="mono mt-1 text-[11px] text-faint">
            {readout.done} completed · {readout.queued} queued
          </div>
        </div>

        <label className="block sm:w-[260px]">
          <span className="mono mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-sub">
            Workers — {workers}
          </span>
          <input
            type="range"
            min={1}
            max={16}
            value={workers}
            onChange={(e) => setWorkers(Number(e.target.value))}
            className="sim-range w-full"
            aria-label="Number of workers"
          />
        </label>
      </div>

      <canvas ref={canvasRef} className="block h-[190px] w-full" aria-hidden="true" />

      <div className="mono flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-faint">
        <span>ingress → queue → workers → db</span>
        <span>illustrative · drag the slider</span>
      </div>
    </div>
  )
}
