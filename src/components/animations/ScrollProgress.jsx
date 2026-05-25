import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useReducedMotion } from '../../lib/animations.js'

// Small orange dot floating on the right edge that tracks the scroll
// position of the parent container. Position is spring-smoothed so it
// 'glides' rather than snaps.
export default function ScrollProgress({ containerRef }) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ container: containerRef })
  const y = useTransform(scrollYProgress, [0, 1], ['12vh', '78vh'])
  const ySmoothed = useSpring(y, { stiffness: 90, damping: 22 })
  const scale = useTransform(scrollYProgress, [0, 0.05, 1], [0.6, 1, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 0.85, 0.85, 0.4])

  if (reduced) return null

  return (
    <motion.div
      className="absolute right-2 z-30 pointer-events-none"
      style={{ top: ySmoothed, scale, opacity }}
      aria-hidden="true"
    >
      <span className="block w-1.5 h-10 rounded-full bg-accent shadow-[0_0_14px_rgba(255,106,0,0.7)]" />
    </motion.div>
  )
}
