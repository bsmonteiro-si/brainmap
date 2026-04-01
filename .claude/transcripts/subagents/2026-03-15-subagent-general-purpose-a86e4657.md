# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 19:31:54
**Agent:** general-purpose
**Agent ID:** a86e4657f5a3c5681
**Parent Session:** cdef1f9f-8f4a-455f-b39c-cdd015da051b

---

## User

Implement the frontend TypeScript changes for the PDF viewer feature in BrainMap. Make the following changes:

## 1. Add PdfFileMeta type and API method to types.ts

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`

Add after PlainFileDetail (after line 55):

```typescript
export interface PdfFileMeta {
  path: string;
  absolute_path: string;
  size_bytes: number;
}
```

Add to the BrainMapAPI interface (after `readPlainFile`):
```typescript
  resolvePdfPath(path: string): Promise<PdfFileMeta>;
```

## 2. Add to TauriBridge

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`

Add import of `PdfFileMeta` to the type imports.

Add method after `readPlainFile`:
```typescript
  async resolvePdfPath(path: string): Promise<PdfFileMeta> {
    return invoke<PdfFileMeta>("resolve_pdf_path", { path });
  }
```

## 3. Add to MockBridge

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`

Add import of `PdfFileMeta` to the type imports.

Add method after `readPlainFile`:
```typescript
  async resolvePdfPath(path: string): Promise<PdfFileMeta> {
    return { path, absolute_path: `/mock/seed/${path}`, size_bytes: 0 };
  }
```

## 4. Extend TabState.kind in tabStore.ts

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts`

Change the `kind` type in TabState from:
```typescript
  kind: "note" | "plain-file" | "untitled";
```
to:
```typescript
  kind: "note" | "plain-file" | "untitled" | "pdf";
```

Change the `openTab` function signature from:
```typescript
  openTab: (path: string, kind: "note" | "plain-file", title: string, noteType: string | null) => void;
```
to:
```typescript
  openTab: (path: string, kind: "note" | "plain-file" | "pdf", title: string, noteType: string | null) => void;
```

Change `createFreshTab` parameter from:
```typescript
function createFreshTab(path: string, kind: "note" | "plain-file" | "untitled", title: string, noteType: string | null): TabState {
```
to:
```typescript
function createFreshTab(path: string, kind: "note" | "plain-file" | "untitled" | "pdf", title: string, noteType: string | null): TabState {
```

## 5. Add clearForPdfTab to editorStore.ts

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`

Add to the EditorStoreState interface (find the interface and add before the closing brace):
```typescript
  clearForPdfTab: () => void;
```

Add the implementation in the store creation (add after the `clear` action implementation):
```typescript
  clearForPdfTab: () => {
    snapshotToActiveTab();
    set({
      activeNote: null,
      activePlainFile: null,
      isUntitledTab: false,
      isLoading: false,
      editedBody: null,
      editedFrontmatter: null,
      isDirty: false,
      conflictState: "none",
      rawContent: null,
      _rawDirty: false,
    });
  },
```

Also need to handle it in the `openNote` flow. When a PDF tab is the current tab and user switches to a note, we need the auto-save logic to skip PDF tabs. Check if the auto-save already checks `isDirty` — if so, PDF tabs with `isDirty: false` will be fine. But verify.

## 6. Handle PDF click in FileTreePanel.tsx

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`

Find where files are clicked/opened. There should be a click handler that calls either `openNote` or `openPlainFile`. Add PDF detection BEFORE the existing file handling:

The pattern should be: if the file ends with `.pdf` (case-insensitive), open it as a PDF tab instead of a plain file. Look for where plain files or notes are opened on click (probably in a handleFileClick or similar function). The logic should be:

```typescript
if (filePath.toLowerCase().endsWith(".pdf")) {
  const fileName = filePath.split("/").pop() ?? filePath;
  useTabStore.getState().openTab(filePath, "pdf", fileName, null);
  useEditorStore.getState().clearForPdfTab();
  return;
}
```

Read each file before editing. Make the edits using the Edit tool. Be careful to preserve existing code.

---

