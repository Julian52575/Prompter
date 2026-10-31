import { createHash } from "node:crypto";
import type { Plugin } from "vite";

const PLACEHOLDER = "'sha256-BUILD_HASH'";
const CSP = `default-src 'none'; script-src ${PLACEHOLDER}; style-src 'unsafe-inline'; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'`;

/**
 * Adds the CSP meta tag as the first child of <head>, build only: the dev
 * server's scripts would be blocked by it. Then writes the SHA-256 of the single inlined script into the CSP meta tag, so
 * the page may run its own bundle and nothing else. Runs after
 * vite-plugin-singlefile has inlined the bundle.
 */
export function cspHash(): Plugin {
  return {
    name: "csp-hash",
    enforce: "post",
    apply: "build",
    transformIndexHtml: {
      order: "pre",
      // Raw HTML: Vite's tag injection would escape the quotes in the policy.
      handler: (html) =>
        html.replace(/<head>/, `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}">`),
    },
    generateBundle: { order: "post", handler(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== "asset" || !file.fileName.endsWith(".html")) continue;
        const html = String(file.source);
        const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
        if (scripts.length !== 1 || /\bsrc=/.test(scripts[0][1]))
          this.error(`expected exactly one inline script in ${file.fileName}, found ${scripts.length}`);
        if (!html.includes(PLACEHOLDER)) this.error(`no CSP placeholder in ${file.fileName}`);
        const hash = createHash("sha256").update(scripts[0][2], "utf8").digest("base64");
        file.source = html.replace(PLACEHOLDER, `'sha256-${hash}'`);
      }
    } },
  };
}
