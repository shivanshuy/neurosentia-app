import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ingest': {
        target: 'http://127.0.0.1:2025',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ingest/, '/ingest'),
      },
      '/api/langgraph': {
        target: 'http://127.0.0.1:2024',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/langgraph/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Accept-Encoding', 'identity');
          });
          proxy.on('proxyRes', (proxyRes) => {
            const contentType = proxyRes.headers['content-type'];
            if (contentType && String(contentType).includes('text/event-stream')) {
              proxyRes.headers['cache-control'] = 'no-cache, no-transform';
              proxyRes.headers['x-accel-buffering'] = 'no';
              delete proxyRes.headers['content-encoding'];
            }
          });
        },
      },
    },
  },
})
