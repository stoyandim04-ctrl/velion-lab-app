import { motion } from 'framer-motion'

export default function Card({
  children,
  selected = false,
  onClick,
  className = '',
  interactive = false,
  density = 'comfy' // 'comfy' | 'compact'
}) {
  const Comp = onClick ? motion.button : motion.div
  const isInteractive = interactive || Boolean(onClick)

  return (
    <Comp
      onClick={onClick}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      whileHover={onClick && !selected ? { y: -1 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={[
        'relative w-full text-left rounded-2xl overflow-hidden',
        density === 'compact' ? 'px-4 py-3.5' : 'px-5 py-5',
        'bg-forest-card border transition-all',
        selected
          ? 'border-accent shadow-[0_0_30px_rgba(255,106,0,0.32)] bg-[#13241C]'
          : 'border-forest-line',
        isInteractive && !selected ? 'hover:border-accent/40' : '',
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
