import ModeToggle from './ModeToggle'

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-5 py-5 sm:px-8 md:px-11">
      <a href="#top" className="flex items-center gap-2.5">
        <svg className="h-[22px] w-[22px] text-accent" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-display text-[20px] font-semibold tracking-[-0.01em] text-ink">Pranshu Pandey</span>
      </a>

      <div className="hidden items-center gap-8 text-[15px] font-medium md:flex" style={{ color: 'var(--body)' }}>
        <a href="#experience" className="opacity-85 transition hover:text-accent hover:opacity-100">Experience</a>
        <a href="#work" className="opacity-85 transition hover:text-accent hover:opacity-100">Projects</a>
        <a href="#writing" className="opacity-85 transition hover:text-accent hover:opacity-100">Writing</a>
        <a href="#approach" className="opacity-85 transition hover:text-accent hover:opacity-100">Approach</a>
      </div>

      <div className="flex items-center gap-2.5">
        <ModeToggle />
        {/* TODO: point at the real résumé PDF */}
        <a href="/resume.pdf" className="pill hidden lg:inline-flex">Résumé ↗</a>
        <a href="#control" className="pill hidden sm:inline-flex" data-cursor="play">
          <span aria-hidden="true">▸</span> Play with it
        </a>
        <a href="#contact" className="pill pill--ink">Get in touch</a>
      </div>
    </nav>
  )
}
