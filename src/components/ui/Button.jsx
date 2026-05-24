import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

// Variants control the visual treatment. Sizes control vertical density.
// All variants share the same motion language so taps feel consistent.
const VARIANTS = {
  primary: {
    base: 'bg-accent text-forest-deep',
    glow: 'shadow-[0_0_36px_rgba(255,106,0,0.45)]',
    hoverGlow: 'shadow-[0_0_48px_rgba(255,106,0,0.6)]'
  },
  outline: {
    base: 'bg-transparent text-ink border border-forest-line',
    glow: '',
    hoverGlow: 'border-ink-muted'
  },
  accentSoft: {
    base: 'bg-accent/10 text-accent border border-accent/40',
    glow: '',
    hoverGlow: 'bg-accent/15'
  },
  ghost: {
    base: 'bg-forest-card/60 text-ink-muted border border-forest-line',
    glow: '',
    hoverGlow: 'text-ink border-ink-muted'
  },
  danger: {
    base: 'bg-red-500/15 text-red-300 border border-red-500/40',
    glow: '',
    hoverGlow: 'bg-red-500/20'
  }
}

const SIZES = {
  lg: { padding: 'min-h-[56px] px-5', text: 'text-[13px]', iconGap: 'gap-2' },
  md: { padding: 'min-h-[48px] px-4', text: 'text-[12.5px]', iconGap: 'gap-2' },
  sm: { padding: 'min-h-[40px] px-3.5', text: 'text-[11.5px]', iconGap: 'gap-1.5' }
}

export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = true,
  className = '',
  iconLeft = null,
  iconRight = null
}) {
  const v = VARIANTS[variant] || VARIANTS.primary
  const s = SIZES[size] || SIZES.lg
  const isLocked = disabled || loading

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isLocked}
      whileTap={isLocked ? {} : { scale: 0.97 }}
      whileHover={isLocked ? {} : { y: -1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={[
        'relative font-display font-bold tracking-display uppercase rounded-2xl',
        'inline-flex items-center justify-center transition-all overflow-hidden',
        s.padding,
        s.text,
        s.iconGap,
        v.base,
        v.glow,
        !isLocked && 'hover:' + v.hoverGlow,
        fullWidth ? 'w-full' : '',
        isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      ].filter(Boolean).join(' ')}
      style={{ touchAction: 'manipulation' }}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={16} strokeWidth={2.6} />
          <span>Обработка…</span>
        </>
      ) : (
        <>
          {iconLeft}
          <span>{children}</span>
          {iconRight}
        </>
      )}
    </motion.button>
  )
}
