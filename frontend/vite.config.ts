import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '^/api/cases/[^/]+/activities': { target: 'http://localhost:8083' },
      '/api/auth': { target: 'http://localhost:8081' },
      '/api/cases': { target: 'http://localhost:8082' },
    },
  },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
})