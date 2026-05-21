import { motion } from 'framer-motion'

export default function Card({
  children,
  selected = false,
  onClick,
  className = '',
  interactive = false
}) {
  const Comp = onClick ? motion.button : motion.div
  return (
    <Comp
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
      className={[
        'w-full text-left rounded-2xl px-5 py-5',
        'bg-forest-card border transition-all',
        selected
          ? 'border-accent shadow-[0_0_24px_rgba(255,106,0,0.35)] bg-[#13241C]'
          : 'border-forest-line',
        interactive && !selected ? 'hover:border-ink-muted' : '',
        className
      ].join(' ')}
    >
      {children}
    </Comp>
  )
}
