import React from 'react'

// Catches uncaught React errors so the user sees a calm Bulgarian message
// with a Retry button instead of a blank white screen. Apple reviewers
// crash-test apps regularly — this is the difference between a clean
// review and a 2.1 rejection.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Surface in console so it shows up in Sentry/Vercel logs later.
    console.error('[Velion] uncaught render error:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#060D0A',
          color: '#F5F1EA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          fontFamily: 'Manrope, system-ui, sans-serif',
          textAlign: 'center',
          gap: 24
        }}
      >
        <img
          src="/logo/velion-shield.svg"
          alt=""
          style={{ width: 56, height: 56, opacity: 0.85 }}
        />
        <div>
          <div
            style={{
              fontFamily: 'Unbounded, system-ui, sans-serif',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#FF6A00',
              marginBottom: 12
            }}
          >
            Възникна грешка
          </div>
          <h1
            style={{
              fontFamily: 'Unbounded, system-ui, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 12,
              textTransform: 'uppercase'
            }}
          >
            Нещо неочаквано се случи
          </h1>
          <p style={{ fontSize: 14, color: '#A8A39B', maxWidth: 320, margin: '0 auto', lineHeight: 1.5 }}>
            Опитай отново или зареди приложението наново. Прогресът ти е запазен сигурно.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={this.handleRetry}
            style={{
              background: '#FF6A00',
              color: '#060D0A',
              border: 'none',
              borderRadius: 999,
              padding: '14px 22px',
              fontFamily: 'Unbounded, system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Опитай отново
          </button>
          <button
            onClick={this.handleReload}
            style={{
              background: 'transparent',
              color: '#A8A39B',
              border: '1px solid #1A2B23',
              borderRadius: 999,
              padding: '14px 22px',
              fontFamily: 'Unbounded, system-ui, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Презареди
          </button>
        </div>
      </div>
    )
  }
}
