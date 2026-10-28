import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /* Прокси для живого ИИ: обходит CORS браузера к официальному GLM API.
       Клиент ходит на /llm-api/chat/completions (см. src/lib/aiLive.js) */
    proxy: {
      '/llm-api': {
        target: 'https://open.bigmodel.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/llm-api/, '/api/paas/v4'),
      },
    },
  },
})
