import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Drop-in tap ripple. Wrap any tappable element with this hook to get
// the expanding-circle feedback that says 'I felt that' on every press.
//
//   const { ripples, onPointerDown } = useRipple()
//   <button onPointerDown={onPointerDown}>
//     ...
//     <RippleLayer ripples={ripples} />
//   </button>
//
// The container must be position: relative + overflow: hidden.

export function useRipple({ color = 'rgba(255,106,0,0.75)' } = {}) {
  const [ripples, setRipples] = useState([])

  const onPointerDown = useCallback((event) => {
    const target = event.currentTarget
    const rect = target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    // Bigger ripple so it covers the full card and is unmistakable
    const size = Math.max(rect.width, rect.height) * 2.4
    const id = Date.now() + Math.random()
    setRipples((curr) => [...curr, { id, x, y, size, color }])
    setTimeout(() => {
      setRipples((curr) => curr.filter((r) => r.id !== id))
    }, 1200)
  }, [color])

  return { ripples, onPointerDown }
}

export function RippleLayer({ ripples }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              left: r.x - r.size / 2,
              top: r.y - r.size / 2,
              width: r.size,
              height: r.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${r.color}, transparent 65%)`,
              mixBlendMode: 'plus-lighter'
            }}
          />
        ))}
      </AnimatePresence>
    </span>
  )
}
