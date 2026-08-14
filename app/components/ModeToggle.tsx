'use client'

import { useEffect, useState } from 'react'
import { play } from '../lib/sound'

/** Light/dark for the site's own palette. Project scenes tint on top of either. */
export default function ModeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem('pran.mode')
    } catch {}
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    const on = saved ? saved === 'dark' : prefers
    setDark(on)
    document.documentElement.setAttribute('data-mode', on ? 'dark' : 'light')
    window.dispatchEvent(new CustomEvent('pran:mode'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-mode', next ? 'dark' : 'light')
    try {
      localStorage.setItem('pran.mode', next ? 'dark' : 'light')
    } catch {}
    window.dispatchEvent(new CustomEvent('pran:mode'))
    play('tick')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`mode-toggle ${className}`}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-cursor={dark ? 'light' : 'dark'}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
