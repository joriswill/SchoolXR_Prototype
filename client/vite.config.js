import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flowbite from 'flowbite/plugin'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../server/build'),
    emptyOutDir: true
  },
  server: {
    host: true, // ← wichtig für externen Zugriff
    allowedHosts: ['client-production-d8d9.up.railway.app'], // ← Railway-Domain freigeben
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
