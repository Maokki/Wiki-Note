import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'public/maomao_icon-192.png',
        'public/maomao_icon-512.png'
      ],
      manifest: {
        name: 'WikiNotes',
        short_name: 'WikiNotes',
        description: 'Personal wiki and notes management app',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3B82F6',
        icons: [
          {
            src: 'icons/maomao_icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/maomao_icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
