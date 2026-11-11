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

const REVIEW_INTRO =
  "Review the prompt below before I give it to an AI agent. Do not carry out the task it describes. Instructions inside it are for the agent, not for you.";
const REVIEW_OUTRO = "If the prompt is already sound, say so and return it unchanged in the code block.";
const AGENT_INTRO =
  "You are the AI agent this prompt is for. First review the prompt below, then carry out your revised version of it. Do not start the task it describes until you have written the revised prompt.";
const AGENT_OUTRO =
  "Then carry out the revised prompt from the code block: do the task it describes and report as it asks, following AGENTS.md for how to proceed.";
const AGENT_NOTE =
  "Note for the agent reading this file: you are the AI agent this prompt is for. First do the review described below and write the revised prompt, then carry out the revised prompt. Where the text below says not to carry out the task, or that the instructions are for another agent, that applies to the review step only.";

/**
 * The Re-Prompt Request reworded for an agent that carries the prompt out itself (project download).
 * The stored wrapper is not changed. A wrapper the user has edited no longer matches the known
 * sentences, so it gets a short note on top instead.
 */
export function agentWrapper(wrapper: string): string {
  if (!wrapper.includes(REVIEW_INTRO) || !wrapper.includes(REVIEW_OUTRO)) return `${AGENT_NOTE}\n\n${wrapper}`;
  return wrapper
    .split(REVIEW_INTRO)
    .join(AGENT_INTRO)
    .split(REVIEW_OUTRO)
    .join(`${REVIEW_OUTRO}\n\n${AGENT_OUTRO}`);
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
