'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { play } from '../lib/sound'
import { ARTIFACTS, recordScore, unlock, unlockArtifact } from '../lib/store'

/**
 * Packet Rush — the meta game.
 *
 * Requests stream in from the left and must reach the database on the right.
 * You place workers on lanes to process them; unprocessed requests pile into the
 * queue, and when the queue overflows the run ends. Clearing a wave recovers a
 * real artifact from the portfolio — the game is how you read the CV.
 */

type Req = { x: number; lane: number; work: number; done: boolean }
type Worker = { lane: number; level: number; cool: number }

const LANES = 5
const QUEUE_MAX = 20

export default function PacketRush({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wave, setWave] = useState(1)
  const [queue, setQueue] = useState(0)
  const [processed, setProcessed] = useState(0)
  const [credits, setCredits] = useState(3)
  const [selected, setSelected] = useState(0)
  const [over, setOver] = useState(false)
  const [waveProgress, setWaveProgress] = useState(0)

  const stateRef = useRef({
    reqs: [] as Req[],
    workers: [] as Worker[],
    queue: 0,
    processed: 0,
    wave: 1,
    spawned: 0,
    target: 8,
    credits: 3,
    over: false,
    acc: 0,
    selected: 0,
  })

  const place = useCallback((lane: number) => {
    const s = stateRef.current
    if (s.over) return
    const existing = s.workers.find((w) => w.lane === lane)
    if (existing) {
      if (s.credits <= 0 || existing.level >= 3) return
      s.credits -= 1
      existing.level += 1
    } else {
      if (s.credits <= 0) return
      s.credits -= 1
      s.workers.push({ lane, level: 1, cool: 0 })
    }
    setCredits(s.credits)
    play('tick')
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const s = stateRef.current

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

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onExit()
      const n = Number(e.key)
      if (n >= 1 && n <= LANES) {
        s.selected = n - 1
        setSelected(n - 1)
        place(n - 1)
      }
      if (e.key === 'ArrowUp') { s.selected = Math.max(0, s.selected - 1); setSelected(s.selected) }
      if (e.key === 'ArrowDown') { s.selected = Math.min(LANES - 1, s.selected + 1); setSelected(s.selected) }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); place(s.selected) }
    }
    window.addEventListener('keydown', onKey)

    const onClick = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const lane = Math.floor(((e.clientY - r.top) / r.height) * LANES)
      if (lane >= 0 && lane < LANES) { s.selected = lane; setSelected(lane); place(lane) }
    }
    canvas.addEventListener('click', onClick)

    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50)
      last = now
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      const laneH = H / LANES

      if (!s.over) {
        // spawn
        s.acc += dt
        const gap = Math.max(260 - s.wave * 18, 90)
        if (s.acc > gap && s.spawned < s.target) {
          s.acc = 0
          s.spawned++
          s.reqs.push({
            x: 0,
            lane: (Math.random() * LANES) | 0,
            work: 1 + Math.random() * 0.6,
            done: false,
          })
        }

        // move + process
        for (const r of s.reqs) {
          const w = s.workers.find((k) => k.lane === r.lane)
          const gate = W * 0.42
          if (!r.done && r.x >= gate && w) {
            // worker chews through it; higher level = faster
            r.work -= (dt / 1000) * (0.9 + w.level * 0.75)
            if (r.work <= 0) {
              r.done = true
              s.processed++
              setProcessed(s.processed)
            }
          } else if (!r.done && r.x >= gate && !w) {
            // no worker on this lane: it backs up into the queue
            r.x = gate
            r.work -= (dt / 1000) * 0.06
            if (r.work <= 0.55 && !r.done) {
              r.done = true
              s.queue++
              setQueue(s.queue)
              if (s.queue >= QUEUE_MAX) {
                s.over = true
                setOver(true)
                play('error')
                recordScore('rush', s.wave)
              }
            }
          } else {
            r.x += (dt / 1000) * (W * 0.22)
          }
          if (r.done && r.work <= 0) r.x += (dt / 1000) * (W * 0.5)
        }
        s.reqs = s.reqs.filter((r) => r.x < W + 40)

        setWaveProgress(Math.min(s.processed / s.target, 1))

        // wave cleared?
        if (s.spawned >= s.target && s.reqs.length === 0 && !s.over) {
          const art = ARTIFACTS.find((a) => a.wave === s.wave)
          if (art) unlockArtifact(art.id)
          if (s.wave >= 3) unlock('rush_wave3')
          if (s.wave >= 6) unlock('rush_wave6')
          recordScore('rush', s.wave)
          s.wave++
          s.target = 6 + s.wave * 3
          s.spawned = 0
          s.processed = 0
          s.credits += 2
          setWave(s.wave)
          setCredits(s.credits)
          setProcessed(0)
          play('ok')
        }
      }

      // ---- draw ----
      const styles = getComputedStyle(document.documentElement)
      const accent = styles.getPropertyValue('--accent').trim() || '#6a5cff'
      ctx.clearRect(0, 0, W, H)

      // lanes
      for (let i = 0; i < LANES; i++) {
        const y = i * laneH
        ctx.fillStyle = i === s.selected ? 'rgba(255,255,255,0.045)' : 'transparent'
        ctx.fillRect(0, y, W, laneH)
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, y + laneH)
        ctx.lineTo(W, y + laneH)
        ctx.stroke()
      }

      // worker gate
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.setLineDash([3, 5])
      ctx.beginPath()
      ctx.moveTo(W * 0.42, 0)
      ctx.lineTo(W * 0.42, H)
      ctx.stroke()
      ctx.setLineDash([])

      // db
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.fillRect(W - 12, 0, 12, H)

      // workers
      for (const w of s.workers) {
        const cy = w.lane * laneH + laneH / 2
        for (let l = 0; l < w.level; l++) {
          ctx.fillStyle = accent
          ctx.globalAlpha = 0.35 + l * 0.28
          ctx.fillRect(W * 0.42 + 6 + l * 11, cy - 9, 8, 18)
        }
        ctx.globalAlpha = 1
      }

      // requests
      for (const r of s.reqs) {
        const cy = r.lane * laneH + laneH / 2
        ctx.beginPath()
        ctx.arc(r.x, cy, 3.4, 0, Math.PI * 2)
        ctx.fillStyle = r.done ? 'rgba(52,211,153,0.95)' : r.x >= W * 0.42 ? accent : 'rgba(255,255,255,0.55)'
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('click', onClick)
      ro.disconnect()
    }
  }, [onExit, place])

  const restart = () => {
    const s = stateRef.current
    Object.assign(s, {
      reqs: [], workers: [], queue: 0, processed: 0, wave: 1,
      spawned: 0, target: 8, credits: 3, over: false, acc: 0, selected: 0,
    })
    setWave(1); setQueue(0); setProcessed(0); setCredits(3); setOver(false)
  }

  return (
    <div className="rush">
      <div className="rush-hud">
        <span>wave <b>{wave}</b></span>
        <span>credits <b>{credits}</b></span>
        <span>done <b>{processed}</b></span>
        <span className={queue > QUEUE_MAX * 0.6 ? 'is-hot' : ''}>
          queue <b>{queue}</b>/{QUEUE_MAX}
        </span>
        <span className="rush-hint">
          {over ? 'queue overflowed — enter to retry · esc to exit' : 'click a lane (or 1–5) to place / upgrade a worker'}
        </span>
      </div>

      <div className="rush-progress">
        <span style={{ width: `${waveProgress * 100}%` }} />
      </div>

      <canvas ref={canvasRef} className="rush-canvas" />

      <div className="rush-foot">
        <span className="rush-artifacts">
          artifacts recovered: {ARTIFACTS.filter((a) => a.wave < wave).length}/{ARTIFACTS.length}
        </span>
        {over && (
          <button type="button" onClick={restart} className="rush-retry">
            ▸ retry
          </button>
        )}
      </div>

      <p className="rush-note">
        clear a wave → recover a real piece of the portfolio. selected lane: {selected + 1}
      </p>
    </div>
  )
}
