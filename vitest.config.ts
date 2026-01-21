import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["app/**/*.{test,spec}.{js,ts}"],
    setupFiles: ["app/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["app/**/*.{ts,vue}"],
      exclude: ["app/**/*.{test,spec}.ts", "app/types/**"],
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
      "@": resolve(__dirname, "app"),
    },
  },
});
