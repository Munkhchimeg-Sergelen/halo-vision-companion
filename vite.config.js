import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  publicDir: 'public',
  // Serve additional folders as static assets
  assetsInclude: ['**/*.txt'],
})
