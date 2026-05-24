import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { MODULES_OVERVIEW, PRICE, PAYWALL_FEATURES } from '../data/prices.js'
import { ROUTES } from '../lib/routes.js'

const FAQS = [
  {
    q: 'Дискретно ли е?',
    a: 'Да. Приложението не показва съдържание в известията и не разкрива какво ползваш.'
  },
  {
    q: 'Колко отнема на ден?',
    a: '15-20 минути. Правиш го кога ти е удобно — сутрин, вечер или в почивката.'
  },
  {
    q: 'Гарантиран ли е резултатът?',
    a: 'Не обещаваме магия. Обещаваме система, която работи ако я следваш честно 60 дни.'
  },
  {
    q: 'Мога ли да анулирам?',
    a: 'Плащаш веднъж. Няма абонамент. Достъпът остава завинаги.'
  }
]

export default function LandingScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, hasPaidAccess, accessLoading } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  const handleStart = () => {
    if (isAuthenticated && !accessLoading && hasPaidAccess) {
      navigate(ROUTES.dashboard)
    } else {
      navigate('/quiz/1')
    }
  }

  return (
    <Screen background="bg-forest-deep">
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* SECTION 1 — HERO */}
        <section className="relative min-h-[88vh] flex flex-col">
          <div className="absolute inset-0">
            <img
              src="/landing/hero.webp"
              alt=""
              decoding="async"
              fetchpriority="high"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/55 to-[#0A0A0A]" />
          </div>

          <div className="relative z-10 flex flex-col flex-1 px-6 pt-[max(48px,env(safe-area-inset-top))] pb-10">
            <div className="flex justify-center">
              <img
                src="/logo/velion-shield.svg"
                alt="Velion Lab"
                className="w-12 h-12"
              />
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="font-display text-accent text-[11px] tracking-[0.18em] uppercase mb-4">
                  Velion Lab
                </div>
                <h1 className="font-display font-bold text-ink text-[36px] sm:text-[40px] leading-[0.95] tracking-display uppercase mb-5">
                  60 ДНИ.
                  <br />
                  НОВА ВЕРСИЯ
                  <br />
                  НА ТЕБ.
                </h1>
                <p className="text-ink-muted text-[15px] leading-[1.5] mb-8 max-w-[340px]">
                  Научна система за контрол, увереност и мъжко присъствие.
                </p>

                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleStart}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15 }}
                    className="w-full min-h-[56px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase shadow-[0_0_36px_rgba(255,106,0,0.45)] inline-flex items-center justify-center gap-2"
                  >
                    Започни сега
                    <ArrowRight size={18} strokeWidth={2.8} />
                  </motion.button>
                  <motion.button
                    onClick={() => navigate(ROUTES.auth)}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="w-full min-h-[52px] rounded-2xl border border-forest-line bg-transparent text-ink font-display text-sm font-semibold tracking-display uppercase active:border-ink-muted"
                  >
                    Влез в акаунта си
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — WHAT YOU GET */}
        <section className="relative px-6 py-14">
          <h2 className="font-display font-bold text-ink text-[26px] leading-[1.1] tracking-display uppercase mb-2 text-center">
            60 ДНИ. 8 МОДУЛА.
            <br />
            <span className="text-accent">РЕАЛНА ПРОМЯНА.</span>
          </h2>
          <p className="text-ink-muted text-[13px] text-center mb-8">
            Структуриран път, без излишно теоретизиране.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {MODULES_OVERVIEW.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}
                className="rounded-2xl border border-forest-line bg-forest-card/60 p-4 flex flex-col"
              >
                <div className="font-display text-accent text-[10px] tracking-[0.14em] uppercase font-bold mb-1.5">
                  Модул {m.id}
                </div>
                <div className="font-display text-ink text-[14px] leading-[1.2] font-semibold uppercase tracking-display mb-1">
                  {m.title}
                </div>
                <div className="text-ink-dim text-[11px] mt-auto">{m.range}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 3 — STATS */}
        <section className="relative px-6 py-12 border-t border-forest-line/40">
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: '60', label: 'дни съдържание' },
              { num: '8', label: 'модула' },
              { num: '15 мин', label: 'на ден' }
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-accent text-[34px] leading-none mb-2 tracking-display">
                  {s.num}
                </div>
                <div className="text-ink-muted text-[10.5px] tracking-[0.08em] uppercase leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4 — HOW IT WORKS */}
        <section className="relative px-6 py-14 border-t border-forest-line/40">
          <h2 className="font-display font-bold text-ink text-[24px] leading-[1.1] tracking-display uppercase mb-8 text-center">
            КАК РАБОТИ
          </h2>
          <div className="space-y-4">
            {[
              { n: 1, title: 'Отговори на въпросника', desc: 'Получаваш личен профил, базиран на твоите отговори.' },
              { n: 2, title: 'Следвай системата', desc: '15 минути на ден. Когато си готов, не когато трябва.' },
              { n: 3, title: 'Виж реалната промяна', desc: 'Първи резултати в първите 30 дни. Стабилност след 60.' }
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full border border-accent/40 bg-accent/10 flex items-center justify-center">
                  <span className="font-display font-bold text-accent text-[15px]">
                    {step.n}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-display font-semibold text-ink text-[15px] tracking-display uppercase mb-1">
                    {step.title}
                  </div>
                  <p className="text-ink-muted text-[13px] leading-[1.55]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 5 — PRICE */}
        <section className="relative px-6 py-14 border-t border-forest-line/40">
          <div className="relative rounded-3xl border border-accent/40 bg-forest-card p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,0,0.18),transparent_55%)] pointer-events-none" />
            <div className="relative">
              <div className="font-display text-accent text-[11px] tracking-[0.18em] uppercase mb-2 text-center">
                Пълен достъп
              </div>
              <div className="text-center mb-2">
                <span className="font-display font-bold text-ink text-[64px] leading-none tracking-display">
                  {PRICE.price}
                </span>
              </div>
              <p className="text-ink-muted text-[12px] text-center mb-6">
                {PRICE.subtitle}
              </p>

              <div className="space-y-2.5 mb-6">
                {PAYWALL_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center flex-shrink-0">
                      <Check size={11} strokeWidth={3} className="text-accent" />
                    </div>
                    <span className="text-ink text-[14px] leading-[1.5]">{f}</span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleStart}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -1 }}
                className="w-full min-h-[56px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase shadow-[0_0_32px_rgba(255,106,0,0.42)] inline-flex items-center justify-center gap-2"
              >
                Вземи достъп
                <ArrowRight size={18} strokeWidth={2.8} />
              </motion.button>
            </div>
          </div>
        </section>

        {/* SECTION 6 — FAQ */}
        <section className="relative px-6 py-14 border-t border-forest-line/40">
          <h2 className="font-display font-bold text-ink text-[24px] leading-[1.1] tracking-display uppercase mb-6 text-center">
            ЧЕСТИ ВЪПРОСИ
          </h2>
          <div className="space-y-2.5">
            {FAQS.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-forest-line bg-forest-card/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
                >
                  <span className="font-display font-semibold text-ink text-[14px] tracking-display uppercase">
                    {f.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={[
                      'text-ink-muted transition-transform shrink-0',
                      openFaq === i ? 'rotate-180' : ''
                    ].join(' ')}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-ink-muted text-[13px] leading-[1.55]">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative px-6 py-10 border-t border-forest-line/40 text-center">
          <img
            src="/logo/velion-shield.svg"
            alt="Velion Lab"
            className="w-10 h-10 mx-auto mb-3 opacity-80"
          />
          <div className="font-display text-ink-muted text-[10px] tracking-[0.18em] uppercase mb-4">
            Velion Lab
          </div>
          <div className="flex items-center justify-center gap-3 text-[12px] text-ink-dim">
            <button
              onClick={() => navigate(ROUTES.privacy)}
              className="active:text-ink"
            >
              Поверителност
            </button>
            <span>·</span>
            <button
              onClick={() => navigate(ROUTES.terms)}
              className="active:text-ink"
            >
              Условия
            </button>
            <span>·</span>
            <button
              onClick={() => navigate(ROUTES.about)}
              className="active:text-ink"
            >
              За проекта
            </button>
          </div>
          <div className="mt-6 text-ink-dim text-[10px]">
            © Velion Lab 2026
          </div>
        </footer>
      </div>
    </Screen>
  )
}
