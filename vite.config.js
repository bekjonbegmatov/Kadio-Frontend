import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'f1c23c96a684.ngrok-free.app',
      'http://192.168.0.11:5173/'
    ]
  }
})
