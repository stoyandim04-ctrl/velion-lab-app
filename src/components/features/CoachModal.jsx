// AI Coach chat modal. Bottom-sheet style matching the other
// authenticated drawers. Conversation history is loaded once on open
// from Supabase, new turns append optimistically while the API call is
// in flight, and the daily quota counter is rendered in the header.

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles } from 'lucide-react'
import { useAuth } from '../../state/AuthContext.jsx'
import {
  DAILY_LIMIT,
  fetchCoachHistory,
  fetchTodayUsage,
  sendCoachMessage
} from '../../lib/coach.js'

const STARTERS = [
  'Не успях да направя сесията вчера. Какво да правя днес?',
  'Как да овладея тревожността преди близост?',
  'Какво е най-важното от Модул I?',
  'Имам спад в мотивацията. Помогни.'
]

function MessageBubble({ role, content }) {
  const isAssistant = role === 'assistant'
  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={[
          'max-w-[82%] rounded-2xl px-4 py-3 text-[14px] leading-[1.45]',
          isAssistant
            ? 'bg-forest-card border border-forest-line text-ink'
            : 'bg-accent/15 border border-accent/40 text-ink'
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  )
}

export default function CoachModal({ open, onClose }) {
  const { user, session } = useAuth()
  const userId = user?.id
  const token = session?.access_token

  const [history, setHistory] = useState([])
  const [usage, setUsage] = useState(0)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const listRef = useRef(null)

  useEffect(() => {
    if (!open || !userId) return
    let active = true
    setLoading(true)
    setError('')
    Promise.all([fetchCoachHistory(userId), fetchTodayUsage(userId)]).then(([h, u]) => {
      if (!active) return
      setHistory(h)
      setUsage(u)
      setLoading(false)
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'auto' }), 50)
    })
    return () => {
      active = false
    }
  }, [open, userId])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [history.length, open])

  const send = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || sending || usage >= DAILY_LIMIT) return
    if (!token) {
      setError('Влез в акаунта си отново.')
      return
    }

    const optimistic = { id: `tmp-${Date.now()}`, role: 'user', content: trimmed }
    setHistory((curr) => [...curr, optimistic])
    setDraft('')
    setSending(true)
    setError('')

    try {
      const data = await sendCoachMessage(token, trimmed)
      const reply = { id: `tmp-${Date.now()}-r`, role: 'assistant', content: data.reply }
      setHistory((curr) => [...curr, reply])
      setUsage((u) => u + 1)
    } catch (err) {
      setError(err.message || 'Грешка. Опитай отново.')
      if (err.code === 'quota_exceeded') {
        setUsage(DAILY_LIMIT)
      }
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(draft)
  }

  const remaining = Math.max(0, DAILY_LIMIT - usage)
  const limited = remaining <= 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-forest-deep border-t border-forest-line rounded-t-3xl flex flex-col"
            style={{ height: '88%' }}
          >
            <div className="flex-shrink-0 relative flex items-center justify-between px-5 pt-4 pb-3 bg-forest-deep border-b border-forest-line/60">
              <div className="w-10 h-1 bg-ink-dim/40 rounded-full absolute top-1.5 left-1/2 -translate-x-1/2" />
              <div className="flex items-center gap-2 mt-1">
                <Sparkles size={16} className="text-accent" strokeWidth={2.5} />
                <h2 className="font-display font-bold text-ink text-base tracking-display uppercase">
                  Velion Coach
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-ink-muted active:scale-95"
                aria-label="Затвори"
              >
                <X size={22} />
              </button>
            </div>

            <div className="px-5 py-2 border-b border-forest-line/40 text-ink-dim text-[11.5px] flex items-center justify-between">
              <span>Кратки персонални съвети. Не заместват специалист.</span>
              <span className="text-ink-muted">
                {remaining}/{DAILY_LIMIT} днес
              </span>
            </div>

            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-7 w-7 rounded-full border border-accent/35 border-t-accent animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col gap-3 pt-4">
                  <div className="font-display text-accent text-[10.5px] tracking-[0.16em] uppercase">
                    С какво да помогна?
                  </div>
                  <p className="text-ink-muted text-[13px] leading-[1.55]">
                    Питай за упражненията, мотивацията, нервната система или конкретен ден от протокола.
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        disabled={sending || limited}
                        className="text-left rounded-2xl border border-forest-line bg-forest-card/60 px-4 py-3 text-ink text-[13.5px] leading-[1.4] active:bg-forest-card disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                history.map((m) => <MessageBubble key={m.id} role={m.role} content={m.content} />)
              )}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-forest-card border border-forest-line px-4 py-3 inline-flex items-center gap-2 text-ink-muted text-[13px]">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-muted animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </span>
                    Coach мисли…
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-red-300 text-[12.5px] leading-[1.5]">
                  {error}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-shrink-0 px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] border-t border-forest-line/40 bg-forest-deep"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={limited ? 'Достигна лимита за днес' : 'Питай нещо…'}
                  disabled={limited || sending}
                  maxLength={600}
                  className="flex-1 min-h-[48px] bg-forest-card border border-forest-line rounded-2xl px-4 text-ink placeholder:text-ink-dim focus:outline-none focus:border-accent/60 disabled:opacity-60"
                  style={{ fontSize: 16 }}
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending || limited}
                  className="w-12 h-12 rounded-2xl bg-accent text-forest-deep flex items-center justify-center disabled:opacity-50 active:scale-95"
                >
                  <Send size={18} strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
