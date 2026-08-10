import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['gsap'],
    },
    server: {
      host: '127.0.0.1',
      port: 4321,
      strictPort: true,
      watch: {
        usePolling: false,
        ignored: [
          '**/.wrangler/**',
          '**/.astro/**',
          '**/node_modules/**'
        ]
      }
    }
  }
});