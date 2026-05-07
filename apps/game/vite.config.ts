import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url))
    }
  }
})
