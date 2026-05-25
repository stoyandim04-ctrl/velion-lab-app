import { motion } from 'framer-motion'
import { getInitials } from '../../lib/profile.js'
import { useReducedMotion } from '../../lib/animations.js'

export default function ProfileButton({ profile, completedDays, onClick }) {
  const initials = getInitials(profile.name)
  const hasAvatar = Boolean(profile.avatar)
  const reduced = useReducedMotion()

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ y: -2, scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      aria-label="Профил"
      className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/50 bg-gradient-to-br from-accent/20 to-forest-card flex items-center justify-center"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Pulsing aura around the avatar so the eye is drawn there */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={
          reduced
            ? {}
            : {
                boxShadow: [
                  '0 0 0px rgba(255,106,0,0.0)',
                  '0 0 22px rgba(255,106,0,0.55)',
                  '0 0 0px rgba(255,106,0,0.0)'
                ]
              }
        }
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {hasAvatar ? (
        <img
          src={profile.avatar}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <span className="relative font-display font-bold text-accent text-sm tracking-wider">
          {initials}
        </span>
      )}
      {completedDays > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.4 }}
          className="absolute -bottom-0.5 -right-0.5 min-w-[20px] h-[20px] px-1 rounded-full bg-accent text-forest-deep text-[10px] font-display font-bold flex items-center justify-center border-2 border-forest-deep"
        >
          {completedDays}
        </motion.span>
      )}
    </motion.button>
  )
}
