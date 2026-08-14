'use client'

import { useEffect } from 'react'
import { play } from '../lib/sound'
import { unlock } from '../lib/store'

const KONAMI = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a',
]

/** Konami code + a console note for anyone who opens devtools. */
export default function EasterEggs() {
  useEffect(() => {
    let seq: string[] = []
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      seq.push(e.key.toLowerCase())
      if (seq.length > KONAMI.length) seq = seq.slice(-KONAMI.length)
      if (seq.length === KONAMI.length && seq.every((k, i) => k === KONAMI[i])) {
        seq = []
        play('ok')
        unlock('konami')
        document.documentElement.classList.add('konami')
        window.setTimeout(() => document.documentElement.classList.remove('konami'), 4900)
        // eslint-disable-next-line no-console
        console.log('%c↑↑↓↓←→←→BA — you found it. try `run snake` in the terminal (` to open).', 'color:#6a5cff;font-weight:bold')
      }
    }
    window.addEventListener('keydown', onKey)

    // eslint-disable-next-line no-console
    console.log(
      '%cpranshu.system%c\nPoking around? Good.\nPress ` (backtick) for a terminal. Try: help, cat ei-lms, run snake.',
      'color:#6a5cff;font-size:16px;font-weight:bold',
      'color:#8b8f9a;font-size:12px',
    )

    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return null
}
