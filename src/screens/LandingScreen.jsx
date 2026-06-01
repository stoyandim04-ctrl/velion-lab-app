// Landing page v3 — conversion-focused rewrite.
//
// Design intent:
//   - First paint (≤1s after load) must communicate: dark cinematic
//     premium, masculine, this-is-not-an-app-for-yoga-moms.
//   - The hero alone must answer "what is this?" without scrolling.
//   - Every section below the fold is one of: shame-release, proof,
//     contrast, social, price, FAQ, or CTA. No filler.
//   - Sticky bottom CTA appears after the hero leaves the viewport so
//     the buy decision is always one tap away.
//   - The PhoneFrame caps the layout to 420px so we design mobile-first
//     and let the desktop preview frame the content.

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionTemplate } from 'framer-motion'
import {
  ArrowRight, Check, X, ChevronDown, Shield as ShieldIcon,
  Lock, Zap, Flame, Brain, Wind, Target, Heart, Sparkles, Plus
} from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { PRICE } from '../data/prices.js'
import { ROUTES } from '../lib/routes.js'
import {
  useReducedMotion,
  STAGGER_CONTAINER,
  STAGGER_ITEM,
  SPRING
} from '../lib/animations.js'
import CountUp from '../components/animations/CountUp.jsx'
import ParticleField from '../components/animations/ParticleField.jsx'
import AuroraGlow from '../components/animations/AuroraGlow.jsx'

const Shield3D = lazy(() => import('../components/animations/Shield3D.jsx'))

function ShieldFallback({ size }) {
  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center">
      <img src="/logo/velion-shield.svg" alt="Velion Lab" className="w-[70%] h-[70%]" />
    </div>
  )
}

// ─── COPY (single source of truth) ──────────────────────────────────────────

const HERO_WORDS_1 = ['60', 'ДНИ.']
const HERO_WORDS_2 = ['ЕДИН', 'ПРОТОКОЛ.']
const HERO_WORDS_3 = ['НОВА', 'ВЕРСИЯ.']

const PROBLEM_QUOTES = [
  '"Тялото ми реагира, преди да съм мислил."',
  '"Свърших по-бързо, отколкото признавам."',
  '"Избягвам първите срещи. Защо да се излагам."',
  '"Не знам какво точно е „мъжко присъствие". Но знам, че го нямам."'
]

const NOT_THIS = [
  'Поредно приложение за медитация',
  'Хапчета или временни решения',
  'Групови сесии със споделяне',
  'Терапевт, който нищо не предлага конкретно'
]

const THIS = [
  '60-дневен структуриран протокол',
  'Приложна невробиология за нервната ти система',
  'Анонимно. Само ти, телефонът ти и системата',
  'Lifetime достъп. Еднократна цена. Без абонамент'
]

const MODULES = [
  { id: 'I', title: 'Осъзнатост', range: '1-7', icon: Brain, color: '#FF6A00' },
  { id: 'II', title: 'Контрол', range: '8-14', icon: Target, color: '#FF6A00' },
  { id: 'III', title: 'Дишане и темпо', range: '15-21', icon: Wind, color: '#FF6A00' },
  { id: 'IV', title: 'Тяло и навици', range: '22-28', icon: Zap, color: '#FF6A00' },
  { id: 'V', title: 'Психология', range: '29-35', icon: Brain, color: '#FF6A00' },
  { id: 'VI', title: 'Партньорство', range: '36-42', icon: Heart, color: '#FF6A00' },
  { id: 'VII', title: 'Привличане', range: '43-49', icon: Flame, color: '#FF6A00' },
  { id: 'VIII', title: 'Нова идентичност', range: '50-60', icon: ShieldIcon, color: '#FF6A00' }
]

const ROUTINE = [
  { time: '5 мин', label: 'Урок', sub: 'Чисто, без преливане' },
  { time: '5 мин', label: 'Упражнение', sub: 'Точно, измеримо' },
  { time: '3 мин', label: 'Tracker', sub: 'Отбелязваш свършеното' },
  { time: '2 мин', label: 'Журнал', sub: 'По избор' }
]

