import { motion } from 'framer-motion'
import { useReducedMotion } from '../../lib/animations.js'

// Slow color aurora that drifts behind the dashboard — gives subtle "alive"
// feeling without distracting from content. Two layered radial gradients
// shift position across 12-18s.
export default function AuroraGlow({ className = '' }) {
  const reduced = useReducedMotion()
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 10%, rgba(255,106,0,0.18), transparent 65%)'
        }}
        animate={
          reduced
            ? {}
            : {
                x: ['-15%', '12%', '-15%'],
                y: ['-10%', '15%', '-10%']
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 40% at 80% 80%, rgba(255,138,51,0.16), transparent 65%)'
        }}
        animate={
          reduced
            ? {}
            : {
                x: ['10%', '-12%', '10%'],
                y: ['8%', '-15%', '8%']
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
