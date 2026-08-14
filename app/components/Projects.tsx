import Reveal from './Reveal'

type Theme = 'base' | 'eilms' | 'pran' | 'hq'

type Project = {
  id: string
  theme: Theme
  index: string
  name: string
  tagline: string
  kind: string
  period: string
  blurb: string
  highlights: string[]
  metrics: { value: string; label: string }[]
  stack: string[]
  headline: string
  // TODO: drop real screenshots into /public/projects and set `shot`
  shot?: string
  links: { label: string; href: string }[]
  note?: string
}

const PROJECTS: Project[] = [
  {
    id: 'ei-lms',
    theme: 'eilms',
    index: '02',
    name: 'EI-LMS',
    tagline: 'The department, running on rails.',
    kind: 'ERP / LMS · SGSITS',
    period: '2024', // TODO: confirm real dates
    blurb:
      'A full-scale ERP and learning management system for the Electronics & Instrumentation department — attendance, coursework, testing and reporting in one place. Self-hosted and kept alive in production.',
    highlights: [
      'QR-based attendance, assignments, forms, notes distribution and simulator integrations.',
      'An online testing platform with automated evaluation, analytics dashboards and email-delivered results.',
      'Automated the department’s PDF and Excel reporting workflows.',
      'Self-hosted behind NGINX with PM2.',
    ],
    metrics: [
      { value: '500+', label: 'daily users' },
      { value: '15,000+', label: 'requests / day' },
    ],
    stack: ['React', 'Express', 'PostgreSQL', 'Prisma', 'Zustand', 'NGINX', 'PM2'],
    headline: 'In production',
    shot: '/projects/eilms.png',
    links: [
      { label: 'Live ↗', href: 'https://eilms.vercel.app' },
      { label: 'Client ↗', href: 'https://github.com/pranshu0604/EIClassroom-client' },
      { label: 'Server ↗', href: 'https://github.com/pranshu0604/EIClassroom-server' },
    ],
  },
  {
    id: 'hq',
    theme: 'hq',
    index: '03',
    name: 'HQ',
    tagline: 'A command center for one person.',
    kind: 'Personal life OS · self-hosted · macOS',
    period: '2026',
    blurb:
      'A single-user command center that runs on my own machine against a local SQLite file — job hunt, work, projects, reflections, notes, people, gym, wellbeing. The web app is only half of it: a native macOS shell wraps it in the executive-function layer a browser tab cannot provide, and an Android build is next.',
    highlights: [
      'A floating always-on-top beacon: a wall clock that becomes the running timer the moment a focus session starts. Local state, so it never depends on the server.',
      'Global hotkeys for capture — start a session, catch a stray task, log a rabbit hole mid-focus, or collapse everything to one thing when overwhelmed.',
      'Starting a session flips macOS into Do Not Disturb via Shortcuts and opens the tied workspace; a context shield notices when you slip into a time-sink app and nudges once.',
      'A menu-bar panel with what you are doing right now, what is due next, and what you set aside.',
      'Ships its own MCP server (~45 tools, stdio + streamable HTTP) so Claude, Cursor or ChatGPT can operate it.',
      'A dialectic journal, a polymorphic mention graph, wellbeing targets derived from a profile, and an XP system that rewards effort rather than outcomes.',
    ],
    metrics: [
      { value: 'Local', label: 'sqlite, on device' },
      { value: '~45', label: 'MCP tools' },
      { value: 'macOS', label: 'native · Android next' },
    ],
    stack: ['Next.js 16', 'React 19', 'Electron', 'Tailwind v4', 'Prisma', 'SQLite', 'TipTap', 'MCP'],
    headline: 'local · sqlite',
    shot: '/projects/hq.png',
    links: [{ label: 'Source ↗', href: '#' }], // TODO: GitHub URL once pushed
    note: 'No hosted demo by design — it is single-user and keeps your data on your own machine. Clone it and run it yourself.',
  },
  {
    id: 'pran',
    theme: 'pran',
    index: '04',
    name: 'P.R.A.N.',
    tagline: 'Reputation. Engineered.',
    kind: 'Public Relation and Analysis Node',
    period: '2025', // TODO: confirm real dates
    blurb:
      'An AI-powered online reputation management platform. It scrapes and watches what the internet is saying, runs sentiment analysis over it, and turns that into brand monitoring and audience-growth recommendations — presented as a HUD console.',
    highlights: [
      'Distributed scraping and sentiment-analysis pipelines.',
      'RAG-based analysis workflows feeding growth recommendations and brand monitoring.',
      'Modular backend services and scalable dashboards with clear API boundaries.',
    ],
    metrics: [],
    stack: ['FastAPI', 'Next.js', 'Playwright', 'Redis', 'RAG'],
    headline: 'ACCESS_GRANTED',
    shot: '/projects/pran.png',
    links: [
      { label: 'Live ↗', href: 'https://orm-pran.vercel.app/' },
      { label: 'Source ↗', href: '#' }, // TODO
    ],
  },
]

