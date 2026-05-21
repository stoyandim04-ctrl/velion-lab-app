import { motion } from 'framer-motion'

const variants = {
  primary:
    'bg-accent text-forest-deep shadow-[0_0_30px_rgba(255,106,0,0.45)] hover:shadow-[0_0_44px_rgba(255,106,0,0.6)]',
  ghost:
    'bg-transparent text-ink border border-forest-line hover:border-ink-muted',
  subtle: 'bg-forest-card text-ink-muted hover:text-ink'
}

export default function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = true
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { y: -1 }}
      transition={{ duration: 0.15 }}
      className={[
        'font-display font-semibold tracking-display uppercase text-sm',
        'rounded-2xl py-4 px-6 transition-all',
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        variants[variant],
        className
      ].join(' ')}
    >
      {children}
    </motion.button>
  )
}
