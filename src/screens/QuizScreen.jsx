import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Screen from '../components/layout/Screen.jsx'
import Header from '../components/layout/Header.jsx'
import ProgressBar from '../components/layout/ProgressBar.jsx'
import Button from '../components/ui/Button.jsx'
import QuizOption from '../components/features/QuizOption.jsx'
import { QUIZ, QUIZ_TOTAL } from '../data/quiz.js'
import { useOnboarding } from '../state/OnboardingContext.jsx'
import { ROUTES } from '../lib/routes.js'

export default function QuizScreen() {
  const { step } = useParams()
  const navigate = useNavigate()
  const { answers, setAnswer } = useOnboarding()

  const stepNum = Math.max(1, Math.min(QUIZ_TOTAL, Number(step) || 1))
  const question = QUIZ.find((q) => q.id === stepNum)
  const selected = answers[stepNum]

  const handleNext = () => {
    if (stepNum < QUIZ_TOTAL) {
      navigate(`/quiz/${stepNum + 1}`)
    } else {
      navigate(ROUTES.education)
    }
  }

  return (
    <Screen>
      <Header step={stepNum} total={QUIZ_TOTAL} />

      <div className="px-6 pb-2">
        <ProgressBar value={stepNum} max={QUIZ_TOTAL} />
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide scroll-pb-[190px] px-6 pt-6 pb-[190px]"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepNum}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display font-bold text-[26px] leading-[1.15] tracking-display text-ink uppercase mb-8">
              {question.question}
            </h1>

            <div className="flex flex-col gap-3">
              {question.options.map((opt) => (
                <QuizOption
                  key={opt}
                  label={opt}
                  selected={selected === opt}
                  onSelect={() => setAnswer(stepNum, opt)}
                />
              ))}
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-forest-deep via-forest-deep/95 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
          <Button onClick={handleNext} disabled={!selected}>
            {stepNum < QUIZ_TOTAL ? 'Продължи' : 'Завърши'}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
