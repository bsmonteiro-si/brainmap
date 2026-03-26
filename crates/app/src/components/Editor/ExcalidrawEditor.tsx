import { useState, useEffect, useRef, useCallback, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { getAPI } from "../../api/bridge";
import { useTabStore } from "../../stores/tabStore";
import { useUIStore } from "../../stores/uiStore";
import { log } from "../../utils/logger";
import "@excalidraw/excalidraw/index.css";

// ── Error boundary ────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  error: string | null;
}

class ExcalidrawErrorBoundary extends Component<{ children: ReactNode; path: string }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(err: Error): ErrorBoundaryState {
    return { error: err.message || "Unknown error" };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    log.error("excalidraw", "component crashed", {
      error: err.message,
      stack: info.componentStack ?? "",
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="excalidraw-container">
          <div className="editor-placeholder" style={{ flexDirection: "column", gap: 8 }}>
            <div>Drawing editor crashed: {this.state.error}</div>
            <button
              className="editor-view-btn"
              onClick={() => {
                useTabStore.getState().closeTab(this.props.path);
                import("../../stores/editorStore").then(({ useEditorStore }) => {
                  useEditorStore.getState().openPlainFile(this.props.path);
                });
              }}
            >
              Open as Text
            </button>
            <button
              className="editor-view-btn"
              onClick={() => this.setState({ error: null })}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Lazy-load Excalidraw ──────────────────────────────────────────────────────

type ExcalidrawModule = typeof import("@excalidraw/excalidraw");
let excalidrawMod: ExcalidrawModule | null = null;
let excalidrawLoading: Promise<ExcalidrawModule> | null = null;

function ensureExcalidraw(): Promise<ExcalidrawModule> {
  if (excalidrawMod) return Promise.resolve(excalidrawMod);
  if (!excalidrawLoading) {
    excalidrawLoading = import("@excalidraw/excalidraw").then((mod) => {
      excalidrawMod = mod;
      return mod;
    });
  }
  return excalidrawLoading;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExcalidrawData {
  elements: readonly Record<string, unknown>[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}

const SAVE_DEBOUNCE_MS = 1500;

// Module-level state for save-on-unmount (can't rely on React state in cleanup)
const pendingSaves = new Map<string, ExcalidrawData>();

// ── Component ─────────────────────────────────────────────────────────────────

function ExcalidrawEditorInner({ path }: { path: string }) {
  const [mod, setMod] = useState<ExcalidrawModule | null>(excalidrawMod);
  const [initialData, setInitialData] = useState<ExcalidrawData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const excalidrawTheme = useUIStore((s) => s.excalidrawTheme);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const dirtyRef = useRef(false);
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const doSaveRef = useRef<(data: ExcalidrawData) => Promise<void>>(null!);

  // Load file + module in parallel
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    Promise.all([
      getAPI().then((api) => api.readPlainFile(path)),
      ensureExcalidraw(),
    ])
      .then(([file, loadedMod]) => {
        if (cancelled) return;
        if (file.binary) {
          setError("Binary file — cannot open as drawing");
          setLoading(false);
          return;
        }
        try {
          const parsed = JSON.parse(file.body);
          const data: ExcalidrawData = {
            elements: parsed.elements ?? [],
            appState: parsed.appState ?? {},
            files: parsed.files ?? {},
          };
          try {
            lastSavedRef.current = JSON.stringify({
              elements: data.elements,
              files: data.files,
            });
          } catch {
            lastSavedRef.current = "";
          }
          setInitialData(data);
          setMod(loadedMod);
        } catch {
          setError("Could not parse drawing file. The file may be corrupted or not valid Excalidraw JSON.");
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  // Reload from disk when an external change is detected (via tabReloadKeys bump)
  const reloadKey = useUIStore((s) => s.tabReloadKeys.get(path) ?? 0);
  useEffect(() => {
    if (reloadKey === 0) return; // skip initial mount

    // If dirty, show conflict state on the tab instead of silently reloading
    if (dirtyRef.current) {
      const tabId = useTabStore.getState().activeTabId;
      if (tabId) {
        useTabStore.getState().updateTabState(tabId, { conflictState: "external-change" });
      }
      return;
    }

    // Not dirty — reload from disk
    let cancelled = false;
    Promise.all([
      getAPI().then((api) => api.readPlainFile(path)),
      ensureExcalidraw(),
    ])
      .then(([file, loadedMod]) => {
        if (cancelled || file.binary) return;
        try {
          const parsed = JSON.parse(file.body);
          const data: ExcalidrawData = {
            elements: parsed.elements ?? [],
            appState: parsed.appState ?? {},
            files: parsed.files ?? {},
          };
          try {
            lastSavedRef.current = JSON.stringify({
              elements: data.elements,
              files: data.files,
            });
          } catch {
            lastSavedRef.current = "";
          }
          dirtyRef.current = false;
          setInitialData(data);
          setMod(loadedMod);
        } catch {
          log.warn("excalidraw", "external reload: failed to parse drawing file", { path });
        }
      })
      .catch((e) => {
        if (!cancelled) log.warn("excalidraw", "external reload failed", { path, error: String(e) });
      });

    return () => { cancelled = true; };
  }, [reloadKey, path]);

  // Save function
  const doSave = useCallback(
    async (data: ExcalidrawData) => {
      if (savingRef.current) return;
      savingRef.current = true;
      try {
        const json = JSON.stringify(
          {
            type: "excalidraw",
            version: 2,
            source: "brainmap",
            elements: data.elements,
            appState: data.appState,
            files: data.files,
          },
          null,
          2,
        );
        const api = await getAPI();
        await api.writePlainFile(path, json);
        try {
          lastSavedRef.current = JSON.stringify({
            elements: data.elements,
            files: data.files,
          });
        } catch {
          lastSavedRef.current = "";
        }
        dirtyRef.current = false;
        pendingSaves.delete(path);
        if (mountedRef.current) {
          const tabId = useTabStore.getState().activeTabId;
          if (tabId === path) {
            useTabStore.getState().updateTabState(tabId, { isDirty: false });
          }
        }
      } catch (e) {
        pendingSaves.delete(path);
        log.error("excalidraw", "failed to save drawing", {
          path,
          error: String(e),
        });
      } finally {
        savingRef.current = false;
      }
    },
    [path],
  );

  // Keep doSaveRef in sync so unmount cleanup uses latest version
  doSaveRef.current = doSave;

  // Listen for excalidraw:save event (Cmd+S / Cmd+W) — path-discriminated
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && detail !== path) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      const data = pendingSaves.get(path);
      if (data) {
        doSave(data);
      }
    };
    window.addEventListener("excalidraw:save", handler);
    return () => window.removeEventListener("excalidraw:save", handler);
  }, [path, doSave]);

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      const data = pendingSaves.get(path);
      if (data && !savingRef.current) {
        doSaveRef.current(data);
      }
    };
  }, [path]);

  // onChange handler from Excalidraw — wrapped in try/catch to prevent app crash
  const handleChange = useCallback(
    (elements: readonly Record<string, unknown>[], _appState: Record<string, unknown>, files: Record<string, unknown>) => {
      try {
        // Compare content (elements + files) against last saved to skip selection-only changes
        let contentKey: string;
        try {
          contentKey = JSON.stringify({ elements, files });
        } catch {
          // Non-serializable data — treat as changed
          contentKey = "";
        }
        if (contentKey && contentKey === lastSavedRef.current) return;

        const data: ExcalidrawData = {
          elements,
          appState: _appState,
          files,
        };
        pendingSaves.set(path, data);

        if (!dirtyRef.current) {
          dirtyRef.current = true;
          const tabId = useTabStore.getState().activeTabId;
          if (tabId === path) {
            useTabStore.getState().updateTabState(tabId, { isDirty: true });
          }
        }

        // Debounced save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveTimerRef.current = null;
          const pending = pendingSaves.get(path);
          if (pending) doSave(pending);
        }, SAVE_DEBOUNCE_MS);
      } catch (e) {
        log.error("excalidraw", "onChange error", { error: String(e) });
      }
    },
    [path, doSave],
  );

  if (loading) {
    return (
      <div className="excalidraw-container">
        <div className="editor-placeholder">Loading drawing...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="excalidraw-container">
        <div className="editor-placeholder" style={{ flexDirection: "column", gap: 8 }}>
          <div>{error}</div>
          <button
            className="editor-view-btn"
            onClick={() => {
              useTabStore.getState().closeTab(path);
              import("../../stores/editorStore").then(({ useEditorStore }) => {
                useEditorStore.getState().openPlainFile(path);
              });
            }}
          >
            Open as Text
          </button>
        </div>
      </div>
    );
  }

  if (!mod || !initialData) return null;

  const { Excalidraw } = mod;

  return (
    <div className="excalidraw-container">
      <Excalidraw
        initialData={{
          elements: initialData.elements as Parameters<typeof Excalidraw>[0] extends { initialData?: { elements?: infer E } } ? E : never,
          appState: { ...initialData.appState, collaborators: new Map() },
          files: initialData.files as Parameters<typeof Excalidraw>[0] extends { initialData?: { files?: infer F } } ? F : never,
        }}
        onChange={handleChange as (...args: unknown[]) => void}
        theme={excalidrawTheme}
      />
    </div>
  );
}

// ── Public export with error boundary ─────────────────────────────────────────

export function ExcalidrawEditor({ path }: { path: string }) {
  return (
    <ExcalidrawErrorBoundary path={path} key={path}>
      <ExcalidrawEditorInner path={path} />
    </ExcalidrawErrorBoundary>
  );
}
