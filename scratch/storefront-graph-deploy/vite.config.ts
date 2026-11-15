import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { resolveStoreRedirect, unavailableOfferPage } from './server/storeRedirect.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://74.225.250.0:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'public-store-links',
      configureServer(server) {
        server.middlewares.use('/out', async (req, res, next) => {
          const url = new URL(req.url || '/', 'http://localhost');
          const match = url.pathname.match(/^\/([a-zA-Z0-9_-]+)\/?$/);
          if (!match) return next();
          const result = await resolveStoreRedirect(match[1], url.searchParams);
          res.setHeader('Cache-Control', 'no-store');
          if (result.location) { res.writeHead(302, { Location: result.location }); res.end(); return; }
          res.writeHead(result.status, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(unavailableOfferPage);
        });
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api/v1/products/reviews': {
        target: process.env.VITE_REVIEW_BACKEND_URL || BACKEND_URL,
        changeOrigin: true,
      },
      '/deal-images': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/deal-images/, '/images'),
      },
      '/feed-fallback': {
        target: 'https://dealflow-edge.pottemasshippo.workers.dev',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/feed-fallback/, ''),
      },
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://74.225.250.0:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
