// @ts-check
import { defineConfig } from 'astro/config';

const mode = process.env.SITE_MODE === 'live' ? 'live' : 'review';
const site = process.env.PUBLIC_SITE_URL || 'https://nazir-and-company.pages.dev';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
    assets: 'assets',
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  vite: {
    define: {
      'import.meta.env.SITE_MODE': JSON.stringify(mode),
    },
    build: {
      // Inline the subset WOFF2 fonts into the stylesheet (no font swap, no layout shift);
      // never inline scripts (the CSP forbids inline scripts).
      assetsInlineLimit: (file) => file.endsWith('.woff2'),
      // One stylesheet for the whole site: a single cached request instead of one per component
      cssCodeSplit: false,
    },
  },
});
