import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API runs on http://localhost:5080 by default (the API repository's launchSettings.json).
// Set API_URL to point somewhere else, e.g. `API_URL=https://localhost:7080 npm run dev`.
// Proxying keeps the browser on one origin, which the cookie-based login relies on.
const apiUrl = process.env.API_URL ?? 'http://localhost:5080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': apiUrl,
      '/health': apiUrl,
    },
  },
})