## Assistant



I'll start by reading all the files that need to be modified.

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

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Now I need to find the click handler in FileTreePanel.tsx where files are opened.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"openNote|openPlainFile|handleFileClick|\\.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","output_mode":"content","-n":true,"hea`

---

## Assistant

Let me see the context around lines 565-580 where files are opened on click.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","offset":560,"limit":30}`

---

## Assistant

Now I also need to check the `moveNote` and `moveFolder` methods in the mock bridge - they're missing. Let me check.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"moveNote|moveFolder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","output_mode":"content"}`

---

## Assistant

The mock bridge is missing those but that's not my concern. Now let me also check the EditorState interface to see where I should add `clearForPdfTab`.

Now I have all the information needed. Let me make all the edits.

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","old_string":"export interface PlainFileDetail {\n  path: string;\n  body: string;\n  binary:`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","old_string":"  readPlainFile(path: string): Promise<PlainFileDetail>;\n  writePlainFile(path`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","old_string":"import type {\n  BrainMapAPI,\n  EdgeDto,\n  GraphTopology,\n  NodeSummary,\n  `

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","old_string":"  async readPlainFile(path: string): Promise<PlainFileDetail> {\n    return inv`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","old_string":"import type {\n  BrainMapAPI,\n  EdgeDto,\n  GraphTopology,\n  NodeSummary`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","old_string":"  async readPlainFile(path: string): Promise<PlainFileDetail> {\n    retur`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","old_string":"  kind: \"note\" | \"plain-file\" | \"untitled\";\n  title: string;\n  no`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","old_string":"  openTab: (path: string, kind: \"note\" | \"plain-file\", title: string,`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts","old_string":"function createFreshTab(path: string, kind: \"note\" | \"plain-file\" | \`

---

## Assistant

Now add `clearForPdfTab` to the EditorState interface and implementation in editorStore.ts.

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","old_string":"  clear: () => void;\n}","new_string":"  clearForPdfTab: () => void;\n`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","old_string":"  clear: () => {\n    set({\n      activeNote: null,\n      activePlai`

---

## Assistant

Now add the PDF click handler in FileTreePanel.tsx.

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx","old_string":"  const handleClick = () => {\n    if (isBrainMapNote) {`

---

## Assistant

Now let me verify the auto-save logic handles PDF tabs correctly. Since PDF tabs will have `isDirty: false`, the auto-save guard `if (isDirty && ...)` in `openNote` and `openPlainFile` will skip them. The `saveNote` method also checks `isDirty` first. So PDF tabs with `isDirty: false` are safe.

Let me also check that `useTabStore` is already imported in FileTreePanel.tsx (it is, line 8 from the initial read).

Let me run a quick TypeScript check to make sure everything compiles.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"npx tsc --noEmit --pretty 2>&1 | head -40","description":"TypeScript type check","timeout":30000}`

---

## Assistant

The pre-existing errors (MockBridge missing moveNote/moveFolder, PdfViewer issues) are not related to my changes. The type check shows no new errors from the edits I made.

All six changes are complete:

1. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`** -- Added `PdfFileMeta` interface after `PlainFileDetail`, and `resolvePdfPath` method to `BrainMapAPI` interface after `readPlainFile`.

2. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`** -- Added `PdfFileMeta` to type imports and implemented `resolvePdfPath` method invoking `"resolve_pdf_path"`.

3. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`** -- Added `PdfFileMeta` to type imports and implemented mock `resolvePdfPath` returning a stub response.

4. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts`** -- Extended `kind` type to include `"pdf"` in `TabState`, `openTab` signature, and `createFreshTab` parameter.

5. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts`** -- Added `clearForPdfTab` to the `EditorState` interface and implemented it in the store. It snapshots the active tab, then clears editor state with `isDirty: false` so auto-save logic safely skips PDF tabs.

6. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`** -- Added PDF detection at the top of `handleClick`: if the file path ends with `.pdf` (case-insensitive), it opens a PDF tab via `tabStore.openTab` and calls `clearForPdfTab`, returning early before the note/plain-file logic.

---

