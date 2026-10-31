import { codeFence } from "./render";
import type { Provider } from "./types";

export const LINK_CAP = 8000;

export function lintWrapper(text: string): string[] {
  const count = text.split("{{prompt}}").length - 1;
  if (count !== 1) return ["The wrapper must contain {{prompt}} exactly once."];
  if (!text.split(/\r?\n/).some((l) => l.trim() === "{{prompt}}"))
    return ["{{prompt}} must be on a line of its own."];
  return [];
}

export function wrapPrompt(wrapper: string, prompt: string): string {
  // split/join: a single pass, and "$" in the prompt has no special meaning.
  const out = wrapper.split("{{prompt}}").join(codeFence(prompt));
  return out.endsWith("\n") ? out : `${out}\n`;
}

export function lintProvider(p: Pick<Provider, "label" | "link" | "home">): string[] {
  const errs: string[] = [];
  if (!p.label.trim()) errs.push("The label must not be empty.");
  if (!p.home.startsWith("https://")) errs.push("The home URL must start with https://.");
  if (p.link !== "") {
    if (!p.link.startsWith("https://")) errs.push("The link template must start with https://.");
    if (p.link.split("{prompt}").length !== 2) errs.push("The link template must contain {prompt} exactly once, or be empty.");
  }
  return errs;
}

/** The URL to open. "home": no link template; "long": too long or unencodable. */
export function buildLink(
  p: Pick<Provider, "link" | "home">,
  text: string,
): { url: string; kind: "link" | "home" | "long" } {
  if (!p.link) return { url: p.home, kind: "home" };
  try {
    const url = p.link.split("{prompt}").join(encodeURIComponent(text));
    if (url.length <= LINK_CAP) return { url, kind: "link" };
  } catch {
    // lone surrogates make encodeURIComponent throw
  }
  return { url: p.home, kind: "long" };
}
