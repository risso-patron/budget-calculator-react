import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimizaciones de build
  build: {
    // Minificación agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true,
      },
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks separados
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'charts': ['recharts'],
          'pdf': ['jspdf', 'jspdf-autotable'],
          'utils': ['papaparse', 'react-confetti'],
        },
      },
    },
    
    // Tamaño de chunk warning
    chunkSizeWarningLimit: 1000,
    
    // Source maps en producción (para debugging)
    sourcemap: true,
  },
  
  // Server config para desarrollo
  server: {
    port: 5174, // Cambiado temporalmente para evitar cache
    strictPort: false,
    open: true,
  },
  
  // Preview config
  preview: {
    port: 4173,
    strictPort: true,
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
  },
})
