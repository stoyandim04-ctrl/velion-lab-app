import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useReducedMotion } from '../../lib/animations.js'

// Right-edge scroll indicator: faint full-height track + glowing accent
// capsule that glides between top and bottom based on scroll progress.
// Visible from page load — no fade-in — so the user can see it sitting there.
export default function ScrollProgress({ containerRef }) {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ container: containerRef })
  const y = useTransform(scrollYProgress, [0, 1], ['10vh', '78vh'])
  const ySmoothed = useSpring(y, { stiffness: 120, damping: 26 })

  if (reduced) return null

  return (
    <>
      {/* Track */}
      <span
        aria-hidden="true"
        className="absolute right-[10px] top-[10vh] bottom-[12vh] w-[2px] rounded-full bg-forest-line/70 z-30 pointer-events-none"
      />
      {/* Glowing capsule */}
      <motion.div
        className="absolute right-[7px] z-30 pointer-events-none"
        style={{ top: ySmoothed }}
        aria-hidden="true"
      >
        <span className="block w-2 h-14 rounded-full bg-accent shadow-[0_0_22px_rgba(255,106,0,0.9)]" />
      </motion.div>
    </>
  )
}
