import { useId } from "preact/hooks";

/** Info button: the popup shows on hover and on keyboard focus, and Escape closes it. */
export function InfoTip({ label, text }: { label: string; text: string }) {
  const id = useId();
  return (
    <span class="info">
      <button
        type="button"
        class="info-btn"
        aria-label={label}
        aria-describedby={id}
        onKeyDown={(e) => e.key === "Escape" && e.currentTarget.blur()}
      >
        i
      </button>
      <span role="tooltip" id={id} class="info-pop">
        {text}
      </span>
    </span>
  );
}
