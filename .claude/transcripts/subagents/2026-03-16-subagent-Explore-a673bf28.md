# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 15:31:26
**Agent:** Explore
**Agent ID:** a673bf282187a7d88
**Parent Session:** 1f00a52d-c5ca-41c3-96c1-d813916884b1

---

## User

Explore how folder deletion works in the core Rust crate and the Tauri backend. Look at:

1. `crates/core/src/workspace.rs` - any delete/remove methods, especially `delete_note` and `delete_folder`
2. `crates/app/src-tauri/src/handlers.rs` - the delete handler implementation
3. `crates/app/src-tauri/src/commands.rs` - the delete command

Focus on understanding the logic that determines whether something is a file or folder, and what filesystem operations happen during deletion. The bug is that deleting a non-frontmatter file somehow deletes its parent folder.

Read the full implementation of the relevant functions.

---

## Assistant

I'll search for the delete-related functionality in the core Rust crate and Tauri backend to understand how folder deletion works and identify the bug.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

Now let me read the core workspace implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

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

Now let me search for the `delete_note` implementation in the core workspace:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"fn delete_note\" crates/core/src/workspace.rs | head -20"}`

---

## Assistant

Let me read the delete_note implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":462,"limit":150}`

---

## Assistant

Now let me search for the `prune_empty_folder_nodes` function:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"fn prune_empty_folder_nodes\" crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":1369,"limit":80}`

---

## Assistant

Perfect. Let me also look at `prune_empty_folder_nodes` more closely and see what happens when we delete a plain file. Let me search for how it interacts with folder deletion:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"prune_empty_folder_nodes\\|remove_file\\|delete_note\\|parent()\" crates/core/src/workspace.rs | head -40"}`

---

## Assistant

Now let me look at the `remove_file` method - this is key:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":805,"limit":60}`

---

## Assistant

Now let me look at the plain file deletion handler to understand the discrepancy:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"handle_delete_plain_file\" crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

I already saw the handle_delete_plain_file in my earlier read. Let me check the delete_node command in commands.rs more carefully, particularly looking at how it determines if something is a file or folder:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":197,"limit":60}`

---

## Assistant

Now let me look at the frontend code to see how it decides whether to call `delete_node` or `delete_plain_file`:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find crates/app/src -name \"*.tsx\" -o -name \"*.ts\" | xargs grep -l \"delete.*file\\|delete.*node\" | head -10"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"delete.*file\\|delete.*node\" crates/app/src/components/Layout/FileTreePanel.tsx | head -20"}`

---

## Assistant

Let me look at how the delete logic is organized in the FileTreePanel:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"deleteTarget\\|handleDelete\\|delete_\" crates/app/src/components/Layout/FileTreePanel.tsx | head -30"}`

---

## Assistant

This is interesting! Let me look at the logic more carefully at lines 1067-1110:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":1017,"limit":110}`

---

## Assistant

Now I need to understand how `deleteTarget` gets its properties. Let me search for where `deleteTarget` is set:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"setDeleteTarget\" crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"onDelete\\|TreeNode\" crates/app/src/components/Layout/FileTreePanel.tsx | head -40"}`

---

## Assistant

Let me look at the TreeNode interface:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":18,"limit":30}`

---

## Assistant

Now let me look at the buildTree function to see how `note_type` is populated:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":43,"limit":120}`

---

## Assistant

Perfect! Now I have a clear picture. Let me check what happens in handle_delete_note to understand the full flow. Let me also look at the delete_plain_file logic more carefully:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":471,"limit":15}`

---

## Assistant

Now let me verify what happens to the parent folder when a plain file is deleted. The key question: does `handle_delete_plain_file` trigger any folder pruning? Looking at the code, it just deletes the file on disk via `std::fs::remove_file`. It does NOT call `prune_empty_folder_nodes`.

However, the Tauri command `delete_plain_file` in commands.rs at line 607-624 does register an expected write and emit a `files_changed_event`. Let me verify what that event does. But first, let me examine what happens to the parent directory in handle_delete_note:

