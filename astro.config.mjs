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
    // Removed sitemap plugin since we're handling sitemap generation manually in sitemap.xml.ts
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
