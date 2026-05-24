import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function QuizOption({ label, selected, onSelect }) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      whileHover={!selected ? { y: -1 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={[
        'relative w-full text-left rounded-2xl px-5 py-4 overflow-hidden border transition-all',
        selected
          ? 'border-accent bg-[#13241C] shadow-[0_0_28px_rgba(255,106,0,0.30)]'
          : 'border-forest-line bg-forest-card hover:border-accent/40'
      ].join(' ')}
      style={{ touchAction: 'manipulation' }}
    >
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,rgba(255,106,0,0.18),transparent_55%)] pointer-events-none"
        />
      )}
      <div className="relative flex items-center justify-between gap-4">
        <span
          className={[
            'font-display font-semibold tracking-display uppercase text-[15px] transition-colors',
            selected ? 'text-ink' : 'text-ink'
          ].join(' ')}
        >
          {label}
        </span>
        <motion.span
          animate={
            selected
              ? { scale: 1, opacity: 1 }
              : { scale: 0.85, opacity: 1 }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          className={[
            'flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-colors',
            selected
              ? 'border-accent bg-accent shadow-[0_0_14px_rgba(255,106,0,0.6)]'
              : 'border-forest-line bg-transparent'
          ].join(' ')}
        >
          {selected && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              <Check size={13} strokeWidth={3.5} className="text-forest-deep" />
            </motion.span>
          )}
        </motion.span>
      </div>
    </motion.button>
  )
}
