import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, Camera, Check, Flame, LogOut } from 'lucide-react'
import { saveProfile, getInitials, readFileAsDataURL } from '../../lib/profile.js'
import { useAuth } from '../../state/AuthContext.jsx'
import { ROUTES } from '../../lib/routes.js'

export default function ProfileDrawer({
  open,
  onClose,
  userId,
  profile,
  onProfileChange,
  completedDays,
  totalDays,
  completedDaysList = []
}) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  // Reset local input state when the underlying profile changes
  // (account switch, fresh fetch from Supabase, etc).
  useEffect(() => {
    setName(profile?.name || '')
  }, [profile?.name, userId])

  const handleSignOut = async () => {
    await signOut()
    onClose()
    navigate(ROUTES.auth, { replace: true })
  }

  const handleSaveName = async () => {
    if (!userId) return
    const trimmed = name.trim()
    if (trimmed === (profile?.name || '')) return
    const updated = await saveProfile(userId, { name: trimmed })
    onProfileChange({ ...profile, ...updated })
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  const handleAvatarPick = () => fileRef.current?.click()

  const handleFileChange = async (e) => {
    if (!userId) return
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) return
    const dataURL = await readFileAsDataURL(file)
    const updated = await saveProfile(userId, { avatar: dataURL })
    onProfileChange({ ...profile, ...updated })
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  const hasAvatar = Boolean(profile.avatar)
  const initials = getInitials(profile.name)
  const progressPct = totalDays > 0 ? (completedDays / totalDays) * 100 : 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-forest-deep border-t border-forest-line rounded-t-3xl flex flex-col"
            style={{ maxHeight: '88%', height: '88%' }}
          >
            <div className="flex-shrink-0 relative flex items-center justify-between px-5 pt-4 pb-3 bg-forest-deep border-b border-forest-line/60">
              <div className="w-10 h-1 bg-ink-dim/40 rounded-full absolute top-1.5 left-1/2 -translate-x-1/2" />
              <h2 className="font-display font-bold text-ink text-base tracking-display uppercase mt-1">
                Профил
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-ink-muted active:scale-95"
                aria-label="Затвори"
              >
                <X size={22} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{
                minHeight: 0,
                WebkitOverflowScrolling: 'touch',
                paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
              }}
            >
              <div className="px-5 py-6 flex flex-col items-center">
                <button
                  onClick={handleAvatarPick}
                  className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-accent/40 bg-gradient-to-br from-accent/15 to-forest-card flex items-center justify-center active:scale-95 transition-transform"
                >
                  {hasAvatar ? (
                    <img
                      src={profile.avatar}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-display font-bold text-accent text-3xl tracking-wider">
                      {initials}
                    </span>
                  )}
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center border-2 border-forest-deep">
                    <Camera size={14} className="text-forest-deep" strokeWidth={2.5} />
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-ink-dim text-[10px] mt-3">
                  Натисни за смяна на снимка
                </p>
              </div>

              <div className="px-5 mb-6">
                <label className="font-display font-semibold text-ink-muted text-[10px] tracking-[0.12em] uppercase mb-2 block">
                  Име
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleSaveName}
                    placeholder="Твоето име"
                    maxLength={40}
                    className="w-full bg-forest-card border border-forest-line rounded-2xl px-4 py-3.5 text-ink text-base placeholder:text-ink-dim focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {saved && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent">
                      <Check size={18} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 mb-6">
                <div className="rounded-3xl border border-forest-line bg-forest-card p-5">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="font-display font-semibold text-ink text-xs tracking-[0.12em] uppercase">
                      Прогрес в курса
                    </span>
                    <span className="font-display font-bold text-accent text-lg">
                      {completedDays}
                      <span className="text-ink-dim text-xs ml-1">/ {totalDays}</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-forest-line rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-accent"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted text-xs">
                    <Flame size={14} className="text-accent" />
                    <span>{Math.max(1, completedDays)} последователни дни</span>
                  </div>
                </div>
              </div>

              {user?.email && (
                <div className="px-5 mb-5">
                  <div className="rounded-2xl border border-forest-line bg-forest-card/60 px-4 py-3">
                    <div className="font-display font-semibold text-ink-muted text-[10px] tracking-[0.12em] uppercase mb-1">
                      Акаунт
                    </div>
                    <div className="text-ink text-[14px] truncate">{user.email}</div>
                  </div>
                </div>
              )}

              {completedDaysList.length > 0 && (
                <div className="px-5 mb-6">
                  <h3 className="font-display font-semibold text-ink-muted text-[10px] tracking-[0.12em] uppercase mb-3">
                    Завършени дни
                  </h3>
                  <div className="space-y-2">
                    {completedDaysList.map((d) => (
                      <div
                        key={d.day}
                        className="flex items-center gap-3 rounded-2xl border border-forest-line bg-forest-card p-3"
                      >
                        <span className="w-8 h-8 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                          <Check size={14} strokeWidth={3} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-display font-bold text-ink-dim text-[10px] tracking-wider uppercase">
                            Ден {d.day}
                          </div>
                          <div className="text-ink text-sm truncate">{d.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user && (
                <div className="px-5 mb-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl border border-forest-line bg-forest-card text-ink-muted text-[14px] active:bg-forest active:text-ink transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <LogOut size={16} />
                    Изход
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
