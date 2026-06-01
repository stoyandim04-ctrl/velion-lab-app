// Dashboard widget that shows the user's daily motivational line.
// Fetches /api/daily-motivation once per dashboard visit; cached
// server-side per calendar day. Falls back to a soft "Зареждаме…"
// state on network failure; never errors loudly.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../../state/AuthContext.jsx'

export default function DailyMotivationCard() {
  const { session } = useAuth()
  const token = session?.access_token
  const [content, setContent] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!token) return
    let active = true
    fetch('/api/daily-motivation', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return
        if (data?.content) setContent(data.content)
        setLoaded(true)
      })
      .catch(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [token])

  if (!loaded || !content) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.08 }}
      className="w-full mb-3 rounded-2xl border border-accent/25 bg-forest-card/60 px-4 py-3.5 relative overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_5%_50%,rgba(255,106,0,0.16),transparent_55%)]" />
      <div className="relative flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: 'rgba(255,106,0,0.16)',
            border: '1px solid rgba(255,106,0,0.4)'
          }}
        >
          <Sparkles size={13} className="text-accent" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-accent text-[9.5px] tracking-[0.16em] uppercase mb-1">
            Дневна мотивация
          </div>
          <div className="text-ink text-[13.5px] leading-[1.5]">
            {content}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
