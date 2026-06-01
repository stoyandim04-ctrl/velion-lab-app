// Share Card preview + download/share modal. Opens from /stats and
// from the Day-60 completion celebration (Phase 3 follow-up). Renders
// the 1080×1920 card off-screen via shareCard.js, displays a scaled
// preview, and exposes two actions:
//   1. "Сподели" — Web Share API if available, otherwise falls back to
//      a download.
//   2. "Свали като снимка" — always-available PNG download.

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2 } from 'lucide-react'
import {
  renderShareCard,
  downloadShareCard,
  shareShareCard
} from '../../lib/shareCard.js'
import { renderBeforeAfterCard } from '../../lib/beforeAfterCard.js'

export default function ShareCardModal({ open, onClose, payload, variant = 'stats' }) {
  const [card, setCard] = useState(null)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    if (!open || !payload) {
      setCard(null)
      return
    }
    let active = true
    setWorking(true)
    ;(async () => {
      // 'transformation' variant is the dedicated 60-day before/after
      // card. It expects payload.initialScore + payload.finalScore +
      // payload.delta to be set; renders a delta-hero layout instead
      // of the regular stats grid.
      const renderer =
        variant === 'transformation' &&
        payload.initialScore != null &&
        payload.finalScore != null
          ? renderBeforeAfterCard
          : renderShareCard
      const result = await renderer(payload)
      if (!active) return
      setCard(result)
      setWorking(false)
    })()
    return () => {
      active = false
    }
  }, [open, payload, variant])

  const handleDownload = () => {
    if (!card?.dataUrl) return
    downloadShareCard(card.dataUrl)
  }

  const handleShare = async () => {
    if (!card) return
    const ok = await shareShareCard(card.blob)
    if (!ok) handleDownload()
  }

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
            style={{ maxHeight: '92%' }}
          >
            <div className="flex-shrink-0 relative flex items-center justify-between px-5 pt-4 pb-3 bg-forest-deep border-b border-forest-line/60">
              <div className="w-10 h-1 bg-ink-dim/40 rounded-full absolute top-1.5 left-1/2 -translate-x-1/2" />
              <h2 className="font-display font-bold text-ink text-base tracking-display uppercase mt-1">
                Сподели прогреса
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-ink-muted active:scale-95"
                aria-label="Затвори"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
              <div className="flex justify-center mb-5">
                {working || !card ? (
                  <div
                    className="rounded-2xl border border-forest-line bg-forest-card flex items-center justify-center"
                    style={{ width: 220, aspectRatio: '9 / 16' }}
                  >
                    <div className="h-9 w-9 rounded-full border border-accent/35 border-t-accent animate-spin" />
                  </div>
                ) : (
                  <motion.img
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    src={card.dataUrl}
                    alt="Velion Lab share card preview"
                    className="rounded-2xl border border-forest-line shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
                    style={{ width: 240, height: 'auto', aspectRatio: '9 / 16' }}
                  />
                )}
              </div>

              <p className="text-ink-muted text-[13px] leading-[1.55] text-center mb-5 max-w-[300px] mx-auto">
                Качи го като Story или Reel — линкът в био отвежда новите хора към курса.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleShare}
                  disabled={!card || working}
                  className="w-full min-h-[52px] rounded-2xl bg-accent text-forest-deep font-display text-[13px] font-bold tracking-display uppercase inline-flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_28px_rgba(255,106,0,0.4)]"
                >
                  <Share2 size={16} strokeWidth={2.5} />
                  Сподели
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!card || working}
                  className="w-full min-h-[48px] rounded-2xl border border-forest-line bg-forest-card text-ink font-display text-[12.5px] font-semibold tracking-display uppercase inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download size={15} strokeWidth={2.5} />
                  Свали като снимка
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
