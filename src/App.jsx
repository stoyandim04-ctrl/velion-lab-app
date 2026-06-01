import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PhoneFrame from './components/layout/PhoneFrame.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RouteFallback from './components/RouteFallback.jsx'
import { OnboardingProvider } from './state/OnboardingContext.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import { ROUTES } from './lib/routes.js'
import { registerDeepLinks } from './lib/capacitor.js'

// Onboarding-path screens stay eager — they're tiny and on the first paint.
import LandingScreen from './screens/LandingScreen.jsx'
import AuthScreen from './screens/AuthScreen.jsx'
import GoalsScreen from './screens/GoalsScreen.jsx'
import NotAloneScreen from './screens/NotAloneScreen.jsx'
import QuizScreen from './screens/QuizScreen.jsx'
import BreatherScreen from './screens/BreatherScreen.jsx'
import ResultsScreen from './screens/ResultsScreen.jsx'
import FutureScreen from './screens/FutureScreen.jsx'
import PaywallScreen from './screens/PaywallScreen.jsx'

// Legacy screens kept registered (not in main flow) for backwards-compat with any deep link.
const WelcomeScreen = lazy(() => import('./screens/WelcomeScreen.jsx'))
const EducationScreen = lazy(() => import('./screens/EducationScreen.jsx'))
const BuildingPlanScreen = lazy(() => import('./screens/BuildingPlanScreen.jsx'))
const ResultScreen = lazy(() => import('./screens/ResultScreen.jsx'))
const SuccessScreen = lazy(() => import('./screens/SuccessScreen.jsx'))
const DailyOnboardingScreen = lazy(() => import('./screens/DailyOnboardingScreen.jsx'))
const DashboardScreen = lazy(() => import('./screens/DashboardScreen.jsx'))
const StatsScreen = lazy(() => import('./screens/StatsScreen.jsx'))
const BeforeAfterScreen = lazy(() => import('./screens/BeforeAfterScreen.jsx'))
const DayScreen = lazy(() => import('./screens/DayScreen.jsx'))
const DaysScreen = lazy(() => import('./screens/DaysScreen.jsx'))
const PrivacyScreen = lazy(() => import('./screens/PrivacyScreen.jsx'))
const TermsScreen = lazy(() => import('./screens/TermsScreen.jsx'))
const FounderScreen = lazy(() => import('./screens/FounderScreen.jsx'))

