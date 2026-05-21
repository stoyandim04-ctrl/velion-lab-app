import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

const OnboardingContext = createContext(null)

const STORAGE_KEY = 'velion_onboarding_v1'

function loadState() {
  if (typeof window === 'undefined') return { goals: [], answers: {} }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { goals: [], answers: {} }
    const parsed = JSON.parse(raw)
    return {
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {}
    }
  } catch {
    return { goals: [], answers: {} }
  }
}

export function OnboardingProvider({ children }) {
  const initial = useMemo(loadState, [])
  const [goals, setGoals] = useState(initial.goals)
  const [answers, setAnswers] = useState(initial.answers)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ goals, answers }))
    } catch {}
  }, [goals, answers])

  const toggleGoal = useCallback((id) => {
    setGoals((curr) => (curr.includes(id) ? curr.filter((g) => g !== id) : [...curr, id]))
  }, [])

  const setAnswer = useCallback((qid, value) => {
    setAnswers((curr) => ({ ...curr, [qid]: value }))
  }, [])

  const reset = useCallback(() => {
    setGoals([])
    setAnswers({})
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {}
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
