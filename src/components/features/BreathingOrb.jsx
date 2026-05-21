import { motion } from 'framer-motion'

export default function BreathingOrb({ size = 220 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-accent/30 blur-2xl"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-6 rounded-full border border-accent/40"
      />
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="absolute inset-12 rounded-full border border-accent/30"
      />
      <div className="absolute inset-16 rounded-full bg-gradient-to-br from-accent/20 to-transparent shadow-[inset_0_0_30px_rgba(255,106,0,0.3)]" />
    </div>
  )
}
