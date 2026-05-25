import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../lib/animations.js'

// Ambient amber particles drifting upward — pure CSS/SVG transforms, GPU friendly.
// Sized for mobile (small count, low opacity) so it never costs FPS.
export default function ParticleField({ count = 14, className = '' }) {
  const reduced = useReducedMotion()
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 4,
        x: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 8,
        opacity: 0.25 + Math.random() * 0.45
      })),
    [count]
  )

  if (reduced) return null

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '110%', opacity: 0 }}
          animate={{
            y: '-15%',
            opacity: [0, p.opacity, p.opacity, 0]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            opacity: { times: [0, 0.15, 0.85, 1] }
          }}
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: '#FF6A00',
            boxShadow: `0 0 ${p.size * 3}px rgba(255,106,0,0.6)`
          }}
          className="absolute rounded-full"
        />
      ))}
    </div>
  )
}
