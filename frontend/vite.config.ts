import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  
  plugins: [react(), tailwindcss()],
  
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/geoapify': {
        target: 'https://api.geoapify.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/geoapify/, ''),
      }
    }
  }
})