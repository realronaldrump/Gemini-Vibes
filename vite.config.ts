import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Existing proxy for authentication
          '/api/bouncie-auth': {
            target: 'https://auth.bouncie.com',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/bouncie-auth/, ''),
          },
          // NEW proxy for the main API endpoints
          '/api/bouncie-api': {
            target: 'https://api.bouncie.dev',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/bouncie-api/, ''),
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

