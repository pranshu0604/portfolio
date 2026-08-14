import Link from 'next/link'
import Reveal from './Reveal'
import { POSTS, readingTime } from '../data/posts'

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Writing() {
  return (
    <section id="writing" data-scene data-theme="base" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-8" style={{ borderColor: 'var(--line-2)' }}>
            <div>
              <div className="mono mb-5 text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--sub)' }}>
                Writing
              </div>
              <h2 className="font-display text-[clamp(30px,5.2vw,60px)] font-semibold leading-[1] tracking-[-0.025em]">
                Notes from the queue.
              </h2>
            </div>
            <p className="max-w-[38ch] text-[15.5px] leading-[1.6]" style={{ color: 'var(--body)' }}>
              Mostly about the unglamorous half of the job — latency, retrieval, and the
              boundaries you put around things that can act on their own.
            </p>
          </div>
        </Reveal>

        <ol className="mt-4">
          {POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 50}>
              <li>
                <Link href={`/writing/${p.slug}`} className="post-row" data-cursor="read">
                  <span className="post-idx mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="post-main">
                    <span className="post-title">{p.title}</span>
                    <span className="post-dek">{p.dek}</span>
                  </span>
                  <span className="post-meta mono">
                    <span className="post-tag">{p.tag}</span>
                    <span>{fmt(p.date)}</span>
                    <span>{readingTime(p)} min</span>
                  </span>
                  <span className="post-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