function Frame({ shot, headline, theme }: { shot?: string; headline: string; theme: Theme }) {
  return (
    <div className={`shot-frame relative overflow-hidden ${theme === 'pran' ? 'hud-brackets' : ''}`}>
      {theme === 'pran' && <span className="br-b" />}
      {theme === 'pran' && <span className="scanline" />}

      <div
        className="flex items-center gap-2 border-b px-3.5 py-2.5"
        style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.03)' }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--line-2)' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--line-2)' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--line-2)' }} />
      </div>

      {/* 2:1 matches the cropped screenshots, so nothing is cut off */}
      <div className="relative aspect-[2/1]" style={{ background: 'var(--paper-2)' }}>
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(127,127,140,0.10) 0 14px, rgba(127,127,140,0.04) 14px 28px)',
            }}
          >
            <span className="mono rounded bg-black/60 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.1em] text-white">
              Placeholder — needs real screenshot
            </span>
          </div>
        )}
        <span className="mono absolute bottom-3 left-3 rounded bg-black/75 px-2 py-1 text-[10px] font-medium text-white">
          {headline}
        </span>
      </div>
    </div>
  )
}

export default function Projects() {
  return (
    <section id="work">
      {PROJECTS.map((p, i) => (
        <article
          key={p.id}
          id={p.id}
          data-scene
          data-theme={p.theme}
          className={`chrome-${p.theme} relative overflow-hidden py-20 md:py-32`}
        >
          <div className="scene-grid pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="relative mx-auto max-w-[1240px] px-6 md:px-10">
            <Reveal>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b pb-6" style={{ borderColor: 'var(--line)' }}>
                <span className="mono text-[12px] tracking-[0.2em]" style={{ color: 'var(--accent)' }}>
                  {p.index}
                </span>
                <h2 className="scene-title font-display text-[clamp(30px,5.4vw,64px)] font-semibold leading-[1] tracking-[-0.02em]">
                  {p.name}
                </h2>
                <span className="mono text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--sub)' }}>
                  {p.tagline}
                </span>
                <span className="mono ml-auto hidden text-[11px] uppercase tracking-[0.18em] sm:block" style={{ color: 'var(--faint)' }}>
                  {p.kind} · {p.period}
                </span>
              </div>
            </Reveal>

            <div className="mt-12 grid items-start gap-10 md:grid-cols-12 md:gap-12">
              <Reveal className={`md:col-span-5 ${i % 2 === 1 ? 'md:order-2 md:col-start-8' : ''}`}>
                <p className="max-w-[44ch] text-[16px] leading-[1.65]" style={{ color: 'var(--body)' }}>
                  {p.blurb}
                </p>

                <ul className="mt-6 flex flex-col gap-2.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="grid grid-cols-[auto_1fr] gap-3 text-[14.5px] leading-[1.55]" style={{ color: 'var(--sub)' }}>
                      <span style={{ color: 'var(--faint)' }}>—</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                {p.metrics.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-x-9 gap-y-4 border-t pt-6" style={{ borderColor: 'var(--line)' }}>
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <b
                          className="block font-display text-[24px] font-semibold leading-none tracking-[-0.02em]"
                          style={{ color: 'var(--ink)' }}
                        >
                          {m.value}
                        </b>
                        <span className="mono mt-2 block text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--sub)' }}>
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mono mt-6 flex flex-wrap gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--faint)' }}>
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="border px-2 py-1"
                      style={{ borderColor: 'var(--line)', borderRadius: p.theme === 'pran' ? 2 : 6 }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {(p.links.length > 0 || p.note) && (
                  <div className="mt-7 flex flex-wrap items-center gap-2.5">
                    {p.links.map((l) => (
                      <a key={l.label} href={l.href} className="pill !px-4 !py-2 !text-[13px]">
                        {l.label}
                      </a>
                    ))}
                    {p.note && (
                      <span
                        className="mono max-w-[38ch] text-[11px] leading-[1.55]"
                        style={{ color: 'var(--faint)' }}
                      >
                        {p.note}
                      </span>
                    )}
                  </div>
                )}
              </Reveal>

              <Reveal className={`md:col-span-7 ${i % 2 === 1 ? 'md:order-1 md:col-start-1' : ''}`} delay={80}>
                <div data-flood-origin>
                  <Frame shot={p.shot} headline={p.headline} theme={p.theme} />
                </div>
              </Reveal>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}
