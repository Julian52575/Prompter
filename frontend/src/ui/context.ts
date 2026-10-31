import { createContext } from "preact";
import { useContext, useEffect, useReducer } from "preact/hooks";
import type { Store } from "../core/storage";
import type { DialogApi } from "./Dialogs";
import type { Dict, Language } from "./i18n";

export type View = "builder" | "history" | "settings";

/** A record this tab may hold unsaved changes to, for the multi-tab banner. */
export interface DirtySource {
  key: string;
  isDirty(): boolean;
  reload(): void;
  /** Pauses saving while the user picks Load theirs or Keep mine. */
  hold?(on: boolean): void;
}

export interface AppApi {
  store: Store;
  /** UI strings in the chosen language; prompts are always English. */
  t: Dict;
  lang: Language;
  dialogs: DialogApi;
  announce(msg: string): void;
  navigate(view: View): void;
  /** Registers a "leave with unsaved changes?" check; returns the unregister function. */
  setLeaveGuard(guard: (() => Promise<boolean>) | null): void;
  registerDirty(src: DirtySource): () => void;
  /** One-off message the Builder shows on its next render (Restore). */
  builderNotice: { current: string | null };
  /** Set before navigating to Settings to open the new-template editor there. */
  openNewTemplate: { current: boolean };
}

export const AppContext = createContext<AppApi>(null as never);
export const useApp = () => useContext(AppContext);

/** Re-renders the component whenever the store changes. */
export function useStoreVersion(): void {
  const { store } = useApp();
  const [, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => store.subscribe(() => bump(0)), [store]);
}

/** Focuses an element after the pending render; containers focus their first control. */
export function focusLater(id: string, fallbackId?: string): void {
  setTimeout(() => focusNow(id) || (fallbackId !== undefined && focusNow(fallbackId)), 0);
}

export function focusNow(id: string): boolean {
  let el = document.getElementById(id);
  if (!el) return false;
  if (el.matches("fieldset, div, section, ul, li"))
    el = el.querySelector<HTMLElement>("input:not([disabled]), textarea, select, button:not([disabled])") ?? el;
  if ((el as HTMLButtonElement).disabled) return false;
  el.focus();
  return document.activeElement === el;
}
