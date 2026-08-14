'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { play } from '../lib/sound'
import { setSoundOn } from '../lib/sound'
import { unlock } from '../lib/store'

type Cmd = { id: string; label: string; group: string; hint?: string; run: () => void }

function scrollTo(sel: string) {
  const el = document.querySelector(sel)
  if (!el) return
  const lenis = window.__lenis
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -20, duration: 1.1 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

const fire = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }))

/** ⌘K / Ctrl+K — the discoverable front door to everything the site can do. */
export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Cmd[] = useMemo(
    () => [
      { id: 'rush', group: 'play', label: 'Play Packet Rush', hint: 'unlocks my CV as you go', run: () => fire('pran:open-arcade', 'rush') },
      { id: 'snake', group: 'play', label: 'Play Snake', run: () => fire('pran:open-arcade', 'snake') },
      { id: 'arcade', group: 'play', label: 'Open the arcade', run: () => fire('pran:open-arcade') },
      { id: 'incident', group: 'play', label: 'Break my system', hint: 'incident mode', run: () => fire('pran:trigger-incident') },
      { id: 'desktop', group: 'play', label: 'Open desktop mode', run: () => fire('pran:open-desktop') },

      { id: 'exp', group: 'go', label: 'Experience — Invsto', run: () => scrollTo('#experience') },
      { id: 'work', group: 'go', label: 'Projects', run: () => scrollTo('#work') },
      { id: 'eilms', group: 'go', label: 'EI-LMS', run: () => scrollTo('#ei-lms') },
      { id: 'hq', group: 'go', label: 'HQ — personal command center', run: () => scrollTo('#hq') },
      { id: 'pran', group: 'go', label: 'P.R.A.N.', run: () => scrollTo('#pran') },
      { id: 'writing', group: 'go', label: 'Writing', run: () => scrollTo('#writing') },
      { id: 'approach', group: 'go', label: 'How I build', run: () => scrollTo('#approach') },
      { id: 'contact', group: 'go', label: 'Contact', run: () => scrollTo('#contact') },

      { id: 'terminal', group: 'system', label: 'Open terminal', hint: '`', run: () => fire('pran:open-terminal') },
      { id: 'tbase', group: 'system', label: 'Theme: base', run: () => document.documentElement.setAttribute('data-theme', 'base') },
      { id: 'teilms', group: 'system', label: 'Theme: EI-LMS', run: () => document.documentElement.setAttribute('data-theme', 'eilms') },
      { id: 'thq', group: 'system', label: 'Theme: HQ', run: () => document.documentElement.setAttribute('data-theme', 'hq') },
      { id: 'tpran', group: 'system', label: 'Theme: P.R.A.N.', run: () => document.documentElement.setAttribute('data-theme', 'pran') },
      { id: 'son', group: 'system', label: 'Sound on', run: () => setSoundOn(true) },
      { id: 'soff', group: 'system', label: 'Sound off', run: () => setSoundOn(false) },
      { id: 'mail', group: 'system', label: 'Email me', run: () => { window.location.href = 'mailto:pranshu0604@gmail.com' } },
      { id: 'gh', group: 'system', label: 'GitHub', run: () => window.open('https://github.com/pranshu0604', '_blank') },
      { id: 'li', group: 'system', label: 'LinkedIn', run: () => window.open('https://linkedin.com/in/pranshuaf', '_blank') },
      { id: 'x', group: 'system', label: 'X — @notoriouspran', run: () => window.open('https://x.com/notoriouspran', '_blank') },
    ],
    [],
  )

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return commands
    return commands.filter((c) => (c.label + ' ' + c.group + ' ' + (c.hint || '')).toLowerCase().includes(s))
  }, [q, commands])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        setQ('')
        setIdx(0)
        play('open')
      } else if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      unlock('palette')
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  useEffect(() => setIdx(0), [q])

  if (!open) return null

  const exec = (c: Cmd) => {
    setOpen(false)
    play('ok')
    c.run()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && filtered[idx]) { e.preventDefault(); exec(filtered[idx]) }
  }

  let lastGroup = ''

  return (
    <div className="pal-scrim" onClick={() => setOpen(false)}>
      <div className="pal" role="dialog" aria-label="Command palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="pal-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="type a command…  (games, sections, theme)"
          aria-label="Command"
          spellCheck={false}
        />
        <ul className="pal-list">
          {filtered.map((c, i) => {
            const head = c.group !== lastGroup ? ((lastGroup = c.group), c.group) : null
            return (
              <li key={c.id}>
                {head && <div className="pal-group">{head}</div>}
                <button
                  type="button"
                  className={`pal-item ${i === idx ? 'is-active' : ''}`}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => exec(c)}
                >
                  <span>{c.label}</span>
                  {c.hint && <em>{c.hint}</em>}
                </button>
              </li>
            )
          })}
          {!filtered.length && <li className="pal-empty">nothing matches that.</li>}
        </ul>
        <div className="pal-foot">↑↓ navigate · ↵ run · esc close</div>
      </div>
    </div>
  )
}
