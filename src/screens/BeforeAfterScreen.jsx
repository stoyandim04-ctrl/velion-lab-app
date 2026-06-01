// /transformation — Before/After view shown automatically once a user
// finishes the 60-day protocol AND records a 'final' Контрол индекс.
// Pulls the initial + final rows, computes the delta, and presents it
// as the emotional payoff for the program. CTA leads straight into
// downloading the certificate and opening the share modal.

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { ArrowLeft, TrendingUp, FileText, Share2 } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { supabase } from '../lib/supabaseClient.js'
import { TIERS } from '../lib/controlIndex.js'
import { getCachedProfile } from '../lib/profile.js'
import { getCachedGamification } from '../lib/gamification.js'
import ShareCardModal from '../components/features/ShareCardModal.jsx'

function AnimatedScore({ score, color, size = 48 }) {
  const mv = useMotionValue(0)
  const displayed = useTransform(mv, (v) => Math.round(v))
  useEffect(() => {
    const controls = animate(mv, score, { duration: 1.4, ease: [0.22, 1, 0.36, 1] })
    return controls.stop
  }, [mv, score])
  return (
    <motion.span
      className="font-display font-bold tracking-display"
      style={{ color, fontSize: size, textShadow: `0 0 20px ${color}55` }}
    >
      {displayed}
    </motion.span>
  )
}

