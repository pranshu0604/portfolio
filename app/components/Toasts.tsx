'use client'

import { useEffect, useState } from 'react'
import { ACHIEVEMENTS, unlock, type AchievementId, type Artifact } from '../lib/store'
import { play } from '../lib/sound'

type Toast =
  | { key: number; kind: 'achievement'; name: string; hint: string }
  | { key: number; kind: 'artifact'; title: string; body: string; label: string }

let seq = 0

/** Achievement + unlocked-artifact toasts. */
export default function Toasts() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    const drop = (key: number) =>
      window.setTimeout(() => setItems((l) => l.filter((t) => t.key !== key)), 5200)

    const onAch = (e: Event) => {
      const id = (e as CustomEvent).detail as AchievementId
      const meta = ACHIEVEMENTS[id]
      if (!meta) return
      const key = ++seq
      setItems((l) => [...l, { key, kind: 'achievement', name: meta.name, hint: meta.hint }])
      play('ok')
      drop(key)
    }
    const onArt = (e: Event) => {
      const a = (e as CustomEvent).detail as Artifact
      const key = ++seq
      setItems((l) => [
        ...l,
        { key, kind: 'artifact', title: a.title, body: a.body, label: a.kind },
      ])
      play('ok')
      drop(key)
    }

    const onSoundOn = () => unlock('sound')

    window.addEventListener('pran:achievement', onAch)
    window.addEventListener('pran:artifact', onArt)
    window.addEventListener('pran:sound-on', onSoundOn)
    return () => {
      window.removeEventListener('pran:achievement', onAch)
      window.removeEventListener('pran:artifact', onArt)
      window.removeEventListener('pran:sound-on', onSoundOn)
    }
  }, [])

  if (!items.length) return null

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.key} className={`toast toast--${t.kind}`}>
          {t.kind === 'achievement' ? (
            <>
              <div className="toast-eyebrow">◆ achievement unlocked</div>
              <div className="toast-title">{t.name}</div>
              <div className="toast-body">{t.hint}</div>
            </>
          ) : (
            <>
              <div className="toast-eyebrow">▣ artifact recovered · {t.label}</div>
              <div className="toast-title">{t.title}</div>
              <div className="toast-body">{t.body}</div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
