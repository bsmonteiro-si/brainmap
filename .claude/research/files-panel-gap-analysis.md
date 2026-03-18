# BrainMap Files Panel Gap Analysis (vs Obsidian)

**Date:** 2026-03-17
**Purpose:** Identify missing file management features in the Files panel compared to Obsidian's file explorer.

---

## Current State Summary

The Files panel (`FileTreePanel.tsx`, 1232 lines) has a solid foundation: tree view with folders-first alphabetical sorting, inline rename (F2), drag-and-drop move, context menus per item type, filter/search input, new note/folder creation, delete with confirmation, and a home note toggle. However, compared to Obsidian's file explorer, several convenience features are missing.

---

## Side-by-Side Comparison

### File Context Menu

| Feature | Obsidian | BrainMap | Gap? |
|---------|----------|----------|------|
| New Note Here | ✅ | ✅ | — |
| Open in new tab | ✅ | ❌ | **Yes** |
| Open to the right (split pane) | ✅ | ❌ | **Yes** (no split editor) |
| Open in new window | ✅ | ❌ | **Yes** (Tauri limitation) |
| Bookmark / Star | ✅ | ❌ | **Yes** |
| Make a copy / Duplicate | ✅ | ❌ | **Yes** |
| Rename | ✅ | ✅ | — |
| Delete | ✅ | ✅ | — |
| Move file to... (search modal) | ✅ | ❌ | **Yes** (only drag-drop) |
| Open in default app | ✅ | ❌ | **Yes** |
| Show in Finder/Explorer | ✅ | ❌ | **Yes** |
| Copy file path | ✅ (as Obsidian URL) | ❌ | **Yes** |
| Focus in Graph | ❌ | ✅ | BrainMap extra |
| Set as Home Note | ❌ | ✅ | BrainMap extra |

### Folder Context Menu

| Feature | Obsidian | BrainMap | Gap? |
|---------|----------|----------|------|
| New Note in Folder | ✅ | ✅ | — |
| New Subfolder | ✅ | ✅ | — |
| Bookmark / Star | ✅ | ❌ | **Yes** |
| Duplicate folder | ✅ | ❌ | **Yes** |
| Rename | ✅ | ✅ | — |
| Delete | ✅ | ✅ | — |
| Move folder to... (search modal) | ✅ | ❌ | **Yes** |
| Show in Finder/Explorer | ✅ | ❌ | **Yes** |
| Copy path | ✅ | ❌ | **Yes** |
| Focus in Graph | ❌ | ✅ | BrainMap extra |

### File Tree Toolbar & Global Features

| Feature | Obsidian | BrainMap | Gap? |
|---------|----------|----------|------|
| New note button | ✅ | ✅ | — |
| New folder button | ✅ | ✅ | — |
| Sort order dropdown | ✅ (name, modified, created, A-Z/Z-A) | ❌ (hardcoded alphabetical) | **Yes** |
| Collapse all button | ✅ | ❌ | **Yes** |
| Expand all button | ❌ (not native) | ❌ | — |
| Auto-reveal active file | ✅ | ❌ | **Yes** |
| Filter/search | ✅ (via separate plugin) | ✅ (built-in fuzzy filter) | BrainMap ahead |
| Drag external files to import | ✅ | ❌ | **Yes** |
| `⋯` hover action button | ❌ | ✅ | BrainMap extra |

### Delete Behavior

| Feature | Obsidian | BrainMap | Gap? |
|---------|----------|----------|------|
| Move to system trash | ✅ (default) | ❌ (permanent delete) | **Yes** |
| Move to app trash (.trash/) | ✅ (option) | ❌ | **Yes** |
| Permanent delete | ✅ (option) | ✅ (only option) | — |
| Configurable delete behavior | ✅ | ❌ | **Yes** |

---

## Prioritized Gaps

### Tier 1 — High Impact, Expected by Users

| # | Feature | Complexity | Notes |
|---|---------|-----------|-------|
| 1 | **Show in Finder/Explorer** | Low | Tauri has `tauri::api::shell::open` or `opener` plugin. Single Tauri command + context menu item. |
| 2 | **Copy file path** | Low | Copy relative or absolute path to clipboard. Pure frontend, no backend needed. |
| 3 | **Sort order dropdown** | Medium | Add sort options: name A-Z, name Z-A, modified (newest), modified (oldest), created (newest), created (oldest). Requires passing `modified`/`created` timestamps from backend (currently in frontmatter but not exposed to file tree). |
| 4 | **Collapse all** | Low | Traverse tree state and set all folders to collapsed. Single toolbar button. |
| 5 | **Move to trash** (instead of permanent delete) | Medium | Use Tauri's `trash` crate or `opener` plugin to move to system trash instead of `std::fs::remove_file`. Safer default. |
| 6 | **Duplicate file** | Medium | Backend: read file, write copy with `(1)` suffix. Frontend: context menu item + open the copy. |

### Tier 2 — Important, Differentiating

