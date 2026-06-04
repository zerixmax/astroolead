// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://oleadigitalis.eu',
  integrations: [icon(), sitemap()],
  i18n: {
    defaultLocale: 'hr',
    locales: ['hr', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    },
    translations: {
      en: {
        'o-projektu': 'about-project'
      }
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
});