/// <reference types="vitest/config" />
import preact from "@preact/preset-vite";
import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { cspHash } from "./csp-hash.ts";

// A release tag (set by the release workflow), else the commit sha.
function appVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION;
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
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
