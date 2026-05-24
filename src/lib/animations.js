// Centralised animation primitives. Respect prefers-reduced-motion.

import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

// Shared spring profile — matches Button/Card feel across the app.
export const SPRING = { type: 'spring', stiffness: 380, damping: 26 }
export const SOFT_SPRING = { type: 'spring', stiffness: 220, damping: 30 }

// Ease curves
export const EASE_OUT = [0.22, 1, 0.36, 1]
export const EASE_IN_OUT = [0.65, 0, 0.35, 1]

// Stagger container for revealing children one-by-one
export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
}

export const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } }
}

export const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } }
}

export const SCALE_IN = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } }
}
