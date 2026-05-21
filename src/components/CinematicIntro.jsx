import { useEffect, useRef, useState } from 'react'

const VIDEO_VERTICAL = '/video/intro-vertical.mp4'
const INTRO_DURATION_MS = 3800
const CSS_FALLBACK_MS = 3000

export default function CinematicIntro({ onComplete, onStartExit }) {
  const videoRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [mode, setMode] = useState('loading')
  const completedRef = useRef(false)

  const finalize = () => {
    if (completedRef.current) return
    completedRef.current = true
    onStartExit?.()
    onComplete?.()
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      const t = setTimeout(finalize, 1000)
      return () => clearTimeout(t)
    }

    const v = videoRef.current
    if (!v) {
      setMode('css')
      return
    }

    v.muted = true
    v.defaultMuted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    v.removeAttribute('controls')

    const p = v.play()
    if (p && typeof p.then === 'function') {
      p.then(() => setMode('video')).catch(() => setMode('css'))
    } else {
      setMode('css')
    }
  }, [reducedMotion])

  useEffect(() => {
    if (mode === 'video') {
      const safety = setTimeout(finalize, INTRO_DURATION_MS + 2000)
      return () => clearTimeout(safety)
    }
    if (mode === 'css') {
      const t = setTimeout(finalize, CSS_FALLBACK_MS)
      return () => clearTimeout(t)
    }
  }, [mode])

  if (reducedMotion) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0A0A0A',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      />
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        zIndex: 9999,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {mode !== 'css' && (
        <video
          ref={videoRef}
          src={VIDEO_VERTICAL}
          autoPlay
          muted
          defaultMuted
          loop={false}
          playsInline
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x-webkit-airplay="deny"
          disableRemotePlayback
          disablePictureInPicture
          controls={false}
          preload="auto"
          onEnded={finalize}
          onError={() => setMode('css')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#0A0A0A',
            pointerEvents: 'none',
            opacity: mode === 'video' ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {mode === 'css' && <CssIntro />}
    </div>
  )
}

function CssIntro() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#0A0A0A',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180%',
          height: '120%',
          background: 'radial-gradient(ellipse at center, rgba(255,106,0,0.55) 0%, rgba(255,106,0,0.25) 25%, rgba(255,106,0,0.08) 45%, transparent 65%)',
          animation: 'velionEmber 3s ease-out forwards',
          filter: 'blur(40px)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 60%, transparent 0%, transparent 40%, #0A0A0A 90%)',
          opacity: 0.7
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'Unbounded, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(28px, 8vw, 48px)',
          letterSpacing: '0.25em',
          color: '#F5F1EA',
          opacity: 0,
          animation: 'velionTitle 3s ease-out forwards',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        VELION
      </div>
      <style>{`
        @keyframes velionEmber {
          0%   { transform: translate(-50%, 30%) scale(0.7); opacity: 0; }
          40%  { transform: translate(-50%, 0%) scale(1.0); opacity: 1; }
          100% { transform: translate(-50%, -10%) scale(1.15); opacity: 0.9; }
        }
        @keyframes velionTitle {
          0%   { opacity: 0; letter-spacing: 0.4em; }
          50%  { opacity: 1; letter-spacing: 0.25em; }
          85%  { opacity: 1; letter-spacing: 0.25em; }
          100% { opacity: 0.95; letter-spacing: 0.22em; }
        }
      `}</style>
    </div>
  )
}
