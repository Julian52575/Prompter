import { useEffect, useReducer, useRef, useState } from "preact/hooks";
import { recordKind, repo, type Store } from "../core/storage";
import { Builder } from "./Builder";
import { type AppApi, AppContext, type DirtySource, useApp, useStoreVersion, type View } from "./context";
import { useDialogHost } from "./Dialogs";
import { History } from "./History";
import { browserLanguage, DICTS } from "./i18n";
import { Notice } from "./Notice";
import { Settings } from "./Settings";

const VIEWS: View[] = ["builder", "history", "settings"];

const viewFromHash = (): View => {
  const v = location.hash.replace(/^#\//, "");
  return VIEWS.includes(v as View) ? (v as View) : "builder";
};

export function App({ store }: { store: Store }) {
  const [view, setView] = useState<View>(viewFromHash);
  // The language lives in settings, so the whole app re-renders when the store changes.
  const [, bump] = useReducer((n: number) => n + 1, 0);
  useEffect(() => store.subscribe(() => bump(0)), [store]);
  const lang = repo(store).settings().language ?? browserLanguage();
  const t = DICTS[lang];
  const [dialogs, dialogNodes] = useDialogHost();
  const [live, setLive] = useState("");
  const [conflict, setConflict] = useState<DirtySource | null>(null);
  const guard = useRef<(() => Promise<boolean>) | null>(null);
  const dirty = useRef(new Set<DirtySource>());
  const builderNotice = useRef<string | null>(null);
  const openNewTemplate = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;

  const go = (v: View, push: boolean) => {
    setView(v);
    if (push) location.hash = `#/${v}`;
    setTimeout(() => document.getElementById("main")?.focus(), 0);
  };

  const api: AppApi = {
    store,
    t,
    lang,
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
    openNewTemplate,
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
    document.title = t.app.pageTitle(t.app.nav[view]);
    document.documentElement.lang = lang;
  }, [view, lang]);

  return (
    <AppContext.Provider value={api}>
      <Theme />
      <a class="skip" href="#main" onClick={(e) => (e.preventDefault(), document.getElementById("main")?.focus())}>
        {t.app.skip}
      </a>
      <header>
        <h1>Prompt Builder</h1>
        <nav aria-label={t.app.views}>
          <ul>
            {VIEWS.map((v) => (
              <li key={v}>
                <a
                  href={`#/${v}`}
                  aria-current={view === v ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    api.navigate(v);
                  }}
                >
                  {t.app.nav[v]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <StoreNotices />
      {conflict && (
        <Notice>
          {t.app.otherTab}{" "}
          <span class="inline-actions">
            <button
              type="button"
              onClick={() => {
                conflict.hold?.(false);
                conflict.reload();
                setConflict(null);
              }}
            >
              {t.app.loadTheirs}
            </button>
            <button
              type="button"
              onClick={() => {
                conflict.hold?.(false);
                setConflict(null);
              }}
            >
              {t.common.keepMine}
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
        <p class="hint">{t.app.footer}</p>
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
  const { store, t } = useApp();
  return (
    <>
      {store.getNotices().map((n) => (
        <Notice key={n.id} kind={n.kind === "alert" ? "alert" : "status"} onDismiss={n.id === "full" || n.kind === "banner" ? undefined : () => store.dismiss(n.id)}>
          {t.notices.text(n.code, n.record ? t.notices.records[recordKind(n.record)] : "")}
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
