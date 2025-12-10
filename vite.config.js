import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Expense Tracker",
        short_name: "Expenses",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
        ],
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/"
      }
    })
  ]
}
