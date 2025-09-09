import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and React-related packages
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Firebase chunk for all Firebase services
          'firebase-vendor': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/analytics'
          ],
          // UI libraries chunk
          'ui-vendor': ['lucide-react']
        }
      }
    },
    // Increase chunk size warning limit to 1000 KB for admin functionality
    chunkSizeWarningLimit: 1000
  }
})