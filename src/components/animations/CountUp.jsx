import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useReducedMotion } from '../../lib/animations.js'

// Counts from 0 → `to` over `duration`ms when the element scrolls into view.
// Supports an optional suffix (e.g. ' мин').
export default function CountUp({ to, duration = 1200, suffix = '', className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()
  const [value, setValue] = useState(reduced ? to : 0)

  useEffect(() => {
    if (!inView || reduced) {
      if (reduced) setValue(to)
      return
    }
    const start = performance.now()
    let raf
    const tick = (now) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration, reduced])

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  )
}
