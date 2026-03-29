import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // server:{
  //   proxy:{
  //     '/api':{
  //       target:'http://localhost:3000',
  //       changeOrigin: true
  //     }
  //   }
  // },
  plugins: [
    vue(),
    VitePWA({
      mode: 'production',
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
      },
      selfDestroying: true,
      includeAssets: ["icon.ico", "apple-touch-icon.webp", "mask-icon.svg"],
      manifest: {
        name: "Mesfor File Convertor",
        short_name: "MIR",
        description: "Mesfor File Convertor",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icons/icon_x192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "/icons/icon_x512.webp",
            sizes: "512x512",
            type: "image/webp",
          }
        ],
        screenshots: [
          {
           src: "/icons/icon_x320.webp",
            sizes: "320x320",
            type: "image/webp",
            form_factor: "narrow",
            label: "Wonder Widgets"
          },
          {
           src: "/icons/icon_x640.webp",
            sizes: "640x320",
            type: "image/webp",
            form_factor: "wide",
            label: "Wonder Widgets"
          }
      ]
      }
    })
  ]
})
