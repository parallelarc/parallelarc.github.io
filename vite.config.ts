/// <reference types="vitest" />
/// <reference types="vite/client" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  // The app uses hash URLs; unknown real paths should return 404.
  appType: "mpa",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        // Keep text resources and missing paths out of the app fallback.
        navigateFallbackAllowlist: [/^\/(?:\?.*)?$/],
      },
    }),
  ],
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
