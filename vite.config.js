import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    plugins: [
      tailwindcss(),
      react(),
      visualizer({
        open: true,             // автоматически откроет браузер
        filename: 'stats.html', // название html-файла
        gzipSize: true,         // показывает размер после gzip
        brotliSize: true        // и после brotli (ещё полезнее)
      }),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'document',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'html-cache',
              },
            },
          ],
        },
        includeAssets: ['apple-touch-icon.png'],
        devOptions: {
          enabled: isDev, // ✅ включено только в режиме разработки
        },
        manifest: {
          name: 'Покрасочная',
          short_name: 'App',
          description: 'Покрасочная',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pweb-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) return 'vendor'
          },
        },
      },
    },
    server: {
      host: true,
    },
  }
})
