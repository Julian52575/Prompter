import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useApp } from "./context";

export interface ConfirmOptions {
  title: string;
  body?: ComponentChildren;
  /** The safe choice: initial focus and the Esc action. */
  cancel?: string;
  confirm: string;
  /** Extra choices between cancel and confirm; resolves with their value. */
  extra?: { label: string; value: string }[];
  danger?: boolean;
  checkbox?: string;
}

export interface ConfirmResult {
  choice: "cancel" | "confirm" | string;
  checked: boolean;
}

export interface DialogApi {
  confirm(o: ConfirmOptions): Promise<ConfirmResult>;
  /** Free-form dialog; `close` resolves it. */
  show(
    title: string,
    body: (close: () => void) => ComponentChildren,
    opts?: { closeOnOutsideClick?: boolean },
  ): Promise<void>;
}

interface Open {
  id: number;
  title: string;
  body: (close: (r: ConfirmResult) => void) => ComponentChildren;
  resolve: (r: ConfirmResult) => void;
  returnFocus: Element | null;
  closeOnOutsideClick?: boolean;
}

let seq = 0;

export function useDialogHost(): [DialogApi, ComponentChildren] {
  const [stack, setStack] = useState<Open[]>([]);
  const open = (title: string, body: Open["body"], closeOnOutsideClick = false) =>
    new Promise<ConfirmResult>((resolve) =>
      setStack((s) => [
        ...s,
        { id: ++seq, title, body, resolve, returnFocus: document.activeElement, closeOnOutsideClick },
      ]),
    );
  const api: DialogApi = {
    confirm: (o) => open(o.title, (close) => <ConfirmBody o={o} close={close} />),
    show: (title, body, opts) =>
      open(title, (close) => body(() => close({ choice: "cancel", checked: false })), opts?.closeOnOutsideClick).then(
        () => {},
      ),
  };
  const close = (d: Open, r: ConfirmResult) => {
    setStack((s) => s.filter((x) => x.id !== d.id));
    d.resolve(r);
    // Focus returns to whatever opened the dialog.
    setTimeout(() => (d.returnFocus as HTMLElement | null)?.focus?.(), 0);
  };
  const nodes = stack.map((d) => <Modal key={d.id} d={d} close={(r) => close(d, r)} />);
  return [api, nodes];
}

function Modal({ d, close }: { d: Open; close: (r: ConfirmResult) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `dlg-${d.id}-title`;
  // A click only counts when it also started on the backdrop, so dragging a text selection out of the dialog keeps it open.
  const pressedOutside = useRef(false);
  const outside = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || e.target !== el) return false;
    const r = el.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  useEffect(() => {
    const el = ref.current!;
    if (!el.open) el.showModal?.();
    const safe = el.querySelector<HTMLElement>("[data-initial]") ?? el.querySelector<HTMLElement>("button");
    safe?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onPointerDown={(e) => (pressedOutside.current = d.closeOnOutsideClick === true && outside(e))}
      onClick={(e) => {
        if (pressedOutside.current && outside(e)) close({ choice: "cancel", checked: false });
        pressedOutside.current = false;
      }}
      onCancel={(e) => {
        e.preventDefault();
        close({ choice: "cancel", checked: false });
      }}
    >
      <h2 id={titleId}>{d.title}</h2>
      {d.body(close)}
    </dialog>
  );
}

function ConfirmBody({ o, close }: { o: ConfirmOptions; close: (r: ConfirmResult) => void }) {
  const { t } = useApp();
  const [checked, setChecked] = useState(false);
  return (
    <>
      {typeof o.body === "string" ? <p>{o.body}</p> : o.body}
      {o.checkbox && (
        <p>
          <label class="check">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.currentTarget.checked)} />{" "}
            {o.checkbox}
          </label>
        </p>
      )}
      <div class="actions">
        <button type="button" data-initial onClick={() => close({ choice: "cancel", checked })}>
          {o.cancel ?? t.common.cancel}
        </button>
        {o.extra?.map((x) => (
          <button type="button" key={x.value} onClick={() => close({ choice: x.value, checked })}>
            {x.label}
          </button>
        ))}
        <button
          type="button"
          class={o.danger ? "danger" : "primary"}
          onClick={() => close({ choice: "confirm", checked })}
        >
          {o.confirm}
        </button>
      </div>
    </>
  );
}
