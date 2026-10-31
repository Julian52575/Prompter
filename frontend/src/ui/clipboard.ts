export const COPY_MANUAL = "Press Ctrl+C (⌘C on Mac) to copy.";

/**
 * Clipboard API, then the legacy copy on `select` (a field holding exactly
 * `text`). Resolves "selected" when both fail, leaving the text selected.
 * Starts the API call synchronously so it runs inside the click.
 */
export function copyText(text: string, select?: HTMLTextAreaElement | null): Promise<"copied" | "selected"> {
  const legacy = (): "copied" | "selected" => {
    if (!select) return "selected";
    select.focus();
    select.select();
    try {
      return document.execCommand("copy") ? "copied" : "selected";
    } catch {
      return "selected";
    }
  };
  if (!navigator.clipboard?.writeText) return Promise.resolve(legacy());
  return navigator.clipboard.writeText(text).then(
    () => "copied" as const,
    () => legacy(),
  );
}