| # | Feature | Complexity | Notes |
|---|---------|-----------|-------|
| 7 | **Move file/folder to...** (search modal) | Medium | Modal with folder search/autocomplete. More discoverable than drag-drop for deeply nested moves. |
| 8 | **Auto-reveal active file** | Low | When opening a note (from graph, search, or link navigation), scroll the file tree to that item and highlight it. |
| 9 | **Open in new tab** (context menu) | Low | Currently left-click replaces the active tab or reuses an existing tab for the same file. Add explicit "Open in New Tab" that always creates a new tab. |
| 10 | **Open in default app** | Low | Use Tauri shell open API. Useful for PDFs, images, and non-markdown files. |

### Tier 3 — Nice to Have

| # | Feature | Complexity | Notes |
|---|---------|-----------|-------|
| 11 | **Bookmarks/Starred notes** | High | Needs a new data model (bookmarks list persisted to localStorage or a config file), a dedicated panel or section, and UI for add/remove. |
| 12 | **Drag external files to import** | Medium | Handle `drop` events with `event.dataTransfer.files`, copy files into workspace, trigger file watcher. |
| 13 | **Configurable delete behavior** | Low | Settings toggle: "Move to trash" vs "Delete permanently". |

---

## Implementation Details for Key Gaps

### 1. Show in Finder/Explorer

**Backend (Tauri command):**
```rust
#[tauri::command]
async fn reveal_in_explorer(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    std::process::Command::new("open").arg("-R").arg(&path).spawn().map_err(|e| e.to_string())?;
    #[cfg(target_os = "windows")]
    std::process::Command::new("explorer").arg(format!("/select,{}", &path)).spawn().map_err(|e| e.to_string())?;
    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open").arg(std::path::Path::new(&path).parent().unwrap_or(std::path::Path::new("."))).spawn().map_err(|e| e.to_string())?;
    Ok(())
}
```

**Frontend:** Add context menu item "Show in Finder" → calls `invoke("reveal_in_explorer", { path: absolutePath })`.

### 2. Copy File Path

**Frontend only:**
```ts
await navigator.clipboard.writeText(relativePath);
// or absolutePath = wsRoot + "/" + relativePath
```

Context menu items: "Copy Relative Path" and "Copy Absolute Path".

### 3. Sort Order

**State:** Add `fileSortOrder: "name-asc" | "name-desc" | "modified-desc" | "modified-asc" | "created-desc" | "created-asc"` to `uiStore`, persisted to `brainmap:uiPrefs`.

**Data requirement:** File tree currently sorts by name only. For modified/created sorting, need timestamps from the graph nodes (frontmatter has `created`/`modified`). The `NodeDto` already has these fields — just need to pass them to the sort comparator.

**UI:** Dropdown button in the file tree toolbar with sort options.

### 4. Collapse All

**State:** File tree expanded state is tracked per-folder. Add a `collapseAll()` action that sets all folders to collapsed.

**UI:** Button in toolbar (ChevronDown icon or similar).

### 5. Move to Trash

**Backend:** Replace `std::fs::remove_file`/`remove_dir_all` with the `trash` crate:
```toml
[dependencies]
trash = "5"
```
```rust
trash::delete(&path)?;
```

This moves to macOS Trash, Windows Recycle Bin, or Linux freedesktop trash.

### 6. Duplicate File

**Backend command:**
```rust
#[tauri::command]
async fn duplicate_note(path: String) -> Result<NoteDetail, String> {
    // Read original, generate new path with " (copy)" suffix, write copy
}
```

**Frontend:** Context menu item "Duplicate" → calls backend → opens the new copy.

### 8. Auto-Reveal Active File

**Implementation:** When `editorStore.activeNote` changes, find the corresponding tree node and:
1. Expand all parent folders
2. Scroll the tree to the item
3. Briefly highlight it

This requires the file tree to expose a `revealPath(path: string)` function. Can be toggled on/off in settings (Obsidian has this as a toggle).

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `src/components/Layout/FileTreePanel.tsx` | New context menu items, sort dropdown, collapse all button, auto-reveal |
| `src/stores/uiStore.ts` | `fileSortOrder` state, `autoRevealActiveFile` toggle |
| `src-tauri/src/commands.rs` | `reveal_in_explorer`, `duplicate_note` commands |
| `src-tauri/Cargo.toml` | Add `trash` crate dependency |
| `src-tauri/src/commands.rs` | Replace `remove_file`/`remove_dir_all` with `trash::delete` |
| `src/api/types.ts` | New API method signatures |
| `src/api/tauriBridge.ts` | New invoke wrappers |

---

## Recommended Implementation Order

**Phase A — Quick wins (1 PR):**
1. Show in Finder/Explorer
2. Copy file path (relative + absolute)
3. Collapse all toolbar button
4. Auto-reveal active file

**Phase B — Safety & convenience (1 PR):**
5. Move to trash (replace permanent delete)
6. Duplicate file
7. Open in new tab (context menu)
8. Open in default app

**Phase C — Sort & move (1 PR):**
9. Sort order dropdown
10. Move file/folder to... modal

**Phase D — Advanced (separate PR):**
11. Bookmarks/starred notes
