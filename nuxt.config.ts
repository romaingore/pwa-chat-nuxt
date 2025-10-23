// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@pinia/nuxt", "@vite-pwa/nuxt"],
  app: {
    head: {
      title: "PWA Chat (Nuxt)",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },

  // Configuration PWA
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "PWA Chat",
      short_name: "Chat",
      description: "Application de messagerie instantanée (offline + online)",
      theme_color: "#111827",
      background_color: "#111827",
      display: "standalone",
      start_url: "/",
      scope: "/",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/maskable-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          urlPattern: ({ sameOrigin, url }) =>
            sameOrigin &&
            (url.pathname === "/" || url.pathname.startsWith("/room")),
          handler: "NetworkFirst",
          options: { cacheName: "pages" },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith("/socket.io"),
          handler: "NetworkOnly",
        },
      ],
    },
    devOptions: {
      enabled: true, // 👈 active le PWA en mode dev
      type: "module", // nécessaire pour Vite 5 / ESM
    },
  },

  typescript: {
    strict: true,
  },

  nitro: {
    preset: "node-server", // utile pour le déploiement Node + PM2
  },
});
