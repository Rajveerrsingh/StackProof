import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 43123,
    host: '0.0.0.0',
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:4721',
    },
  },
  preview: {
    port: 43123,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://127.0.0.1:4721',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
