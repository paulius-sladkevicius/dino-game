/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Santykinis kelias – žaidimą galima talpinti bet kuriame aplanke (pvz., GitHub Pages).
  base: './',
  build: { target: 'es2022' },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['ikonos/ikona.svg', 'ikonos/apple-touch-icon.png'],
      manifest: {
        name: 'Dingusios raidės',
        short_name: 'Raidės',
        description: 'Skaitymo nuotykis pirmokui',
        lang: 'lt',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f3ead8',
        theme_color: '#24233f',
        icons: [
          { src: 'ikonos/ikona-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'ikonos/ikona-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'ikonos/ikona-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
