import { codeFence } from "./render";
import type { Provider } from "./types";

export const LINK_CAP = 8000;

export type WrapperIssue = "promptCount" | "promptOwnLine";
export type ProviderIssue = "label" | "home" | "linkHttps" | "linkPlaceholder";

export function lintWrapper(text: string): WrapperIssue[] {
  const count = text.split("{{prompt}}").length - 1;
  if (count !== 1) return ["promptCount"];
  if (!text.split(/\r?\n/).some((l) => l.trim() === "{{prompt}}")) return ["promptOwnLine"];
  return [];
}

export function wrapPrompt(wrapper: string, prompt: string): string {
  // split/join: a single pass, and "$" in the prompt has no special meaning.
  const out = wrapper.split("{{prompt}}").join(codeFence(prompt));
  return out.endsWith("\n") ? out : `${out}\n`;
}

/** Inverse of wrapPrompt: the prompt inside the fence, or null if the wrapper text was altered. */
export function unwrapPrompt(wrapper: string, text: string): string | null {
  const [pre, post] = wrapper.split("{{prompt}}");
  const tail = post.endsWith("\n") ? post : `${post}\n`;
  if (!text.startsWith(pre) || !text.endsWith(tail) || text.length < pre.length + tail.length) return null;
  const m = /^(`{3,})markdown\n([\s\S]*)\n\1$/.exec(text.slice(pre.length, text.length - tail.length));
  return m ? m[2] : null;
}

export function lintProvider(p: Pick<Provider, "label" | "link" | "home">): ProviderIssue[] {
  const errs: ProviderIssue[] = [];
  if (!p.label.trim()) errs.push("label");
  if (!p.home.startsWith("https://")) errs.push("home");
  if (p.link !== "") {
    if (!p.link.startsWith("https://")) errs.push("linkHttps");
    if (p.link.split("{prompt}").length !== 2) errs.push("linkPlaceholder");
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
