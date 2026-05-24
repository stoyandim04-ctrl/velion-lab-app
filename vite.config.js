import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ONLY split the project's own per-day data files. Vendor splitting
          // was causing React to land in a different chunk than the modules
          // that import it (jsx-runtime split, undefined useState at boot).
          // Let Vite auto-handle vendor chunks — it gets the dependency graph
          // right by default.
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
      }
    }
  }
})
