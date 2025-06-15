import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { splitVendorChunkPlugin } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    // Análisis de bundle (solo en build)
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  
  // Configuración del servidor de desarrollo
  server: {
    port: 5174,
    strictPort: true,
    host: true, // Permitir acceso externo
    cors: true,
    // Configuración de proxy para development - usando API de producción
    proxy: {
      '/api': {
        target: 'https://proyecto-final-cafeteria.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  
  // Configuración de build para producción
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // Optimizaciones de performance
    rollupOptions: {
      output: {
        // Separar chunks por vendor y features
        manualChunks: {
          // Vendor chunks
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['@headlessui/react'],
          charts: ['recharts'],
          
          // Utils chunks
          http: ['axios'],
          alerts: ['sweetalert2'],
        },
        
        // Naming pattern para chunks
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Optimización de assets
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remover console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true
      }
    },
    
    // Configuración de chunks
    chunkSizeWarningLimit: 1000,
    
    // Optimizaciones CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  
  // Resolver aliases para importaciones más limpias
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@store': '/src/store',
      '@utils': '/src/utils',
      '@constants': '/src/constants',
      '@hooks': '/src/hooks',
      '@assets': '/src/assets',
    }
  },
  
  // Optimizaciones de dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
      '@headlessui/react',
      'recharts',
      'sweetalert2'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  
  // Performance en desarrollo
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'es2020'
  },
  
  // Configuración de preview
  preview: {
    port: 3001,
    host: true,
    cors: true
  }
})