const SCIENCE = [
  {
    title: 'Невробиология',
    body: 'Контролът не е сила на волята — той е тренировка на нервната ти система. Седмици повтаряне променят пътищата.',
    cite: 'Hebb (1949), приложна неврология'
  },
  {
    title: 'Поведенческа психология',
    body: '66 дни — точно колкото показват изследванията, че трябват на нов навик да стане автоматичен.',
    cite: 'Lally et al., UCL (2010)'
  },
  {
    title: 'Физиология на дишането',
    body: 'Бавното издишване стимулира блуждаещия нерв и забавя автономната реакция в напрегнат момент.',
    cite: 'Porges, Polyvagal Theory'
  }
]

const COMPARISON = [
  { label: 'Терапевт', cost: '€80/час', cons: 'Седмично, лично, неудобно' },
  { label: 'Apps за медитация', cost: '€15/мес', cons: 'Не лекуват причината' },
  { label: 'Книги и Reddit', cost: 'Безплатно', cons: 'Без структура, без проследяване' },
  { label: 'Velion Lab', cost: '€11 lifetime', cons: null, highlight: true }
]

const FAQ = [
  {
    q: 'Анонимно ли е?',
    a: 'Абсолютно. Не трябва име, нито снимка. Само имейл за вход. Нищо не се споделя, никой друг не вижда твоя прогрес.'
  },
  {
    q: 'Колко време отнема на ден?',
    a: '15 минути. Кога ти е удобно. Можеш да го правиш сутрин преди душ или вечер преди сън.'
  },
  {
    q: 'Какво ако пропусна ден?',
    a: 'Имаш гратисен период от 1 ден за streak-а. След това просто продължаваш от където си спрял — нищо не изгубваш.'
  },
  {
    q: 'Има ли refund?',
    a: 'Да. 14 дни от покупката. Без въпроси. Пишеш на velionbilgaria@gmail.com — парите се връщат за 5 работни дни.'
  },
  {
    q: 'Защо €11 а не повече?',
    a: 'Защото това не е продукт за богати. Това е инструмент. Цената е достатъчно ниска да опиташ без риск и достатъчно висока, за да го завършиш.'
  },
  {
    q: 'След като приключа 60-те дни какво?',
    a: 'Получаваш сертификат. Можеш да преминеш отново. Достъпът е lifetime — без таймер.'
  }
]

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function LandingScreen() {
  const navigate = useNavigate()
  const { isAuthenticated, hasPaidAccess, accessLoading, user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const reduced = useReducedMotion()

  const scrollRef = useRef(null)
  const heroRef = useRef(null)

  // Page-wide scroll progress drives the rotating shield + the corner
  // scroll-progress arc.
  const { scrollYProgress: pageProgress } = useScroll({ container: scrollRef })

  // Hero-local scroll progress drives the cinematic transforms:
  // image parallax+scale+blur+fade, shield rotate+lift, text crossfade
  // between three stacked headlines.
  const { scrollYProgress: heroProgress } = useScroll({
    container: scrollRef,
    target: heroRef,
    offset: ['start start', 'end start']
  })

  // Smoothed version so transforms don't jitter on touch scroll. All
  // hero motion derives from this single spring.
  const heroP = useSpring(heroProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  // Background image — translate up, zoom in, blur, fade.
  const imgY = useTransform(heroP, [0, 1], reduced ? ['0%', '0%'] : ['0%', '-28%'])
  const imgScale = useTransform(heroP, [0, 1], reduced ? [1, 1] : [1.05, 1.45])
  const imgOpacity = useTransform(heroP, [0, 0.5, 1], [0.95, 0.55, 0])
  const imgBlurPx = useTransform(heroP, [0, 1], reduced ? [0, 0] : [0, 14])
  const imgFilter = useMotionTemplate`blur(${imgBlurPx}px)`

  // Shield — rotates on Y axis as you scroll, lifts and shrinks toward
  // the top, fades out near the end.
  const shieldRotateY = useTransform(heroP, [0, 1], reduced ? [0, 0] : [0, 540])
  const shieldScale = useTransform(heroP, [0, 0.6, 1], [1, 1.08, 0.55])
  const shieldY = useTransform(heroP, [0, 1], reduced ? ['0%', '0%'] : ['0%', '-120%'])
  const shieldOpacity = useTransform(heroP, [0.7, 1], [1, 0.15])

  // Text states — three headlines cross-fade across the scroll. Each is
  // visible inside its own progress band, off-screen elsewhere.
  const text1Opacity = useTransform(heroP, [0, 0.18, 0.3], [1, 1, 0])
  const text1Y = useTransform(heroP, [0, 0.3], ['0%', '-15%'])
  const text2Opacity = useTransform(heroP, [0.28, 0.4, 0.55, 0.65], [0, 1, 1, 0])
  const text2Y = useTransform(heroP, [0.28, 0.65], ['18%', '-12%'])
  const text3Opacity = useTransform(heroP, [0.62, 0.78, 0.92, 1], [0, 1, 1, 0.85])
  const text3Y = useTransform(heroP, [0.62, 1], ['18%', '-6%'])

  // Aurora layer intensifies as we leave the hero.
  const auroraIntensity = useTransform(heroP, [0, 1], [0.6, 1])

  // Corner scroll arc — 0→360deg across the whole page.
  const arcRotate = useTransform(pageProgress, [0, 1], [0, 360])
  const arcProgress = useTransform(pageProgress, [0, 1], [0, 100])
  const arcStrokeOffset = useTransform(arcProgress, (v) => 2 * Math.PI * 14 * (1 - v / 100))

  const [showStickyCta, setShowStickyCta] = useState(false)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      setShowStickyCta(el.scrollTop > el.clientHeight * 0.65)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const isPaid = isAuthenticated && !accessLoading && hasPaidAccess
  const isAuthedNotPaid = isAuthenticated && !accessLoading && !hasPaidAccess
  const firstName = user?.user_metadata?.full_name?.split(/\s+/)[0] || ''

  const handlePrimaryCta = () => {
    if (isPaid) navigate(ROUTES.dashboard)
    else if (isAuthedNotPaid) navigate(ROUTES.paywall)
    else navigate('/quiz/1')
  }
  const handleSecondary = () => {
    if (!isAuthenticated) navigate(ROUTES.auth, { state: { mode: 'login' } })
  }
  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  return (
    <Screen background="bg-forest-deep">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide relative"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* AMBIENT — drifts everywhere on the page */}
        <motion.div style={{ opacity: auroraIntensity }} className="absolute inset-0 pointer-events-none">
          <AuroraGlow />
        </motion.div>
        <ParticleField count={26} />

        {/* TOP BAR — pinned absolutely so it stays visible during scroll-hero */}
        <div className="absolute z-30 top-0 left-0 right-0 flex items-center justify-between px-6 pt-[max(20px,env(safe-area-inset-top))] pb-3">
          <div className="font-display text-accent text-[10.5px] tracking-[0.2em] uppercase">
            Velion Lab
          </div>
          {/* Scroll progress arc */}
          <div className="relative w-9 h-9">
            <motion.div style={{ rotate: arcRotate }} className="absolute inset-0">
              <svg width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#FF6A00"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 14}
                  style={{ strokeDashoffset: arcStrokeOffset, transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
            </motion.div>
          </div>
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-ink-dim text-[10.5px] tracking-[0.1em] uppercase active:text-ink disabled:opacity-50"
            >
              {signingOut ? '…' : 'Изход'}
            </button>
          ) : (
            <button
              onClick={handleSecondary}
              className="text-ink-dim text-[10.5px] tracking-[0.1em] uppercase active:text-ink"
            >
              Вход
            </button>
          )}
        </div>

        {/* ═══ SECTION 1 · CINEMATIC SCROLL HERO ════════════════════════════ */}
        {/* 250vh tall — pinned sticky inner container holds the 100vh stage
            and crossfades 3 text states as the user scrolls. */}
        <section
          ref={heroRef}
          className="relative h-[250vh] overflow-visible"
        >
          <div className="sticky top-0 h-[100vh] w-full overflow-hidden">
            {/* BACKGROUND IMAGE — parallax + scale + blur + fade */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ y: imgY, scale: imgScale, opacity: imgOpacity, filter: imgFilter }}
            >
              <img
                src="/landing/hero.webp"
                alt=""
                decoding="async"
                fetchpriority="high"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/40 via-forest-deep/65 to-forest-deep" />
            </motion.div>

            {/* SHIELD — rotates on Y, lifts toward top, shrinks, fades */}
            <motion.div
              className="absolute left-1/2 top-[18vh] -translate-x-1/2 flex justify-center"
              style={{ y: shieldY, scale: shieldScale, opacity: shieldOpacity }}
            >
              <motion.div
                style={{ rotateY: shieldRotateY, transformStyle: 'preserve-3d', perspective: 800 }}
              >
                <Suspense fallback={<ShieldFallback size={120} />}>
                  <Shield3D size={120} />
                </Suspense>
              </motion.div>
            </motion.div>

            {/* TEXT STATES — three headlines crossfading across the scroll */}
            <div className="absolute inset-x-0 top-[48vh] px-6">
              {/* State 1: brand intro */}
              <motion.div
                style={{ opacity: text1Opacity, y: text1Y }}
                className="absolute inset-x-6 text-center"
              >
                <motion.div
                  variants={STAGGER_CONTAINER}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div
                    variants={STAGGER_ITEM}
                    className="font-display text-accent text-[10.5px] tracking-[0.18em] uppercase mb-4"
                  >
                    60-дневен протокол за мъже
                  </motion.div>
                  <h1 className="font-display font-bold text-ink text-[42px] sm:text-[48px] leading-[0.92] tracking-display uppercase">
                    <span className="block">
                      {HERO_WORDS_1.map((w, i) => (
                        <motion.span key={i} variants={STAGGER_ITEM} className="inline-block mr-2.5">{w}</motion.span>
                      ))}
                    </span>
                    <span className="block">
                      {HERO_WORDS_2.map((w, i) => (
                        <motion.span key={i} variants={STAGGER_ITEM} className="inline-block mr-2.5">{w}</motion.span>
                      ))}
                    </span>
                    <span className="block text-accent">
                      {HERO_WORDS_3.map((w, i) => (
                        <motion.span key={i} variants={STAGGER_ITEM} className="inline-block mr-2.5">{w}</motion.span>
                      ))}
                    </span>
                  </h1>
                </motion.div>
              </motion.div>

              {/* State 2: shock stat */}
              <motion.div
                style={{ opacity: text2Opacity, y: text2Y }}
                className="absolute inset-x-6 text-center"
              >
                <div className="font-display text-accent text-[10.5px] tracking-[0.18em] uppercase mb-4">
                  Истината
                </div>
                <div className="font-display font-bold text-ink text-[110px] sm:text-[130px] leading-none tracking-display mb-2">
                  <span style={{ textShadow: '0 0 32px rgba(255,106,0,0.45)' }}>75<span className="text-accent">%</span></span>
                </div>
                <div className="font-display font-bold text-ink text-[18px] tracking-display uppercase">
                  Мъже го имат.
                </div>
                <div className="font-display font-bold text-accent text-[18px] tracking-display uppercase">
                  Никой не казва.
                </div>
              </motion.div>

              {/* State 3: promise */}
              <motion.div
                style={{ opacity: text3Opacity, y: text3Y }}
                className="absolute inset-x-6 text-center"
              >
                <div className="font-display text-accent text-[10.5px] tracking-[0.18em] uppercase mb-4">
                  Резултат
                </div>
                <h2 className="font-display font-bold text-ink text-[34px] leading-[0.98] tracking-display uppercase mb-5">
                  ОТ <span className="text-ink-dim line-through">ИНСТИНКТ</span>
                  <br />
                  ДО <span className="text-accent">КОНТРОЛ</span>
                </h2>
                <p className="text-ink-muted text-[14px] leading-[1.55] max-w-[300px] mx-auto">
                  60 дни. Един протокол. Цена на едно кафе на седмица.
                </p>
              </motion.div>
            </div>

            {/* CTA — pinned in the bottom safe-area of the hero stage */}
            <div className="absolute inset-x-0 bottom-0 px-6 pb-[max(28px,env(safe-area-inset-bottom))]">
              <motion.button
                onClick={handlePrimaryCta}
                whileTap={{ scale: 0.96 }}
                whileHover={{ y: -1 }}
                animate={reduced ? {} : {
                  boxShadow: [
                    '0 0 28px rgba(255,106,0,0.45)',
                    '0 0 56px rgba(255,106,0,0.80)',
                    '0 0 28px rgba(255,106,0,0.45)'
                  ]
                }}
                transition={{
                  boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
                  scale: SPRING
                }}
                className="w-full min-h-[62px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase inline-flex items-center justify-center gap-2"
              >
                {isPaid
                  ? (firstName ? `Влез, ${firstName}` : 'Влез в курса')
                  : isAuthedNotPaid
                    ? 'Към плащане'
                    : 'Започни сега'}
                <ArrowRight size={18} strokeWidth={2.8} />
              </motion.button>
              <div className="flex items-center justify-center gap-2 mt-4 text-ink-dim text-[10.5px] tracking-[0.08em] uppercase">
                <Sparkles size={11} className="text-accent" />
                <span>€11 lifetime · Без абонамент</span>
              </div>
            </div>

            {/* Scroll cue — visible in first state only */}
            <motion.div
              style={{ opacity: text1Opacity }}
              className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-1 text-ink-dim text-[9px] tracking-[0.2em] uppercase pointer-events-none"
            >
              <span>Скрол</span>
              <motion.div
                animate={reduced ? {} : { y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown size={14} className="text-accent" strokeWidth={2.4} />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══ SECTION 2 · SHAME RELEASE ═══════════════════════════════════ */}
        <section className="relative px-6 py-16 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            01 · Истината
          </div>
          <div className="grid grid-cols-2 gap-3 mb-7">
            <Stat number={75} suffix="%" label="мъжете" sub="между 25 и 45 г." />
            <Stat number={90} suffix="%" label="мълчат" sub="никога не казват" />
          </div>
          <p className="text-ink text-[18px] leading-[1.45] font-display tracking-display uppercase mb-3">
            Не си слаб. Не си счупен.
          </p>
          <p className="text-ink-muted text-[15px] leading-[1.6]">
            Това е необучен мускул. Нервната ти система реагира, преди мозъкът ти да е разбрал. Просто никой не те е научил какво да правиш с това.
          </p>
        </section>

        {/* ═══ SECTION 3 · PAIN QUOTES (carousel of one) ═══════════════════ */}
        <section className="px-6 py-12 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-5">
            02 · Знаеш ги
          </div>
          <div className="space-y-3">
            {PROBLEM_QUOTES.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border-l-2 border-accent/50 bg-forest-card/40 px-4 py-3 text-ink text-[14px] leading-[1.55] italic"
              >
                {q}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 4 · NOT vs IS ═══════════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            03 · Какво е това
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-7">
            Velion Lab НЕ е…
          </h2>
          <div className="space-y-2 mb-9">
            {NOT_THIS.map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <div className="w-5 h-5 mt-0.5 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <X size={11} strokeWidth={3} className="text-red-400" />
                </div>
                <span className="text-ink-muted text-[14.5px] leading-[1.5]">{line}</span>
              </div>
            ))}
          </div>

          <h2 className="font-display font-bold text-accent text-[28px] leading-[1.05] tracking-display uppercase mb-5">
            Това е…
          </h2>
          <div className="space-y-2">
            {THIS.map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <div className="w-5 h-5 mt-0.5 rounded-full border border-accent/50 bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Check size={11} strokeWidth={3} className="text-accent" />
                </div>
                <span className="text-ink text-[14.5px] leading-[1.5]">{line}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 5 · 8 MODULES ═══════════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            04 · Какво ще научиш
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-3">
            8 модула · 60 дни
          </h2>
          <p className="text-ink-muted text-[14px] leading-[1.55] mb-6">
            Всеки модул надгражда върху предишния. Не можеш да прескочиш — и нямаш нужда.
          </p>

          <div className="space-y-3">
            {MODULES.map((m, i) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 14, rotateX: -8 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.04 }}
                  style={{ perspective: '600px' }}
                  className="rounded-2xl border border-forest-line bg-forest-card/70 px-4 py-4 flex items-center gap-4 relative overflow-hidden"
                >
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_95%_50%,rgba(255,106,0,0.08),transparent_55%)]" />
                  <div
                    className="relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(255,106,0,0.14)',
                      border: '1px solid rgba(255,106,0,0.4)'
                    }}
                  >
                    <Icon size={18} strokeWidth={2.2} style={{ color: m.color }} />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-display text-ink-dim text-[10px] tracking-[0.18em]">
                        МОДУЛ {m.id}
                      </span>
                      <span className="font-display text-ink-dim text-[10px] tracking-[0.1em]">
                        · Дни {m.range}
                      </span>
                    </div>
                    <div className="font-display font-bold text-ink text-[15px] tracking-display uppercase">
                      {m.title}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ═══ SECTION 6 · DAILY ROUTINE ═══════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            05 · Един ден вътре
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-3">
            15 минути на ден
          </h2>
          <p className="text-ink-muted text-[14px] leading-[1.55] mb-7">
            Не зум. Не разписание. Не група. Само ти, телефонът ти и системата — кога ти е удобно.
          </p>

          <div className="rounded-3xl border border-forest-line bg-forest-card/60 p-5 space-y-3">
            {ROUTINE.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <div className="w-16 flex-shrink-0">
                  <div className="font-display font-bold text-accent text-[16px] tracking-display">
                    {r.time}
                  </div>
                </div>
                <div className="w-1.5 h-10 bg-forest-line rounded-full" />
                <div className="flex-1">
                  <div className="font-display font-bold text-ink text-[13.5px] tracking-[0.06em] uppercase">
                    {r.label}
                  </div>
                  <div className="text-ink-dim text-[11.5px]">
                    {r.sub}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 7 · SCIENCE ═════════════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            06 · Методът
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-3">
            Не мотивация. Наука.
          </h2>
          <p className="text-ink-muted text-[14px] leading-[1.55] mb-7">
            Три стълба от приложна неврология, поведенческа психология и физиология.
          </p>

          <div className="space-y-4">
            {SCIENCE.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-forest-line bg-forest-card/60 px-5 py-5"
              >
                <div className="font-display text-accent text-[10.5px] tracking-[0.16em] uppercase mb-2">
                  {String(i + 1).padStart(2, '0')} · {s.title}
                </div>
                <p className="text-ink text-[14px] leading-[1.55] mb-3">
                  {s.body}
                </p>
                <div className="font-display text-ink-dim text-[10.5px] tracking-[0.04em] italic">
                  {s.cite}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 8 · STATS ═══════════════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="grid grid-cols-2 gap-3">
            <Stat number={60} label="дни" sub="структуриран протокол" big />
            <Stat number={8} label="модула" sub="всеки строи следващия" big />
            <Stat number={15} label="минути" sub="на ден" big />
            <Stat number={11} prefix="€" label="lifetime" sub="без абонамент" big positive />
          </div>
        </section>

        {/* ═══ SECTION 9 · COMPARISON ══════════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            07 · Сравни
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-6">
            Какви са алтернативите
          </h2>

          <div className="rounded-3xl border border-forest-line overflow-hidden">
            {COMPARISON.map((c) => (
              <div
                key={c.label}
                className="px-5 py-4 flex items-center justify-between gap-3 border-b border-forest-line/60 last:border-b-0"
                style={{
                  background: c.highlight ? 'rgba(255,106,0,0.10)' : 'transparent'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="font-display font-bold text-[14px] tracking-display uppercase leading-tight mb-0.5"
                    style={{ color: c.highlight ? '#FF6A00' : '#F5F1EA' }}
                  >
                    {c.label}
                  </div>
                  {c.cons && (
                    <div className="text-ink-dim text-[11.5px] leading-snug">{c.cons}</div>
                  )}
                </div>
                <div
                  className="font-display font-bold text-[14px] tracking-display flex-shrink-0"
                  style={{ color: c.highlight ? '#FF6A00' : '#B7B0A2' }}
                >
                  {c.cost}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ SECTION 10 · PRICE ══════════════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            08 · Цена
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl border border-accent/40 bg-forest-card p-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,106,0,0.20),transparent_55%)] pointer-events-none" />
            <div className="relative">
              <div className="font-display text-accent text-[11px] tracking-[0.18em] uppercase mb-3 text-center">
                ПЪЛЕН ДОСТЪП
              </div>
              <div className="text-center mb-2">
                <span className="font-display font-bold text-ink text-[64px] leading-none tracking-display">
                  {PRICE.price}
                </span>
              </div>
              <p className="text-ink-muted text-[12.5px] text-center mb-6">
                Еднократно плащане · Lifetime достъп
              </p>

              <div className="space-y-2.5 mb-6">
                {[
                  '60 структурирани дни',
                  '8 модула с упражнения',
                  'Контрол индекс (преди / след)',
                  'AI Coach, мисии, статистика',
                  'Сертификат за завършване',
                  'Всички бъдещи updates безплатно'
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 mt-0.5 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center flex-shrink-0">
                      <Check size={11} strokeWidth={3} className="text-accent" />
                    </div>
                    <span className="text-ink text-[13.5px] leading-[1.5]">{f}</span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handlePrimaryCta}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -1 }}
                animate={reduced ? {} : {
                  boxShadow: [
                    '0 0 24px rgba(255,106,0,0.40)',
                    '0 0 48px rgba(255,106,0,0.70)',
                    '0 0 24px rgba(255,106,0,0.40)'
                  ]
                }}
                transition={{ boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
                className="w-full min-h-[58px] rounded-2xl bg-accent text-forest-deep font-display text-sm font-bold tracking-display uppercase inline-flex items-center justify-center gap-2"
              >
                Вземи достъп
                <ArrowRight size={16} strokeWidth={2.8} />
              </motion.button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-ink-dim text-[11px]">
                <Lock size={12} className="text-accent" strokeWidth={2.4} />
                <span>Сигурно плащане през Stripe</span>
              </div>
            </div>
          </motion.div>

          <div className="mt-4 rounded-2xl border border-forest-line bg-forest-card/40 px-4 py-3 text-center">
            <div className="font-display text-[color:#3DD68C] text-[10.5px] tracking-[0.14em] uppercase mb-1 inline-flex items-center gap-1.5">
              <ShieldIcon size={12} strokeWidth={2.5} />
              14 ДНИ ГАРАНЦИЯ
            </div>
            <p className="text-ink-muted text-[12px] leading-[1.5]">
              Не ти ли е резонирало — пишеш и парите се връщат. Без въпроси.
            </p>
          </div>
        </section>

        {/* ═══ SECTION 11 · FAQ ════════════════════════════════════════════ */}
        <section className="px-6 py-14 border-t border-forest-line/40">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-4">
            09 · Често задавани
          </div>
          <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-6">
            Въпроси
          </h2>

          <div className="space-y-2">
            {FAQ.map((item, i) => {
              const open = openFaq === i
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-forest-line bg-forest-card/50 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left active:bg-forest-card"
                  >
                    <span className="font-display font-bold text-ink text-[13.5px] tracking-[0.04em] flex-1">
                      {item.q}
                    </span>
                    <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }}>
                      <Plus size={16} className="text-accent flex-shrink-0" strokeWidth={2.5} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="px-4 pb-4 text-ink-muted text-[13px] leading-[1.55]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* ═══ SECTION 13 · FINAL CTA ══════════════════════════════════════ */}
        <section className="relative px-6 py-16 border-t border-forest-line/40 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,106,0,0.18),transparent_60%)] pointer-events-none" />
          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7 }}
              className="flex justify-center mb-5"
            >
              <Suspense fallback={<ShieldFallback size={72} />}>
                <Shield3D size={72} />
              </Suspense>
            </motion.div>
            <h2 className="font-display font-bold text-ink text-[28px] leading-[1.05] tracking-display uppercase mb-3">
              60 дни.
              <br />
              Един протокол.
              <br />
              <span className="text-accent">Решаваш сега.</span>
            </h2>
            <p className="text-ink-muted text-[14.5px] leading-[1.6] mb-7 max-w-[320px] mx-auto">
              Утре сутрин ще си с 1 ден напред — или ще си същия. Изборът е €11.
            </p>
            <motion.button
              onClick={handlePrimaryCta}
              whileTap={{ scale: 0.97 }}
              animate={reduced ? {} : {
                boxShadow: [
                  '0 0 28px rgba(255,106,0,0.45)',
                  '0 0 60px rgba(255,106,0,0.80)',
                  '0 0 28px rgba(255,106,0,0.45)'
                ]
              }}
              transition={{ boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
              className="w-full min-h-[64px] rounded-2xl bg-accent text-forest-deep font-display text-base font-bold tracking-display uppercase inline-flex items-center justify-center gap-2"
            >
              Започни сега · {PRICE.price}
              <ArrowRight size={18} strokeWidth={2.8} />
            </motion.button>
            <div className="mt-5 text-ink-dim text-[10.5px] tracking-[0.1em] uppercase">
              14 дни refund · Lifetime достъп · Без абонамент
            </div>
          </div>
        </section>

        {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
        <footer className="px-6 py-10 border-t border-forest-line/40 text-center">
          <div className="font-display text-accent text-[10px] tracking-[0.2em] uppercase mb-3">
            Velion Lab
          </div>
          <div className="flex items-center justify-center gap-4 text-ink-dim text-[11px] mb-3">
            <button onClick={() => navigate(ROUTES.privacy)} className="active:text-ink">
              Поверителност
            </button>
            <span className="text-forest-line">·</span>
            <button onClick={() => navigate(ROUTES.terms)} className="active:text-ink">
              Условия
            </button>
            <span className="text-forest-line">·</span>
            <button onClick={() => navigate(ROUTES.about)} className="active:text-ink">
              За проекта
            </button>
          </div>
          <div className="text-ink-dim text-[10.5px]">
            velionbilgaria@gmail.com
          </div>
        </footer>

        {/* Bottom spacer for sticky CTA */}
        <div className="h-24" />
      </div>

      {/* ═══ STICKY BOTTOM CTA ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            className="absolute left-0 right-0 bottom-0 z-30 px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none"
          >
            <div className="pointer-events-auto">
              <button
                onClick={handlePrimaryCta}
                className="w-full min-h-[54px] rounded-2xl bg-accent text-forest-deep font-display text-[13px] font-bold tracking-display uppercase inline-flex items-center justify-center gap-2 shadow-[0_0_36px_rgba(255,106,0,0.55)]"
              >
                {isPaid
                  ? (firstName ? `Влез, ${firstName}` : 'Влез в курса')
                  : isAuthedNotPaid
                    ? 'Към плащане'
                    : `Започни · ${PRICE.price}`}
                <ArrowRight size={16} strokeWidth={2.8} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  )
}

// ─── SMALL HELPERS ──────────────────────────────────────────────────────────

function Stat({ number, prefix = '', suffix = '', label, sub, big = false, positive = false }) {
  const color = positive ? '#3DD68C' : '#FF6A00'
  return (
    <div className="rounded-2xl border border-forest-line bg-forest-card/60 px-4 py-4">
      <div
        className={`font-display font-bold leading-none tracking-display ${big ? 'text-[34px]' : 'text-[28px]'}`}
        style={{ color, textShadow: `0 0 18px ${color}33` }}
      >
        {prefix}
        <CountUp to={number} />
        {suffix}
      </div>
      <div className="font-display text-ink text-[11px] tracking-[0.14em] uppercase mt-2 font-bold">
        {label}
      </div>
      {sub && (
        <div className="text-ink-dim text-[10.5px] mt-1 leading-snug">
          {sub}
        </div>
      )}
    </div>
  )
}
