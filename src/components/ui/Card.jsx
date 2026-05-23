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
      whileHover={onClick && !selected ? { y: -1 } : undefined}
      transition={{ duration: 0.18 }}
      className={[
        'relative w-full text-left rounded-2xl px-5 py-5 overflow-hidden',
        'bg-forest-card border transition-all',
        selected
          ? 'border-accent shadow-[0_0_28px_rgba(255,106,0,0.32)] bg-[#13241C]'
          : 'border-forest-line',
        interactive && !selected ? 'hover:border-accent/40' : '',
        className
      ].join(' ')}
    >
      {selected && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,106,0,0.14),transparent_55%)] pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </Comp>
  )
}
