'use client'

import { useEffect, useRef, useState } from 'react'
import { play } from '../lib/sound'
import { getState, recordScore, unlock } from '../lib/store'

/**
 * Backpressure — snake, reframed as the thing it always secretly was.
 *
 * You are one worker draining a queue. Every job you consume extends your
 * backlog behind you. Run into your own backlog and you have deadlocked;
 * run past the boundary and you have dropped the connection. It is the same
 * failure mode I design around for real: unbounded queues kill consumers.
 */

type Particle = { x: number; y: number; vx: number; vy: number; life: number; hue: string }
type Popup = { x: number; y: number; life: number; text: string }

const COLS = 24
const ROWS = 16
const TICK = 92

export default function Snake({ onExit }: { onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const [throughput, setThroughput] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => setBest(getState().snakeBest), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let cell = 16
    const resize = () => {
      const r = canvas.getBoundingClientRect()
      cell = Math.floor(Math.min(r.width / COLS, r.height / ROWS))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let snake = [{ x: 8, y: 8 }]
    let dir = { x: 1, y: 0 }
    let pending = { x: 1, y: 0 }
    let food = { x: 15, y: 8 }
    let dead = false
    let acc = 0
    let last = performance.now()
    let localScore = 0
    let shake = 0
    let flash = 0
    let pulse = 0
    let startedAt = performance.now()
    const particles: Particle[] = []
    const popups: Popup[] = []

    const placeFood = () => {
      let ok = false
      while (!ok) {
        food = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 }
        ok = !snake.some((s) => s.x === food.x && s.y === food.y)
      }
    }

    const burst = (gx: number, gy: number, ox: number, oy: number, color: string, n: number) => {
      if (reduce) return
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.5
        const sp = 40 + Math.random() * 110
        particles.push({
          x: ox + gx * cell + cell / 2,
          y: oy + gy * cell + cell / 2,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          hue: color,
        })
      }
    }

    const reset = () => {
      snake = [{ x: 8, y: 8 }]
      dir = { x: 1, y: 0 }
      pending = { x: 1, y: 0 }
      localScore = 0
      dead = false
      startedAt = performance.now()
      particles.length = 0
      popups.length = 0
      setScore(0)
      setOver(false)
      setThroughput(0)
      placeFood()
    }

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === 'escape') return onExit()
      if (dead && (k === 'enter' || k === ' ')) return reset()
      const map: Record<string, { x: number; y: number }> = {
        arrowup: { x: 0, y: -1 }, w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 }, d: { x: 1, y: 0 },
      }
      const nd = map[k]
      if (!nd) return
      e.preventDefault()
      if (nd.x === -dir.x && nd.y === -dir.y) return
      pending = nd
    }
    window.addEventListener('keydown', onKey)

    let raf = 0
    const frame = (now: number) => {
      const dt = now - last
      last = now
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      const ox = (W - COLS * cell) / 2
      const oy = (H - ROWS * cell) / 2

      const styles = getComputedStyle(document.documentElement)
      const accent = styles.getPropertyValue('--accent').trim() || '#6a5cff'

      if (!dead) {
        acc += dt
        while (acc >= TICK) {
          acc -= TICK
          dir = pending
          const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
          const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS
          const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y)
          if (hitWall || hitSelf) {
            dead = true
            setOver(true)
            play('error')
            shake = 1
            flash = 1
            burst(
              Math.max(0, Math.min(COLS - 1, head.x)),
              Math.max(0, Math.min(ROWS - 1, head.y)),
              ox, oy, '#ef4444', 26,
            )
            popups.push({
              x: ox + Math.max(0, Math.min(COLS - 1, head.x)) * cell,
              y: oy + Math.max(0, Math.min(ROWS - 1, head.y)) * cell,
              life: 1,
              text: hitSelf ? 'DEADLOCK' : 'DROPPED',
            })
            recordScore('snake', localScore)
            if (localScore >= 10) unlock('snake_10')
            if (localScore >= 25) unlock('snake_25')
            setBest((b) => Math.max(b, localScore))
            break
          }
          snake.unshift(head)
          if (head.x === food.x && head.y === food.y) {
            localScore += 1
            setScore(localScore)
            play('eat')
            pulse = 1
            burst(head.x, head.y, ox, oy, accent, 14)
            popups.push({ x: ox + head.x * cell, y: oy + head.y * cell, life: 1, text: '+1 job' })
            placeFood()
          } else {
            snake.pop()
          }
        }
        setThroughput(Math.round((localScore / Math.max((now - startedAt) / 1000, 1)) * 60))
        setElapsed((now - startedAt) / 1000)
      }

      // ---- draw ----
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      if (shake > 0) {
        ctx.translate((Math.random() - 0.5) * 14 * shake, (Math.random() - 0.5) * 14 * shake)
        shake = Math.max(0, shake - dt / 380)
      }

      // board + faint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.lineWidth = 1
      ctx.strokeRect(ox, oy, COLS * cell, ROWS * cell)
      ctx.strokeStyle = 'rgba(255,255,255,0.035)'
      for (let i = 1; i < COLS; i++) {
        ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + ROWS * cell); ctx.stroke()
      }
      for (let j = 1; j < ROWS; j++) {
        ctx.beginPath(); ctx.moveTo(ox, oy + j * cell); ctx.lineTo(ox + COLS * cell, oy + j * cell); ctx.stroke()
      }

      // pending job, pulsing
      const fp = 1 + Math.sin(now / 180) * 0.08
      ctx.save()
      ctx.translate(ox + food.x * cell + cell / 2, oy + food.y * cell + cell / 2)
      ctx.scale(fp, fp)
      ctx.fillStyle = '#34d399'
      ctx.shadowColor = '#34d399'
      ctx.shadowBlur = 14
      ctx.fillRect(-cell / 2 + 3, -cell / 2 + 3, cell - 6, cell - 6)
      ctx.restore()
      ctx.shadowBlur = 0

      // the worker + its backlog
      snake.forEach((s, i) => {
        const head = i === 0
        ctx.globalAlpha = head ? 1 : Math.max(0.3, 1 - i * 0.03)
        ctx.fillStyle = head ? accent : accent
        if (head) {
          ctx.shadowColor = accent
          ctx.shadowBlur = 12 + pulse * 20
        }
        const pad = head ? 1 : 2.5
        ctx.fillRect(ox + s.x * cell + pad, oy + s.y * cell + pad, cell - pad * 2, cell - pad * 2)
        ctx.shadowBlur = 0
      })
      ctx.globalAlpha = 1
      pulse = Math.max(0, pulse - dt / 260)

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += (p.vx * dt) / 1000
        p.y += (p.vy * dt) / 1000
        p.vy += (240 * dt) / 1000
        p.life -= dt / 620
        if (p.life <= 0) { particles.splice(i, 1); continue }
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.hue
        ctx.fillRect(p.x, p.y, 3, 3)
      }
      ctx.globalAlpha = 1

      // floating labels
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]
        p.y -= (26 * dt) / 1000
        p.life -= dt / 900
        if (p.life <= 0) { popups.splice(i, 1); continue }
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.text === '+1 job' ? '#34d399' : '#ef4444'
        ctx.font = '600 11px ui-monospace, monospace'
        ctx.fillText(p.text, p.x, p.y)
      }
      ctx.globalAlpha = 1
      ctx.restore()

      // death flash
      if (flash > 0) {
        ctx.fillStyle = `rgba(239,68,68,${flash * 0.22})`
        ctx.fillRect(0, 0, W, H)
        flash = Math.max(0, flash - dt / 420)
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      ro.disconnect()
    }
  }, [onExit])

  const depth = score
  const saturated = depth > 18

  return (
    <div className="bp">
      <div className="bp-main">
        <div className="bp-hud">
          <span>
            jobs drained <b>{score}</b>
          </span>
          <span>
            best <b>{best || '—'}</b>
          </span>
          <span className="bp-hint">
            {over ? 'enter to redeploy · esc to exit' : 'arrows / wasd — consume the green jobs'}
          </span>
        </div>
        <canvas ref={canvasRef} className="snake-canvas" />
      </div>

      {/* the empty half of the screen, put to work */}
      <aside className="bp-side">
        <div className="bp-panel">
          <span className="bp-panel-h">worker · w-01</span>
          <div className="bp-metric">
            <span>backlog depth</span>
            <b className={saturated ? 'is-hot' : ''}>{depth}</b>
          </div>
          <div className="bp-bar">
            <span style={{ width: `${Math.min((depth / 24) * 100, 100)}%` }} />
          </div>
          <div className="bp-metric">
            <span>throughput</span>
            <b>{throughput}/min</b>
          </div>
          <div className="bp-metric">
            <span>uptime</span>
            <b>{elapsed.toFixed(0)}s</b>
          </div>
          <div className="bp-metric">
            <span>status</span>
            <b className={over ? 'is-hot' : 'is-ok'}>{over ? 'CRASHED' : 'HEALTHY'}</b>
          </div>
        </div>

        <div className="bp-note">
          <span className="bp-panel-h">why this is here</span>
          <p>
            A consumer with an unbounded queue eventually eats itself. Every job you
            take makes your own backlog longer, until the thing you are dragging
            behind you is what kills you.
          </p>
          <p>
            That is <em>backpressure</em> — and designing around it is most of what
            I do with queues and workers at Invsto.
          </p>
        </div>

        <div className="bp-legend">
          <span><i className="sw-job" /> pending job</span>
          <span><i className="sw-worker" /> worker</span>
          <span><i className="sw-log" /> your backlog</span>
        </div>
      </aside>
    </div>
  )
}
