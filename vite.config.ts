import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  // ตำแหน่งที่วางเว็บบนเซิร์ฟเวอร์ เช่น VITE_BASE=/onedms/ ถ้าอยู่ใน IIS virtual directory
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // เมื่อมี API จริง ให้ตั้ง VITE_API_PROXY=http://localhost:5000 แล้วเรียก /api/... ได้โดยไม่ติด CORS
    proxy: process.env.VITE_API_PROXY ? { '/api': process.env.VITE_API_PROXY } : undefined,
  },
})
