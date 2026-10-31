import type { ComponentChildren } from "preact";

export function Notice({
  children,
  kind = "status",
  onDismiss,
}: {
  children: ComponentChildren;
  kind?: "status" | "alert";
  onDismiss?: () => void;
}) {
  return (
    <div class={`notice ${kind === "alert" ? "notice-alert" : ""}`} role={kind}>
      <p>
        <span aria-hidden="true">{kind === "alert" ? "✖ " : "ℹ "}</span>
        {children}
      </p>
      {onDismiss && (
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
