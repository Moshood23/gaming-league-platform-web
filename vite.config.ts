import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API runs on http://localhost:5080 (see backend launchSettings.json).
// Proxying keeps the browser on one origin, which the cookie-based login will rely on.
const apiUrl = 'http://localhost:5080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': apiUrl,
      '/health': apiUrl,
    },
  },
})
