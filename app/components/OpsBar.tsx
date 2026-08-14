'use client'

import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, getState, subscribe } from '../lib/store'

type Perf = { fps: number; nodes: number; mem: number | null }

function fmtUptime(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Ambient instrumentation — the page measuring itself. Deliberately *not* the
 * front door any more: the control-room section owns discovery, so this is just
 * an honest status line (plus the achievement ledger).
 */
export default function OpsBar() {
  const [perf, setPerf] = useState<Perf>({ fps: 60, nodes: 0, mem: null })
  const [uptime, setUptime] = useState(0)
  const [status, setStatus] = useState<'nominal' | 'degraded'>('nominal')
  const [count, setCount] = useState(0)
  const [showAch, setShowAch] = useState(false)

  useEffect(() => {
    const off = subscribe((s) => setCount(s.unlocked.length))
    return () => {
      off()
    }
  }, [])

  useEffect(() => {
    const onIncident = (e: Event) =>
      setStatus((e as CustomEvent).detail ? 'degraded' : 'nominal')
    window.addEventListener('pran:incident', onIncident)
    return () => window.removeEventListener('pran:incident', onIncident)
  }, [])

  // counts frames every rAF, commits state once a second
  useEffect(() => {
    const t0 = performance.now()
    let frames = 0
    let mark = performance.now()
    let raf = 0
    const loop = (now: number) => {
      frames++
      if (now - mark >= 1000) {
        const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
        setPerf({
          fps: Math.min(120, Math.round((frames * 1000) / (now - mark))),
          nodes: document.getElementsByTagName('*').length,
          mem: mem ? Math.round(mem.usedJSHeapSize / 1048576) : null,
        })
        setUptime(now - t0)
        frames = 0
        mark = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const held = getState().unlocked

  return (
    <>
      <div className="ops" role="status">
        <div className="ops-left">
          <span className={`ops-dot ops-dot--${status}`} />
          <span className="ops-status">system {status}</span>
          <span className="ops-sep" />
          <span className="ops-metric">up {fmtUptime(uptime)}</span>
          <span className="ops-metric">{perf.fps}fps</span>
          <span className="ops-metric ops-hide-sm">{perf.nodes} nodes</span>
          {perf.mem !== null && <span className="ops-metric ops-hide-sm">{perf.mem}mb</span>}
        </div>

        <div className="ops-right">
          <a href="#control" className="ops-link">control room ↑</a>
          <button type="button" onClick={() => setShowAch((v) => !v)} data-cursor="awards">
            ◆ {count}/{Object.keys(ACHIEVEMENTS).length}
          </button>
        </div>
      </div>

      {showAch && (
        <div className="ach-panel">
          <div className="ach-head">
            <span>achievements</span>
            <button type="button" onClick={() => setShowAch(false)} aria-label="Close">
              close
            </button>
          </div>
          <ul>
            {(Object.keys(ACHIEVEMENTS) as (keyof typeof ACHIEVEMENTS)[]).map((id) => {
              const got = held.includes(id)
              return (
                <li key={id} className={got ? 'is-got' : ''}>
                  <span className="ach-mark">{got ? '◆' : '◇'}</span>
                  <span>
                    <b>{got ? ACHIEVEMENTS[id].name : '???'}</b>
                    <em>{ACHIEVEMENTS[id].hint}</em>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}
