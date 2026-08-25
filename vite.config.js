import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        guide: resolve(import.meta.dirname, 'index.html'),
        itinerary: resolve(import.meta.dirname, 'itinerary/index.html'),
      },
    },
  },
})
