import Reveal from './Reveal'

export default function Contact() {
  return (
    <section id="contact" data-scene data-theme="base" className="mx-auto max-w-[1240px] px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="panel overflow-hidden px-7 py-14 md:px-14 md:py-20">
          <div className="grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <span className="label">Contact</span>
              <h2 className="mt-4 font-display text-[clamp(30px,5vw,58px)] font-semibold leading-[1.02] tracking-[-0.025em]">
                Building something that
                <br />
                needs to hold up?
              </h2>
              <p className="mt-6 max-w-[44ch] text-[16px] leading-[1.6] text-sub">
                I&apos;m open to interesting problems — distributed backends, agentic AI systems, or
                the fast-and-reliable end of product engineering.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href="mailto:pranshu0604@gmail.com" className="btn-accent" data-cursor="email">
                  Get in touch →
                </a>
                <a href="/resume.pdf" className="pill">
                  Résumé ↗
                </a>
              </div>
            </div>

            <div className="md:col-span-3 md:col-start-10">
              <div className="mono flex flex-col gap-3 text-[13px] tracking-[0.04em] text-sub md:items-end">
                <a href="https://github.com/pranshu0604" className="transition hover:text-accent">
                  GitHub ↗
                </a>
                <a href="https://linkedin.com/in/pranshuaf" className="transition hover:text-accent">
                  LinkedIn ↗
                </a>
                <a href="https://x.com/notoriouspran" className="transition hover:text-accent">
                  X / @notoriouspran ↗
                </a>
                <span style={{ color: 'var(--faint)' }}>Indore, India</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-[13px] text-faint">
        <span>© {new Date().getFullYear()} Pranshu Pandey</span>
        <span className="mono tracking-[0.04em]">Built from scratch · Next.js</span>
      </footer>
    </section>
  )
}
