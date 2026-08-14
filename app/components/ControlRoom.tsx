'use client'

import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { play } from '../lib/sound'
import { ARTIFACTS, getState, subscribe } from '../lib/store'

/**
 * The interactive layer, placed in the scroll where people actually read
 * instead of hidden in chrome. Each entry says plainly why it exists here —
 * if the reason doesn't hold up, the toy shouldn't be on the site.
 */

type Card = {
  id: string
  glyph: string
  name: string
  what: string
  why: string
  cta: string
  event: string
  detail?: string
  tone?: 'danger' | 'primary'
}

const CARDS: Card[] = [
  {
    id: 'terminal',
    glyph: '❯_',
    name: 'The terminal',
    what: 'A real shell. `ls`, `cat invsto`, `goto hq`, `theme pran`, `play rush`.',
    why: 'It is where I actually work, so it is how this site is actually navigated.',
    cta: 'Open shell',
    event: 'pran:open-terminal',
  },
  {
    id: 'incident',
    glyph: '⚠',
    name: 'Incident drill',
    what: 'Production degrades for real — then you repair three subsystems against a clock.',
    why: 'Being on call is the job. This is the closest a webpage gets to a 3am page.',
    cta: 'Break my system',
    event: 'pran:trigger-incident',
    tone: 'danger',
  },
  {
    id: 'rush',
    glyph: '▸',
    name: 'Packet Rush',
    what: 'Requests flood five lanes. Place workers, hold the queue, survive the wave.',
    why: 'It is the architecture I build every day — queues, workers, backpressure — made playable. Clear a wave and it hands you a piece of my CV.',
    cta: 'Play',
    event: 'pran:open-arcade',
    detail: 'rush',
    tone: 'primary',
  },
  {
    id: 'backpressure',
    glyph: '⌇',
    name: 'Backpressure',
    what: 'You are one worker draining a queue. Every job you consume grows your backlog.',
    why: 'Snake, reframed as the thing it always secretly was: a consumer that dies by its own unbounded queue.',
    cta: 'Drain the queue',
    event: 'pran:open-arcade',
    detail: 'snake',
  },
  {
    id: 'desktop',
    glyph: '▦',
    name: 'Desktop mode',
    what: 'The whole portfolio as a windowed OS — drag, stack, close.',
    why: 'Everything I build ends up being a console someone operates. This site should be one too.',
    cta: 'Boot desktop',
    event: 'pran:open-desktop',
  },
]

export default function ControlRoom() {
  const [stats, setStats] = useState({ unlocked: 0, artifacts: 0, snake: 0, rush: 0, mttr: null as number | null })

  useEffect(() => {
    const off = subscribe((s) =>
      setStats({
        unlocked: s.unlocked.length,
        artifacts: s.artifacts.length,
        snake: s.snakeBest,
        rush: s.rushBest,
        mttr: s.mttrBest,
      }),
    )
    return () => {
      off()
    }
  }, [])

  const fire = (c: Card) => {
    play('open')
    window.dispatchEvent(new CustomEvent(c.event, { detail: c.detail }))
  }

  return (
    <section id="control" data-scene data-theme="base" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <div className="border-b pb-8" style={{ borderColor: 'var(--line-2)' }}>
            <div className="mono mb-5 text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--sub)' }}>
              Control room
            </div>
            <div className="grid gap-6 md:grid-cols-12 md:items-end">
              <h2 className="font-display text-[clamp(30px,5.2vw,60px)] font-semibold leading-[1] tracking-[-0.025em] md:col-span-7">
                This site is a system.
                <br />
                You can operate it.
              </h2>
              <p className="max-w-[40ch] text-[16px] leading-[1.65] md:col-span-5" style={{ color: 'var(--body)' }}>
                I build things people run, not things people look at. So rather than describe
                that, the site lets you run it — and break it.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <button
                type="button"
                onClick={() => fire(c)}
                className={`ctrl-card ctrl-card--${c.tone || 'plain'}`}
                data-cursor={c.cta.toLowerCase()}
              >
                <span className="ctrl-glyph">{c.glyph}</span>
                <span className="ctrl-name">{c.name}</span>
                <span className="ctrl-what">{c.what}</span>
                <span className="ctrl-why">
                  <em>why it&apos;s here —</em> {c.why}
                </span>
                <span className="ctrl-cta">{c.cta} →</span>
              </button>
            </Reveal>
          ))}

          {/* live readout, as content rather than chrome */}
          <Reveal delay={CARDS.length * 60}>
            <div className="ctrl-stats">
              <span className="ctrl-stats-h">Your session</span>
              <dl>
                <div><dt>achievements</dt><dd>{stats.unlocked}/14</dd></div>
                <div><dt>CV artifacts</dt><dd>{stats.artifacts}/{ARTIFACTS.length}</dd></div>
                <div><dt>best wave</dt><dd>{stats.rush || '—'}</dd></div>
                <div><dt>queue drained</dt><dd>{stats.snake || '—'}</dd></div>
                <div><dt>best MTTR</dt><dd>{stats.mttr !== null ? `${stats.mttr.toFixed(1)}s` : '—'}</dd></div>
              </dl>
              <span className="ctrl-stats-foot">
                ⌘K anywhere · ` for the shell
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function hasProgress() {
  const s = getState()
  return s.unlocked.length > 0
}
