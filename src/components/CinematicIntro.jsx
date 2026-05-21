import { useEffect, useRef, useState } from 'react'

const VIDEO_SRC = '/video/intro-vertical.mp4'
const INTRO_DURATION_MS = 4000
const SAFETY_TIMEOUT_MS = 6000

export default function CinematicIntro({ onComplete, onStartExit }) {
  const videoRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
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
    if (v) {
      v.muted = true
      v.defaultMuted = true
      v.setAttribute('muted', '')
      v.setAttribute('playsinline', '')
      v.setAttribute('webkit-playsinline', '')
      v.removeAttribute('controls')

      const p = v.play()
      if (p && typeof p.then === 'function') {
        p.then(() => setVideoPlaying(true)).catch(() => setVideoPlaying(false))
      }
    }

    const main = setTimeout(finalize, INTRO_DURATION_MS)
    const safety = setTimeout(finalize, SAFETY_TIMEOUT_MS)

    return () => {
      clearTimeout(main)
      clearTimeout(safety)
    }
  }, [reducedMotion])

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
      <video
        ref={videoRef}
        src={VIDEO_SRC}
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
        onError={() => setVideoPlaying(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: '#0A0A0A',
          pointerEvents: 'none',
          opacity: videoPlaying ? 1 : 0,
          transition: 'opacity 0.4s ease'
        }}
      />

      {!videoPlaying && (
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
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 35%, rgba(10,10,10,0.55) 80%)',
          pointerEvents: 'none'
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
          fontSize: 'clamp(36px, 11vw, 64px)',
          color: '#F5F1EA',
          opacity: 0,
          animation: 'velionTitle 3.5s ease-out forwards',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          textShadow: '0 0 24px rgba(0,0,0,0.6)',
          pointerEvents: 'none'
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
          40%  { opacity: 1; letter-spacing: 0.28em; }
          85%  { opacity: 1; letter-spacing: 0.28em; }
          100% { opacity: 0.95; letter-spacing: 0.25em; }
        }
      `}</style>
    </div>
  )
}
