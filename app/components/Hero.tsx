import Nav from './Nav'
import Portrait from './Portrait'

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="grid grid-cols-[34px_1fr] items-center gap-3.5 border-t border-line py-[18px] last:border-b">
      <span className="h-[34px] w-[34px] text-accent">{icon}</span>
      <div>
        <b className="block font-display text-[26px] font-semibold leading-none tracking-[-0.02em] text-ink">
          {value}
        </b>
        <span className="mt-[3px] block text-[12.5px] leading-[1.25] text-sub">{label}</span>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="top" data-scene data-theme="base" className="px-3 pt-3 sm:px-5 sm:pt-5 md:px-7 md:pt-7">
      <div className="panel mx-auto max-w-[1240px] overflow-hidden">
        <Nav />

        <div className="grid items-center gap-6 px-5 pb-8 pt-2 sm:px-8 md:grid-cols-[1.02fr_1.25fr_0.78fr] md:gap-4 md:px-11 md:pb-14">
          {/* LEFT — copy */}
          <div className="order-2 md:order-1">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-white px-3 py-[7px] text-[13px] font-medium text-[#44444c]">
              <span className="h-2 w-2 rounded-full bg-good shadow-[0_0_0_3px_rgba(31,184,114,0.18)]" />
              Currently building at Invsto
            </div>
            <h1 className="font-display text-[clamp(42px,5.6vw,76px)] font-semibold leading-[0.96] tracking-[-0.025em]">
              Built to
              <br />
              hold up
              <br />
              <span className="text-sub">under load.</span>
            </h1>
            <p className="mt-[22px] max-w-[34ch] text-[17px] leading-[1.5] text-sub">
              Backend &amp; AI engineer. I build asynchronous, event-driven systems and the agentic
              AI platforms that run on top of them.
            </p>
            <div className="mt-7 flex items-center gap-3">
              <a href="#experience" className="btn-accent" data-cursor="scroll">See the work →</a>
              <a
                href="#approach"
                className="font-semibold text-ink underline decoration-1 underline-offset-4"
              >
                How I build
              </a>
            </div>
          </div>

          {/* CENTER — analyzed portrait */}
          <div data-flood-origin className="relative order-1 mx-auto w-full max-w-[440px] self-end md:order-2">
            <div
              className="pointer-events-none absolute inset-[6%_4%_-2%_4%] blur-[6px]"
              style={{ background: 'radial-gradient(60% 60% at 50% 40%, rgba(106,92,255,0.16), transparent 70%)' }}
              aria-hidden="true"
            />
            <Portrait normalSrc="/avatar-normal.png" techSrc="/avatar-tech.png" />

            {/* scanner annotations */}
            <div className="scan" style={{ left: '44%', top: '16%', width: 118, height: 74 }}>
              <div className="frame" />
              <span className="box tl" />
              <span className="box br" />
              <span className="lab" style={{ top: -10, left: '104%' }}>
                Distributed systems<span className="sub">architecture</span>
              </span>
            </div>
            <div className="scan" style={{ left: '6%', top: '40%', width: 96, height: 64 }}>
              <div className="frame" />
              <span className="box tl" />
              <span className="box br" />
              <span className="lab" style={{ top: -12, right: '104%', textAlign: 'right' }}>
                Ships to prod<span className="sub">reliability</span>
              </span>
            </div>
            <div className="scan" style={{ left: '50%', top: '62%', width: 150, height: 80 }}>
              <div className="frame" />
              <span className="box tl" />
              <span className="box br" />
              <span className="lab" style={{ bottom: -14, left: '100%' }}>
                Agentic AI<span className="sub">MCP · RAG</span>
              </span>
            </div>
          </div>

          {/* RIGHT — stats */}
          <div className="order-3 flex flex-wrap gap-x-4 self-center md:flex-col md:flex-nowrap">
            <div className="min-w-[150px] flex-1 md:flex-none">
              <Stat
                value="500+"
                label="daily users on EI-LMS, self-hosted"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                }
              />
            </div>
            <div className="min-w-[150px] flex-1 md:flex-none">
              <Stat
                value="15k+"
                label="requests / day it serves"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 18V9M9 18V5M14 18v-7M19 18V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                }
              />
            </div>
            <div className="min-w-[150px] flex-1 md:flex-none">
              <Stat
                value="Jan 2026"
                label="Full Stack & GenAI eng. at Invsto"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 4v16M4 9h4" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>

        {/* footer strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4 text-[13px] font-medium text-sub sm:px-8 md:px-11">
          <a href="#control" className="mono text-[12px] tracking-[0.04em] transition-colors hover:text-accent">
            ▸ this site is playable — <span className="underline underline-offset-4">try it</span>
          </a>
          <div className="mono flex flex-wrap gap-6 text-[12px] tracking-[0.04em] text-[#8a8a92]">
            <span><b className="font-semibold text-ink">Invsto</b> · experience</span>
            <span><b className="font-semibold text-ink">EI-LMS</b> · ERP / LMS</span>
            <span><b className="font-semibold text-ink">HQ</b> · life OS</span>
            <span><b className="font-semibold text-ink">P.R.A.N.</b> · reputation</span>
          </div>
          <a href="#experience">↓ scroll</a>
        </div>
      </div>
    </section>
  )
}
