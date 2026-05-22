import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

const OnboardingContext = createContext(null)

// Legacy storage key — we still purge it on mount in case old data is lingering
// from before the in-memory refactor. We deliberately do NOT persist onboarding
// answers anymore: each browser session starts with a clean quiz/goals state,
// so a new user never sees the previous user's pre-selected answers.
const LEGACY_STORAGE_KEY = 'velion_onboarding_v1'

function purgeLegacy() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {}
}

export function OnboardingProvider({ children }) {
  const [goals, setGoals] = useState([])
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    purgeLegacy()
  }, [])

  const toggleGoal = useCallback((id) => {
    setGoals((curr) => (curr.includes(id) ? curr.filter((g) => g !== id) : [...curr, id]))
  }, [])

  const setAnswer = useCallback((qid, value) => {
    setAnswers((curr) => ({ ...curr, [qid]: value }))
  }, [])

  const reset = useCallback(() => {
    setGoals([])
    setAnswers({})
    purgeLegacy()
  }, [])

  const value = useMemo(
    () => ({ goals, answers, toggleGoal, setAnswer, reset }),
    [goals, answers, toggleGoal, setAnswer, reset]
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider')
  return ctx
}
