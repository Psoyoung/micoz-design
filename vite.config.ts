import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// MICOZ — Vite 설정. 레거시 원본(shop/, admin/, MICOZ-*.html)은 빌드에서 제외된다.
export default defineConfig({
  plugins: [react()],
})
