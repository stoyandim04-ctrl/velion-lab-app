/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0A1410',
          deep: '#060D0A',
          card: '#0F1D17',
          line: '#1A2B23'
        },
        accent: {
          DEFAULT: '#FF6A00',
          soft: '#FF8A33',
          glow: 'rgba(255, 106, 0, 0.45)'
        },
        ink: {
          DEFAULT: '#F5F1EA',
          muted: '#A8A39B',
          dim: '#6B665E'
        }
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        display: '-0.02em'
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 106, 0, 0.35)',
        'glow-soft': '0 0 24px rgba(255, 106, 0, 0.2)',
        card: '0 12px 30px rgba(0, 0, 0, 0.5)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'fade-in': 'fadeIn 0.7s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'breathing': 'breathing 4s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 106, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 106, 0, 0.6)' }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        breathing: {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
          '50%': { transform: 'scale(1.08)', opacity: 1 }
        }
      }
    }
  },
  plugins: []
}
