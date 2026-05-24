import { motion } from 'framer-motion'

// Premium page transition — gentle slide-up + fade, consistent across all screens.
// The motion timing matches the spring used on buttons/cards so the feel is
// unified across taps and navigations.
const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}

export default function Screen({ children, className = '', background = 'bg-cinema-soft' }) {
  return (
    <motion.div
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex min-h-0 flex-col h-full overflow-hidden ${background} ${className}`}
    >
      {children}
    </motion.div>
  )
}
