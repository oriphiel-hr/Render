// uslugar/frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Jedan primjerak Reacta u bundleu (inace react-router, leaflet, itd. vuku React 18 i puca useRef na null u runtimeu)
const r = path.resolve(__dirname, 'node_modules/react')
const rd = path.resolve(__dirname, 'node_modules/react-dom')

// Automatski JSX runtime – ne treba "import React from 'react'" po fajlovima
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      react: r,
      'react-dom': rd
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    esbuildOptions: { jsx: 'automatic' }
  }
})
