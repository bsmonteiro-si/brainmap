# 2026-03-23 — Subagent Transcript: general-purpose

**Date:** 2026-03-23 17:10:07
**Agent:** general-purpose
**Agent ID:** ae2fa8e79b32d74e9
**Parent Session:** ec7fd629-9474-402a-8f32-fc5f367f64bc

---

## User

You are reviewing code changes for BrainMap, a knowledge graph tool. Review the following changed files for the "Image Viewer" feature. This adds a read-only image viewer for binary image files (png, jpg, gif, svg, webp, etc.).

## Review Criteria

You are reviewing code for BrainMap. Your job is to find real defects, not style nits.

### What to Review

1. **Correctness**: Logic bugs, off-by-one errors, missed conditions, error handling covering all failure modes, file system operations safety (path traversal, partial writes), state consistency.

2. **Rust Quality** (for backend code): Ownership/borrowing, unnecessary clones, unwrap/expect usage, appropriate types.

3. **Function Design**: Each function doing one thing, descriptive names, if-else chains.

4. **Test Coverage**: Every new public function tested, error paths tested, behavior-based tests.

5. **Serialization and API Surface**: JSON output structures, consistent field names.

6. **Performance**: O(n^2) loops, unnecessary clones, repeated scans.

### Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If the code is solid, say so briefly.

Do NOT report: Missing comments/docstrings, style preferences, TODOs.

## Changed Files

Please read these files and review them:

### Backend (Rust):
1. `crates/app/src-tauri/src/handlers.rs` - new `handle_resolve_image_path` function (search for it)
2. `crates/app/src-tauri/src/commands.rs` - new `resolve_image_path` command (search for it)
3. `crates/app/src-tauri/src/lib.rs` - registration of the new command

### Frontend (TypeScript/React):
4. `crates/app/src/components/Editor/ImageViewer.tsx` - the main new component
5. `crates/app/src/components/Editor/ImageViewer.test.tsx` - tests
6. `crates/app/src/stores/tabStore.ts` - added "image" to tab kind union
7. `crates/app/src/stores/tabActions.ts` - added "image" to custom tab kind check
8. `crates/app/src/components/Editor/EditorPanel.tsx` - routing for image tab kind
9. `crates/app/src/components/Editor/TabBar.tsx` - image tab integration
10. `crates/app/src/components/Layout/FileTreePanel.tsx` - image extension detection in handleClick
11. `crates/app/src/App.tsx` - Cmd+W and Cmd+S handling for image tabs
12. `crates/app/src/api/types.ts` - resolveImagePath in BrainMapAPI interface
13. `crates/app/src/api/tauri.ts` - TauriBridge implementation
14. `crates/app/src/api/mock/index.ts` - MockBridge implementation

Write your findings to `.claude/reviews/code/image-viewer-review-1.md`.

---

## Assistant



I'll read all the changed files to review them.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"handle_resolve_image_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"resolve_image_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"resolve_image_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ImageViewer.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/ImageViewer.test.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabActions.ts","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image|ImageViewer","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image|resolveImagePath","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image|resolveImagePath","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"image|resolveImagePath","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","output_mode":"content","-n":true,"-i":true}`

---

## Assistant

Now let me read the handler function and the surrounding context for the backend files more closely.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":425,"limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":660,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","offset":90,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":780,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":155,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","offset":312,"limit":20}`

---

## Assistant

Now let me also check the `PdfMetaDto` type to confirm the reuse is appropriate, and look at `validate_relative_path` for path traversal safety.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub struct PdfMetaDto","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"content","-n":true,"-C":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn validate_relative_path","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-n":true,"-C":10}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":581,"limit":20}`

---

## Assistant

Good, path traversal is properly guarded. Now I have all the information needed. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/image-viewer-review-1.md","content":"# Code Review: Image Viewer Feature\n\n**Reviewer**: code-reviewer agent\n**Date**: `

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/image-viewer-review-1.md`.

**Summary of findings (6 total):**

**Bugs (2):**
1. **Passive wheel listener** (`ImageViewer.tsx:83-89`): React registers `onWheel` as passive by default, so `e.preventDefault()` is silently ignored. Ctrl+scroll zoom won't suppress page scrolling. Fix: attach listener via `useEffect` with `{ passive: false }`.
2. **Stale pan closure** (`ImageViewer.tsx:91-95`): `handleMouseDown` depends on `pan` state, causing recreation on every drag movement. Fragile if deps are tightened. Fix: use a ref for pan state.

**Should-fix (4):**
3. **`PdfMetaDto` reuse**: Image endpoint returns a type named `PdfMetaDto` — semantically confusing. Rename to `FileMetaDto` or add an alias.
4. **Duplicated extension lists**: Backend (Rust) and frontend (FileTreePanel.tsx) each define image extensions independently — drift risk.
5. **SVG security**: SVGs loaded via `<img>` are safe, but this security boundary should be documented to prevent future refactors to `<object>`/`<embed>`.
6. **Missing component tests**: Tests only cover tab store integration, not the ImageViewer component itself (loading, error, zoom, pan, formatSize).

---

