import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173, // Default Vite port
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your Flask backend address
        changeOrigin: true,
        secure: false, // Set to true if your backend is HTTPS and has a valid cert
      },
      '/static': { // New rule
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
})