const protectedDay = (
  <ProtectedRoute requirePaid>
    <DayScreen />
  </ProtectedRoute>
)

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Native deep links: when the user returns from Stripe Checkout (or any
  // other Universal/App Link), navigate to the path embedded in the URL.
  useEffect(() => {
    let cleanup = () => {}
    registerDeepLinks((path) => {
      navigate(path, { replace: true })
    }).then((fn) => { cleanup = fn })
    return () => cleanup()
  }, [navigate])

  return (
    <>
      {true && (
        <AuthProvider>
          <OnboardingProvider>
            <PhoneFrame>
              <AnimatePresence mode="wait" initial={false}>
                <Suspense fallback={<RouteFallback />}>
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<LandingScreen />} />
                  <Route path="/welcome-classic" element={<WelcomeScreen />} />
                  <Route path={ROUTES.auth} element={<AuthScreen />} />
                  <Route path={ROUTES.goals} element={<GoalsScreen />} />
                  <Route path={ROUTES.notAlone} element={<NotAloneScreen />} />
                  <Route path={ROUTES.quiz} element={<QuizScreen />} />
                  <Route path={ROUTES.breather} element={<BreatherScreen />} />
                  <Route path={ROUTES.results} element={<ResultsScreen />} />
                  <Route path={ROUTES.education} element={<EducationScreen />} />
                  <Route path={ROUTES.future} element={<FutureScreen />} />
                  <Route path={ROUTES.building} element={<BuildingPlanScreen />} />
                  <Route path={ROUTES.result} element={<ResultScreen />} />
                  <Route path={ROUTES.paywall} element={<PaywallScreen />} />
                  <Route path={ROUTES.success} element={<ProtectedRoute><SuccessScreen /></ProtectedRoute>} />
                  <Route path={ROUTES.dailyOnboarding} element={<ProtectedRoute requirePaid><DailyOnboardingScreen /></ProtectedRoute>} />
                  <Route path={ROUTES.dashboard} element={<ProtectedRoute requirePaid><DashboardScreen /></ProtectedRoute>} />
                  <Route path={ROUTES.stats} element={<ProtectedRoute requirePaid><StatsScreen /></ProtectedRoute>} />
                  <Route path={ROUTES.transformation} element={<ProtectedRoute requirePaid><BeforeAfterScreen /></ProtectedRoute>} />
                  <Route path="/course/day-1" element={protectedDay} />
                  <Route path="/course/day-2" element={protectedDay} />
                  <Route path="/course/day-3" element={protectedDay} />
                  <Route path="/course/day-4" element={protectedDay} />
                  <Route path="/course/day-5" element={protectedDay} />
                  <Route path="/course/day-6" element={protectedDay} />
                  <Route path="/course/day-7" element={protectedDay} />
                  <Route path="/course/day-8" element={protectedDay} />
                  <Route path="/course/day-9" element={protectedDay} />
                  <Route path="/course/day-10" element={protectedDay} />
                  <Route path="/course/day-11" element={protectedDay} />
                  <Route path="/course/day-12" element={protectedDay} />
                  <Route path="/course/day-13" element={protectedDay} />
                  <Route path="/course/day-14" element={protectedDay} />
                  <Route path="/course/day-15" element={protectedDay} />
                  <Route path="/course/day-16" element={protectedDay} />
                  <Route path="/course/day-17" element={protectedDay} />
                  <Route path="/course/day-18" element={protectedDay} />
                  <Route path="/course/day-19" element={protectedDay} />
                  <Route path="/course/day-20" element={protectedDay} />
                  <Route path="/course/day-21" element={protectedDay} />
                  <Route path="/course/day-22" element={protectedDay} />
                  <Route path="/course/day-23" element={protectedDay} />
                  <Route path="/course/day-24" element={protectedDay} />
                  <Route path="/course/day-25" element={protectedDay} />
                  <Route path="/course/day-26" element={protectedDay} />
                  <Route path="/course/day-27" element={protectedDay} />
                  <Route path="/course/day-28" element={protectedDay} />
                  <Route path="/course/day-29" element={protectedDay} />
                  <Route path="/course/day-30" element={protectedDay} />
                  <Route path="/course/day-31" element={protectedDay} />
                  <Route path="/course/day-32" element={protectedDay} />
                  <Route path="/course/day-33" element={protectedDay} />
                  <Route path="/course/day-34" element={protectedDay} />
                  <Route path="/course/day-35" element={protectedDay} />
                  <Route path="/course/day-36" element={protectedDay} />
                  <Route path="/course/day-37" element={protectedDay} />
                  <Route path="/course/day-38" element={protectedDay} />
                  <Route path="/course/day-39" element={protectedDay} />
                  <Route path="/course/day-40" element={protectedDay} />
                  <Route path="/course/day-41" element={protectedDay} />
                  <Route path="/course/day-42" element={protectedDay} />
                  <Route path="/course/day-43" element={protectedDay} />
                  <Route path="/course/day-44" element={protectedDay} />
                  <Route path="/course/day-45" element={protectedDay} />
                  <Route path="/course/day-46" element={protectedDay} />
                  <Route path="/course/day-47" element={protectedDay} />
                  <Route path="/course/day-48" element={protectedDay} />
                  <Route path="/course/day-49" element={protectedDay} />
                  <Route path="/course/day-50" element={protectedDay} />
                  <Route path="/course/day-51" element={protectedDay} />
                  <Route path="/course/day-52" element={protectedDay} />
                  <Route path="/course/day-53" element={protectedDay} />
                  <Route path="/course/day-54" element={protectedDay} />
                  <Route path="/course/day-55" element={protectedDay} />
                  <Route path="/course/day-56" element={protectedDay} />
                  <Route path="/course/day-57" element={protectedDay} />
                  <Route path="/course/day-58" element={protectedDay} />
                  <Route path="/course/day-59" element={protectedDay} />
                  <Route path="/course/day-60" element={protectedDay} />
                  <Route path={ROUTES.day} element={protectedDay} />
                  <Route path={ROUTES.days} element={<ProtectedRoute requirePaid><DaysScreen /></ProtectedRoute>} />
                  <Route path={ROUTES.privacy} element={<PrivacyScreen />} />
                  <Route path={ROUTES.terms} element={<TermsScreen />} />
                  <Route path={ROUTES.about} element={<FounderScreen />} />
                  <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
                </Routes>
                </Suspense>
              </AnimatePresence>
            </PhoneFrame>
          </OnboardingProvider>
        </AuthProvider>
      )}

    </>
  )
}
