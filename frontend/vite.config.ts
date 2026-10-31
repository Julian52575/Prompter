/// <reference types="vitest/config" />
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { cspHash } from "./csp-hash.ts";

export default defineConfig({
  plugins: [preact(), viteSingleFile({ removeViteModuleLoader: true }), cspHash()],
  // Relative paths: the build opens from file://.
  base: "./",
  build: { modulePreload: { polyfill: false }, reportCompressedSize: false },
  server: { host: "0.0.0.0", port: 5173, strictPort: true },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: { provider: "v8", reporter: ["text", "lcov"], include: ["src/**/*.{ts,tsx}"] },
  },
});
