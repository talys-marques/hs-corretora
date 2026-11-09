// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import basePath from './integrations/base-path.mjs';

// Production defaults to the real domain at the root. A preview build (GitHub Pages)
// sets SITE_URL=https://talys-marques.github.io and BASE_PATH=/hs-corretora.
const SITE_URL = process.env.SITE_URL || 'https://hervalcorretora.com.br';
const BASE_PATH = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  // Keep the same URL shape as the WordPress site (trailing slash, folder/index.html)
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') }), basePath()],
});
