# How to Add a Dedicated File-Type Editor

A "file-type editor" opens files of a specific extension with a custom viewer/editor component instead of CodeMirror. This is the pattern used by PdfViewer (`.pdf`) and ExcalidrawEditor (`.excalidraw`).

Use this guide when the file type needs its own full-screen editor (not just a preview widget inside a markdown document). If you're adding a rendered preview inside fenced code blocks, use `add-cm-preview-widget.md` instead.

## Reference implementations

- `PdfViewer.tsx` — read-only viewer (simpler, no save logic)
- `ExcalidrawEditor.tsx` — full read/write editor with auto-save, error boundary, lazy loading

## Architecture overview

```
File tree click → detect extension → openTab(path, "<kind>", ...) → clearForCustomTab()
                                                                          ↓
EditorPanel.tsx checks activeTab.kind → renders <YourEditor path={...} />
                                                                          ↓
YourEditor reads file via readPlainFile(), renders custom UI, saves via writePlainFile()
```

The editor component is **self-contained** — it manages its own state independently from editorStore (which is for CodeMirror-based editing). Only `isDirty` is synced to tabStore for the dirty dot indicator.

## Checklist

### 1. Install the rendering library (if needed)

- [ ] Add dependency to `crates/app/package.json`
- [ ] Run `npm install --cache /tmp/npm-cache` in `crates/app/`
- [ ] If the library is large (>500KB), use **dynamic import** to avoid bloating the initial bundle. Follow the singleton pattern in `ExcalidrawEditor.tsx`:

```typescript
type MyModule = typeof import("my-library");
let mod: MyModule | null = null;
let loading: Promise<MyModule> | null = null;

function ensureModule(): Promise<MyModule> {
  if (mod) return Promise.resolve(mod);
  if (!loading) {
    loading = import("my-library").then((m) => { mod = m; return m; });
  }
  return loading;
}
```

### 2. Extend the tab kind union

**File**: `crates/app/src/stores/tabStore.ts`

- [ ] Add your kind string to the `TabState.kind` union type
- [ ] Add your kind string to the `openTab` parameter type in `TabStoreState`
- [ ] Add your kind string to the `createFreshTab` parameter type

```typescript
kind: "note" | "plain-file" | "untitled" | "pdf" | "excalidraw" | "your-kind";
```

### 3. Add file tree icon

**File**: `crates/app/src/components/Layout/fileTreeIcons.tsx`

- [ ] Import an appropriate icon from `lucide-react`
- [ ] Add entry to `FILE_EXT_ICONS`:

```typescript
yourext: { icon: YourIcon, color: "#hexcolor" },
```

### 4. Route file clicks in FileTreePanel

**File**: `crates/app/src/components/Layout/FileTreePanel.tsx`

- [ ] In `handleClick` (in the `FileItem` component), add extension detection **before** the existing `.pdf` check:

```typescript
if (node.fullPath.toLowerCase().endsWith(".yourext")) {
  const fileName = node.fullPath.split("/").pop() ?? node.fullPath;
  useTabStore.getState().openTab(node.fullPath, "your-kind", fileName, null);
  useEditorStore.getState().clearForCustomTab();
  return;
}
```

### 5. (Optional) Add "New File" context menu item

**File**: `crates/app/src/components/Layout/FileTreePanel.tsx`

If users should be able to create new files of this type:

- [ ] Add a handler (follow `handleNewDrawingHere` pattern):
  - Determine target folder via `folderPrefixFor()`
  - Auto-generate unique filename (check `workspaceFiles` for collisions)
  - Create file with valid initial content via `api.writePlainFile()`
  - Call `clearForCustomTab()` **before** `openTab()` (ordering matters for snapshot/auto-save)
- [ ] Add menu items in root, folder, and optionally file context menus

### 6. Create the editor component

**File**: `crates/app/src/components/Editor/YourEditor.tsx`

**Props**: `{ path: string }`

**Required elements:**

