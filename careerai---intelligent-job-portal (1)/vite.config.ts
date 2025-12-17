import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid TypeScript error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Polyfill process.env.API_KEY for the frontend code
      // Fallback to hardcoded key if env loading fails in this environment
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.API_KEY || 'AIzaSyCvGwgLTBfafPl0BxTExci9wGlIpIB3MHE'),
      // Polyfill process.env for other potential usages
      'process.env': {}
    },
    server: {
      proxy: {
        // Proxy API calls during dev to avoid CORS and use same origin
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true
        }
      }
    }
  };
});
