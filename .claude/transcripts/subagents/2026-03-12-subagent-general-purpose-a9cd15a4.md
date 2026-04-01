# 2026-03-12 — Subagent Transcript: general-purpose

**Date:** 2026-03-12 12:13:39
**Agent:** general-purpose
**Agent ID:** a9cd15a41de4a73b5
**Parent Session:** 5ae6d1d3-bcbb-4cec-8479-cbe6e4ae4a3d

---

## User

You are reviewing code changes for BrainMap. Follow the code reviewer criteria exactly.

## Code Reviewer Agent Instructions

You are reviewing Rust and TypeScript code for BrainMap, a knowledge graph tool. Your job is to find real defects, not style nits.

### What to Review
1. **Correctness**: Logic bugs, off-by-one errors, missed conditions, error handling covering all failure modes, file system safety, graph/index state consistency after mutations
2. **Rust Quality**: Unnecessary clones, unwrap/expect safety, appropriate types (String vs &str, &Path vs PathBuf)
3. **Function Design**: Single responsibility, descriptive names, appropriate length
4. **Test Coverage**: Public functions tested, error paths tested, behavior verification
5. **Serialization and API Surface**: JSON output fields, consistent naming, error responses
6. **Performance**: O(n^2) loops, unnecessary clones, batch opportunities

### Output Format
For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

## Changed Files to Review

### 1. `crates/app/src-tauri/src/handlers.rs` — New handler

```rust
/// Delete a folder and all notes inside it.
pub fn handle_delete_folder(
    ws: &mut Workspace,
    folder_path: &str,
    force: bool,
) -> Result<DeleteFolderResultDto, String> {
    let prefix = if folder_path.ends_with('/') {
        folder_path.to_string()
    } else {
        format!("{}/", folder_path)
    };

    let mut note_paths: Vec<String> = ws
        .notes
        .keys()
        .filter(|p| p.as_str().starts_with(&prefix))
        .map(|p| p.as_str().to_string())
        .collect();

    if !force {
        let folder_note_set: std::collections::HashSet<&str> =
            note_paths.iter().map(|s| s.as_str()).collect();

        let mut external_backlinks: Vec<ExternalBacklinkDto> = Vec::new();
        for note_path in &note_paths {
            let rp = brainmap_core::model::RelativePath::new(note_path);
            if let Ok(backlinks) = ws.index.backlinks(&rp) {
                for (source, rel) in backlinks {
                    if !folder_note_set.contains(source.as_str()) {
                        external_backlinks.push(ExternalBacklinkDto {
                            source_path: source,
                            target_path: note_path.clone(),
                            rel,
                        });
                    }
                }
            }
        }

        if !external_backlinks.is_empty() {
            let bl_json = serde_json::to_string(&external_backlinks)
                .unwrap_or_else(|_| "[]".to_string());
            return Err(format!("EXTERNAL_BACKLINKS:{}", bl_json));
        }
    }

    note_paths.sort();
    note_paths.reverse();

    let mut deleted_paths: Vec<String> = Vec::new();
    for note_path in &note_paths {
        match ws.delete_note(note_path, true) {
            Ok(()) => deleted_paths.push(note_path.clone()),
            Err(e) => {
                let partial_json = serde_json::to_string(&deleted_paths)
                    .unwrap_or_else(|_| "[]".to_string());
                return Err(format!(
                    "PARTIAL_DELETE:{}:{}",
                    partial_json,
                    e.to_string()
                ));
            }
        }
    }

    let dir_path = ws.root.join(folder_path);
    if dir_path.is_dir() {
        let _ = remove_empty_dirs_recursive(&dir_path);
    }

    Ok(DeleteFolderResultDto { deleted_paths })
}

fn remove_empty_dirs_recursive(dir: &std::path::Path) -> std::io::Result<()> {
    if dir.is_dir() {
        for entry in std::fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                let _ = remove_empty_dirs_recursive(&path);
            }
        }
        let _ = std::fs::remove_dir(dir);
    }
    Ok(())
}
```

### 2. `crates/app/src-tauri/src/commands.rs` — New command

