'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { play } from '../lib/sound'
import { ARTIFACTS, getState, unlock } from '../lib/store'
import { ICONS } from './DesktopIcons'
import { POSTS } from '../data/posts'

type WinId =
  | 'about' | 'experience' | 'eilms' | 'hq' | 'pran'
  | 'artifacts' | 'photos' | 'games' | 'writing'

type Win = { id: WinId; x: number; y: number; z: number; open: boolean; min: boolean }

const APPS: { id: WinId; name: string; group: 'me' | 'work' | 'fun' }[] = [
  { id: 'about', name: 'about', group: 'me' },
  { id: 'writing', name: 'writing', group: 'me' },
  { id: 'photos', name: 'photos', group: 'me' },
  { id: 'experience', name: 'invsto', group: 'work' },
  { id: 'eilms', name: 'ei-lms', group: 'work' },
  { id: 'hq', name: 'hq', group: 'work' },
  { id: 'pran', name: 'p.r.a.n.', group: 'work' },
  { id: 'games', name: 'games', group: 'fun' },
  { id: 'artifacts', name: 'artifacts', group: 'fun' },
]

const CONTENT: Record<WinId, { title: string; lines: string[] }> = {
  about: {
    title: 'about.txt',
    lines: [
      'Pranshu Pandey — Backend | AI Engineer',
      'Indore, India · pranshu0604@gmail.com',
      '',
      'I build asynchronous, event-driven systems and the agentic AI',
      'platforms that run on top of them. Currently Full Stack & GenAI',
      'Engineer at Invsto.',
      '',
      'Languages   Python · TypeScript · JavaScript · SQL · C++',
      'Backend     FastAPI · PostgreSQL · SQLModel · Prisma · Redis',
      '            RabbitMQ · ARQ · AsyncIO · Pydantic',
      'AI          LangChain · MCP · RAG · Agentic systems · Azure AI Foundry',
      'Infra       Azure · Docker · GitHub Actions · NGINX · Linux · CI/CD',
    ],
  },
  experience: {
    title: 'invsto — full stack & genai engineer',
    lines: [
      'January 2026 — present',
      '',
      '· Owned and contributed to multiple production repositories across AI',
      '  applications, backend services, developer tooling and infrastructure.',
      '· Designed asynchronous backends with FastAPI, AsyncIO, RabbitMQ,',
      '  Redis and ARQ workers for event-driven workflows.',
      '· Built agentic AI platforms across web and CLI using MCP, Azure AI',
      '  Foundry and modular RAG architectures.',
      '· Built internal agents for developer productivity, UAT and GTM.',
      '· Developed secure execution environments with strict runtime isolation.',
      '· Re-architected a latency-critical pipeline onto distributed workers —',
      '  8 seconds to sub-second.',
      '· Managed Linux servers, NGINX, SSL/TLS, Azure, ACR and CI/CD.',
    ],
  },
  eilms: {
    title: 'ei-lms — erp / lms',
    lines: [
      'SGSITS · Electronics & Instrumentation',
      '',
      '· Full-scale ERP/LMS built with React, Express, PostgreSQL,',
      '  Prisma and Zustand.',
      '· QR-based attendance, assignments, forms, notes distribution',
      '  and simulator integrations.',
      '· Online testing platform with automated evaluation, analytics',
      '  dashboards and email-delivered results.',
      '· Automated departmental PDF and Excel reporting.',
      '· Self-hosted on NGINX + PM2.',
      '',
      '  500+ daily users · 15,000+ requests/day',
    ],
  },
  pran: {
    title: 'p.r.a.n. — public relation and analysis node',
    lines: [
      '"Reputation. Engineered."',
      '',
      '· AI-powered online reputation management platform.',
      '· Built with FastAPI, Next.js, Playwright, Redis and RAG-based',
      '  analysis workflows.',
      '· Distributed scraping and sentiment-analysis pipelines for',
      '  audience growth recommendations and brand monitoring.',
      '· Modular backend services and scalable dashboards with clear',
      '  API boundaries.',
    ],
  },
  hq: {
    title: 'hq — personal command center',
    lines: [
      'Self-hosted · local SQLite · native macOS · 2026',
      '',
      '· A single-user "life OS" running on my own machine: job hunt,',
      '  work, projects, reflections, notes, people, gym, wellbeing.',
      '',
      'The desktop shell — what a browser tab cannot do:',
      '· A floating always-on-top beacon: a wall clock that becomes the',
      '  running timer the moment a focus session starts.',
      '· Global hotkeys to start a session, capture a stray task, log a',
      '  rabbit hole mid-focus, or collapse to one thing when overwhelmed.',
      '· Sessions flip macOS into Do Not Disturb through Shortcuts and',
      '  open the tied workspace.',
      '· A context shield that notices a time-sink app and nudges once.',
      '· Menu bar: what you are on, what is next, what you set aside.',
      '',
      '· Ships its own MCP server (~45 tools) so Claude, Cursor or',
      '  ChatGPT can read and write it.',
      '· Dialectic journal, polymorphic mention graph, wellbeing targets.',
      '',
      '  Android next — Capacitor wrapper with native widgets.',
      '',
      '  Next.js 16 · React 19 · Electron · Prisma · SQLite · TipTap',
      '',
      '  No hosted demo by design — it is single-user and keeps your',
      '  data on your own machine. Clone it and run it yourself.',
    ],
  },
  artifacts: { title: 'artifacts', lines: [] },
  photos: { title: 'photos', lines: [] },
  games: { title: 'games', lines: [] },
  writing: { title: 'writing', lines: [] },
}

