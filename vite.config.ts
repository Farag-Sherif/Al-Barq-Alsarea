import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Social login bootstrap endpoints only (do not proxy /social/callback SPA route)
      '^/social/(redirect|google(?:/redirect)?|facebook(?:/redirect)?)': {
        target: 'https://food.test.do-go.net',
        changeOrigin: true,
        secure: true,
      },
      // Social callback provider endpoints (keep /social/callback for SPA page local)
      '^/social/(callback(?:/(?:google|facebook))?|(?:google|facebook)/callback)': {
        target: 'https://food.test.do-go.net',
        changeOrigin: true,
        secure: true,
      },
      '^/auth/social/(redirect(?:/(?:google|facebook))?|(?:google|facebook)(?:/redirect)?|callback(?:/(?:google|facebook))?|(?:google|facebook)/callback)': {
        target: 'https://food.test.do-go.net',
        changeOrigin: true,
        secure: true,
      },
      '^/auth/(google|facebook)/callback': {
        target: 'https://food.test.do-go.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
