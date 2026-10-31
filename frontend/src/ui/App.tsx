import { useEffect, useRef, useState } from "preact/hooks";
import { repo, type Store } from "../core/storage";
import { Builder } from "./Builder";
import { type AppApi, AppContext, type DirtySource, useApp, useStoreVersion, type View } from "./context";
import { useDialogHost } from "./Dialogs";
import { History } from "./History";
import { Notice } from "./Notice";
import { Settings } from "./Settings";

const VIEWS: { id: View; label: string }[] = [
  { id: "builder", label: "Builder" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

const viewFromHash = (): View => {
  const v = location.hash.replace(/^#\//, "");
  return VIEWS.some((x) => x.id === v) ? (v as View) : "builder";
};

export function App({ store }: { store: Store }) {
  const [view, setView] = useState<View>(viewFromHash);
  const [dialogs, dialogNodes] = useDialogHost();
  const [live, setLive] = useState("");
  const [conflict, setConflict] = useState<DirtySource | null>(null);
  const guard = useRef<(() => Promise<boolean>) | null>(null);
  const dirty = useRef(new Set<DirtySource>());
  const builderNotice = useRef<string | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const go = (v: View, push: boolean) => {
    setView(v);
    if (push) location.hash = `#/${v}`;
    setTimeout(() => document.getElementById("main")?.focus(), 0);
  };

  const api: AppApi = {
    store,
    dialogs,
    announce: (msg) => {
      // Cleared first so the same message is announced again.
      setLive("");
      setTimeout(() => setLive(msg), 50);
    },
    navigate: async (v) => {
      if (v === viewRef.current) return;
      if (guard.current && !(await guard.current())) return;
      guard.current = null;
      go(v, true);
    },
    setLeaveGuard: (g) => {
      guard.current = g;
    },
    registerDirty: (src) => {
      dirty.current.add(src);
      return () => dirty.current.delete(src);
    },
    builderNotice,
  };

  useEffect(() => {
    let restoring = false;
    const onHash = async () => {
      if (restoring) {
        restoring = false;
        return;
      }
      const v = viewFromHash();
      if (v === viewRef.current) return;
      if (guard.current) {
        // Hash changes cannot be cancelled: put the old one back, then ask.
        restoring = true;
        history.replaceState(null, "", `#/${viewRef.current}`);
        restoring = false;
        if (!(await guard.current())) return;
        guard.current = null;
        go(v, true);
        return;
      }
      go(v, false);
    };
    addEventListener("hashchange", onHash);
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      const src = [...dirty.current].find((d) => d.key === e.key && d.isDirty());
      store.external(e.key, e.newValue);
      if (src) {
        src.hold?.(true);
        setConflict(src);
      }
    };
    addEventListener("storage", onStorage);
    const onCsp = (e: SecurityPolicyViolationEvent) =>
      console.error(`CSP violation: ${e.violatedDirective} blocked ${e.blockedURI || "inline content"}`);
    document.addEventListener("securitypolicyviolation", onCsp);
    return () => {
      removeEventListener("hashchange", onHash);
      removeEventListener("storage", onStorage);
      document.removeEventListener("securitypolicyviolation", onCsp);
    };
  }, []);

  useEffect(() => {
    document.title = `${VIEWS.find((v) => v.id === view)!.label} – Prompt Builder`;
  }, [view]);

  return (
    <AppContext.Provider value={api}>
      <Theme />
      <a class="skip" href="#main" onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())}>
        Skip to main content
      </a>
      <header>
        <h1>Prompt Builder</h1>
        <nav aria-label="Views">
          <ul>
            {VIEWS.map((v) => (
              <li key={v.id}>
                <a
                  href={`#/${v.id}`}
                  aria-current={view === v.id ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    api.navigate(v.id);
                  }}
                >
                  {v.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <StoreNotices />
      {conflict && (
        <Notice>
          This data was changed in another tab.{" "}
          <span class="inline-actions">
            <button
              type="button"
              onClick={() => {
                conflict.hold?.(false);
                conflict.reload();
                setConflict(null);
              }}
            >
              Load theirs
            </button>
            <button
              type="button"
              onClick={() => {
                conflict.hold?.(false);
                setConflict(null);
              }}
            >
              Keep mine
            </button>
          </span>
        </Notice>
      )}
      <main id="main" tabIndex={-1}>
        {view === "builder" && <Builder />}
        {view === "history" && <History />}
        {view === "settings" && <Settings />}
      </main>
      <footer>
        <p class="hint">
          Runs offline in this browser and sends nothing unless you press an Open button. Markdown headings you type are kept
          as typed and can look like sections to the model.
        </p>
      </footer>
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </div>
      {dialogNodes}
    </AppContext.Provider>
  );
}

function StoreNotices() {
  useStoreVersion();
  const { store } = useApp();
  return (
    <>
      {store.getNotices().map((n) => (
        <Notice key={n.id} kind={n.kind === "alert" ? "alert" : "status"} onDismiss={n.id === "full" || n.kind === "banner" ? undefined : () => store.dismiss(n.id)}>
          {n.text}
        </Notice>
      ))}
    </>
  );
}

function Theme() {
  useStoreVersion();
  const { store } = useApp();
  const theme = repo(store).settings().theme;
  useEffect(() => {
    if (theme === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}
