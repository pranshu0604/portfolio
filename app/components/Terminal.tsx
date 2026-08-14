'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { play, restoreSound, setSoundOn } from '../lib/sound'
import { unlock } from '../lib/store'
import { POSTS, readingTime } from '../data/posts'

type Line = { kind: 'in' | 'out' | 'err' | 'sys'; text: string }

const PROJECTS: Record<string, string[]> = {
  invsto: [
    'Invsto — Full Stack & GenAI Engineer (Jan 2026 — present)   [experience]',
    'Production repos across AI applications, backend services,',
    'developer tooling and platform infrastructure.',
    '',
    '  ai        agentic platforms (web + CLI) on MCP, Azure AI Foundry, RAG',
    '            AI assistants + internal agents for dev productivity, UAT, GTM',
    '            sandboxed execution for user-defined workflows',
    '  backend   async event-driven systems: FastAPI, AsyncIO, RabbitMQ, Redis, ARQ',
    '            re-architected a latency-critical pipeline: 8s -> sub-second',
    '            reusable retrieval / orchestration / scheduling infrastructure',
    '  infra     Linux, SSH, NGINX, SSL/TLS, Azure, ACR, GitHub Actions CI/CD',
  ],
  'ei-lms': [
    'EI-LMS — ERP / LMS, SGSITS   [project]',
    'A full-scale ERP and learning management system for the Electronics &',
    'Instrumentation department. Self-hosted and kept alive in production.',
    '',
    '  features  QR attendance, assignments, forms, notes, simulator integrations',
    '            online testing w/ automated evaluation + analytics dashboards',
    '            automated PDF and Excel reporting workflows',
    '  users     500+ daily',
    '  traffic   15,000+ requests/day',
    '  stack     React · Express · PostgreSQL · Prisma · Zustand · NGINX · PM2',
  ],
  hq: [
    'HQ — Personal Command Center   [project]',
    'A single-user "life OS" that runs on my own machine against a local',
    'SQLite file: job hunt, work, projects, reflections, notes, people,',
    'gym, wellbeing — plus an assistant that can read and write all of it.',
    '',
    '  desktop   native macOS shell (Electron) — the part a browser cannot do:',
    '            floating always-on-top beacon that becomes a session timer',
    '            menu-bar panel: what you are on, what is next, what you shelved',
    '            focus sessions flip macOS into Do Not Disturb via Shortcuts',
    '            context shield nudges once when you slip into a time sink',
    '  hotkeys   ⌥⌘N start · ⌥⌘K capture · ⌥⌘R rabbit hole',
    '            ⌥⌘O overwhelmed · ⌥⌘Y culture · ⌥⌘B beacon',
    '  next      an Android build (Capacitor + native widgets)',
    '  mcp       ships its own server (~45 tools, stdio + streamable HTTP)',
    '  data      local sqlite, no auth, no analytics, no telemetry',
    '  stack     Next.js 16 · React 19 · Electron · Prisma · TipTap · MCP',
    '',
    '  no hosted demo by design — clone it and run it yourself.',
  ],
  pran: [
    'P.R.A.N. — Public Relation and Analysis Node   [project]',
    '"Reputation. Engineered."',
    'An AI-powered online reputation management platform: distributed scraping',
    'and sentiment analysis feeding brand monitoring and audience-growth',
    'recommendations, presented as a HUD console.',
    '',
    '  pipelines distributed scraping + sentiment analysis',
    '            RAG-based analysis workflows',
    '  stack     FastAPI · Next.js · Playwright · Redis · RAG',
  ],
}

const HELP = [
  'available commands',
  '',
  '  help              this list',
  '  whoami            who is this guy',
  '  ls                list experience + projects',
  '  cat <name>        read one  (invsto | ei-lms | pran)',
  '  goto <section>    scroll somewhere (experience | work | writing | contact)',
  '  posts             list what I have written',
  '  open <slug>       read a post',
  '  theme <name>      repaint the site (base | eilms | pran)',
  '  arcade            ▸ games — snake, packet rush',
  '  play <game>       ▸ launch directly (snake | rush)',
  '  desktop           ▦ open desktop mode',
  '  incident          ⚠ break the system (then fix it)',
  '  fix <thing>       during an incident: workers | queue | cache',
  '  sound <on|off>    blips',
  '  resume            open the résumé',
  '  contact           how to reach me',
  '  clear             wipe the screen',
  '',
  'tip: ↑/↓ for history, tab to complete, ⌘K for the palette.',
]

