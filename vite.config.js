import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimizaciones de build
  build: {
    // Minificación ligera
    minify: 'esbuild',
    
    // Tamaño de chunk warning
    chunkSizeWarningLimit: 1500,
    
    // Source maps desactivados
    sourcemap: false,
    
    // Rollup options simplificados
    rollupOptions: {
      output: {
        manualChunks: undefined, // Dejar que Vite lo maneje automáticamente
      },
    },
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
  
  // Resolver alias para problemas de módulos
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  
  // SSR options para resolver CommonJS
  ssr: {
    noExternal: ['es-toolkit'],
  },
})
