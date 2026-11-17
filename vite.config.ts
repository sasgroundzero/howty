import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// three.js is split into its own long-cached chunk; scripts/prerender.mjs then writes one HTML page per game.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1200, rollupOptions: { output: { manualChunks: { three: ['three', '@react-three/fiber', '@react-three/drei'] } } } },
})
