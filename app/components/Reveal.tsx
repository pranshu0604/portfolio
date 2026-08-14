'use client'

import { useInView } from 'react-intersection-observer'

/** Fade + rise once, when scrolled into view. Honors prefers-reduced-motion via CSS. */
export default function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '0px 0px -80px 0px' })
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-visible={inView ? 'true' : 'false'}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