The key distinction I found is:

1. **`handle_delete_note` (for BrainMap-managed notes):**
   - Removes the file from disk (line 478)
   - Removes from `self.notes` map (line 483)
   - Removes from graph (line 484)
   - **Calls `prune_empty_folder_nodes` on the parent (lines 487-489)** — This automatically removes empty parent folder nodes!

2. **`handle_delete_plain_file` (for plain files):**
   - Only removes the file from disk (line 482)
   - Does NOT call `prune_empty_folder_nodes`
   - Does NOT modify the workspace state at all

The bug becomes clear: When a non-frontmatter file (plain file) is deleted from the Files panel, it takes the `!deleteTarget.isFolder && !isBrainMapNote` path (line 1070 in FileTreePanel.tsx). This calls `api.deletePlainFile()`, which only removes the physical file from disk but does NOT prune empty parent folder nodes from the graph.

However, if the parent folder is empty (only contained this one file), the folder node remains in the graph even though the filesystem directory might also be empty. And when the user tries to delete that parent folder node or if folder pruning happens through some other mechanism, something goes wrong.

Wait, let me re-read the bug description. The user said "deleting a non-frontmatter file somehow deletes its parent folder." Let me check if there's an issue with the parent directory being deleted from the filesystem.

Looking at `handle_delete_plain_file`, it only calls `std::fs::remove_file(&abs)`, which removes just the file, not the directory. So the parent directory should remain.

Unless... let me check if there's something in the watcher or file system monitoring that might be interpreting this as a folder deletion. But actually, wait - let me re-read the actual bug more carefully by searching for any recent issues or test cases:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find crates/app/src -name \"*.test.ts\" | xargs grep -l \"delete.*plain\\|delete.*file\" 2>/dev/null | head -5"}`

---

## Assistant

Let me check the git history to see if there's any recent issue related to this:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git log --oneline --all | grep -i \"delete\\|plain\\|folder\" | head -20"}`

---

## Assistant

I see "Fix folder deletion" in commit 9c47ec1. Let me check what that fixed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"git show 9c47ec1 --stat"}`

---

## Assistant

That looks recent. Now let me think about the bug carefully. The user said the issue is that when deleting a non-frontmatter file, it somehow deletes its parent folder. Let me trace through what actually happens:

1. User right-clicks a plain file (non-.md file or a .txt file, etc.)
2. FileTreePanel determines it's not a folder and has no `note_type`
3. Calls `api.deletePlainFile()`
4. This calls the Tauri command `delete_plain_file`
5. Which calls `handle_delete_plain_file` that only does `std::fs::remove_file`

The problem: After deleting the plain file, if the parent folder is now empty on disk, nothing removes the empty folder. But more importantly for the graph: **if the parent folder node exists in the graph (because it was created by `compute_folder_hierarchy`), it still exists even though there are no children notes.**

However, the user said "deletes its parent folder" — implying the folder disappears from the file tree. Let me check if there's a mechanism that cleans up folder nodes when files change:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"files_changed\\|workspaceFiles\\|emptyFolders\" crates/app/src/components/Layout/FileTreePanel.tsx | head -30"}`

---

## Assistant

Now let me check what happens when a files-changed event is received. Let me search for where the event handler is:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"files-changed\\|filesChanged\" crates/app/src -r"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts","offset":100,"limit":50}`

---

## Assistant

OK so files-changed events just update the workspaceFiles list. Now I need to understand what might actually be deleting the parent folder. Let me check if there's an issue with how the directory traversal actually works. Let me review the actual sequence:

Actually, wait. I think I might have misunderstood the bug. Let me re-read the user's original request. They said "deleting a non-frontmatter file somehow deletes its parent folder." 

This could mean:
1. The parent folder node disappears from the graph (less likely)
2. The parent folder gets physically deleted from disk (very bad!)
3. The parent folder becomes inaccessible or broken

Let me check if maybe `std::fs::remove_file` could somehow be removing a directory. That doesn't make sense. But let me check if there's any path canonicalization or weird path handling that might cause issues.

