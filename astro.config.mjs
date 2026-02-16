import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import icon from 'astro-icon';

export default defineConfig({
  // Site metadata for Bing
  site: 'https://futbollibre.velcuri.io',

  // Build configuration
  build: {
    format: 'directory', // Clean URLs (/partidos-hoy/ not /partidos-hoy.html)
  },

  // Optimization
  vite: {
    build: {
      minify: 'terser',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react'],
          }
        }
      }
    },
    ssr: {
      external: ['svgo']
    }
  },

  // Integrations
  integrations: [
    sitemap({
      // Generate sitemap for all dynamic pages
      filter: (page) => page !== 'https://futbollibre.velcuri.io/admin',
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date(),
    }),
    compress({
      CSS: true,
      HTML: true,
      Image: true,
      JavaScript: true,
      SVG: true,
    }),
    icon(),
  ],

  // Output configuration for static site
  output: 'static',

  // Trailing slashes for Bing consistency
  trailingSlash: 'always',

  // Image optimization
  image: {
    domains: ['raw.githubusercontent.com'],
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
