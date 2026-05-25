import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Spotlight that follows the user's finger/cursor inside a card.
// Use the hook to wire pointer events, render <TouchGlowLayer/> inside
// a relative+overflow:hidden container.

export function useTouchGlow() {
  const [point, setPoint] = useState(null)

  const onPointerMove = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setPoint({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100
    })
  }, [])

  const onPointerLeave = useCallback(() => setPoint(null), [])

  return { point, onPointerMove, onPointerLeave }
}

export function TouchGlowLayer({ point, color = 'rgba(255,106,0,0.18)' }) {
  return (
    <AnimatePresence>
      {point && (
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(180px circle at ${point.x}% ${point.y}%, ${color}, transparent 60%)`
          }}
        />
      )}
    </AnimatePresence>
  )
}
