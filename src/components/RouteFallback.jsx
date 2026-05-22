// Fallback rendered while a lazy-loaded route chunk is being fetched.
// Uses inline styles so it can render before the main bundle's CSS is parsed.
export default function RouteFallback() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#060D0A'
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px solid rgba(255, 106, 0, 0.25)',
          borderTopColor: '#FF6A00',
          animation: 'velion-spin 0.9s linear infinite'
        }}
      />
      <style>{`@keyframes velion-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
