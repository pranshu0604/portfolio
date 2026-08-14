'use client'

import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import { play } from '../lib/sound'

/**
 * The learning years. Kept deliberately quiet — folded away by default — because
 * the point is the distance between these and the work above, not the work itself.
 */

type Early = {
  id: string
  name: string
  year: string
  what: string
  learned: string
  shot: string
  stack: string[]
  href: string
}

// TODO: confirm years
const EARLY: Early[] = [
  {
    id: 'jobjolt',
    name: 'JobJolt',
    year: '2024',
    href: 'https://job-jolt-six.vercel.app/',
    what: 'A two-sided hiring platform — post work, apply to it, manage the process from both ends.',
    learned:
      'My first time modelling two different users against one database, and the first time I found out what happens when auth is an afterthought.',
    shot: '/projects/early/jobjolt.png',
    stack: ['React', 'Node', 'Express', 'MongoDB'],
  },
  {
    id: 'blogbreeze',
    name: 'BlogBreeze',
    year: '2024',
    href: 'https://blogbreeze-omega.vercel.app/',
    what: 'A blogging app: write, publish, read. A rich text editor and everything around it.',
    learned:
      'Where I learned that storing user-authored content is a much harder problem than rendering it.',
    shot: '/projects/early/blogbreeze.png',
    stack: ['React', 'Node', 'Express', 'MongoDB'],
  },
]

export default function EarlyWork() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) play('open')
  }, [open])

  return (
    <section id="early" data-scene data-theme="base" className="relative pb-20 md:pb-28">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <div className="border-t pt-8" style={{ borderColor: 'var(--line)' }}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="early-toggle"
              aria-expanded={open}
              aria-controls="early-panel"
              data-cursor={open ? 'close' : 'open'}
            >
              <span className="early-chev" aria-hidden="true">
                {open ? '−' : '+'}
              </span>
              <span className="early-toggle-text">
                <span className="early-toggle-h">Before any of this</span>
                <span className="early-toggle-sub">
                  {EARLY.length} apps from when I was still learning to build for the web
                </span>
              </span>
              <span className="mono early-toggle-cta">{open ? 'hide' : 'show'}</span>
            </button>
          </div>
        </Reveal>

        <div id="early-panel" className={`early-panel ${open ? 'is-open' : ''}`} aria-hidden={!open}>
          <div className="early-inner">
            <p className="early-lede">
              I am not going to pretend these are good. They are the apps where I learned what a
              database was for, why auth is not a checkbox, and how much of the work is the part
              nobody sees. Everything above exists because these came first.
            </p>

            <div className="early-grid">
              {EARLY.map((e) => (
                <a
                  key={e.id}
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="early-card"
                  data-cursor="visit"
                  tabIndex={open ? 0 : -1}
                >
                  <div className="early-shot">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.shot} alt={`${e.name} screenshot`} loading="lazy" />
                    <span className="early-visit mono">still live ↗</span>
                  </div>
                  <div className="early-body">
                    <div className="early-head">
                      <h3>{e.name}</h3>
                      <span className="mono early-year">{e.year}</span>
                    </div>
                    <p className="early-what">{e.what}</p>
                    <p className="early-learned">
                      <em>what it taught me —</em> {e.learned}
                    </p>
                    <div className="early-stack mono">
                      {e.stack.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
