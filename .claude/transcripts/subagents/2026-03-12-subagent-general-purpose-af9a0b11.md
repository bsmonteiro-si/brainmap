# 2026-03-12 — Subagent Transcript: general-purpose

**Date:** 2026-03-12 16:13:18
**Agent:** general-purpose
**Agent ID:** af9a0b11a5103a125
**Parent Session:** 279be677-6d3a-444c-a7e0-844e319db25f

---

## User

You are reviewing code changes for BrainMap. Review the changes below for correctness. The changes add a "list all workspace files" feature so the file tree shows all files, not just parsed BrainMap notes.

Review criteria (from code-reviewer agent):

### 1. Correctness
- Logic bugs, missed conditions, error handling
- File system operations safety (path traversal, partial writes)
- Graph/index state consistency after mutations

### 2. Rust Quality
- Unnecessary clones, ownership issues
- unwrap()/expect() usage
- Appropriate types (&Path vs PathBuf, &str vs String)

### 3. Function Design
- Single responsibility, descriptive names

### 4. Test Coverage
- New public functions tested?
- Error paths tested?

### 5. Performance
- O(n^2) loops, unnecessary clones

### Output Format
For each finding: **File**, **Severity** (bug/should-fix/suggestion), **Finding**, **Fix**.

## Changed files:

### handlers.rs (new code at bottom):
```rust
/// List all files in the workspace directory (recursive, excludes `.brainmap/`).
/// Returns relative paths from the workspace root.
pub fn handle_list_workspace_files(ws: &Workspace) -> Vec<String> {
    let mut files = Vec::new();
    collect_files_recursive(&ws.root, &ws.root, &mut files);
    files.sort();
    files
}

fn collect_files_recursive(
    base: &std::path::Path,
    dir: &std::path::Path,
    out: &mut Vec<String>,
) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        let name_str = name.to_string_lossy();

        // Skip .brainmap directory
        if name_str == ".brainmap" {
            continue;
        }
        // Skip hidden files/dirs
        if name_str.starts_with('.') {
            continue;
        }

        if path.is_dir() {
            collect_files_recursive(base, &path, out);
        } else if let Ok(rel) = path.strip_prefix(base) {
            out.push(rel.to_string_lossy().into_owned());
        }
    }
}
```

### commands.rs (new command):
```rust
#[tauri::command]
pub fn list_workspace_files(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    state.with_workspace(|ws| Ok(handlers::handle_list_workspace_files(ws)))
}
```

### lib.rs: Added `commands::list_workspace_files` to invoke handler list.

### types.ts: Added `listWorkspaceFiles(): Promise<string[]>` to BrainMapAPI interface.

### tauri.ts:
```typescript
async listWorkspaceFiles(): Promise<string[]> {
    return invoke<string[]>("list_workspace_files");
}
```

### mock/index.ts:
```typescript
async listWorkspaceFiles(): Promise<string[]> {
    return Array.from(mockState.notes.keys());
}
```

### graphStore.ts changes:
- Added `workspaceFiles: string[]` to state
- `loadTopology` now calls `Promise.all([api.getGraphTopology(), api.listWorkspaceFiles()])` and stores both
- `reset` clears `workspaceFiles: []`

### FileTreePanel.tsx changes:
- `buildTree` signature: added optional `workspaceFiles?: string[]` param
- After empty folders merge, iterates `workspaceFiles` and adds TreeNodes for paths not in `nodes` Map (with `title = fileName`, no `note_type`)
- Dedup check: `roots.some(r => r.fullPath === filePath)` and `parent.children.some(c => c.fullPath === filePath)`
- `FileTreePanel` passes `workspaceFiles` from graphStore to `buildTree`
- Non-BrainMap files (no `note_type`) get `tree-file--plain` CSS class and clicking is a no-op

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/filesystem-listing-review-1.md`.

---

## Assistant



Let me review the changed files more carefully to understand the full context.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/FileTreePanel*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.test.ts"}`

---

## Assistant

Now let me check the `Workspace` struct to understand `ws.root` accessibility.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub struct Workspace","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content","-A":5}`

---

## Assistant

Now I have enough context to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/filesystem-listing-review-1.md","content":"# Code Review: List All Workspace Files Feature\n\n**Reviewer**: code-reviewer`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/filesystem-listing-review-1.md`.

**Summary of findings (0 bugs, 4 should-fix, 4 suggestions):**

**Should-fix:**
1. **`workspaceFiles` not updated after mutations** (`graphStore.ts`): `applyEvent` updates `nodes`/`edges` but never touches `workspaceFiles`, so the file tree goes stale after create/delete operations until a full reload.
2. **Symlink traversal risk** (`handlers.rs`): `collect_files_recursive` follows symlinks, which can cause infinite recursion (cycle) or list files outside the workspace. Add a `path.is_symlink()` skip.
3. **Context menu on plain files** (`FileTreePanel.tsx`): "Delete" and "Focus in Graph" are shown for non-BrainMap files but will fail or produce empty results. These should be hidden or handled separately.
4. **No tests** for the new `workspaceFiles` parameter in `buildTree` (TypeScript) or `handle_list_workspace_files` (Rust).

**Suggestions:**
- `noteCount` badges inflate counts by including plain files -- consider filtering by `note_type`.
- The `.brainmap` skip check is redundant with the `starts_with('.')` check.
- Mock bridge only returns note paths, never exercises plain-file code paths.
- Path separators would break on Windows (not an immediate concern on macOS).

---

