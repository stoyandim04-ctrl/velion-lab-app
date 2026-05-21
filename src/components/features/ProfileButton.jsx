import { motion } from 'framer-motion'
import { getInitials } from '../../lib/profile.js'

export default function ProfileButton({ profile, completedDays, onClick }) {
  const initials = getInitials(profile.name)
  const hasAvatar = Boolean(profile.avatar)

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      aria-label="Профил"
      className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-accent/40 bg-gradient-to-br from-accent/15 to-forest-card flex items-center justify-center hover:border-accent transition-colors"
      style={{ touchAction: 'manipulation' }}
    >
      {hasAvatar ? (
        <img
          src={profile.avatar}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <span className="font-display font-bold text-accent text-sm tracking-wider">
          {initials}
        </span>
      )}
      {completedDays > 0 && (
        <span className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-forest-deep text-[10px] font-display font-bold flex items-center justify-center border-2 border-forest-deep">
          {completedDays}
        </span>
      )}
    </motion.button>
  )
}
