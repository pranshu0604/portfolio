import Reveal from './Reveal'

const PRINCIPLES = [
  {
    n: '01',
    title: 'Do the work asynchronously',
    body: 'Most things do not need to happen while someone waits. Queues, workers and event-driven boundaries are how a system stays responsive — and how an eight-second pipeline becomes sub-second.',
  },
  {
    n: '02',
    title: 'It only counts in production',
    body: 'A system is real when people depend on it. That means self-hosting it, watching it at 15k requests a day, and owning the servers, certificates and pipelines underneath.',
  },
  {
    n: '03',
    title: 'Give the AI real tools, and a sandbox',
    body: 'Agents are only as good as what they can reach. I build retrieval, tool execution and lifecycle plumbing — with strict runtime isolation, because an agent with real tools needs real boundaries.',
  },
]

export default function Approach() {
  return (
    <section id="approach" data-scene data-theme="base" className="border-y border-line-2 bg-paper">
      <div className="mx-auto max-w-[1240px] px-6 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <span className="label">Approach</span>
            <h2 className="mt-4 font-display text-[clamp(28px,4vw,44px)] font-semibold leading-[1.05] tracking-[-0.02em]">
              How I build.
            </h2>
            <p id="about" className="mt-6 max-w-[34ch] text-[15.5px] leading-[1.6]" style={{ color: 'var(--sub)' }}>
              I&apos;m Pranshu — a backend and AI engineer who likes the parts of the job that
              don&apos;t demo well: queues, workers, retrieval, the plumbing behind the screen.
              Currently doing that at Invsto.
            </p>
          </Reveal>

          <div className="md:col-span-7 md:col-start-6">
            <ol className="flex flex-col">
              {PRINCIPLES.map((p, i) => (
                <Reveal key={p.n} delay={i * 80}>
                  <li className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-line py-8 last:border-b">
                    <span className="mono pt-1 text-[13px] text-accent">{p.n}</span>
                    <div>
                      <h3 className="font-display text-[clamp(19px,2.2vw,24px)] font-semibold tracking-[-0.01em]">
                        {p.title}
                      </h3>
                      <p className="mt-2.5 max-w-[52ch] text-[15px] leading-[1.6] text-sub">{p.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
