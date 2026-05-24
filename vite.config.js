import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            // Group day content into per-module chunks so the initial bundle
            // doesn't carry all 60 days. Vite emits 4 day-module chunks that
            // are fetched on demand when the user navigates into a day.
            const dayMatch = id.match(/[\\/]src[\\/]data[\\/]day(\d+)\.js$/)
            if (dayMatch) {
              const n = parseInt(dayMatch[1], 10)
              if (n <= 7) return 'days-module-1'
              if (n <= 21) return 'days-module-2'
              if (n <= 42) return 'days-module-3'
              return 'days-module-4'
            }
            return undefined
          }

          // Vendor splits
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('@capacitor')) return 'vendor-capacitor'
          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-three'
          if (id.includes('gsap')) return 'vendor-gsap'
          if (id.includes('lottie')) return 'vendor-lottie'
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          return 'vendor'
        }
      }
    }
  }
})
