import { useEffect, useReducer, useRef, useState } from "preact/hooks";
import { recordKind, repo, type Store } from "../core/storage";
import { Builder } from "./Builder";
import { type AppApi, AppContext, type DirtySource, useApp, useStoreVersion, type View } from "./context";
import { useDialogHost } from "./Dialogs";
import { History } from "./History";
import { Keep, Roadmap } from "./Keep";
import { browserLanguage, DICTS } from "./i18n";
import { Notice } from "./Notice";
import { Settings } from "./Settings";

const VIEWS: View[] = ["builder", "keep", "roadmap", "history", "settings"];

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
  const editingKeep = useRef<{ name: string; project: string } | null>(null);
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
    editingKeep,
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
      <Scenery place="map" />
      <Scenery place="top" />
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
        {view === "keep" && <Keep />}
        {view === "roadmap" && <Roadmap />}
        {view === "history" && <History />}
        {view === "settings" && <Settings />}
      </main>
      <Scenery place="bottom" />
      <footer>
        <p class="hint">{t.app.footer}</p>
        <p class="hint">© Julian Bottiglione, 2026</p>
        <p class="hint">{__APP_VERSION__}</p>
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

/** Pieces of each theme's scenery bands; CSS draws them. Themes not listed have none. */
const SCENERY: Partial<Record<string, { map?: string[]; top?: string[]; bottom?: string[] }>> = {
  platformer: {
    top: ["cloud cloud-1", "cloud cloud-2", "cloud cloud-3"],
    bottom: ["hill hill-1", "hill hill-2", "hill hill-3"],
  },
  dragon: {
    map: [
      "ow-river",
      "ow-forest ow-forest-1",
      "ow-forest ow-forest-2",
      "ow-forest ow-forest-3",
      "ow-mountain ow-mountain-1",
      "ow-mountain ow-mountain-2",
      "ow-mountain ow-mountain-3",
      "ow-mountain ow-mountain-4",
    ],
  },
  adventure: {
    top: ["puff puff-1", "puff puff-2", "puff puff-3"],
    bottom: ["kb-sea", "kb-hill", "kb-grass"],
  },
  red: {
    top: ["gb-dither", "gb-bushes"],
    bottom: ["gb-dither", "gb-bushes gb-bushes-top"],
  },
  gold: {
    top: ["gs-roof", "gs-wall"],
    bottom: ["gs-grass", "gs-water"],
  },
  awakening: {
    top: ["lz-grass", "lz-trunk", "lz-bush"],
    bottom: ["lz-grass", "lz-trunk", "lz-bush"],
  },
  watch: {
    map: ["wm"],
    bottom: ["gw-btn gw-btn-1", "gw-btn gw-btn-2", "gw-btn gw-btn-3", "gw-big gw-big-l", "gw-big gw-big-r"],
  },
};

/**
 * Decoration drawn by CSS: bands above and below the content, or a map behind
 * the whole page. Themes keep text off it (bands hold none; on a map, text
 * sits in opaque windows).
 */
function Scenery({ place }: { place: "map" | "top" | "bottom" }) {
  useStoreVersion();
  const { store } = useApp();
  const pieces = SCENERY[repo(store).settings().theme]?.[place];
  if (!pieces) return null;
  return (
    <div class={`scenery band-${place}`} aria-hidden="true">
      {pieces.map((c) => (
        <div key={c} class={c} />
      ))}
    </div>
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
