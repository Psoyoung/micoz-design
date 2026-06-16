import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// MICOZ — Vite 설정. 레거시 원본(shop/, admin/, MICOZ-*.html)은 빌드에서 제외된다.
export default defineConfig({
  plugins: [react()],
  // /api → 백엔드(localhost:8080). axios baseURL '/api/v1' 와 합쳐져 :8080/api/v1/... 로 프록시.
  // (경로 프리픽스 유지 — rewrite 없음. 명세 URL 이 /api/v1/... 그대로이므로.)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
