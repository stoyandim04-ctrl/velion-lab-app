import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, className = '', glow = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`h-1.5 w-full bg-forest-line rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="h-full bg-gradient-to-r from-accent-soft via-accent to-accent-soft"
        style={glow ? { boxShadow: '0 0 22px rgba(255,106,0,0.55)' } : undefined}
      />
    </div>
  )
}
