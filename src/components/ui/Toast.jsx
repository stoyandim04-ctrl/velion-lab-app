import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function Toast({ message, onDismiss, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onDismiss?.(), duration)
    return () => clearTimeout(t)
  }, [message, duration, onDismiss])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="absolute top-4 left-4 right-4 z-50 pointer-events-none"
        >
          <div className="bg-red-900/90 backdrop-blur-md border border-red-700/50 rounded-xl px-4 py-3 flex items-start gap-3 pointer-events-auto">
            <AlertTriangle size={18} className="text-red-300 shrink-0 mt-0.5" />
            <span className="text-ink text-sm leading-relaxed flex-1">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
