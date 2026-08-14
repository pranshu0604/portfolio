'use client'

import { useEffect } from 'react'

/**
 * Scanner-reticle cursor: a lagging bracket frame + a precise dot, echoing the
 * hero's annotation boxes. Expands and labels itself over interactive targets.
 * Pointer-fine devices only; disabled under reduced-motion.
 */
export default function Cursor() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dot = document.createElement('div')
    dot.className = 'cur-dot'
    const ring = document.createElement('div')
    ring.className = 'cur-ring'
    ring.innerHTML =
      '<span class="c tl"></span><span class="c tr"></span><span class="c bl"></span><span class="c br"></span><span class="cur-label"></span>'
    const label = ring.querySelector('.cur-label') as HTMLElement
    document.body.append(dot, ring)
    document.documentElement.classList.add('has-cursor')

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
    }

    const loop = () => {
      rx += (mx - rx) * 0.18
      ry += (my - ry) * 0.18
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const SEL = 'a, button, input, textarea, [role="button"], .portrait, canvas, label'
    const onOver = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest(SEL) as HTMLElement | null
      if (!t) return
      ring.classList.add('is-active')
      const cue = t.getAttribute('data-cursor')
      if (cue) {
        label.textContent = cue
        ring.classList.add('has-label')
      }
    }
    const onOut = (e: MouseEvent) => {
      const t = (e.target as HTMLElement).closest(SEL)
      if (!t) return
      ring.classList.remove('is-active', 'has-label')
      label.textContent = ''
    }
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      dot.remove()
      ring.remove()
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return null
}