/** A windowed desktop over the site — projects as apps you can open and drag. */
export default function Desktop() {
  const [open, setOpen] = useState(false)
  const [clock, setClock] = useState('')
  const [wins, setWins] = useState<Win[]>([])
  const zTop = useRef(10)
  const drag = useRef<{ id: WinId; dx: number; dy: number } | null>(null)

  useEffect(() => {
    const onOpen = () => {
      setOpen(true)
      unlock('desktop')
      play('open')
      setWins((w) => (w.length ? w : [makeWin('about', 0)]))
    }
    window.addEventListener('pran:open-desktop', onOpen)
    return () => window.removeEventListener('pran:open-desktop', onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const tick = () =>
      setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    tick()
    const id = window.setInterval(tick, 20_000)
    return () => window.clearInterval(id)
  }, [open])

  useEffect(() => {
    if (!open) return
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // spawn clear of the icon rail on the left, and cascade from there
  function makeWin(id: WinId, i: number): Win {
    return { id, x: 196 + (i % 4) * 34, y: 58 + (i % 4) * 30, z: ++zTop.current, open: true, min: false }
  }

  const focus = useCallback((id: WinId) => {
    setWins((w) => w.map((x) => (x.id === id ? { ...x, z: ++zTop.current, min: false } : x)))
  }, [])

  const launch = useCallback(
    (id: WinId) => {
      play('tick')
      setWins((w) => {
        const found = w.find((x) => x.id === id)
        if (found) return w.map((x) => (x.id === id ? { ...x, open: true, min: false, z: ++zTop.current } : x))
        return [...w, makeWin(id, w.length)]
      })
    },
    [],
  )

  // dragging
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const d = drag.current
      if (!d) return
      setWins((w) => w.map((x) => (x.id === d.id ? { ...x, x: e.clientX - d.dx, y: e.clientY - d.dy } : x)))
    }
    const up = () => { drag.current = null }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [])

  if (!open) return null

  const found = getState().artifacts

  return (
    <div className="desk">
      <div className="desk-top">
        <span className="desk-logo" aria-hidden="true" />
        <span className="desk-brand">pranshu.os</span>
        <span className="desk-hint">click an icon · drag windows</span>
        <span className="desk-clock">{clock}</span>
        <button type="button" className="desk-exit" onClick={() => setOpen(false)}>
          exit ⌫
        </button>
      </div>

      <div className="desk-icons">
        {(['me', 'work', 'fun'] as const).map((group) => (
          <div key={group} className="desk-group">
            <span className="desk-group-h">{group}</span>
            {APPS.filter((a) => a.group === group).map((a) => {
              const Glyph = ICONS[a.id]
              return (
                <button
                  key={a.id}
                  type="button"
                  className="desk-icon"
                  onDoubleClick={() => launch(a.id)}
                  onClick={() => launch(a.id)}
                >
                  <span className="desk-glyph">
                    <Glyph />
                  </span>
                  <span>{a.name}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {wins.filter((w) => w.open && !w.min).map((w) => {
        const c = CONTENT[w.id]
        return (
          <div
            key={w.id}
            className="dwin"
            style={{ left: w.x, top: w.y, zIndex: w.z }}
            onMouseDown={() => focus(w.id)}
          >
            <div
              className="dwin-bar"
              onMouseDown={(e) => {
                drag.current = { id: w.id, dx: e.clientX - w.x, dy: e.clientY - w.y }
              }}
            >
              <div className="dwin-lights">
                <button
                  type="button"
                  className="dl dl-close"
                  onClick={() => setWins((ws) => ws.map((x) => (x.id === w.id ? { ...x, open: false } : x)))}
                  aria-label="Close"
                />
                <button
                  type="button"
                  className="dl dl-min"
                  onClick={() => setWins((ws) => ws.map((x) => (x.id === w.id ? { ...x, min: true } : x)))}
                  aria-label="Minimise"
                />
                <span className="dl dl-max" />
              </div>
              <span className="dwin-title">{c.title}</span>
              <span className="dwin-spacer" />
            </div>
            <div className="dwin-body">
              {w.id === 'artifacts' ? (
                found.length ? (
                  <ul className="dwin-arts">
                    {ARTIFACTS.filter((a) => found.includes(a.id)).map((a) => (
                      <li key={a.id}><b>{a.title}</b><span>{a.body}</span></li>
                    ))}
                  </ul>
                ) : (
                  <p className="dwin-empty">
                    Nothing recovered yet. Play Packet Rush in the arcade — each wave you
                    clear releases one of these.
                  </p>
                )
              ) : w.id === 'games' ? (
                <div className="dwin-games">
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('pran:open-arcade', { detail: 'rush' }))}>
                    <b>Packet Rush</b>
                    <span>Route requests, place workers. Each wave recovers a piece of my CV.</span>
                  </button>
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('pran:open-arcade', { detail: 'snake' }))}>
                    <b>Backpressure</b>
                    <span>Drain a queue as one worker — every job you take grows your own backlog.</span>
                  </button>
                  <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('pran:trigger-incident'))}>
                    <b>Incident drill</b>
                    <span>Break production, then repair three subsystems against the clock.</span>
                  </button>
                </div>
              ) : w.id === 'writing' ? (
                <div className="dwin-games">
                  {POSTS.map((p) => (
                    <a key={p.slug} href={`/writing/${p.slug}`}>
                      <b>{p.title}</b>
                      <span>{p.dek}</span>
                    </a>
                  ))}
                </div>
              ) : w.id === 'photos' ? (
                <div className="dwin-photos">
                  {/* TODO: drop images into /public/photos and list them here */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="dwin-photo-slot" />
                  ))}
                  <p className="dwin-empty">
                    Empty for now — photos go in <code>/public/photos</code>.
                  </p>
                </div>
              ) : (
                <pre>{c.lines.join('\n')}</pre>
              )}
            </div>
          </div>
        )
      })}

      <div className="desk-dock">
        {wins.filter((w) => w.open).map((w) => (
          <button key={w.id} type="button" onClick={() => focus(w.id)} className={w.min ? 'is-min' : ''}>
            {CONTENT[w.id].title.split(' ')[0]}
          </button>
        ))}
        <span className="desk-dock-sep" />
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('pran:open-arcade'))}>▸ arcade</button>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('pran:open-terminal'))}>❯ terminal</button>
      </div>
    </div>
  )
}
