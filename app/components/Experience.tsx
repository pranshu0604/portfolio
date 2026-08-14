import Reveal from './Reveal'
import LatencySim from './LatencySim'

/**
 * Invsto is a role, not a case study — so it reads as one: a masthead, the
 * work grouped by discipline, and a shipped-things ledger down the side.
 * One bullet (the latency re-architecture) opens into something playable,
 * but it stays a footnote.
 */

const GROUPS = [
  {
    n: '01',
    key: 'AI & agents',
    lede: 'Systems that use models, and the guardrails around them.',
    items: [
      'Built agentic AI platforms across web and CLI using MCP, Azure AI Foundry, and modular RAG architectures.',
      'Developed AI assistants for feature automation using retrieval systems and custom MCP tools.',
      'Built internal agents supporting developer productivity, UAT, and go-to-market workflows through tool orchestration.',
      'Developed secure execution environments for user-defined workflows, with strict runtime isolation and controlled tool access.',
    ],
  },
  {
    n: '02',
    key: 'Backend & distributed systems',
    lede: 'The asynchronous plumbing everything else stands on.',
    items: [
      'Designed asynchronous, event-driven backends with FastAPI, AsyncIO, RabbitMQ, Redis, and ARQ workers.',
      'Re-architected a latency-critical processing pipeline onto distributed workers with Redis coordination and message queues — 8 seconds to sub-second.',
      'Built reusable infrastructure for retrieval, workflow orchestration, task scheduling, tool execution, and agent lifecycle management.',
    ],
  },
  {
    n: '03',
    key: 'Platform & infrastructure',
    lede: 'Owning the boxes, not just the code on them.',
    items: [
      'Owned and contributed to multiple production repositories across AI applications, backend services, developer tooling, and platform infrastructure.',
      'Managed production infrastructure: Linux servers, SSH, NGINX reverse proxies, SSL/TLS, Azure deployments, container registries, and GitHub Actions CI/CD.',
    ],
  },
]

const STACK = [
  'FastAPI', 'AsyncIO', 'RabbitMQ', 'Redis', 'ARQ', 'PostgreSQL',
  'MCP', 'Azure AI Foundry', 'RAG', 'LangChain',
  'Docker', 'NGINX', 'Azure', 'GitHub Actions',
]

export default function Experience() {
  return (
    <section id="experience" data-scene data-theme="base" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        {/* masthead */}
        <Reveal>
          <div className="border-b pb-8" style={{ borderColor: 'var(--line-2)' }}>
            <div className="mono mb-5 text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--sub)' }}>
              Experience
            </div>
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <div>
                <h2 className="font-display text-[clamp(38px,7vw,84px)] font-semibold leading-[0.92] tracking-[-0.03em]">
                  Invsto
                </h2>
                <p className="mt-3 text-[17px]" style={{ color: 'var(--body)' }}>
                  Full Stack &amp; GenAI Engineer
                </p>
              </div>

              <div className="flex items-end gap-8">
                <div>
                  <div className="font-display text-[26px] font-semibold leading-none tracking-[-0.02em]" style={{ color: 'var(--ink)' }}>
                    Jan 2026
                  </div>
                  <div className="mono mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--sub)' }}>
                    → present
                  </div>
                </div>
                <div className="h-10 w-px" style={{ background: 'var(--line-2)' }} />
                <div>
                  <div className="font-display text-[26px] font-semibold leading-none tracking-[-0.02em]" style={{ color: 'var(--ink)' }}>
                    8s → &lt;1s
                  </div>
                  <div className="mono mt-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--sub)' }}>
                    pipeline latency
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-12 md:grid-cols-12">
          {/* left rail */}
          <Reveal className="md:col-span-4">
            <p className="max-w-[36ch] text-[16px] leading-[1.65]" style={{ color: 'var(--body)' }}>
              My day job. I work across production repositories — AI applications, backend
              services, developer tooling, and the infrastructure underneath them.
            </p>

            <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--line)' }}>
              <div className="mono mb-3 text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--sub)' }}>
                What I reach for
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                {STACK.map((s) => (
                  <span
                    key={s}
                    className="mono rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.1em]"
                    style={{ borderColor: 'var(--line)', color: 'var(--faint)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* right: the work */}
          <div className="md:col-span-7 md:col-start-6">
            {GROUPS.map((g, gi) => (
              <Reveal key={g.key} delay={gi * 70}>
                <div className="border-t py-8 first:border-t-0 first:pt-0" style={{ borderColor: 'var(--line)' }}>
                  <div className="mb-5 flex items-baseline gap-4">
                    <span className="mono text-[11px] tracking-[0.16em]" style={{ color: 'var(--accent)' }}>
                      {g.n}
                    </span>
                    <div>
                      <h3 className="font-display text-[clamp(19px,2.3vw,25px)] font-semibold tracking-[-0.01em]">
                        {g.key}
                      </h3>
                      <p className="mt-1 text-[13.5px]" style={{ color: 'var(--faint)' }}>
                        {g.lede}
                      </p>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-3 pl-[calc(11px+1rem)]">
                    {g.items.map((it) => (
                      <li
                        key={it}
                        className="grid grid-cols-[auto_1fr] gap-3 text-[15px] leading-[1.6]"
                        style={{ color: 'var(--body)' }}
                      >
                        <span style={{ color: 'var(--accent)' }}>—</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}

            {/* the latency bullet, made playable — a footnote, not the headline */}
            <Reveal delay={120}>
              <details className="group border-t pt-6" style={{ borderColor: 'var(--line)' }}>
                <summary
                  className="mono flex cursor-pointer list-none items-center gap-2 text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: 'var(--sub)' }}
                  data-cursor="play"
                >
                  <span style={{ color: 'var(--accent)' }}>▸</span>
                  play with the latency re-architecture
                </summary>
                <div className="mt-5">
                  <LatencySim />
                </div>
              </details>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