const COMMANDS = [
  'help', 'whoami', 'ls', 'cat', 'goto', 'theme', 'posts', 'open', 'arcade', 'play',
  'desktop', 'incident', 'fix', 'sound', 'resume', 'contact', 'clear', 'exit', 'sudo',
]

export default function Terminal() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<Line[]>([
    { kind: 'sys', text: 'pranshu.system — type `help` to begin.' },
  ])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [hIdx, setHIdx] = useState(-1)
  const [soundOn, setSoundState] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const push = useCallback((next: Line[]) => setLines((l) => [...l, ...next]), [])

  useEffect(() => {
    setSoundState(restoreSound())
    const onSound = (e: Event) => setSoundState((e as CustomEvent).detail)
    window.addEventListener('pran:sound', onSound)
    return () => window.removeEventListener('pran:sound', onSound)
  }, [])

  // global open/close: ` or ~ toggles, Esc closes, ops bar can request it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'
      if ((e.key === '`' || e.key === '~') && !typing) {
        e.preventDefault()
        setOpen((o) => !o)
        play('open')
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pran:open-terminal', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pran:open-terminal', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      unlock('terminal')
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [open])

  // let other surfaces (palette, incident) print into the shell
  useEffect(() => {
    const onPrint = (e: Event) => {
      const text = (e as CustomEvent).detail as string
      setLines((l) => [...l, { kind: 'sys', text }])
    }
    window.addEventListener('pran:term-print', onPrint)
    return () => window.removeEventListener('pran:term-print', onPrint)
  }, [])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [lines, open])

  const scrollTo = (sel: string) => {
    const el = document.querySelector(sel)
    if (!el) return false
    const lenis = window.__lenis
    if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -20, duration: 1.2 })
    else el.scrollIntoView({ behavior: 'smooth' })
    return true
  }

  function run(raw: string) {
    const cmd = raw.trim()
    if (!cmd) return
    push([{ kind: 'in', text: cmd }])
    setHistory((h) => [cmd, ...h])
    setHIdx(-1)

    const [head, ...rest] = cmd.split(/\s+/)
    const arg = rest.join(' ').toLowerCase()
    const out = (text: string[]) => push(text.map((t) => ({ kind: 'out' as const, text: t })))
    const err = (text: string) => {
      push([{ kind: 'err', text }])
      play('error')
    }

    switch (head.toLowerCase()) {
      case 'help': out(HELP); play('ok'); break
      case 'whoami':
        out([
          'pranshu pandey — backend | ai engineer',
          'async, event-driven backends and the agentic AI platforms on top of them.',
          'full stack & genai engineer @ invsto (jan 2026 — present). indore, india.',
        ])
        play('ok')
        break
      case 'ls':
        out([
          'invsto/     experience · full stack & genai engineer · jan 2026 —',
          'ei-lms/     project · ERP/LMS · 500+ daily users',
          'hq/         project · self-hosted personal life OS',
          'pran/       project · AI reputation management',
        ])
        break
      case 'cat': {
        const key = arg.replace(/\/$/, '').replace(/\./g, '')
        const found = PROJECTS[key] || PROJECTS[arg] || (key === 'prana' ? PROJECTS.pran : undefined)
        if (found) { out(found); unlock('reader'); play('ok') }
        else err(`cat: ${arg || '(nothing)'}: no such entry. try: ls`)
        break
      }
      case 'goto': {
        const map: Record<string, string> = {
          work: '#work', projects: '#work', approach: '#approach', about: '#approach',
          contact: '#contact', top: '#top', home: '#top',
          experience: '#experience', invsto: '#experience',
          writing: '#writing', posts: '#writing', blog: '#writing',
          control: '#control', play: '#control',
          'ei-lms': '#ei-lms', eilms: '#ei-lms', hq: '#hq', pran: '#pran',
        }
        const sel = map[arg]
        if (sel && scrollTo(sel)) { out([`→ ${arg}`]); setOpen(false) }
        else err(`goto: unknown section "${arg}"`)
        break
      }
      case 'theme': {
        if (['base', 'eilms', 'hq', 'pran'].includes(arg)) {
          document.documentElement.setAttribute('data-theme', arg)
          out([`theme → ${arg}`]); play('ok')
        } else err('theme: expected base | eilms | pran')
        break
      }
      case 'sound': {
        if (arg === 'on' || arg === 'off') { setSoundOn(arg === 'on'); out([`sound ${arg}`]) }
        else err('sound: expected on | off')
        break
      }
      case 'resume': out(['opening résumé…']); window.open('/resume.pdf', '_blank'); break
      case 'contact':
        out([
          'email     pranshu0604@gmail.com',
          'github    github.com/pranshu0604',
          'linkedin  linkedin.com/in/pranshuaf',
          'x         @notoriouspran',
          'location  indore, india',
        ])
        break
      case 'posts':
      case 'writing':
      case 'blog':
        out([
          'writing —',
          '',
          ...POSTS.map(
            (p) => `  ${p.slug.padEnd(26)} ${p.tag.padEnd(13)} ${readingTime(p)} min`,
          ),
          '',
          'read one with: open <slug>',
        ])
        play('ok')
        break
      case 'open': {
        const post = POSTS.find((p) => p.slug === arg || p.slug.startsWith(arg))
        if (!arg) { err('open: which post? try: posts'); break }
        if (post) {
          out([`opening “${post.title}”…`])
          window.location.href = `/writing/${post.slug}`
        } else err(`open: no post called "${arg}". try: posts`)
        break
      }
      case 'arcade':
        window.dispatchEvent(new CustomEvent('pran:open-arcade'))
        out(['opening arcade…'])
        setOpen(false)
        play('ok')
        break
      case 'run':
      case 'play': {
        const game = arg === 'rush' || arg === 'packet' || arg === 'packet rush' ? 'rush' : arg === 'snake' ? 'snake' : null
        if (game) {
          window.dispatchEvent(new CustomEvent('pran:open-arcade', { detail: game }))
          setOpen(false)
          play('ok')
        } else err(`play: no game called "${arg}". try: play snake | play rush`)
        break
      }
      case 'desktop':
        window.dispatchEvent(new CustomEvent('pran:open-desktop'))
        setOpen(false)
        play('ok')
        break
      case 'incident':
        window.dispatchEvent(new CustomEvent('pran:trigger-incident'))
        out(['⚠ injecting chaos… good luck.'])
        play('error')
        break
      case 'fix': {
        if (!arg) { err('fix: what? try: fix workers | fix queue | fix cache'); break }
        window.dispatchEvent(new CustomEvent('pran:fix', { detail: arg.split(/\s+/)[0] }))
        break
      }
      case 'scale':
        window.dispatchEvent(new CustomEvent('pran:fix', { detail: 'workers' }))
        break
      case 'restart':
        window.dispatchEvent(new CustomEvent('pran:fix', { detail: arg || 'queue' }))
        break
      case 'flush':
        window.dispatchEvent(new CustomEvent('pran:fix', { detail: 'cache' }))
        break
      case 'clear': setLines([]); break
      case 'exit': setOpen(false); break
      case 'sudo': out(['nice try.']); play('error'); break
      case 'pran': out(['that is the name of the machine you are talking to.']); break
      default:
        err(`command not found: ${head} — try \`help\``)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { run(value); setValue(''); play('key') }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const ni = Math.min(hIdx + 1, history.length - 1)
      if (history[ni] !== undefined) { setHIdx(ni); setValue(history[ni]) }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const ni = hIdx - 1
      if (ni < 0) { setHIdx(-1); setValue('') }
      else { setHIdx(ni); setValue(history[ni]) }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const parts = value.split(/\s+/)
      if (parts.length <= 1) {
        const m = COMMANDS.filter((c) => c.startsWith(parts[0]))
        if (m.length === 1) setValue(m[0] + ' ')
        else if (m.length > 1) push([{ kind: 'out', text: m.join('   ') }])
      } else if (parts[0] === 'cat') {
        const m = Object.keys(PROJECTS).filter((c) => c.startsWith(parts[1] || ''))
        if (m.length === 1) setValue(`cat ${m[0]}`)
      }
    } else play('key')
  }

  return (
    <>
      <div className={`term ${open ? 'is-open' : ''}`} role="dialog" aria-label="Terminal" aria-hidden={!open}>
        <div className="term-bar">
          <span className="mono term-title">pranshu.system — shell</span>
          <div className="term-tools">
            <button type="button" className="mono" onClick={() => setSoundOn(!soundOn)}>
              sound {soundOn ? 'on' : 'off'}
            </button>
            <button type="button" className="mono" onClick={() => setOpen(false)} aria-label="Close terminal">
              esc
            </button>
          </div>
        </div>

        <>
            <div className="term-body" ref={bodyRef}>
              {lines.map((l, i) => (
                <div key={i} className={`term-line term-${l.kind}`}>
                  {l.kind === 'in' && <span className="term-prompt">❯</span>}
                  <span>{l.text || ' '}</span>
                </div>
              ))}
            </div>
            <div className="term-input">
              <span className="term-prompt">❯</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                spellCheck={false}
                autoComplete="off"
                aria-label="Terminal input"
                placeholder="help"
              />
            </div>
        </>
      </div>
    </>
  )
}
