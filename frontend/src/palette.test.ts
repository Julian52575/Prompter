import { readFileSync } from "node:fs";

const css = readFileSync(`${import.meta.dirname}/index.css`, "utf8");

function block(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

describe.each([
  ["light", block(":root {")],
  ["dark", block(':root[data-theme="dark"]')],
])("%s palette (WCAG 2.2)", (_, p) => {
  test.each(["fg", "muted", "accent", "error", "success"])("%s text is at least 4.5:1 on background and surface", (k) => {
    expect(ratio(p[k], p.bg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(p[k], p.sf)).toBeGreaterThanOrEqual(4.5);
  });
  test("text on accent is at least 4.5:1", () => expect(ratio(p["on-accent"], p.accent)).toBeGreaterThanOrEqual(4.5));
  test("focus ring is at least 3:1 on background and surface", () => {
    expect(ratio(p.focus, p.bg)).toBeGreaterThanOrEqual(3);
    expect(ratio(p.focus, p.sf)).toBeGreaterThanOrEqual(3);
  });
});
