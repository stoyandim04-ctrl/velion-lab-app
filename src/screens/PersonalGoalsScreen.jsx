// /my-goals — personal goal tracking. Up to 5 active goals at a time.
// Each goal has title + optional description + optional target date.
// Archived goals stay in the database but render in a separate
// collapsed section. Simple CRUD via Supabase + RLS.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Check, Trash2, Target } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { supabase } from '../lib/supabaseClient.js'

export default function PersonalGoalsScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ title: '', description: '', target_date: '' })

  const refresh = async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setGoals(data || [])
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleAdd = async () => {
    if (!userId || !draft.title.trim()) return
    await supabase.from('user_goals').insert({
      user_id: userId,
      title: draft.title.trim().slice(0, 80),
      description: draft.description.trim().slice(0, 280) || null,
      target_date: draft.target_date || null
    })
    setDraft({ title: '', description: '', target_date: '' })
    setAdding(false)
    refresh()
  }

  const handleArchive = async (id) => {
    await supabase.from('user_goals').update({ archived: true, updated_at: new Date().toISOString() }).eq('id', id)
    refresh()
  }

  const handleDelete = async (id) => {
    await supabase.from('user_goals').delete().eq('id', id)
    refresh()
  }

  const active = goals.filter((g) => !g.archived)
  const archived = goals.filter((g) => g.archived)
  const canAdd = active.length < 5

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

        <h1 className="font-display font-bold text-ink text-[24px] leading-[1.05] tracking-display uppercase mb-1">
          Цели
        </h1>
        <p className="text-ink-muted text-[13px] leading-[1.55] mb-5">
          До 5 активни едновременно. Постави една — започни.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-7 w-7 rounded-full border border-accent/35 border-t-accent animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-2.5 mb-4">
              <AnimatePresence>
                {active.map((g) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="rounded-2xl border border-forest-line bg-forest-card/70 px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-ink text-[13.5px] tracking-display uppercase leading-[1.2] mb-1">
                          {g.title}
                        </div>
                        {g.description && (
                          <div className="text-ink-muted text-[12px] leading-[1.45] mb-1">{g.description}</div>
                        )}
                        {g.target_date && (
                          <div className="font-display text-ink-dim text-[10.5px] tracking-[0.06em]">
                            До {new Date(g.target_date).toLocaleDateString('bg-BG')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleArchive(g.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[color:#3DD68C] active:scale-95"
                          aria-label="Архивирай"
                        >
                          <Check size={14} strokeWidth={2.6} />
                        </button>
                        <button
                          onClick={() => handleDelete(g.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-dim active:scale-95"
                          aria-label="Изтрий"
                        >
                          <Trash2 size={13} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {active.length === 0 && !adding && (
                <div className="rounded-2xl border border-forest-line bg-forest-card/40 px-4 py-6 text-center">
                  <Target size={20} className="mx-auto text-ink-dim mb-2" />
                  <div className="text-ink-muted text-[13px]">
                    Все още нямаш активна цел.
                  </div>
                </div>
              )}
            </div>

            {!adding && canAdd && (
              <button
                onClick={() => setAdding(true)}
                className="w-full rounded-2xl border border-accent/40 bg-accent/8 text-accent font-display text-[12px] font-bold tracking-display uppercase px-5 py-3.5 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Plus size={14} strokeWidth={2.5} />
                Добави цел
              </button>
            )}

            {adding && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-forest-line bg-forest-card px-4 py-4 mb-4"
              >
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Заглавие — кратко и конкретно"
                  maxLength={80}
                  className="w-full bg-transparent border-b border-forest-line px-1 py-2 text-ink text-[15px] placeholder:text-ink-dim focus:outline-none focus:border-accent mb-3"
                  style={{ fontSize: 16 }}
                />
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Описание (по избор)"
                  maxLength={280}
                  rows={2}
                  className="w-full bg-transparent border-b border-forest-line px-1 py-2 text-ink text-[13.5px] placeholder:text-ink-dim focus:outline-none focus:border-accent mb-3 resize-none"
                  style={{ fontSize: 16 }}
                />
                <input
                  type="date"
                  value={draft.target_date}
                  onChange={(e) => setDraft({ ...draft, target_date: e.target.value })}
                  className="w-full bg-transparent border-b border-forest-line px-1 py-2 text-ink text-[14px] focus:outline-none focus:border-accent mb-4"
                  style={{ fontSize: 16 }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAdding(false); setDraft({ title: '', description: '', target_date: '' }) }}
                    className="flex-1 rounded-2xl border border-forest-line bg-forest-card text-ink-muted font-display text-[11.5px] font-bold tracking-display uppercase px-4 py-3"
                  >
                    Откажи
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={!draft.title.trim()}
                    className="flex-1 rounded-2xl bg-accent text-forest-deep font-display text-[11.5px] font-bold tracking-display uppercase px-4 py-3 disabled:opacity-50"
                  >
                    Запази
                  </button>
                </div>
              </motion.div>
            )}

            {archived.length > 0 && (
              <div className="mt-7">
                <div className="font-display text-ink-dim text-[10px] tracking-[0.14em] uppercase mb-2">
                  Архивирани ({archived.length})
                </div>
                <div className="space-y-2 opacity-60">
                  {archived.slice(0, 10).map((g) => (
                    <div key={g.id} className="rounded-2xl border border-forest-line/60 bg-forest-card/40 px-4 py-2.5 flex items-center gap-2">
                      <Check size={12} strokeWidth={2.5} className="text-[color:#3DD68C]" />
                      <div className="font-display text-ink text-[12.5px] truncate">{g.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Screen>
  )
}
