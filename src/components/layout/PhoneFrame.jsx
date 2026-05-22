export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex items-center justify-center">
      <div
        className="relative w-full max-w-[420px] h-[100dvh] md:h-[860px] md:rounded-[44px] overflow-hidden bg-forest-deep md:shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:border md:border-forest-line"
        style={{ touchAction: 'pan-y' }}
      >
        {children}
      </div>
    </div>
  )
}