Actually, I just realized something. Let me look at the `validate_relative_path` function again and also check if there's any place where the parent directory might be getting removed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"remove_dir\\|rmdir\" crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

Now let me look at that context:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":203,"limit":18}`

---

## Assistant

Perfect! Now I understand the bug! Let me trace through the issue:

The `remove_empty_dirs_recursive` function is ONLY called in `handle_delete_folder` (lines 192-197), which deletes a folder and all its contents. It's not called when a plain file is deleted.

However, let me now carefully check if there's any other mechanism that might cause this. Let me look at what happens in `delete_plain_file` in the Tauri command:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":607,"limit":18}`

---

## Assistant

So `delete_plain_file` only calls `handle_delete_plain_file` which just removes the file, and then emits a `files_changed_event`. No folder removal.

Now, given the context of recent commits, I wonder if the issue happens when the plain file path is incorrectly interpreted. Let me check how the path determination logic works in buildTree again. 

Actually wait! I just realized something. Let me look at the delete logic in FileTreePanel more carefully. The condition is:

```typescript
if (!deleteTarget.isFolder && !isBrainMapNote)
```

A TreeNode becomes "not a folder" and "has note_type" = undefined if it comes from `workspaceFiles` (plain files added at lines 119-145 of buildTree). These don't have a `note_type` property set!

So:
- **Plain files in buildTree (lines 119-145)**: Created from `workspaceFiles`, have NO `note_type` property
- **BrainMap notes in buildTree (lines 75-99)**: Have `note_type` property from nodeData

So `isBrainMapNote = !!deleteTarget.note_type` correctly identifies non-BrainMap files.

Now let me think... could there be a case where a FOLDER is being built but mistakenly shown as a plain file? Let me look at how folders are created:

Looking at buildTree:
- Folders come from `getOrCreateFolder` which always sets `isFolder: true` (line 54)
- Folders from `emptyFolders` also set `isFolder: true` (implicitly in getOrCreateFolder)
- Plain files from `workspaceFiles` set `isFolder: false` (line 126)

So a folder should never be mistaken for a plain file based on `isFolder` alone.

BUT WAIT! I see the issue now! Look at lines 113-145 in buildTree:

```typescript
if (workspaceFiles) {
  for (const filePath of workspaceFiles) {
    if (nodes.has(filePath)) continue;  // Skip if already in BrainMap graph
    const parts = filePath.split("/");
    // ... creates parent folders and adds the file as a plain file ...
    }
  }
}
```

This means if a folder path appears in `workspaceFiles`, it would be treated as a FILE, not a folder! The split creates parent folders, but the leaf entry becomes a plain file with `isFolder: false`.

So if a directory somehow ends up in `workspaceFiles`, it would be marked as a plain file, and deleting it would call `delete_plain_file`, which would try to do `std::fs::remove_file` on a DIRECTORY!

Let me check the `collect_files_recursive` function that builds `workspaceFiles`:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":582,"limit":25}`

---

## Assistant

Good! So `collect_files_recursive` at line 599-600 skips directories—it only adds files (line 601-602). So workspaceFiles should never contain directories themselves.

However, let me check if there's a case where `handle_list_workspace_files` might include directories:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":563,"limit":10}`

---

## Assistant

OK so that looks correct too. Let me now think about this differently. What if the issue is not with the list itself, but with how `std::fs::remove_file` behaves when you give it a path that's actually a directory? Let me check the Rust documentation... well, I can test this by looking at any error handling:

Looking back at `handle_delete_plain_file`:
```rust
std::fs::remove_file(&abs)
    .map_err(|e| format!("Failed to delete file: {}", e))?;
```

If `abs` is a directory, `remove_file` would fail with an error like "Is a directory" on Unix systems. So it wouldn't actually delete the directory, it would just fail.

UNLESS... let me check if maybe there's something with parent directory handling. Actually, I wonder if the issue is that the plain file deletion handler is being called on what should be a folder deletion.

Let me revisit the core issue. Reading the user's request again: "deleting a non-frontmatter file somehow deletes its parent folder."

