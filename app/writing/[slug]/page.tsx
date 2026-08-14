import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { POSTS, getPost, readingTime } from '../../data/posts'

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Pranshu Pandey`,
    description: post.dek,
    openGraph: { title: post.title, description: post.dek, type: 'article' },
  }
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const idx = POSTS.findIndex((p) => p.slug === slug)
  const next = POSTS[(idx + 1) % POSTS.length]

  return (
    <main className="content">
      <div className="post-topbar">
        <Link href="/" className="post-brand">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Pranshu Pandey
        </Link>
        <Link href="/#writing" className="post-back mono">
          ← all writing
        </Link>
      </div>

      <article className="post">
        <div className="post-wrap">
          <header className="post-head">
            <div className="mono post-head-meta">
              <span className="post-tag">{post.tag}</span>
              <span>{fmt(post.date)}</span>
              <span>{readingTime(post)} min read</span>
            </div>
            <h1>{post.title}</h1>
            <p className="post-dek-lg">{post.dek}</p>
          </header>

          <div className="post-body">
            {post.body.map((b, i) => {
              if (b.t === 'h') return <h2 key={i}>{b.c}</h2>
              if (b.t === 'p') return <p key={i}>{b.c}</p>
              if (b.t === 'quote') return <blockquote key={i}>{b.c}</blockquote>
              if (b.t === 'ul')
                return (
                  <ul key={i}>
                    {b.c.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                )
              return (
                <pre key={i} className="post-code">
                  <span className="post-code-lang mono">{b.lang}</span>
                  <code>{b.c}</code>
                </pre>
              )
            })}
          </div>

          <footer className="post-foot">
            <div>
              <span className="mono post-foot-h">Next</span>
              <Link href={`/writing/${next.slug}`} className="post-next">
                {next.title} →
              </Link>
            </div>
            <Link href="/#contact" className="pill">
              Get in touch
            </Link>
          </footer>
        </div>
      </article>
    </main>
  )
}
