import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../lib/routes.js'

export default function Header({ step, total, onBack, showBack = true, right, showLogo = true }) {
  const navigate = useNavigate()
  const handleBack = onBack || (() => navigate(-1))

  return (
    <div className="flex items-center justify-between px-5 pt-12 pb-3">
      <div className="w-10 h-10 flex items-center justify-center">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-ink-muted hover:text-ink active:scale-95 transition"
            aria-label="Назад"
          >
            <ChevronLeft size={26} strokeWidth={2.2} />
          </button>
        )}
      </div>

      {step && total ? (
        <div className="font-display text-xs tracking-[0.1em] text-ink-muted uppercase">
          {step} / {total}
        </div>
      ) : (
        showLogo && (
          <button
            onClick={() => navigate(ROUTES.welcome)}
            className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition hover:drop-shadow-[0_0_8px_rgba(255,106,0,0.6)]"
            aria-label="Velion Lab"
          >
            <img src="/logo/velion-shield.svg" alt="" className="w-7 h-7" />
          </button>
        )
      )}

      <div className="w-10 h-10 flex items-center justify-end">{right}</div>
    </div>
  )
}
