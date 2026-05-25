import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { ROUTES } from '../lib/routes.js'
import { FREE_ACCESS_MODE } from '../lib/config.js'

export default function ProtectedRoute({ children, requirePaid = false }) {
  const { isAuthenticated, loading, accessLoading, hasPaidAccess } = useAuth()
  const location = useLocation()

  // When FREE_ACCESS_MODE is on, treat any authenticated user as having paid
  // access — the paid gate is dormant. Auth still required (no anonymous use).
  const effectiveRequirePaid = FREE_ACCESS_MODE ? false : requirePaid

  // Wait for auth state to be fully resolved before deciding what to render.
  if (loading || (isAuthenticated && effectiveRequirePaid && accessLoading)) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FF6A00',
          fontFamily: 'Unbounded, system-ui, sans-serif',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}
      >
        {requirePaid ? 'проверка на достъпа…' : 'зареждане…'}
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.auth} replace state={{ from: location.pathname }} />
  }

  if (effectiveRequirePaid && !hasPaidAccess) {
    return <Navigate to={ROUTES.paywall} replace state={{ from: location.pathname }} />
  }

  return children
}
