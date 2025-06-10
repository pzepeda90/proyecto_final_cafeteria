import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true // Esto hará que Vite falle si el puerto 5174 no está disponible en lugar de buscar otro
  }
})
