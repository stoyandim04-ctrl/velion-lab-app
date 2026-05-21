import { motion } from 'framer-motion'

export default function ThemeCard({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="rounded-3xl border border-accent/30 bg-gradient-to-br from-forest-card to-forest p-7 overflow-hidden"
    >
      <p className="font-display font-bold text-ink text-[23px] leading-[1.22] tracking-display">
        {text}
      </p>
    </motion.div>
  )
}