- [ ] **Loading state**: Show placeholder while file is being read and library loaded
- [ ] **Error state**: Show error message with "Open as Text" fallback button
- [ ] **Error boundary**: Wrap the third-party component in a React error boundary to prevent app-wide crashes. See `ExcalidrawErrorBoundary` in `ExcalidrawEditor.tsx`
- [ ] **File reading**: Use `getAPI().then(api => api.readPlainFile(path))` to read file content
- [ ] **Rendering**: Render the third-party component with parsed data

**If the editor supports editing (not read-only):**

- [ ] **Dirty tracking**: Use a ref (`dirtyRef`) for internal state + sync to tabStore:
  ```typescript
  useTabStore.getState().updateTabState(tabId, { isDirty: true });
  ```
- [ ] **Auto-save**: Debounce saves (1500ms recommended). Use `api.writePlainFile(path, content)` to write
- [ ] **Save-on-unmount**: Clean up pending saves in useEffect cleanup. Store pending data in a module-level Map (not React state) so the cleanup function can access it
- [ ] **Cmd+S support**: Listen for a custom event on `window`:
  ```typescript
  window.addEventListener("your-kind:save", handler);
  ```
- [ ] **Content comparison**: If the library fires change events frequently (e.g., on selection), compare content against last-saved snapshot to skip no-op writes

**Library-specific gotchas to check:**

- [ ] Does the library expect specific types (like `Map` instead of plain objects) after JSON round-trip? Initialize them explicitly
- [ ] Does the library's CSS need to be imported? Add `import "library/style.css"` at the top of the component
- [ ] Does the library register global keyboard handlers that conflict with App.tsx shortcuts?

### 7. Route the tab kind in EditorPanel

**File**: `crates/app/src/components/Editor/EditorPanel.tsx`

- [ ] Import your editor component
- [ ] Add a conditional render block after the existing PDF/Excalidraw checks:

```tsx
if (activeTab?.kind === "your-kind") {
  return (
    <div className="editor-panel-container">
      <YourEditor path={activeTab.path} />
    </div>
  );
}
```

### 8. Handle tab activation and closing in TabBar

**File**: `crates/app/src/components/Editor/TabBar.tsx`

- [ ] **handleActivate**: Add your kind to the `"pdf" || "excalidraw"` branch (or add a new one):
  ```typescript
  } else if (tab.kind === "pdf" || tab.kind === "excalidraw" || tab.kind === "your-kind") {
    useGraphStore.getState().selectNode(null);
    useTabStore.getState().activateTab(path);
    useEditorStore.getState().clearForCustomTab();
  }
  ```
- [ ] **handleClose**: Add your kind to the custom-tab close branch. If the editor saves on unmount, just close:
  ```typescript
  if (tab && (tab.kind === "pdf" || tab.kind === "excalidraw" || tab.kind === "your-kind")) {
    closeTabAndNavigateNext(id);
    return;
  }
  ```
- [ ] **Dirty dot**: The dirty indicator expression in the tab render already handles custom tabs:
  ```typescript
  (tab.id === activeTabId && tab.kind !== "excalidraw" && tab.kind !== "pdf" && tab.kind !== "your-kind"
    ? editorIsDirty : tab.isDirty)
  ```
  Add your kind to this check.

### 9. Handle tab navigation after close

**File**: `crates/app/src/stores/tabActions.ts`

- [ ] In `navigateToActiveTab`, add your kind to the custom-tab branch:
  ```typescript
  } else if (nextTab.kind === "pdf" || nextTab.kind === "excalidraw" || nextTab.kind === "your-kind") {
    useGraphStore.getState().selectNode(null);
    useEditorStore.getState().clearForCustomTab();
  }
  ```

### 10. Handle keyboard shortcuts

**File**: `crates/app/src/App.tsx`

- [ ] **Cmd+S**: If the editor supports saving, add a check before the `saveNote()` fallthrough:
  ```typescript
  if (tab?.kind === "your-kind") {
    window.dispatchEvent(new CustomEvent("your-kind:save", { detail: tab.path }));
    return;
  }
  ```
