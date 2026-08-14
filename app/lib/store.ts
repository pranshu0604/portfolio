'use client'

/**
 * Tiny pub/sub store for the interactive layer: achievements, unlocked
 * portfolio artifacts, high scores and system status. Persists to localStorage
 * so a returning visitor keeps what they found.
 */

export type AchievementId =
  | 'boot'
  | 'terminal'
  | 'palette'
  | 'reader'
  | 'snake_10'
  | 'snake_25'
  | 'incident'
  | 'incident_fast'
  | 'rush_wave3'
  | 'rush_wave6'
  | 'desktop'
  | 'konami'
  | 'sound'
  | 'archivist'

export const ACHIEVEMENTS: Record<AchievementId, { name: string; hint: string }> = {
  boot: { name: 'Cold start', hint: 'Watch the system boot' },
  terminal: { name: 'Shell access', hint: 'Open the terminal' },
  palette: { name: 'Fast hands', hint: 'Use the command palette' },
  reader: { name: 'Due diligence', hint: 'Read a project with `cat`' },
  snake_10: { name: 'Tail end', hint: 'Score 10 in snake' },
  snake_25: { name: 'Ouroboros', hint: 'Score 25 in snake' },
  incident: { name: 'On call', hint: 'Recover from an incident' },
  incident_fast: { name: 'Sub-minute MTTR', hint: 'Recover in under 25 seconds' },
  rush_wave3: { name: 'Backpressure', hint: 'Reach wave 3 in Packet Rush' },
  rush_wave6: { name: 'Horizontally scaled', hint: 'Reach wave 6 in Packet Rush' },
  desktop: { name: 'Window manager', hint: 'Open desktop mode' },
  konami: { name: '↑↑↓↓←→←→BA', hint: 'You know the one' },
  sound: { name: 'Audio enabled', hint: 'Turn the sound on' },
  archivist: { name: 'Archivist', hint: 'Unlock every artifact in Packet Rush' },
}

/** Portfolio content unlocked by playing Packet Rush — the meta layer. */
export type Artifact = {
  id: string
  wave: number
  kind: 'experience' | 'project' | 'skill'
  title: string
  body: string
}

export const ARTIFACTS: Artifact[] = [
  {
    id: 'async',
    wave: 1,
    kind: 'skill',
    title: 'Asynchronous backends',
    body: 'FastAPI, AsyncIO, RabbitMQ, Redis and ARQ workers — the event-driven stack behind everything below.',
  },
  {
    id: 'latency',
    wave: 2,
    kind: 'experience',
    title: '8 seconds → sub-second',
    body: 'At Invsto: re-architected a latency-critical processing pipeline onto distributed workers with Redis coordination and message queues.',
  },
  {
    id: 'agents',
    wave: 3,
    kind: 'experience',
    title: 'Agentic AI platforms',
    body: 'Built agentic platforms across web and CLI using MCP, Azure AI Foundry and modular RAG — plus internal agents for developer productivity, UAT and GTM.',
  },
  {
    id: 'eilms',
    wave: 4,
    kind: 'project',
    title: 'EI-LMS',
    body: 'A full-scale ERP/LMS for the Electronics & Instrumentation department. Self-hosted on NGINX + PM2, serving 500+ daily users and 15,000+ requests a day.',
  },
  {
    id: 'pran',
    wave: 5,
    kind: 'project',
    title: 'P.R.A.N.',
    body: 'Public Relation and Analysis Node — an AI reputation platform with distributed scraping and sentiment-analysis pipelines feeding brand monitoring.',
  },
  {
    id: 'sandbox',
    wave: 6,
    kind: 'experience',
    title: 'Sandboxed execution',
    body: 'Secure execution environments for user-defined workflows, with strict runtime isolation and controlled tool access. Agents with real tools need real boundaries.',
  },
  {
    id: 'infra',
    wave: 7,
    kind: 'skill',
    title: 'Production infrastructure',
    body: 'Linux servers, SSH, NGINX reverse proxies, SSL/TLS, Azure deployments, container registries and GitHub Actions CI/CD.',
  },
]

type State = {
  unlocked: AchievementId[]
  artifacts: string[]
  snakeBest: number
  rushBest: number
  mttrBest: number | null
}

const KEY = 'pran.state.v1'
const EMPTY: State = { unlocked: [], artifacts: [], snakeBest: 0, rushBest: 0, mttrBest: null }

let state: State = { ...EMPTY }
let loaded = false
const subs = new Set<(s: State) => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) }
  } catch {}
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
}

function emit() {
  for (const fn of subs) fn(state)
}

export function getState(): State {
  load()
  return state
}

export function subscribe(fn: (s: State) => void) {
  load()
  subs.add(fn)
  fn(state)
  return () => subs.delete(fn)
}

/** Award an achievement. No-op if already held. Fires a toast event. */
export function unlock(id: AchievementId) {
  load()
  if (state.unlocked.includes(id)) return
  state = { ...state, unlocked: [...state.unlocked, id] }
  save()
  emit()
  window.dispatchEvent(new CustomEvent('pran:achievement', { detail: id }))
}

/** Reveal a portfolio artifact (Packet Rush). */
export function unlockArtifact(id: string) {
  load()
  if (state.artifacts.includes(id)) return
  state = { ...state, artifacts: [...state.artifacts, id] }
  save()
  emit()
  const art = ARTIFACTS.find((a) => a.id === id)
  if (art) window.dispatchEvent(new CustomEvent('pran:artifact', { detail: art }))
  if (state.artifacts.length >= ARTIFACTS.length) unlock('archivist')
}

export function recordScore(game: 'snake' | 'rush', score: number) {
  load()
  const key = game === 'snake' ? 'snakeBest' : 'rushBest'
  if (score > state[key]) {
    state = { ...state, [key]: score }
    save()
    emit()
  }
}

export function recordMttr(seconds: number) {
  load()
  if (state.mttrBest === null || seconds < state.mttrBest) {
    state = { ...state, mttrBest: seconds }
    save()
    emit()
  }
}

export function resetAll() {
  state = { ...EMPTY }
  save()
  emit()
}
