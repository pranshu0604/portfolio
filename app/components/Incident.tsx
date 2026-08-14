'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { play } from '../lib/sound'
import { recordMttr, unlock } from '../lib/store'
import { Puzzle } from './IncidentPuzzles'

type Fault = 'workers' | 'queue' | 'cache'

const FAULTS: Record<Fault, { label: string; symptom: string; fix: string }> = {
  workers: { label: 'worker pool', symptom: 'ARQ workers unresponsive', fix: 'fix workers' },
  queue: { label: 'message queue', symptom: 'RabbitMQ consumers detached', fix: 'fix queue' },
  cache: { label: 'redis cache', symptom: 'Redis coordination lost', fix: 'fix cache' },
}

/**
 * Injects a real incident into the live page: the site degrades, a war-room
 * panel opens, and you have to bring each subsystem back. Times your MTTR.
 * Always escapable, and tame under reduced-motion.
 */
export default function Incident() {
  const [active, setActive] = useState(false)
  const [broken, setBroken] = useState<Fault[]>([])
  const [elapsed, setElapsed] = useState(0)
  const [resolved, setResolved] = useState<number | null>(null)
  const [working, setWorking] = useState<Fault | null>(null)
  const startedAt = useRef(0)
  const reduce = useRef(false)

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const start = useCallback(() => {
    if (active) return
    setActive(true)
    setResolved(null)
    setWorking(null)
    setBroken(['workers', 'queue', 'cache'])
    startedAt.current = performance.now()
    document.documentElement.classList.add('incident')
    if (!reduce.current) document.documentElement.classList.add('incident-fx')
    window.dispatchEvent(new CustomEvent('pran:incident', { detail: true }))
    window.dispatchEvent(
      new CustomEvent('pran:term-print', {
        detail: '⚠ INCIDENT — 3 subsystems down. run `fix workers`, `fix queue`, `fix cache`.',
      }),
    )
    play('error')
  }, [active])

  const finish = useCallback(() => {
    const secs = (performance.now() - startedAt.current) / 1000
    setResolved(secs)
    recordMttr(secs)
    unlock('incident')
    if (secs < 25) unlock('incident_fast')
    document.documentElement.classList.remove('incident', 'incident-fx')
    window.dispatchEvent(new CustomEvent('pran:incident', { detail: false }))
    play('ok')
    window.setTimeout(() => {
      setActive(false)
      setResolved(null)
    }, 4200)
  }, [])

  const repair = useCallback(
    (f: Fault) => {
      setWorking((w) => (w === f ? null : w))
      setBroken((b) => {
        if (!b.includes(f)) return b
        const next = b.filter((x) => x !== f)
        play('ok')
        window.dispatchEvent(
          new CustomEvent('pran:term-print', { detail: `✓ ${FAULTS[f].label} recovered` }),
        )
        if (next.length === 0) window.setTimeout(finish, 60)
        return next
      })
    },
    [finish],
  )

  // triggers + terminal `fix <thing>`
  useEffect(() => {
    const onTrigger = () => start()
    const onFix = (e: Event) => {
      const raw = String((e as CustomEvent).detail || '').toLowerCase()
      const f = (['workers', 'queue', 'cache'] as Fault[]).find((k) => raw.includes(k))
      if (f) repair(f)
    }
    window.addEventListener('pran:trigger-incident', onTrigger)
    window.addEventListener('pran:fix', onFix)
    return () => {
      window.removeEventListener('pran:trigger-incident', onTrigger)
      window.removeEventListener('pran:fix', onFix)
    }
  }, [start, repair])

  // ticking clock
  useEffect(() => {
    if (!active || resolved !== null) return
    const id = window.setInterval(
      () => setElapsed((performance.now() - startedAt.current) / 1000),
      100,
    )
    return () => window.clearInterval(id)
  }, [active, resolved])

  // escape hatch
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.documentElement.classList.remove('incident', 'incident-fx')
        window.dispatchEvent(new CustomEvent('pran:incident', { detail: false }))
        setActive(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  useEffect(
    () => () => document.documentElement.classList.remove('incident', 'incident-fx'),
    [],
  )

  if (!active) return null

  return (
    <div className="warroom" role="alertdialog" aria-label="Incident">
      <div className="warroom-head">
        <span className="warroom-sev">{resolved === null ? 'SEV-1' : 'RESOLVED'}</span>
        <span className="warroom-time">
          {resolved === null ? `${elapsed.toFixed(1)}s` : `MTTR ${resolved.toFixed(1)}s`}
        </span>
      </div>

      {resolved === null ? (
        working ? (
          <>
            <div className="warroom-work">
              <button type="button" className="warroom-back" onClick={() => setWorking(null)}>
                ← subsystems
              </button>
              <span className="warroom-work-name">{FAULTS[working].label}</span>
            </div>
            <Puzzle fault={working} onSolved={() => repair(working)} />
          </>
        ) : (
          <>
            <p className="warroom-lede">
              Production is degraded. Open each subsystem and actually repair it.
            </p>
            <ul className="warroom-list">
              {(Object.keys(FAULTS) as Fault[]).map((f) => {
                const down = broken.includes(f)
                return (
                  <li key={f} className={down ? 'is-down' : 'is-up'}>
                    <span className="warroom-dot" />
                    <span className="warroom-name">
                      <b>{FAULTS[f].label}</b>
                      <em>{down ? FAULTS[f].symptom : 'healthy'}</em>
                    </span>
                    {down ? (
                      <button type="button" onClick={() => setWorking(f)} data-cursor="repair">
                        repair →
                      </button>
                    ) : (
                      <span className="warroom-ok">✓</span>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="warroom-foot">esc to bail out</p>
          </>
        )
      ) : (
        <p className="warroom-done">
          All systems nominal. You recovered production in{' '}
          <b>{resolved.toFixed(1)} seconds</b>.
          {resolved < 25 && <> That is a respectable MTTR.</>}
        </p>
      )}
    </div>
  )
}
