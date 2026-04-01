# Plan: Final Polish — 5 Remaining Features

## Context

All high-impact editor and files panel features are shipped. This batch tackles the remaining items (excluding bookmarks and inline image preview): Move to folder modal, Open in default app, Spell checking, Line wrap toggle, and Indent configuration.

---

## 1. Move File/Folder To... (Search Modal)

**New file:** `crates/app/src/components/Layout/MoveToDialog.tsx`

A modal with a folder path input + autocomplete. When submitted, calls `api.moveNote()` or `api.moveFolder()`.

**Approach:** Reuse the `CreateNoteDialog` pattern — modal overlay, path input field, folder list derived from `graphStore.nodes` (filter `note_type === "folder"`).

**State:** Add `moveDialogTarget: { path: string; isFolder: boolean } | null` to uiStore with `openMoveDialog(target)` / `closeMoveDialog()` actions.

**UI:** Input field showing current path. Dropdown/autocomplete listing all folders from the graph. Submit calls `api.moveNote(oldPath, newFolderPath + "/" + filename)` or `api.moveFolder(oldPath, newFolderPath + "/" + folderName)`.

**Context menu:** Add "Move to..." item in FileTreePanel for notes and folders.

**Files:** `MoveToDialog.tsx` (new), `uiStore.ts`, `FileTreePanel.tsx`, `AppLayout.tsx` (render dialog).

---

## 2. Open in Default App

**No backend changes.** `@tauri-apps/plugin-shell` is already a dependency.

**Frontend:** Use `import { open } from '@tauri-apps/plugin-shell'` to open the absolute file path.

**Context menu:** Add "Open in Default App" item in FileTreePanel for plain files (non-markdown). Also useful for `.md` files if the user wants to open in another editor.

**Files:** `FileTreePanel.tsx` (context menu item + handler).

---

## 3. Spell Checking

**Approach:** CodeMirror 6's `.cm-content` is a `contenteditable` div. Setting `spellcheck="true"` on it enables native browser/WKWebView spell checking.

**Implementation:** Add `EditorView.contentAttributes.of({ spellcheck: "true" })` as a CM6 extension in `MarkdownEditor.tsx`, conditional on a `spellCheck` preference.

**Settings:** Add `spellCheck: boolean` to uiStore (default: true). Toggle in SettingsModal under the Editor section.

**Files:** `MarkdownEditor.tsx`, `uiStore.ts`, `SettingsModal.tsx`.

---

## 4. Line Wrap Toggle

**Current state:** `EditorView.lineWrapping` is always included in the extensions array (line 103 of MarkdownEditor.tsx).

**Implementation:** Make it conditional on `lineWrapping` preference from uiStore. Follow the `showLineNumbers` pattern exactly.

**Files:** `MarkdownEditor.tsx` (conditional extension), `uiStore.ts` (new `lineWrapping` boolean, default `true`), `SettingsModal.tsx` (toggle).

---

## 5. Indent Configuration

**Implementation:** Add `editorIndentSize: number` (default 4) to uiStore. Use `indentUnit.of(" ".repeat(size))` from `@codemirror/language` in MarkdownEditor.

**Settings:** Numeric select (2 / 4 / 8) in SettingsModal.

**Files:** `MarkdownEditor.tsx` (add `indentUnit` facet), `uiStore.ts` (new preference), `SettingsModal.tsx` (select).

---

## Files to Modify/Create

| File | Changes |
|------|---------|
| `src/components/Layout/MoveToDialog.tsx` | **Create** — move-to modal with folder autocomplete |
| `src/components/Layout/FileTreePanel.tsx` | "Move to..." + "Open in Default App" context menu items |
| `src/components/Layout/AppLayout.tsx` | Render `MoveToDialog` |
| `src/components/Editor/MarkdownEditor.tsx` | Conditional `lineWrapping`, `spellcheck`, `indentUnit` |
| `src/components/Settings/SettingsModal.tsx` | Toggles for spell check, line wrap; indent size select |
| `src/stores/uiStore.ts` | `moveDialogTarget`, `spellCheck`, `lineWrapping`, `editorIndentSize` + actions |
| `docs/CHANGELOG.md` | Entry |

---

## Verification

1. **Move to:** Right-click note → "Move to..." → modal shows folders → select → note moves
2. **Open in default app:** Right-click plain file → "Open in Default App" → opens in system default
3. **Spell check:** Open Settings → toggle Spell Check → misspelled words get underlined in editor
4. **Line wrap:** Settings → toggle Line Wrapping off → long lines extend beyond viewport with horizontal scroll
5. **Indent:** Settings → change indent size to 2 → Tab key inserts 2 spaces
6. `npm test` — all tests pass