Maybe the problem is this: A plain file like `subfolder/image.png` is deleted. The path gets passed incorrectly, or... wait, let me check how the frontend handles this when the file is not in the nodes map.

Actually, I think I should trace through a concrete example:

1. User has: `MyFolder/image.png` (a plain PNG file)
2. `MyFolder` is EMPTY except for this image (no markdown notes)
3. User deletes `image.png` via the Files panel context menu
4. The frontend builds a tree where `MyFolder` is created as a folder node only because of the `image.png` path
5. After deleting `image.png`, `MyFolder` becomes empty and might be removed from the UI

But that wouldn't "delete" the folder from disk—it would just disappear from the UI.

UNLESS... wait, let me check if `collect_folder_files` is called somewhere and might be removing folders:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"collect_folder_files\" crates/app/src-tauri/src/handlers.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"collect_folder_files\" crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

So `collect_folder_files` is only called in the `delete_folder` command, not in `delete_plain_file`. OK so that's not it.

Let me now think about this from first principles. The bug description says "deleting a non-frontmatter file somehow deletes its parent folder." The most likely explanation is:

**The parent folder node in the graph gets mistakenly pruned when the plain file is deleted.**

But looking at the code:
- `handle_delete_plain_file` does NOT interact with the graph at all
- It only removes the file from disk
- `delete_plain_file` command only emits a `files_changed` event, which doesn't affect the graph nodes

So the graph should be unaffected. Unless... OH! I think I see it now!

Let me check if maybe the problem is in how the DELETE API call is being made. Let me look at the frontend API:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"deletePlainFile\\|deleteNote\\|deleteFolder\" crates/app/src/api/tauri.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","offset":77,"limit":55}`

---

## Assistant

Good, so `deletePlainFile` calls the `delete_plain_file` Tauri command. That's correct.

OK let me now think about this bug differently. Let me check if perhaps the issue is that the code is calling `deleteNote` instead of `deletePlainFile` for a plain file. Let me look at that logic again in FileTreePanel:

The logic at lines 1067-1110 is:
```typescript
const isBrainMapNote = !!deleteTarget.note_type;

if (!deleteTarget.isFolder && !isBrainMapNote) {
  // Delete plain file
  await api.deletePlainFile(deleteTarget.fullPath);
} else if (deleteTarget.isFolder) {
  // Delete folder
  await api.deleteFolder(deleteTarget.fullPath, force);
} else {
  // Delete BrainMap note
  await api.deleteNote(deleteTarget.fullPath, force);
}
```

So the paths are clear. But wait—what if `deleteTarget.isFolder` is incorrect? What if a folder is being marked as `isFolder: false`?

Looking back at buildTree, I don't see how that could happen. Folders are created with `isFolder: true` and files with `isFolder: false`.

WAIT! I just thought of something. What if the problem is actually with `api.deleteNote` being called on a folder path? What if the user's description is backwards—what if deleting a frontmatter-less NOTE (but still a .md file) somehow deletes the parent folder?

Let me check if there's an issue with `handle_delete_note` and how it prunes empty folders. Looking at the code at lines 487-489:

```rust
if let Some(dir) = parent_dir {
    self.prune_empty_folder_nodes(&dir);
}
```

This calls `prune_empty_folder_nodes`, which removes empty folder nodes from the GRAPH. This is correct behavior—it shouldn't affect the filesystem.

BUT WAIT! Let me check if maybe there's an issue with the watcher or with what happens after a note is deleted. Maybe the problem is:

1. Delete a plain file `MyFolder/file.txt`
2. By some mechanism, `MyFolder` becomes empty
3. On the next graph update or topology event, the folder node gets pruned
4. The frontend sees the folder node is gone and shows it as deleted

But that still wouldn't "delete" the folder from disk.

Actually, let me re-read the user's complaint one more time carefully. They said the bug is "deleting a non-frontmatter file somehow deletes its parent folder." Maybe they mean the parent folder OBJECT in the graph, not the physical directory?

Given everything I've seen, here's what I believe is the actual bug:

**The issue is likely that a non-frontmatter file (plain file) doesn't trigger the folder pruning logic, so if a folder only contains that one plain file, when the file is deleted, the empty folder node remains in the graph even though there are no notes left in it. This might cause confusion or visual inconsistency.**

OR

**There's a path handling bug where calling `delete_plain_file` on a path that looks like a folder somehow triggers folder deletion logic.**

Let me check one more thing—is there any place where the path might be getting modified or reinterpreted? Let me look for any path trimming of trailing slashes or similar:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"trim\\|ends_with('/')\" crates/app/src-tauri/src/handlers.rs | head -20"}`