```rust
#[tauri::command]
pub fn delete_folder(
    state: State<'_, AppState>,
    path: String,
    force: Option<bool>,
) -> Result<DeleteFolderResultDto, String> {
    let abs_path = state.with_workspace(|ws| {
        let p = std::path::Path::new(&path);
        if p.is_absolute() {
            return Err("Folder path must be relative".to_string());
        }
        let normalized = ws.root.join(p).components().fold(
            std::path::PathBuf::new(),
            |mut acc, c| {
                match c {
                    std::path::Component::ParentDir => { acc.pop(); acc }
                    _ => { acc.push(c); acc }
                }
            },
        );
        if !normalized.starts_with(&ws.root) {
            return Err("Path escapes workspace root".to_string());
        }
        Ok(normalized)
    })?;

    let prefix = if path.ends_with('/') { path.clone() } else { format!("{}/", path) };
    let note_paths: Vec<std::path::PathBuf> = state.with_workspace(|ws| {
        Ok(ws.notes.keys()
            .filter(|p| p.as_str().starts_with(&prefix))
            .map(|p| ws.root.join(p.as_str()))
            .collect())
    })?;

    for note_abs_path in &note_paths {
        state.register_expected_write(note_abs_path.clone());
    }
    state.register_expected_write(abs_path);

    state.with_workspace_mut(|ws| handlers::handle_delete_folder(ws, &path, force.unwrap_or(false)))
}
```

### 3. `crates/app/src-tauri/src/dto.rs` — New DTOs

```rust
#[derive(Debug, Serialize)]
pub struct DeleteFolderResultDto {
    pub deleted_paths: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct ExternalBacklinkDto {
    pub source_path: String,
    pub target_path: String,
    pub rel: String,
}
```

### 4. `crates/app/src/components/Layout/ConfirmDeleteDialog.tsx` — New React component (confirmation dialog)

The full file is at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/ConfirmDeleteDialog.tsx`. Read it for review.

### 5. `crates/app/src/components/Layout/FileTreePanel.tsx` — Modified (context menu + delete orchestration)

The full file is at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`. Read it for review. Key changes:
- ContextMenu now has an `onDelete` prop and "Delete"/"Delete Folder" menu items with danger styling
- FileTreePanel has `deleteTarget` state, `handleDeleteConfirm` handler
- Orchestration: clears editor/graph focus before API call, handles partial failure for folders

### 6. API bridge changes

`types.ts`: Added `deleteFolder(path: string, force?: boolean): Promise<{ deleted_paths: string[] }>` to BrainMapAPI interface
`tauri.ts`: `async deleteFolder(path, force) { return invoke("delete_folder", { path, force: force ?? false }); }`
`mock/index.ts`: Mock implementation iterates mock notes by prefix

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/delete-context-menu-review-1.md`.

---

## Assistant



Let me read the relevant files first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/ConfirmDeleteDialog.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts"}`

---

## Assistant

Now let me check the `backlinks` method signature and the `ExternalBacklinkDto`'s `source_path` field type to understand what `backlinks` returns.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn backlinks","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core","output_mode":"content","-A":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub fn delete_note","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core","output_mode":"content","-A":3}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub notes:","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","output_mode":"content","-A":1}`

---

## Assistant

Now I have enough context to write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews/code directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/delete-context-menu-review-1.md","content":"# Code Review: Delete Context Menu\n\n## Files Reviewed\n- `crates/app/src-ta`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/delete-context-menu-review-1.md`.

**Summary of findings:**

1. **[bug] Dry-run delete is destructive** -- `ConfirmDeleteDialog` calls `api.deleteFolder(path, false)` as a "probe" to check for external backlinks, but when none exist, `handle_delete_folder` proceeds to actually delete all notes. This is a data-loss bug: notes are deleted the moment the confirmation dialog opens if there are no external backlinks.

2. **[should-fix] Async error handling is broken** -- `handleConfirm` in ConfirmDeleteDialog does not `await` the async `onConfirm` callback, making the try/catch and `setIsDeleting(false)` dead code.

3. **[should-fix] PARTIAL_DELETE parsing off-by-one** -- `colonIdx > 0` should be `colonIdx >= 0` in FileTreePanel to handle the case where the deleted paths array is empty (`[]`).

4. **[suggestion] Clippy lint** -- `e.to_string()` inside `format!` macro in handlers.rs.

5. **[suggestion] Mock signature mismatch** -- `deleteFolder` in MockBridge omits the `force` parameter.

6. **[should-fix] No test coverage** for the delete dialog or orchestration logic.

7. **[suggestion] Potential race with watcher TTL** on large folder deletions.

The **critical blocker** is finding #1 -- the dry-run mechanism inadvertently performs real deletions.

---

