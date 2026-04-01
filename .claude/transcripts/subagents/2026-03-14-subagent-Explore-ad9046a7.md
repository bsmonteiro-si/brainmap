# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 13:50:49
**Agent:** Explore
**Agent ID:** ad9046a7950f2dd32
**Parent Session:** 2f24865e-f08e-4c67-a0fa-64f3942ccaee

---

## User

In the BrainMap desktop app, explore how view modes work in the editor. Specifically:

1. Find where `viewMode` is defined and what values it can take (e.g., "edit", "preview", "raw")
2. Find the ViewModeToggle or similar component that lets users switch between views
3. Find how the tab bar or editor panel decides which view modes are available
4. Check if there's any logic that restricts view modes based on whether the file has frontmatter

Look in: `crates/app/src/components/Editor/`, `crates/app/src/stores/editorStore.ts`, `crates/app/src/stores/tabStore.ts`

---

## Assistant

I'll explore the view modes system in the BrainMap desktop app. Let me search through the relevant files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"viewMode|ViewMode","type":"ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Now let me read the tabStore to see how viewMode is persisted across tabs:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

Now let me check for a ViewModeToggle component or similar:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*ViewMode*\" -o -name \"*viewMode*\" | head -20"}`

---

## Assistant

Let me search for where view modes are restricted or conditional logic:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"viewMode.*raw|raw.*viewMode|frontmatter.*raw|restrict.*view","type":"tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts","limit":100}`

---

## Assistant

Let me look at the actual ViewMode button logic more closely and check TabBar:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/TabBar.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"raw.*plain|plain.*raw|frontmatter.*missing|no.*frontmatter","type":"tsx","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Perfect. Now let me check the logic around plain files and the raw mode restriction more carefully:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"activePlainFile|plain-file","type":"ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Perfect! Now let me create a comprehensive summary by examining the editor panel rendering more carefully:

Based on my exploration of the BrainMap desktop app, I can now provide you with a complete report on how view modes work in the editor:

## View Modes System - Comprehensive Report

### 1. **ViewMode Definition and Values**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` (lines 29, 48, 85, 106)

`viewMode` is defined as a **union type** with three possible values:
```typescript
viewMode: "edit" | "preview" | "raw"
```

**Initial value**: `"edit"` (set in `CLEAN_EDITOR_STATE`)

### 2. **ViewModeToggle Component**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

There is no separate `ViewModeToggle` component. Instead, view mode buttons are **embedded directly in the EditorPanel** hero section with three distinct button groups depending on file type:

**For BrainMap notes** (lines 244-259):
```typescript
<button className={`editor-view-btn${viewMode === "edit" ? " editor-view-btn--active" : ""}`}
  onClick={() => setViewMode("edit")}>Edit</button>
<button className={`editor-view-btn${viewMode === "preview" ? " editor-view-btn--active" : ""}`}
  onClick={() => setViewMode("preview")}>Preview</button>
<button className={`editor-view-btn${viewMode === "raw" ? " editor-view-btn--active" : ""}`}
  onClick={() => setViewMode("raw")}>Raw</button>
```

**For plain files** (lines 100-110):
```typescript
<button ... onClick={() => setViewMode("edit")}>Edit</button>
<button ... onClick={() => setViewMode("preview")}>Preview</button>
<!-- NO Raw button -->
```

**For untitled tabs** (lines 167-177):
```typescript
<button ... onClick={() => setViewMode("edit")}>Edit</button>
<button ... onClick={() => setViewMode("preview")}>Preview</button>
<!-- NO Raw button -->
```

### 3. **View Mode Availability Logic**

The **Raw mode is restricted based on file type**, not on whether the file has frontmatter:

| File Type | Edit | Preview | Raw |
|-----------|------|---------|-----|
| BrainMap note (activeNote) | ✓ | ✓ | ✓ |
| Plain file (activePlainFile) | ✓ | ✓ | ✗ |
| Untitled tab | ✓ | ✓ | ✗ |

**Key conditional logic** (EditorPanel.tsx lines 72-154, 157-210):
- **Plain files**: Render only Edit/Preview buttons (no Raw)
- **Untitled tabs**: Render only Edit/Preview buttons (no Raw)
- **BrainMap notes**: Render Edit/Preview/**Raw** buttons

### 4. **How View Mode is Persisted Across Tabs**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/tabStore.ts` (line 26)

Each `TabState` stores its own `viewMode`:
```typescript
interface TabState {
  viewMode: "edit" | "preview" | "raw";
  // ... other tab state
}
```

**Persistence flow**:
1. When switching tabs, `snapshotToActiveTab()` (editorStore.ts line 54) captures the current `viewMode` into `tabStore.updateTabState()`
2. When opening a tab, the `viewMode` is restored from the tab's saved state (editorStore.ts lines 158, 240, 325)
3. Per-tab `viewMode` is synced to localStorage through `segmentStateCache.ts` (multi-segment support)

### 5. **View Mode Switching Logic**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts` (lines 635-681, `setViewMode` action)

Key behaviors:
- **Switching TO raw mode**: Auto-saves body/frontmatter edits first, then fetches raw file content via `readPlainFile()` (lines 643-667)
- **Switching FROM raw mode**: Saves raw edits first if dirty, then switches back (lines 669-680)
- **Edit ↔ Preview**: Direct switch with auto-save when dirty (lines 668-680)
- **Auto-save guard**: Won't auto-save if title is empty (line 641)

### 6. **Frontmatter Visibility Based on View Mode**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

The **entire FrontmatterForm is hidden in raw mode** (line 312):
```typescript
{viewMode !== "raw" && <FrontmatterForm note={activeNote} />}
```

Similarly, type pill, tags, status, and source metadata are hidden (lines 279-303):
```typescript
{viewMode !== "raw" && (
  <span className="meta-type-pill">{displayType}</span>
)}
{viewMode !== "raw" && (displayTags.length > 0 || displayStatus || displaySource) && (
  <div className="meta-row">/* metadata */</div>
)}
```

**RelatedNotesFooter is also hidden in raw mode** (line 341):
```typescript
{viewMode !== "raw" && <RelatedNotesFooter />}
```

### Summary

- **Three view modes**: edit, preview, raw
- **Raw is available only for BrainMap notes** (not plain files or untitled tabs)
- **No separate toggle component** — buttons rendered inline in EditorPanel
- **Per-tab persistence**: Each tab remembers its view mode across switches
- **Auto-save on mode switch**: Ensures data integrity when transitioning
- **Metadata hidden in raw**: Frontmatter form and related notes are only shown in edit/preview modes

---