---

## Assistant

That's in `handle_delete_folder`, which is correct.

OK, I think I now have a comprehensive understanding of the code flow. Let me summarize my findings in a report.

## Summary of Exploration

Based on my thorough examination of the folder deletion code in the core Rust crate and Tauri backend, here are my findings:

### File Organization

The relevant code is organized in:
- **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs`**: Contains the `delete_note`, `remove_file`, and `prune_empty_folder_nodes` methods
- **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`**: Contains handler functions `handle_delete_note`, `handle_delete_plain_file`, `handle_delete_folder`, plus utility functions `delete_remaining_files_recursive` and `remove_empty_dirs_recursive`
- **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`**: Contains the Tauri command wrappers `delete_node`, `delete_folder`, `delete_plain_file`

### Key Functionality

**Deleting a BrainMap note (`delete_note` method, lines 462-494 in workspace.rs):**
1. Removes the file from disk (line 478: `std::fs::remove_file(&file_path)`)
2. Removes from `self.notes` map (line 483)
3. Removes from graph (line 484)
4. **Prunes empty folder nodes** (lines 487-489: `self.prune_empty_folder_nodes(&dir)`)

**Deleting a plain file (`handle_delete_plain_file`, lines 471-485 in handlers.rs):**
1. Validates the file is NOT in `ws.notes` (BrainMap-managed)
2. Only removes file from disk (line 482: `std::fs::remove_file(&abs)`)
3. Does NOT interact with graph, does NOT prune folder nodes

**Deleting a folder (`handle_delete_folder`, lines 114-201 in handlers.rs):**
1. Collects all notes under the folder prefix (lines 134-140)
2. Checks for external backlinks if not forced (lines 142-169)
3. Deletes notes in reverse-sorted order (lines 172-190)
4. Deletes remaining non-note files recursively (line 195: `delete_remaining_files_recursive`)
5. **Removes empty directories recursively bottom-up** (line 197: `remove_empty_dirs_recursive`)

### The `prune_empty_folder_nodes` Logic (lines 1369-1416 in workspace.rs)

This function:
- Walks up the directory tree from a starting folder
- For each folder, checks if it has any outgoing "contains" edges (children)
- Stops pruning when it finds a folder with children
- Removes the folder node from the graph if empty

### Critical Insight: The Bug

The discrepancy between `handle_delete_note` and `handle_delete_plain_file` is:

- **`delete_note` calls `prune_empty_folder_nodes`** after removing a note, which removes empty folder nodes from the graph
- **`delete_plain_file` does NOT call `prune_empty_folder_nodes`**, so empty folder nodes remain in the graph

However, this wouldn't physically delete the parent folder from disk. The parent directory remains because `std::fs::remove_file` only removes files, not directories.

The actual bug likely manifests as:
1. **If the parent folder only contained that one plain file**, after deletion the folder becomes physically empty on disk
2. But if the folder is in `emptyFolders` tracking, it might be removed from the UI when `workspaceFiles` updates
3. This could create the appearance that "the parent folder was deleted"

Or there might be a path handling issue where `delete_plain_file` is being incorrectly called on a folder path, though the validation and error handling should prevent that.

### Files with Relevant Code

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` (lines 462-494, 805-843, 1369-1416)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs` (lines 109-201, 471-485)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs` (lines 197-253, 607-624)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx` (lines 1067-1110)

---

