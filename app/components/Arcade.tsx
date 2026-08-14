'use client'

import { useEffect, useState } from 'react'
import Snake from './Snake'
import PacketRush from './PacketRush'
import { ARTIFACTS, getState, subscribe } from '../lib/store'
import { play } from '../lib/sound'

type Game = 'menu' | 'snake' | 'rush'

/** Full-screen arcade. Games are first-class here, not buried behind a command. */
export default function Arcade() {
  const [open, setOpen] = useState(false)
  const [game, setGame] = useState<Game>('menu')
  const [scores, setScores] = useState({ snake: 0, rush: 0, artifacts: [] as string[] })

  useEffect(() => {
    const off = subscribe((s) =>
      setScores({ snake: s.snakeBest, rush: s.rushBest, artifacts: s.artifacts }),
    )
    return () => {
      off()
    }
  }, [])

  useEffect(() => {
    const onOpen = (e: Event) => {
      const which = (e as CustomEvent).detail as Game | undefined
      setGame(which === 'snake' || which === 'rush' ? which : 'menu')
      setOpen(true)
      play('open')
    }
    window.addEventListener('pran:open-arcade', onOpen)
    return () => window.removeEventListener('pran:open-arcade', onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && game === 'menu') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, game])

  if (!open) return null

  const found = getState().artifacts

  return (
    <div className="arcade" role="dialog" aria-label="Arcade">
      <div className="arcade-bar">
        <span className="arcade-title">
          pranshu.system — {game === 'menu' ? 'arcade' : game === 'snake' ? 'backpressure' : 'packet rush'}
        </span>
        <div className="arcade-tools">
          {game !== 'menu' && (
            <button type="button" onClick={() => setGame('menu')}>← games</button>
          )}
          <button type="button" onClick={() => setOpen(false)} aria-label="Close arcade">
            close esc
          </button>
        </div>
      </div>

      <div className="arcade-body">
        {game === 'menu' && (
          <div className="arcade-menu">
            <h2 className="arcade-h">Arcade</h2>
            <p className="arcade-sub">
              Two games. One of them hands you my CV a piece at a time.
            </p>

            <div className="arcade-grid">
              <button type="button" className="game-card game-card--rush" onClick={() => { setGame('rush'); play('ok') }}>
                <span className="game-tag">meta</span>
                <span className="game-name">Packet Rush</span>
                <span className="game-desc">
                  Requests flood in. Place workers, keep the queue from overflowing — every wave
                  you clear recovers a real piece of my experience.
                </span>
                <span className="game-meta">
                  best wave {scores.rush || '—'} · artifacts {found.length}/{ARTIFACTS.length}
                </span>
              </button>

              <button type="button" className="game-card" onClick={() => { setGame('snake'); play('ok') }}>
                <span className="game-tag">systems</span>
                <span className="game-name">Backpressure</span>
                <span className="game-desc">
                  You are one worker draining a queue. Every job you consume extends your
                  backlog — and an unbounded queue eventually eats its own consumer.
                </span>
                <span className="game-meta">best {scores.snake || '—'} jobs drained</span>
              </button>
            </div>

            {found.length > 0 && (
              <div className="arcade-arts">
                <h3>Recovered artifacts</h3>
                <ul>
                  {ARTIFACTS.filter((a) => found.includes(a.id)).map((a) => (
                    <li key={a.id}>
                      <b>{a.title}</b>
                      <span>{a.body}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {game === 'snake' && <Snake onExit={() => setGame('menu')} />}
        {game === 'rush' && <PacketRush onExit={() => setGame('menu')} />}
      </div>
    </div>
  )
}
