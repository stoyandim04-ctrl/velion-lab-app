// /recommendations — AI-curated next-actions for the current user.
// Loaded from /api/recommendations (which caches 6h server-side).

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'

export default function RecommendationsScreen() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const token = session?.access_token
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    let active = true
    fetch('/api/recommendations', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return
        setItems(data?.items || [])
        setLoading(false)
      })
      .catch(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  return (
    <Screen background="bg-forest-deep">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
        <button
          onClick={() => navigate(ROUTES.dashboard)}
          className="inline-flex items-center gap-1.5 text-ink-muted text-[12px] mb-5 active:text-ink"
        >
          <ArrowLeft size={14} />
          Към таблото
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-accent" strokeWidth={2.5} />
            <div className="font-display text-accent text-[10.5px] tracking-[0.18em] uppercase">
              AI препоръки
            </div>
          </div>
          <h1 className="font-display font-bold text-ink text-[24px] leading-[1.05] tracking-display uppercase mb-2">
            За следващите 24 часа
          </h1>
          <p className="text-ink-muted text-[13px] leading-[1.55] mb-5">
            Базирано на твоя прогрес — три конкретни стъпки, нищо излишно.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 rounded-full border border-accent/35 border-t-accent animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-4 relative overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_95%_50%,rgba(255,106,0,0.14),transparent_55%)]" />
                <div className="relative flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-accent text-[12px]"
                    style={{ background: 'rgba(255,106,0,0.16)', border: '1px solid rgba(255,106,0,0.4)' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-ink text-[14px] tracking-display uppercase leading-[1.2] mb-1.5">
                      {item.title}
                    </div>
                    <div className="text-ink-muted text-[13px] leading-[1.5]">
                      {item.body}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  )
}
