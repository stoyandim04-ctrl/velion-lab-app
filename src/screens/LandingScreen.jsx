import { lazy, Suspense, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, X, Sparkles } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { MODULES_OVERVIEW, PRICE, PAYWALL_FEATURES } from '../data/prices.js'
import { ROUTES } from '../lib/routes.js'
import {
  useReducedMotion,
  STAGGER_CONTAINER,
  STAGGER_ITEM,
  FADE_UP,
  SCALE_IN,
  EASE_OUT,
  SPRING
} from '../lib/animations.js'
import CountUp from '../components/animations/CountUp.jsx'

// 3D shield is lazy-loaded so three.js (≈150kB gzip) doesn't block first paint.
// Until it hydrates, the SVG fallback below renders in its place.
const Shield3D = lazy(() => import('../components/animations/Shield3D.jsx'))

function ShieldFallback({ size }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center"
    >
      <img src="/logo/velion-shield.svg" alt="Velion Lab" className="w-[70%] h-[70%]" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Content (single source of truth — easy to tweak copy without touching markup)
// ─────────────────────────────────────────────────────────────────────────────

const PROMISES = [
  'Разбираш как точно работи твоята нервна система в напрегнати моменти.',
  'Контролираш дишането си и забавяш реакциите си съзнателно.',
  'Имаш структуриран протокол, който работи всеки път — не разчиташ на късмет.',
  'Не зависиш от хапчета, спрейове или временни решения.',
  'Партньорката ти забелязва промяна, преди да си казал и дума.'
]

const MODULES_DETAIL = [
  {
    id: 'I',
    title: 'Осъзнатост',
    range: 'Дни 1-7',
    summary:
      'Картата на собствената ти нервна система. Защо тялото ти реагира така — и защо това не е твоя „вина".'
  },
  {
    id: 'II',
    title: 'Контрол',
    range: 'Дни 8-14',
    summary:
      'Конкретни техники: squeeze, edge, pause. Точката на невъзвръщане — как да я разпознаваш отдалеч.'
  },
  {
    id: 'III',
    title: 'Дишане и темпо',
    range: 'Дни 15-21',
    summary:
      '4-7-8, Box Breathing, ритъм. Как дишането става инструмент, а не нещо което просто се случва.'
  },
  {
    id: 'IV',
    title: 'Тяло и навици',
    range: 'Дни 22-28',
    summary:
      'Тазов под, Kegel правилно (не грешно). Сън, стрес, хранене — четирите тихи саботьора.'
  },
  {
    id: 'V',
    title: 'Психология',
    range: 'Дни 29-35',
    summary:
      'Performance anxiety. Reframing. Inner Coach. Защо мисълта „дано не свърша бързо" е причината, а не реакция.'
  },
  {
    id: 'VI',
    title: 'Партньорство',
    range: 'Дни 36-42',
    summary:
      'Емоционална безопасност. Невербални сигнали. Mutual rhythm. Как се присъстваш на двама, не само на себе си.'
  },
  {
    id: 'VII',
    title: 'Привличане',
    range: 'Дни 43-49',
    summary:
      'Гласът, body language, тихата увереност. Защо привличането е поведение, не късмет.'
  },
  {
    id: 'VIII',
    title: 'Нова идентичност',
    range: 'Дни 50-60',
    summary:
      'Дългосрочни навици. Identity shift. Какво остава след курса. Системата, която носиш със себе си.'
  }
]

const DAILY_ROUTINE = [
  { icon: '📖', label: 'Урок', time: '5 мин', desc: 'Кратка лекция за деня' },
  { icon: '🧘', label: 'Упражнение', time: '5 мин', desc: 'Конкретна техника' },
  { icon: '📊', label: 'Tracker', time: '2 мин', desc: 'Маркираш какво си направил' },
  { icon: '💭', label: 'Журнал', time: '3 мин', desc: 'Кратка рефлексия (по избор)' }
]

const PRINCIPLES = [
  {
    n: '01',
    title: 'НЕВРОПЛАСТИЧНОСТ',
    body: 'Мозъкът се пренастройва за 60-90 дни постоянна работа. Това не е теория — това е невробиология.'
  },
  {
    n: '02',
    title: 'РЕГУЛАЦИЯ НА НЕРВНАТА СИСТЕМА',
    body: 'Проблемът не е в техниката. Той е в това как симпатиковата нервна система реагира под напрежение. Учим я да реагира различно.'
  },
  {
    n: '03',
    title: 'ИЗГРАЖДАНЕ НА НАВИЦИ',
    body: 'Lally (UCL) показва: новите навици се закрепват средно за 66 дни. Velion Lab е проектиран точно по този принцип.'
  }
]

const COMPARISON = [
  {
    title: 'ХАПЧЕТА',
    bad: ['Странични ефекти', 'Не лекуват причина', 'Зависимост']
  },
  {
    title: 'ТЕРАПЕВТ',
    bad: ['€60-100 на сесия', 'Срам пред непознат', 'Бавно']
  },
  {
    title: 'СПРЕЙОВЕ / КРЕМОВЕ',
    bad: ['Намалена чувствителност', 'Краткосрочно', 'Партньорката усеща']
  }
]

const VELION_ADVANTAGES = [
  'Без хапчета · без странични ефекти',
  'Без срам · правиш го сам, на твоя ритъм',
  'Научен подход · не магия, не обещания',
  'Lifetime достъп · плащаш веднъж'
]

const FAQS = [
  {
    q: 'Дискретно ли е?',
    a: 'Да. Приложението не показва съдържание в известията. Името му е „Velion Lab" — нищо разкриващо.'
  },
  {
    q: 'Колко отнема на ден?',
    a: '15-20 минути. Правиш го кога ти е удобно — сутрин с кафето, вечер преди сън, или в почивката на работа.'
  },
  {
    q: 'Гарантиран ли е резултатът?',
    a: 'Не обещаваме магия. Обещаваме система, която работи ако я следваш честно. Първи забележими резултати в първите 21 дни. Стабилност след 60.'
  },
  {
    q: 'Подходящо ли е за моята възраст?',
    a: 'Velion Lab е създаден за мъже 18-50+. Мъжете 25-35 често имат повече проблеми от мъжете 45+. Възрастта не е проблем — нервната система е.'
  },
  {
    q: 'Работи ли ако нямам партньорка?',
    a: 'Да. Курсът е за теб, не за партньорството. Когато се появи интимна ситуация — ще си готов.'
  },
  {
    q: 'Какво се случва след 60 дни?',
    a: 'Модул VIII (Дни 50-60) изгражда maintenance протокол — какво правиш ежедневно за да поддържаш промяната без курса.'
  },
  {
    q: 'Мога ли да анулирам?',
    a: 'Плащаш веднъж — €19.99. Няма абонамент, няма автоматично подновяване. Достъпът остава завинаги.'
  },
  {
    q: 'Сигурно ли е плащането?',
    a: 'Плащането минава през Stripe — същия процесор, който ползват Apple, Amazon, Shopify. Ние не виждаме данните от картата ти.'
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

// Split headline into words for stagger reveal.
const HERO_WORDS_LINE_1 = ['60', 'ДНИ.']
const HERO_WORDS_LINE_2 = ['НОВА', 'ВЕРСИЯ']
const HERO_WORDS_LINE_3 = ['НА', 'ТЕБ.']

export default function LandingScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, hasPaidAccess, accessLoading, user, signOut } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)
  const [signingOut, setSigningOut] = useState(false)
  const reduced = useReducedMotion()

  const scrollRef = useRef(null)
  const { scrollY } = useScroll({ container: scrollRef })
  // Subtle hero parallax — image moves slower than scroll
  const heroParallax = useTransform(scrollY, [0, 400], [0, reduced ? 0 : -60])
  const heroOpacity = useTransform(scrollY, [0, 350], [0.65, reduced ? 0.65 : 0.25])

  const isPaidUser = isAuthenticated && !accessLoading && hasPaidAccess

  const handleStartQuiz = () => navigate('/quiz/1')
  const handleOpenProfile = () => navigate(ROUTES.dashboard)
  const handleLogin = () => navigate(ROUTES.auth, { state: { mode: 'login' } })
  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  return (
    <Screen background="bg-forest-deep">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* ───── SECTION 1: HERO ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <motion.div className="absolute inset-0" style={{ y: heroParallax }}>
            <motion.img
              src="/landing/hero.webp"
              alt=""
              decoding="async"
              fetchpriority="high"
              style={{ opacity: heroOpacity }}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/30 via-[#0A0A0A]/60 to-[#0A0A0A]" />
          </motion.div>

          <div className="relative z-10 px-6 pt-[max(48px,env(safe-area-inset-top))] pb-12 min-h-[78vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12" />
              <Suspense fallback={<ShieldFallback size={88} />}>
                <Shield3D size={88} />
              </Suspense>
              {isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="text-ink-dim text-[10px] tracking-[0.1em] uppercase active:text-ink disabled:opacity-50"
                >
                  {signingOut ? '…' : 'Изход'}
                </button>
              ) : (
                <div className="w-12" />
              )}
            </div>
            {isAuthenticated && (
              <div className="text-center text-ink-dim text-[10.5px] mb-4">
                Влязъл като <span className="text-ink-muted">{user?.email}</span>
              </div>
            )}

            <div className="flex-1 flex flex-col justify-end">
              <motion.div
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={STAGGER_ITEM}
                  className="font-display text-accent text-[11px] tracking-[0.18em] uppercase mb-4"
                >
                  Velion Lab · 60-дневен протокол
                </motion.div>
                <h1 className="font-display font-bold text-ink text-[36px] sm:text-[40px] leading-[0.95] tracking-display uppercase mb-5">
                  <span className="block">
                    {HERO_WORDS_LINE_1.map((w, i) => (
                      <motion.span
                        key={i}
                        variants={STAGGER_ITEM}
                        className="inline-block mr-2"
                      >
                        {w}
                      </motion.span>
                    ))}
                  </span>
                  <span className="block">
                    {HERO_WORDS_LINE_2.map((w, i) => (
                      <motion.span
                        key={i}
                        variants={STAGGER_ITEM}
                        className="inline-block mr-2"
                      >
                        {w}
                      </motion.span>
                    ))}
                  </span>
                  <span className="block text-accent">
                    {HERO_WORDS_LINE_3.map((w, i) => (
                      <motion.span
                        key={i}
                        variants={STAGGER_ITEM}
                        className="inline-block mr-2"
                      >
                        {w}
                      </motion.span>
                    ))}
                  </span>
                </h1>
                <motion.p
                  variants={STAGGER_ITEM}
                  className="text-ink-muted text-[15px] leading-[1.55] mb-8 max-w-[340px]"
                >
                  Научна система за контрол, увереност и мъжко присъствие. Без хапчета, без срам, без обещания за чудо.
                </motion.p>

                <motion.div variants={STAGGER_ITEM} className="flex flex-col gap-3">
                  <motion.button
                    onClick={handleStartQuiz}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ y: -1 }}
                    animate={
                      reduced
                        ? {}
                        : {
                            boxShadow: [
                              '0 0 28px rgba(255,106,0,0.35)',
                              '0 0 52px rgba(255,106,0,0.65)',
                              '0 0 28px rgba(255,106,0,0.35)'
                            ]
                          }
                    }
                    transition={{
                      boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
                      scale: { type: 'spring', stiffness: 380, damping: 26 }
                    }}
                    className="w-full min-h-[58px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase inline-flex items-center justify-center gap-2"
                  >
                    Започни сега
                    <ArrowRight size={18} strokeWidth={2.8} />
                  </motion.button>

                  {isPaidUser ? (
                    <motion.button
                      onClick={handleOpenProfile}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="w-full min-h-[52px] rounded-2xl border border-accent/50 bg-accent/5 text-accent font-display text-sm font-semibold tracking-display uppercase active:bg-accent/10"
                    >
                      Влез в профила си
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        onClick={handleLogin}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="w-full min-h-[52px] rounded-2xl border border-forest-line bg-transparent text-ink font-display text-sm font-semibold tracking-display uppercase active:border-ink-muted"
                      >
                        Влез в профила си
                      </motion.button>
                      {!isAuthenticated && (
                        <button
                          onClick={() => navigate(ROUTES.auth, { state: { mode: 'signup' } })}
                          className="w-full min-h-[40px] text-ink-muted text-[12.5px] active:text-ink"
                        >
                          Нямаш акаунт? <span className="text-accent font-semibold">Създай нов</span>
                        </button>
                      )}
                    </>
                  )}
                </motion.div>

                <div className="mt-7 flex items-center justify-center gap-2 text-ink-dim text-[11px] tracking-[0.06em] uppercase">
                  <Sparkles size={11} className="text-accent" />
                  <span>Lifetime достъп · €19.99 еднократно</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ───── SECTION 2: THE PROBLEM ────────────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            01 · Проблемът
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-5">
            ЗНАЕШ ТОВА ЧУВСТВО.
          </h2>
          <p className="text-ink-muted text-[15px] leading-[1.65] mb-4">
            Моментът дойде. Тялото ти знае какво да прави, но не теб. И още преди да си имал шанс да присъстваш — то е свършило.
          </p>
          <p className="text-ink-muted text-[15px] leading-[1.65] mb-4">
            Не е въпрос на воля. Не е въпрос на сила. Това е нервна система, която реагира бързо защото никой не я е научил да реагира различно.
          </p>
          <div className="mt-7 rounded-2xl border border-forest-line bg-forest-card/60 p-5">
            <div className="font-display text-accent text-[11px] tracking-[0.14em] uppercase mb-2">
              Истината
            </div>
            <p className="text-ink text-[14px] leading-[1.55]">
              Над 75% от мъжете между 25 и 45 го изпитват. Над 90% от тях никога не казват на никого. Затова продължава поколения наред.
            </p>
          </div>
        </section>

        {/* ───── SECTION 3: THE PROMISE ─────────────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            02 · Какво ще постигнеш
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-7">
            СЛЕД 60 ДНИ ЩЕ:
          </h2>
          <div className="space-y-3">
            {PROMISES.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center">
                  <Check size={12} strokeWidth={3} className="text-accent" />
                </div>
                <span className="text-ink text-[14px] leading-[1.55]">{p}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ───── SECTION 4: WHAT YOU'LL LEARN — 8 MODULES ──────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            03 · Какво ще научиш
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-3">
            8 МОДУЛА. 60 СТРУКТУРИРАНИ ДНИ.
          </h2>
          <p className="text-ink-muted text-[14px] leading-[1.55] mb-7">
            Всеки модул надгражда предишния. Без прескачане. Без излишно теоретизиране.
          </p>
          <div className="space-y-3">
            {MODULES_DETAIL.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05 }}
                className="rounded-2xl border border-forest-line bg-forest-card/60 p-5"
              >
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div className="font-display text-accent text-[11px] font-bold tracking-[0.14em] uppercase">
                    Модул {m.id}
                  </div>
                  <div className="text-ink-dim text-[10.5px]">{m.range}</div>
                </div>
                <div className="font-display text-ink text-[16px] font-semibold tracking-display uppercase mb-2">
                  {m.title}
                </div>
                <p className="text-ink-muted text-[13px] leading-[1.55]">{m.summary}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ───── SECTION 5: DAILY ROUTINE ──────────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            04 · Един ден изглежда така
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-3">
            15 МИНУТИ. КОГА ТИ Е УДОБНО.
          </h2>
          <p className="text-ink-muted text-[14px] leading-[1.55] mb-7">
            Сутрин с кафето, обед в почивката или вечер преди сън. Velion не диктува кога — само какво.
          </p>
          <div className="space-y-2.5">
            {DAILY_ROUTINE.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-2xl border border-forest-line bg-forest-card/50 p-4"
              >
                <div className="text-3xl flex-shrink-0">{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-ink text-[14px] tracking-display uppercase">
                    {r.label}
                  </div>
                  <div className="text-ink-muted text-[12px] mt-0.5">{r.desc}</div>
                </div>
                <div className="font-display font-bold text-accent text-[13px]">
                  {r.time}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ───── SECTION 6: METHOD / SCIENCE ───────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            05 · Методиката
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-3">
            3 НАУЧНИ ПРИНЦИПА
          </h2>
          <p className="text-ink-muted text-[14px] leading-[1.55] mb-7">
            Velion Lab не е мотивационна книга. Това е приложена невробиология, психология и физиология.
          </p>
          <div className="space-y-4">
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl border border-forest-line bg-forest-card/60 p-5"
              >
                <div className="font-display font-bold text-accent text-[28px] leading-none mb-3 tracking-display">
                  {p.n}
                </div>
                <div className="font-display text-ink text-[14px] font-semibold tracking-[0.05em] uppercase mb-2">
                  {p.title}
                </div>
                <p className="text-ink-muted text-[13px] leading-[1.55]">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ───── SECTION 7: COMPARISON ─────────────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            06 · Защо Velion
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-7">
            АЛТЕРНАТИВИТЕ.
          </h2>

          <div className="space-y-3 mb-7">
            {COMPARISON.map((c) => (
              <div key={c.title} className="rounded-2xl border border-forest-line bg-forest-card/30 p-5">
                <div className="font-display text-ink-muted text-[13px] font-semibold tracking-[0.1em] uppercase mb-3">
                  {c.title}
                </div>
                <div className="space-y-2">
                  {c.bad.map((b) => (
                    <div key={b} className="flex items-start gap-2.5">
                      <X size={14} className="text-red-400/60 mt-1 flex-shrink-0" strokeWidth={2.4} />
                      <span className="text-ink-muted text-[13px] leading-[1.5]">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-accent/40 bg-accent/5 p-5">
            <div className="font-display text-accent text-[13px] font-bold tracking-[0.1em] uppercase mb-3">
              VELION LAB
            </div>
            <div className="space-y-2">
              {VELION_ADVANTAGES.map((a) => (
                <div key={a} className="flex items-start gap-2.5">
                  <Check size={14} className="text-accent mt-1 flex-shrink-0" strokeWidth={2.8} />
                  <span className="text-ink text-[13px] leading-[1.5]">{a}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───── SECTION 8: STATS ──────────────────────────────────────────── */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="text-center"
            >
              <div className="font-display font-bold text-accent text-[34px] leading-none mb-2 tracking-display">
                <CountUp to={60} />
              </div>
              <div className="text-ink-muted text-[10.5px] tracking-[0.08em] uppercase leading-tight">
                дни съдържание
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE_OUT }}
              className="text-center"
            >
              <div className="font-display font-bold text-accent text-[34px] leading-none mb-2 tracking-display">
                <CountUp to={8} />
              </div>
              <div className="text-ink-muted text-[10.5px] tracking-[0.08em] uppercase leading-tight">
                модула
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT }}
              className="text-center"
            >
              <div className="font-display font-bold text-accent text-[34px] leading-none mb-2 tracking-display">
                <CountUp to={15} suffix=" мин" />
              </div>
              <div className="text-ink-muted text-[10.5px] tracking-[0.08em] uppercase leading-tight">
                на ден
              </div>
            </motion.div>
          </div>
        </section>

        {/* ───── SECTION 9: HOW IT WORKS ───────────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            07 · Как работи
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-8">
            3 СТЪПКИ.
          </h2>
          <div className="space-y-5">
            {[
              { n: 1, title: 'Отговори на въпросника', desc: 'Получаваш личен профил, базиран на отговорите ти. Времетраене: ~2 минути.' },
              { n: 2, title: 'Следвай системата', desc: '15 минути на ден. Урок, упражнение, tracker. Кога ти е удобно.' },
              { n: 3, title: 'Виж реалната промяна', desc: 'Първи забележими резултати за 21 дни. Стабилност след 60.' }
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-full border border-accent/40 bg-accent/10 flex items-center justify-center">
                  <span className="font-display font-bold text-accent text-[16px]">
                    {step.n}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-display font-semibold text-ink text-[15px] tracking-display uppercase mb-1.5">
                    {step.title}
                  </div>
                  <p className="text-ink-muted text-[13px] leading-[1.55]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───── SECTION 10: PRICE ─────────────────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3 text-center">
            08 · Цена
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-7 text-center">
            ПЪЛЕН ДОСТЪП.
          </h2>

          <div className="relative rounded-3xl border border-accent/40 bg-forest-card p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,0,0.18),transparent_55%)] pointer-events-none" />
            <div className="relative">
              <div className="text-center mb-2">
                <span className="font-display font-bold text-ink text-[64px] leading-none tracking-display">
                  {PRICE.price}
                </span>
              </div>
              <p className="text-ink-muted text-[12px] text-center mb-6">
                {PRICE.subtitle}
              </p>

              <div className="space-y-2.5 mb-7">
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
                onClick={handleStartQuiz}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -1 }}
                className="w-full min-h-[56px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase shadow-[0_0_32px_rgba(255,106,0,0.42)] inline-flex items-center justify-center gap-2"
              >
                Вземи достъп
                <ArrowRight size={18} strokeWidth={2.8} />
              </motion.button>
            </div>
          </div>

          <p className="text-ink-dim text-[11px] text-center mt-4 leading-relaxed">
            Сигурно плащане през Stripe · Без скрити такси · Lifetime достъп
          </p>
        </section>

        {/* ───── SECTION 11: FAQ ───────────────────────────────────────────── */}
        <section className="px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            09 · Чести въпроси
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-7">
            ТЪРСИШ ОТГОВОР?
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
                    <p className="text-ink-muted text-[13px] leading-[1.6]">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ───── SECTION 12: FINAL CTA ─────────────────────────────────────── */}
        <section className="relative px-6 py-20 border-t border-forest-line/40 text-center overflow-hidden">
          <img
            src="/landing/energy.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/30 via-forest-deep/55 to-forest-deep pointer-events-none" />

          <div className="relative">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="font-display font-bold text-ink text-[32px] leading-[1.05] tracking-display uppercase mb-3"
            >
              ЗАПОЧНИ ДНЕС.
            </motion.h2>
            <p className="text-ink-muted text-[14px] leading-[1.55] mb-8 max-w-[320px] mx-auto">
              Утре може да е твърде късно за нещо което си отлагал с години.
            </p>
            <motion.button
              onClick={handleStartQuiz}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              className="w-full min-h-[60px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase shadow-[0_0_40px_rgba(255,106,0,0.55)] inline-flex items-center justify-center gap-2"
            >
              Започни сега · {PRICE.price}
              <ArrowRight size={18} strokeWidth={2.8} />
            </motion.button>
            <p className="text-ink-dim text-[11px] mt-4">
              ~2 минути въпросник · Lifetime достъп · €19.99 еднократно
            </p>
          </div>
        </section>

        {/* ───── FOOTER ───────────────────────────────────────────────────── */}
        <footer className="px-6 py-10 border-t border-forest-line/40 text-center">
          <img
            src="/logo/velion-shield.svg"
            alt="Velion Lab"
            className="w-10 h-10 mx-auto mb-3 opacity-80"
          />
          <div className="font-display text-ink-muted text-[10px] tracking-[0.18em] uppercase mb-4">
            Velion Lab
          </div>
          <div className="flex items-center justify-center gap-3 text-[12px] text-ink-dim flex-wrap">
            <button onClick={() => navigate(ROUTES.about)} className="active:text-ink">
              За проекта
            </button>
            <span>·</span>
            <button onClick={() => navigate(ROUTES.privacy)} className="active:text-ink">
              Поверителност
            </button>
            <span>·</span>
            <button onClick={() => navigate(ROUTES.terms)} className="active:text-ink">
              Условия
            </button>
          </div>
          <div className="mt-5 text-ink-dim text-[10px]">
            © Velion Lab 2026 · velionbilgaria@gmail.com
          </div>
        </footer>
      </div>
    </Screen>
  )
}
