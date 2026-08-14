'use client'

import { useEffect, useRef, useState } from 'react'
import { play, restoreSound } from '../lib/sound'
import { unlock } from '../lib/store'

/**
 * The site comes online like infrastructure: services report in, then the
 * overlay lifts into the hero. Once per session, skippable with any key/click,
 * and skipped entirely under reduced-motion.
 */

const LINES: { t: string; ok?: string; delay: number }[] = [
  { t: 'pranshu.system — boot', delay: 90 },
  { t: 'mounting /identity', ok: 'ok', delay: 130 },
  { t: 'starting service: engineering', ok: 'ok', delay: 120 },
  { t: 'connecting invsto.trading', ok: 'live', delay: 150 },
  { t: 'loading projects [ei-lms, p.r.a.n.]', ok: '2 found', delay: 160 },
  { t: 'warming queue workers', ok: '16 ready', delay: 140 },
  { t: 'latency check', ok: '<1s', delay: 150 },
  { t: 'all systems nominal', ok: 'ready', delay: 120 },
]

export default function Boot() {
  const [done, setDone] = useState(true)
  const [shown, setShown] = useState(0)
  const [lifting, setLifting] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let seen = false
    try {
      seen = sessionStorage.getItem('pran.booted') === '1'
    } catch {}
    if (reduce || seen) return

    restoreSound()
    setDone(false)
    document.documentElement.style.overflow = 'hidden'

    let acc = 260
    LINES.forEach((l, i) => {
      acc += l.delay
      timers.current.push(
        window.setTimeout(() => {
          setShown(i + 1)
          play('boot')
        }, acc),
      )
    })
    timers.current.push(window.setTimeout(() => finish(), acc + 420))

    function finish() {
      try {
        sessionStorage.setItem('pran.booted', '1')
      } catch {}
      unlock('boot')
      setLifting(true)
      window.setTimeout(() => {
        setDone(true)
        document.documentElement.style.overflow = ''
      }, 620)
    }

    const skip = () => finish()
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('click', skip, { once: true })

    return () => {
      timers.current.forEach(clearTimeout)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('click', skip)
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (done) return null

  return (
    <div className={`boot ${lifting ? 'is-lifting' : ''}`} role="status" aria-live="polite">
      <div className="boot-inner">
        <pre className="boot-log">
          {LINES.slice(0, shown).map((l, i) => (
            <div key={l.t} className="boot-line">
              <span className="boot-caret">›</span> {l.t}
              {l.ok && <span className="boot-ok">[{l.ok}]</span>}
              {i === shown - 1 && <span className="boot-cursor">_</span>}
            </div>
          ))}
        </pre>
        <div className="boot-bar">
          <span style={{ width: `${(shown / LINES.length) * 100}%` }} />
        </div>
        <div className="boot-skip">press any key to skip</div>
      </div>
    </div>
  )
}
