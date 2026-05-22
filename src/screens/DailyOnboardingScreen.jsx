import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Flame } from 'lucide-react'
import Screen from '../components/layout/Screen.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { completePremiumOnboarding, addAnalyticsEvent } from '../lib/engagement.js'
import { pushFromLocal } from '../lib/progressSync.js'
import { ROUTES } from '../lib/routes.js'

const QUESTIONS = [
  {
    id: 'confidence',
    label: 'Увереност',
    title: 'Как се чувстваш в момента?',
    options: [
      { value: 'low', label: 'Ниска', note: 'Искам стабилна основа.' },
      { value: 'medium', label: 'Средна', note: 'Имам моменти, но не е постоянно.' },
      { value: 'high', label: 'Висока', note: 'Искам следващото ниво.' }
    ]
  },
  {
    id: 'stress',
    label: 'Стрес',
    title: 'Колко напрежение носиш напоследък?',
    options: [
      { value: 'calm', label: 'Контролируемо', note: 'Имам място за фокус.' },
      { value: 'loaded', label: 'Натоварено', note: 'Тялото ми е често нащрек.' },
      { value: 'high', label: 'Високо', note: 'Искам да върна контрола.' }
    ]
  },
  {
    id: 'goal',
    label: 'Цел',
    title: 'Коя промяна е най-важна за теб?',
    options: [
      { value: 'control', label: 'Повече контрол', note: 'По-спокойна нервна система.' },
      { value: 'presence', label: 'Повече присъствие', note: 'По-силна мъжка енергия.' },
      { value: 'confidence', label: 'Повече увереност', note: 'По-малко мислене, повече действие.' }
    ]
  },
  {
    id: 'habit',
    label: 'Ритъм',
    title: 'Кога най-реално ще правиш дневния урок?',
    options: [
      { value: 'morning', label: 'Сутрин', note: 'Преди денят да ме погълне.' },
      { value: 'evening', label: 'Вечер', note: 'Когато мога да се затворя.' },
      { value: 'flexible', label: 'Гъвкаво', note: 'Но всеки ден ще има място.' }
    ]
  }
]

export default function DailyOnboardingScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const question = QUESTIONS[step]
  const answered = Boolean(answers[question.id])
  const progress = ((step + (answered ? 1 : 0)) / QUESTIONS.length) * 100

  const selectOption = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }))
    addAnalyticsEvent(user?.id, 'onboarding_answered', { question: question.id, value })
  }

  const goNext = async () => {
    if (!answered || saving) return
    if (step < QUESTIONS.length - 1) {
      setStep((current) => current + 1)
      return
    }

    setSaving(true)
    completePremiumOnboarding(user?.id, {
      ...answers,
      completedVersion: 'retention_v1'
    })
    await pushFromLocal(user?.id)
    navigate(ROUTES.dashboard, { replace: true })
  }

  return (
    <Screen background="bg-forest-deep">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(90% 55% at 50% 0%, rgba(255,106,0,0.18), transparent 62%), #060D0A'
        }}
      />

      <div
        className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain scrollbar-hide px-5 pt-[max(56px,env(safe-area-inset-top))] pb-[max(28px,env(safe-area-inset-bottom))]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-display text-[10px] tracking-[0.15em] text-accent uppercase">
                Velion Lab
              </div>
              <div className="mt-1 text-ink-dim text-[10px] tracking-[0.12em] uppercase">
                Настройка на протокола
              </div>
            </div>
            <div className="flex h-9 min-w-9 items-center justify-center rounded-full border border-accent/35 bg-accent/10 px-3 text-accent">
              <Flame size={15} />
            </div>
          </div>
          <ProgressBar value={progress} glow />
        </div>

        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 min-h-0"
        >
          <div className="text-ink-dim text-[11px] tracking-[0.15em] uppercase mb-3">
            {question.label} · {step + 1}/{QUESTIONS.length}
          </div>
          <h1 className="font-display font-bold text-ink text-[28px] leading-[1.08] tracking-display uppercase mb-4">
            {question.title}
          </h1>
          <p className="text-ink-muted text-[15px] leading-[1.6] mb-7">
            Отговорът ти настройва дневното усещане. Без шум. Само точен ритъм.
          </p>

          <div className="space-y-3">
            {question.options.map((option) => {
              const active = answers[question.id] === option.value
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option.value)}
                  whileTap={{ scale: 0.985 }}
                  className={[
                    'w-full min-h-[76px] rounded-2xl border px-4 py-4 text-left transition-all',
                    active
                      ? 'border-accent bg-accent/10 shadow-[0_0_26px_rgba(255,106,0,0.18)]'
                      : 'border-forest-line bg-forest-card/80 active:border-accent/45'
                  ].join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={[
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-accent bg-accent text-forest-deep' : 'border-forest-line text-ink-dim'
                      ].join(' ')}
                    >
                      {active ? <Check size={16} strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-[14px] font-semibold uppercase tracking-display text-ink">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-[13px] leading-[1.45] text-ink-muted">
                        {option.note}
                      </span>
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        <div className="pt-5">
          <motion.button
            type="button"
            onClick={goNext}
            disabled={!answered || saving}
            whileTap={answered && !saving ? { scale: 0.97 } : {}}
            className={[
              'flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-display text-sm font-semibold uppercase tracking-display transition-all',
              answered
                ? 'bg-accent text-forest-deep shadow-[0_0_30px_rgba(255,106,0,0.38)]'
                : 'border border-forest-line bg-forest-card text-ink-dim'
            ].join(' ')}
          >
            {saving ? 'Запазване...' : step === QUESTIONS.length - 1 ? 'Влез в курса' : 'Напред'}
            {!saving && <ArrowRight size={16} strokeWidth={2.6} />}
          </motion.button>
        </div>
      </div>
    </Screen>
  )
}