export default function BeforeAfterScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id

  const [initial, setInitial] = useState(null)
  const [final, setFinal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [certBusy, setCertBusy] = useState(false)

  useEffect(() => {
    let active = true
    if (!userId) {
      setLoading(false)
      return
    }
    ;(async () => {
      const { data } = await supabase
        .from('user_quiz_results')
        .select('id, kind, score, tier, taken_at')
        .eq('user_id', userId)
        .in('kind', ['initial', 'final'])
        .order('taken_at', { ascending: false })
      if (!active) return
      const rows = data || []
      setFinal(rows.find((r) => r.kind === 'final') || null)
      setInitial(rows.find((r) => r.kind === 'initial') || null)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [userId])

  const delta = useMemo(() => {
    if (!initial || !final) return null
    return final.score - initial.score
  }, [initial, final])

  const sharePayload = useMemo(() => {
    if (!userId) return null
    const profile = getCachedProfile(userId)
    const gam = getCachedGamification(userId)
    return {
      displayName: (profile?.name || '').split(/\s+/)[0] || '',
      level: gam.level || 1,
      streak: gam.current_streak || 0,
      completedDays: 60,
      initialScore: initial?.score ?? null,
      finalScore: final?.score ?? null,
      delta,
      controlIndex: final
        ? {
            score: final.score,
            delta,
            tierLabel: TIERS[final.tier]?.label || null
          }
        : null
    }
  }, [userId, initial, final, delta])

  const handleDownloadCertificate = async () => {
    if (!userId || certBusy) return
    setCertBusy(true)
    try {
      const profile = getCachedProfile(userId)
      const gam = getCachedGamification(userId)
      const { generateCertificatePdf } = await import('../lib/certificate.js')
      await generateCertificatePdf({
        fullName: profile?.name || (user?.email ? user.email.split('@')[0] : 'Velion Lab'),
        completedDays: 60,
        level: gam.level || 1,
        controlIndex: initial && final
          ? { initialScore: initial.score, finalScore: final.score, delta }
          : null
      })
    } catch (e) {
      console.warn('[Velion] certificate generation failed:', e?.message)
    } finally {
      setCertBusy(false)
    }
  }

  if (loading) {
    return (
      <Screen background="bg-forest-deep">
        <div className="flex-1 flex items-center justify-center">
          <div className="h-9 w-9 rounded-full border border-accent/35 border-t-accent animate-spin" />
        </div>
      </Screen>
    )
  }

  if (!initial || !final) {
    return (
      <Screen background="bg-forest-deep">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div className="font-display text-accent text-[11px] tracking-[0.16em] uppercase">
            Все още не е готово
          </div>
          <p className="text-ink-muted text-[14px] leading-relaxed max-w-[300px]">
            Финалният тест ще се отвори след като завършиш всички 60 дни и стартираш Контрол индекса отново от /stats.
          </p>
          <button
            onClick={() => navigate(ROUTES.dashboard)}
            className="mt-4 inline-flex items-center gap-1.5 text-accent text-[12px] underline underline-offset-4"
          >
            Към таблото
          </button>
        </div>
      </Screen>
    )
  }

  const initialTier = TIERS[initial.tier]
  const finalTier = TIERS[final.tier]
  const positive = delta != null && delta > 0
  const deltaColor = positive ? '#3DD68C' : delta < 0 ? '#FF4D2A' : '#9CA3AF'

  return (
    <Screen background="bg-forest-deep">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))]">
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
          transition={{ duration: 0.6 }}
        >
          <div className="font-display text-accent text-[10.5px] tracking-[0.18em] uppercase mb-3 text-center">
            Завършен протокол
          </div>
          <h1 className="font-display font-bold text-ink text-[30px] leading-[1.05] tracking-display uppercase text-center mb-8">
            ТВОЯТА
            <br />
            <span className="text-accent">ТРАНСФОРМАЦИЯ</span>
          </h1>
        </motion.div>

        {/* BEFORE / AFTER COMPARISON */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-forest-line bg-forest-card/70 px-5 py-5 mb-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,106,0,0.18),transparent_60%)] pointer-events-none" />
          <div className="relative grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="font-display text-ink-dim text-[9.5px] tracking-[0.16em] uppercase mb-3">
                Преди
              </div>
              <AnimatedScore score={initial.score} color={initialTier?.color || '#9CA3AF'} size={56} />
              <div
                className="mt-3 inline-block px-2.5 py-1 rounded-full font-display text-[9px] font-bold tracking-[0.12em] uppercase"
                style={{
                  color: initialTier?.color,
                  border: `1px solid ${initialTier?.color}55`,
                  background: `${initialTier?.color}10`
                }}
              >
                {initialTier?.label}
              </div>
            </div>

            <div className="text-center">
              <div className="font-display text-accent text-[9.5px] tracking-[0.16em] uppercase mb-3">
                След
              </div>
              <AnimatedScore score={final.score} color={finalTier?.color || '#FF6A00'} size={56} />
              <div
                className="mt-3 inline-block px-2.5 py-1 rounded-full font-display text-[9px] font-bold tracking-[0.12em] uppercase"
                style={{
                  color: finalTier?.color,
                  border: `1px solid ${finalTier?.color}55`,
                  background: `${finalTier?.color}10`
                }}
              >
                {finalTier?.label}
              </div>
            </div>
          </div>

          <div className="relative mt-5 pt-5 border-t border-forest-line/60 text-center">
            <div className="font-display text-ink-dim text-[10px] tracking-[0.14em] uppercase mb-1.5">
              Промяна
            </div>
            <div className="inline-flex items-center gap-2 font-display font-bold" style={{ color: deltaColor }}>
              <TrendingUp size={20} strokeWidth={2.5} />
              <span className="text-[38px] leading-none tracking-display">
                {positive ? '+' : ''}{delta} точки
              </span>
            </div>
          </div>
        </motion.div>

        {/* MOTIVATIONAL PARAGRAPH */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-ink-muted text-[14px] leading-[1.6] mb-6 px-1"
        >
          {positive
            ? `60 дни структурирана работа промениха ${delta} точки от твоя контрол. Това не е случайност — то е новата ти базова линия.`
            : 'Завърши пълните 60 дни. Това е реалния резултат — следващите цикли носят още по-голяма промяна.'}
        </motion.p>

        {/* ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col gap-2.5"
        >
          <button
            onClick={() => setShareOpen(true)}
            className="w-full rounded-2xl bg-accent text-forest-deep font-display text-[12.5px] font-bold tracking-display uppercase px-5 py-4 inline-flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(255,106,0,0.4)] active:scale-[0.98]"
          >
            <Share2 size={14} strokeWidth={2.5} />
            Сподели трансформацията
          </button>
          <button
            onClick={handleDownloadCertificate}
            disabled={certBusy}
            className="w-full rounded-2xl border border-accent/40 bg-accent/5 text-accent font-display text-[12px] font-bold tracking-display uppercase px-5 py-3.5 inline-flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]"
          >
            <FileText size={14} strokeWidth={2.5} />
            {certBusy ? 'Генерираме…' : 'Свали сертификат'}
          </button>
        </motion.div>
      </div>

      <ShareCardModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        payload={sharePayload}
        variant="transformation"
      />
    </Screen>
  )
}