- [ ] **Cmd+W**: If the editor saves on unmount, just close without explicit save dispatch:
  ```typescript
  if (closingTab?.kind === "your-kind") {
    closeTabAndNavigateNext(closingId);
    return;
  }
  ```

### 11. Add CSS

**File**: `crates/app/src/App.css`

- [ ] Add a container class for your editor (full width/height):
  ```css
  .your-editor-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  ```
- [ ] If the library ships its own CSS, add font isolation to prevent BrainMap globals from leaking in:
  ```css
  .your-editor-container .library-root-class {
    font-family: unset;
    font-size: unset;
  }
  ```

### 12. (Optional) Add a theme setting

**Files**: `crates/app/src/stores/uiStore.ts`, `crates/app/src/components/Settings/SettingsModal.tsx`

If the library supports theming independently from the app:

- [ ] Add `yourEditorTheme: "light" | "dark"` to `StoredPrefs`, `UIState`, and initial state
- [ ] Add `setYourEditorTheme` action with `savePrefs()` persistence
- [ ] Add a select in SettingsModal under the Theme section
- [ ] Read the setting in your editor component via `useUIStore`

### 13. Write tests

**File**: `crates/app/src/components/Editor/YourEditor.test.tsx`

- [ ] Mock the third-party library module
- [ ] Mock `../../api/bridge` (getAPI → readPlainFile, writePlainFile)
- [ ] Test tab kind accepted by `openTab`
- [ ] Test `updateTabState` sets `isDirty`
- [ ] Test `closeTab` removes the tab
- [ ] Test `navigateToActiveTab` handles your kind via `clearForCustomTab`
- [ ] If editable: test dirty tracking, save on change, save on unmount, Cmd+S event
- [ ] Test error state on malformed file content

### 14. Update documentation

- [ ] Add entry to `docs/CHANGELOG.md`
- [ ] Add your extension to the file-type table in this guide (below)

## File types in BrainMap

| Extension | Tab Kind | Editor Component | Editable | Added |
|-----------|----------|-----------------|----------|-------|
| `.md` (with YAML) | `"note"` | MarkdownEditor + FrontmatterForm | Yes | Phase 1 |
| `.md` (no YAML) | `"plain-file"` | MarkdownEditor | Yes | Phase 1 |
| `.pdf` | `"pdf"` | PdfViewer | No (highlights only) | Phase 1c |
| `.excalidraw` | `"excalidraw"` | ExcalidrawEditor | Yes | Phase 1c |
| `.canvas` | `"canvas"` | CanvasEditor | Yes | Phase 1c |

## Common pitfalls

1. **Tab ordering**: Call `clearForCustomTab()` **before** `openTab()` when creating new files (e.g., "New Drawing Here"). If you call `openTab` first, `clearForCustomTab`'s `snapshotToActiveTab()` snapshots the new (empty) tab instead of the old one.

2. **JSON round-trip type loss**: `JSON.stringify` converts `Map` → `{}`, `Set` → `{}`, `Date` → string, etc. When loading a file and passing data to a library, re-initialize any special types the library expects.

3. **onChange frequency**: Many libraries fire change events on every interaction (including selection, hover, focus). Always compare content against the last-saved snapshot before marking dirty or scheduling a save.

4. **Error boundaries are mandatory**: Third-party libraries can throw during render. Without an error boundary, the entire BrainMap app goes blank. Always wrap in a class-component error boundary.

5. **Dirty dot for active tab**: TabBar reads `editorStore.isDirty` for the active tab by default, but custom editors don't use editorStore. Add your kind to the exclusion check so it reads `tab.isDirty` from tabStore instead.

6. **Static CSS imports**: `import "library/style.css"` loads when the module is first imported (even if the component hasn't rendered). This is usually fine but can cause issues if the CSS has global selectors that conflict with BrainMap styles.
