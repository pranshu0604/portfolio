'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { play } from '../lib/sound'

/**
 * Three micro-puzzles, one per failing subsystem. Each is a small, real
 * interaction rather than a confirm button — you have to actually read the
 * readout and act on it.
 */

/* ---------- 1. worker pool: match capacity to a drifting load ---------- */
export function ScalePuzzle({ onSolved }: { onSolved: () => void }) {
  const [load, setLoad] = useState(9)
  const [workers, setWorkers] = useState(1)
  const [held, setHeld] = useState(0)
  const dir = useRef(1)

  useEffect(() => {
    const id = window.setInterval(() => {
      setLoad((l) => {
        if (l >= 14) dir.current = -1
        if (l <= 5) dir.current = 1
        return l + dir.current * (Math.random() < 0.45 ? 1 : 0)
      })
    }, 700)
    return () => window.clearInterval(id)
  }, [])

  const matched = Math.abs(workers - load) <= 1

  useEffect(() => {
    if (!matched) {
      setHeld(0)
      return
    }
    const id = window.setInterval(() => setHeld((h) => h + 100), 100)
    return () => window.clearInterval(id)
  }, [matched])

  useEffect(() => {
    if (held >= 1600) onSolved()
  }, [held, onSolved])

  return (
    <div className="puz">
      <p className="puz-brief">
        Workers are under-provisioned. Track the incoming load and hold capacity
        within ±1 for two seconds.
      </p>
      <div className="puz-gauge">
        <div className="puz-row">
          <span>incoming load</span>
          <b>{load} req/s</b>
        </div>
        <div className="puz-row">
          <span>worker capacity</span>
          <b className={matched ? 'is-ok' : 'is-bad'}>{workers}</b>
        </div>
      </div>
      <input
        className="sim-range puz-range"
        type="range"
        min={1}
        max={16}
        value={workers}
        onChange={(e) => setWorkers(Number(e.target.value))}
        aria-label="Worker count"
      />
      <div className="puz-hold">
        <span style={{ width: `${Math.min((held / 1600) * 100, 100)}%` }} />
      </div>
      <p className="puz-status">{matched ? 'holding…' : 'out of band'}</p>
    </div>
  )
}

/* ---------- 2. message queue: rebind each consumer to its exchange ---------- */
const BINDINGS = [
  { key: 'ingest', q: 'q.ingest' },
  { key: 'index', q: 'q.index' },
  { key: 'notify', q: 'q.notify' },
]

export function RebindPuzzle({ onSolved }: { onSolved: () => void }) {
  const [picked, setPicked] = useState<string | null>(null)
  const [done, setDone] = useState<string[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const [queues] = useState(() => [...BINDINGS].sort(() => Math.random() - 0.5))

  useEffect(() => {
    if (done.length === BINDINGS.length) onSolved()
  }, [done, onSolved])

  const tapQueue = (q: string) => {
    if (!picked) return
    const match = BINDINGS.find((b) => b.key === picked)
    if (match && match.q === q) {
      setDone((d) => [...d, picked])
      setPicked(null)
      play('tick')
    } else {
      setWrong(q)
      play('error')
      window.setTimeout(() => setWrong(null), 400)
    }
  }

  return (
    <div className="puz">
      <p className="puz-brief">
        Consumers detached from their queues. Select a consumer, then its matching
        queue to rebind it.
      </p>
      <div className="puz-bind">
        <div className="puz-col">
          <span className="puz-col-h">consumers</span>
          {BINDINGS.map((b) => (
            <button
              key={b.key}
              type="button"
              disabled={done.includes(b.key)}
              onClick={() => setPicked(b.key)}
              className={`puz-node ${picked === b.key ? 'is-picked' : ''} ${done.includes(b.key) ? 'is-done' : ''}`}
            >
              {b.key}
            </button>
          ))}
        </div>
        <div className="puz-col">
          <span className="puz-col-h">queues</span>
          {queues.map((b) => (
            <button
              key={b.q}
              type="button"
              disabled={done.includes(b.key)}
              onClick={() => tapQueue(b.q)}
              className={`puz-node ${wrong === b.q ? 'is-wrong' : ''} ${done.includes(b.key) ? 'is-done' : ''}`}
            >
              {b.q}
            </button>
          ))}
        </div>
      </div>
      <p className="puz-status">{done.length}/{BINDINGS.length} rebound</p>
    </div>
  )
}

/* ---------- 3. redis: replay the key eviction order ---------- */
const KEYS = ['sess', 'lock', 'rate', 'idem']

export function CachePuzzle({ onSolved }: { onSolved: () => void }) {
  const [seq, setSeq] = useState<number[]>([])
  const [flash, setFlash] = useState<number | null>(null)
  const [phase, setPhase] = useState<'show' | 'input'>('show')
  const [pos, setPos] = useState(0)

  // build and play a 4-step sequence once
  useEffect(() => {
    const s = Array.from({ length: 4 }, () => (Math.random() * KEYS.length) | 0)
    setSeq(s)
    let i = 0
    const id = window.setInterval(() => {
      if (i >= s.length) {
        window.clearInterval(id)
        setFlash(null)
        setPhase('input')
        return
      }
      setFlash(s[i])
      play('tick')
      window.setTimeout(() => setFlash(null), 320)
      i++
    }, 620)
    return () => window.clearInterval(id)
  }, [])

  const tap = (i: number) => {
    if (phase !== 'input') return
    if (seq[pos] === i) {
      const next = pos + 1
      setPos(next)
      play('tick')
      if (next >= seq.length) onSolved()
    } else {
      play('error')
      setPos(0)
    }
  }

  return (
    <div className="puz">
      <p className="puz-brief">
        Redis lost coordination state. Watch the eviction order, then replay it to
        warm the cache back up.
      </p>
      <div className="puz-keys">
        {KEYS.map((k, i) => (
          <button
            key={k}
            type="button"
            onClick={() => tap(i)}
            className={`puz-key ${flash === i ? 'is-flash' : ''}`}
            disabled={phase === 'show'}
          >
            {k}
          </button>
        ))}
      </div>
      <p className="puz-status">
        {phase === 'show' ? 'memorising…' : `replaying ${pos}/${seq.length}`}
      </p>
    </div>
  )
}

/** Picks the right puzzle for a subsystem. */
export function Puzzle({ fault, onSolved }: { fault: string; onSolved: () => void }) {
  const solved = useCallback(() => onSolved(), [onSolved])
  if (fault === 'workers') return <ScalePuzzle onSolved={solved} />
  if (fault === 'queue') return <RebindPuzzle onSolved={solved} />
  return <CachePuzzle onSolved={solved} />
}
