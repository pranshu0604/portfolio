/** Line-drawn app glyphs — a real icon set instead of unicode symbols. */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconAbout() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="12" r="4.4" {...S} />
      <path d="M7.5 25c1.4-4.2 4.6-6.4 8.5-6.4s7.1 2.2 8.5 6.4" {...S} />
      <rect x="4.5" y="4.5" width="23" height="23" rx="5" {...S} opacity="0.35" />
    </svg>
  )
}

export function IconPhotos() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4.5" y="7.5" width="23" height="17" rx="3" {...S} />
      <circle cx="11.5" cy="13.5" r="2" {...S} />
      <path d="M5.5 21.5 12 15.8l4.6 4 3.4-2.6 6.5 5.4" {...S} />
    </svg>
  )
}

export function IconWork() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4.5" y="9.5" width="23" height="15" rx="3" {...S} />
      <path d="M12 9.5V7.8A2.3 2.3 0 0 1 14.3 5.5h3.4A2.3 2.3 0 0 1 20 7.8v1.7" {...S} />
      <path d="M4.5 16h23M13.5 16v2.2h5V16" {...S} />
    </svg>
  )
}

export function IconLms() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 6.5 27 11l-11 4.5L5 11z" {...S} />
      <path d="M9 13.6v6.1c0 1.9 3.1 3.4 7 3.4s7-1.5 7-3.4v-6.1" {...S} />
      <path d="M27 11v6" {...S} />
    </svg>
  )
}

export function IconHq() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 13.5 16 6l10 7.5V25a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 6 25z" {...S} />
      <path d="M12.5 26.5v-7h7v7" {...S} />
      <circle cx="16" cy="13" r="1.6" {...S} />
    </svg>
  )
}

export function IconPran() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="4" {...S} />
      <circle cx="16" cy="16" r="10.5" {...S} opacity="0.45" />
      <path d="M16 5.5V2M16 30v-3.5M5.5 16H2M30 16h-3.5" {...S} />
    </svg>
  )
}

export function IconGames() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3.5" y="9.5" width="25" height="14" rx="6" {...S} />
      <path d="M10 14v4M8 16h4" {...S} />
      <circle cx="21" cy="15.4" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="23.6" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconArtifacts() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 4.5 27 10.5v11L16 27.5 5 21.5v-11z" {...S} />
      <path d="M5 10.5 16 16.5l11-6M16 16.5v11" {...S} opacity="0.55" />
    </svg>
  )
}

export function IconWriting() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M8 5.5h11l5 5V26a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 7 26V7a1.5 1.5 0 0 1 1-1.5z" {...S} />
      <path d="M18.5 5.5v6h5.5M11.5 17h9M11.5 21h6" {...S} />
    </svg>
  )
}

export const ICONS = {
  about: IconAbout,
  writing: IconWriting,
  photos: IconPhotos,
  experience: IconWork,
  eilms: IconLms,
  hq: IconHq,
  pran: IconPran,
  games: IconGames,
  artifacts: IconArtifacts,
} as const
