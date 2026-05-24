import { motion } from 'framer-motion'
import { useReducedMotion } from '../../lib/animations.js'

// "3D" shield without three.js — uses CSS perspective + framer-motion Y rotation
// on the SVG logo. Same visual feel (slow spinning premium shield with glow)
// but ~240KB lighter and zero R3F runtime risk.
export default function Shield3D({ size = 96 }) {
  const reduced = useReducedMotion()
  return (
    <div
      style={{ width: size, height: size, perspective: '600px' }}
      className="relative mx-auto"
      aria-hidden="true"
    >
      <motion.div
        animate={reduced ? {} : { rotateY: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-full h-full flex items-center justify-center"
      >
        <motion.img
          src="/logo/velion-shield.svg"
          alt=""
          className="w-[80%] h-[80%]"
          style={{
            filter: 'drop-shadow(0 0 24px rgba(255,106,0,0.55))'
          }}
          animate={
            reduced
              ? {}
              : {
                  filter: [
                    'drop-shadow(0 0 16px rgba(255,106,0,0.4))',
                    'drop-shadow(0 0 32px rgba(255,106,0,0.75))',
                    'drop-shadow(0 0 16px rgba(255,106,0,0.4))'
                  ]
                }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}
