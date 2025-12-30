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
        manualChunks(id) {
          // Vendor chunks separados
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('jspdf')) {
              return 'pdf';
            }
            if (id.includes('papaparse') || id.includes('react-confetti')) {
              return 'utils';
            }
            return 'vendor';
          }
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
    exclude: ['es-toolkit'],
  },
  
  // Resolver problemas de CommonJS
  resolve: {
    alias: {
      'es-toolkit': 'es-toolkit/dist/index.mjs'
    }
  },
})
