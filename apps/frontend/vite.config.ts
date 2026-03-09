import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    watch: {
      usePolling: true,
      interval: 500,
    },
    proxy: {
      '/api': { target: backendUrl, changeOrigin: true },
      // Regex keys: only match /widget.js and /widget/* — NOT /widgets/* (SPA routes)
      // No changeOrigin so req.get('host') stays localhost:3000 → image proxy URLs work from browser
      '^/widget\\.js': { target: backendUrl },
      '^/widget/': { target: backendUrl },
    },
  },
});
