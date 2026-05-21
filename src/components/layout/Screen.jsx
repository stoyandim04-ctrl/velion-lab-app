import { motion } from 'framer-motion'

export default function Screen({ children, className = '', background = 'bg-cinema-soft' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex flex-col h-full overflow-hidden ${background} ${className}`}
    >
      {children}
    </motion.div>
  )
}
