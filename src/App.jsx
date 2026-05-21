import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import PhoneFrame from './components/layout/PhoneFrame.jsx'
import CinematicIntro from './components/CinematicIntro.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { OnboardingProvider } from './state/OnboardingContext.jsx'
import { AuthProvider } from './state/AuthContext.jsx'
import { ROUTES } from './lib/routes.js'

import WelcomeScreen from './screens/WelcomeScreen.jsx'
import AuthScreen from './screens/AuthScreen.jsx'
import GoalsScreen from './screens/GoalsScreen.jsx'
import NotAloneScreen from './screens/NotAloneScreen.jsx'
import QuizScreen from './screens/QuizScreen.jsx'
import EducationScreen from './screens/EducationScreen.jsx'
import FutureScreen from './screens/FutureScreen.jsx'
import BuildingPlanScreen from './screens/BuildingPlanScreen.jsx'
import ResultScreen from './screens/ResultScreen.jsx'
import SocialProofScreen from './screens/SocialProofScreen.jsx'
import PaywallScreen from './screens/PaywallScreen.jsx'
import SuccessScreen from './screens/SuccessScreen.jsx'
import DashboardScreen from './screens/DashboardScreen.jsx'
import DayScreen from './screens/DayScreen.jsx'

const protectedDay = (
  <ProtectedRoute>
    <DayScreen />
  </ProtectedRoute>
)

export default function App() {
  const location = useLocation()
  const [showIntro, setShowIntro] = useState(true)
  const [mountApp, setMountApp] = useState(false)
  const prevPathRef = useRef(location.pathname)

  useEffect(() => {
    const prev = prevPathRef.current
    const curr = location.pathname
    if (curr === ROUTES.welcome && prev !== ROUTES.welcome) {
      setShowIntro(true)
      setMountApp(false)
    }
    prevPathRef.current = curr
  }, [location.pathname])

  const handleIntroStartExit = () => {
    setMountApp(true)
  }

  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  return (
    <>
      {mountApp && (
        <AuthProvider>
          <OnboardingProvider>
            <PhoneFrame>
              <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                  <Route path={ROUTES.welcome} element={<WelcomeScreen />} />
                  <Route path={ROUTES.auth} element={<AuthScreen />} />
                  <Route path={ROUTES.goals} element={<GoalsScreen />} />
                  <Route path={ROUTES.notAlone} element={<NotAloneScreen />} />
                  <Route path={ROUTES.quiz} element={<QuizScreen />} />
                  <Route path={ROUTES.education} element={<EducationScreen />} />
                  <Route path={ROUTES.future} element={<FutureScreen />} />
                  <Route path={ROUTES.building} element={<BuildingPlanScreen />} />
                  <Route path={ROUTES.result} element={<ResultScreen />} />
                  <Route path={ROUTES.social} element={<SocialProofScreen />} />
                  <Route path={ROUTES.paywall} element={<PaywallScreen />} />
                  <Route path={ROUTES.success} element={<SuccessScreen />} />
                  <Route path={ROUTES.dashboard} element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
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
                  <Route path={ROUTES.day} element={protectedDay} />
                  <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
                </Routes>
              </AnimatePresence>
            </PhoneFrame>
          </OnboardingProvider>
        </AuthProvider>
      )}

      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100dvh',
              minHeight: '100vh',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.65, 0, 0.35, 1] }}
          >
            <CinematicIntro
              onStartExit={handleIntroStartExit}
              onComplete={handleIntroComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
