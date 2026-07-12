// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://front-skills.dev',

  integrations: [mdx(), sitemap(), svelte()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },

  image: {
    layout: 'constrained',
    service: {
      config: {
        avif: { effort: 4, chromaSubsampling: '4:2:0' },
        webp: { effort: 5 },
        jpeg: { mozjpeg: true },
        png: { compressionLevel: 9 },
      },
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});