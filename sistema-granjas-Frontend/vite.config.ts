import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  
  // AÑADIR para producción:
  build: {
    outDir: 'dist',
    sourcemap: false, // Desactivar en producción
    rollupOptions: {
      output: {
        // Mejor organización de chunks
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    }
  },
  
  // IMPORTANTE para SPA en producción
  base: '/', // Asegura rutas relativas
})