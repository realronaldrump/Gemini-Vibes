import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Add this proxy configuration
        proxy: {
          // Any request to /api/bouncie-auth will be forwarded to the Bouncie server
          '/api/bouncie-auth': {
            target: 'https://auth.bouncie.com',
            changeOrigin: true, // Recommended for virtual hosts
            secure: false, // Recommended for local dev
            rewrite: (path) => path.replace(/^\/api\/bouncie-auth/, ''), // Remove the prefix
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
