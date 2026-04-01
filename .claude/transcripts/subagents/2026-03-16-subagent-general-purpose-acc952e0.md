# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 11:36:52
**Agent:** general-purpose
**Agent ID:** acc952e060815536b
**Parent Session:** b36f1181-79cc-47a2-ab76-ceb7b419cf57

---

## User

You are reviewing TypeScript/React code changes for BrainMap. Review the changed file for defects.

## Review Criteria (from .claude/agents/code-reviewer.md):

You are reviewing code for BrainMap, a knowledge graph tool. Your job is to find real defects, not style nits.

### What to Review
1. Correctness - logic bugs, missed conditions, error handling
2. Quality - unnecessary complexity, stale closures, React hook dependency issues
3. Function Design - single responsibility, descriptive names
4. Test Coverage - are new behaviors tested?
5. Performance - unnecessary re-renders, O(n^2) loops

### Output Format
Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If the code is solid, say so briefly. Do NOT report style preferences or missing comments.

## Changed File

`crates/app/src/components/Editor/PdfViewer.tsx`

The changes are:
1. Added `SelectionSnapshot` interface and `selectionSnapshotRef` 
2. Rewrote `checkSelection` to eagerly capture selection data (text, pageNum, rects) into a ref, using `scale` in deps
3. Replaced `mouseup`/`keyup` event listeners with `document.addEventListener("selectionchange", ...)`
4. Rewrote `createHighlight` to use the snapshot instead of reading `window.getSelection()` live
5. Updated `copyToNote` to use the snapshot

Here is the full changed file content:

```tsx
import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";
import { getAPI } from "../../api/bridge";
import type { PdfHighlight, HighlightRect } from "../../api/types";
import { useTabStore } from "../../stores/tabStore";
import { useEditorStore } from "../../stores/editorStore";
import { log } from "../../utils/logger";
import {
  selectionToHighlightRects,
  getSelectionPageNum,
} from "../../utils/pdfCoords";
import { ZoomIn, ZoomOut, FileOutput, Highlighter, X } from "lucide-react";

import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const CONTAINER_PADDING = 24;
const RENDER_BUFFER = 2;

const HIGHLIGHT_COLORS = [
  { name: "Yellow", hex: "#FBBF24" },
  { name: "Green", hex: "#34D399" },
  { name: "Blue", hex: "#60A5FA" },
  { name: "Pink", hex: "#F472B6" },
  { name: "Red", hex: "#F87171" },
];

interface SelectionSnapshot {
  text: string;
  pageNum: number;
  rects: HighlightRect[];
}

interface PdfViewerProps {
  path: string;
}

interface PageInfo {
  pageNum: number;
  rendered: boolean;
}
```

Key changed functions:

```tsx
  // Track text selection — snapshot rects eagerly so they survive button clicks
  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.toString().trim().length > 0 &&
      scrollContainerRef.current?.contains(sel.anchorNode)
    ) {
      const pageNum = getSelectionPageNum(sel);
      if (pageNum) {
        const pageContainer = pageRefsMap.current.get(pageNum);
        if (pageContainer) {
          const rects = selectionToHighlightRects(sel, pageContainer, scale);
          if (rects.length > 0) {
            selectionSnapshotRef.current = {
              text: sel.toString().trim(),
              pageNum,
              rects,
            };
            setHasSelection(true);
            return;
          }
        }
      }
    }
    selectionSnapshotRef.current = null;
    setHasSelection(false);
  }, [scale]);

  useEffect(() => {
    document.addEventListener("selectionchange", checkSelection);
    return () => {
      document.removeEventListener("selectionchange", checkSelection);
    };
  }, [checkSelection]);
```

```tsx
  // Create highlight from the eagerly-captured selection snapshot
  const createHighlight = useCallback(async () => {
    const snap = selectionSnapshotRef.current;
    if (!snap) return;

    const highlight: PdfHighlight = {
      id: crypto.randomUUID(),
      page: snap.pageNum,
      rects: snap.rects,
      text: snap.text,
      color: activeColor,
      created_at: new Date().toISOString(),
    };

    const updated = [...highlights, highlight];
    setHighlights(updated);

    try {
      const api = await getAPI();
      await api.savePdfHighlights(path, updated);
    } catch (e) {
      log.error("pdf-viewer", "Failed to save highlight", {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    window.getSelection()?.removeAllRanges();
    selectionSnapshotRef.current = null;
    setHasSelection(false);

    log.info("pdf-viewer", "Created highlight", {
      path,
      page: snap.pageNum,
      color: activeColor,
      chars: snap.text.length,
    });
  }, [path, highlights, activeColor]);
```

```tsx
  // Copy selection to new note (uses snapshot for resilience)
  const copyToNote = useCallback(async () => {
    const snap = selectionSnapshotRef.current;
    if (!snap) return;

    const fileName = path.split("/").pop() ?? path;
    const body = `${snap.text}\n\n> Source: [${fileName}](${path})`;

    await useEditorStore.getState().openUntitledTab();
    useEditorStore.getState().updateContent(body);

    log.info("pdf-viewer", "Copied selection to new note", {
      path,
      chars: snap.text.length,
    });
  }, [path]);
```

Write your review to `.claude/reviews/code/pdf-highlight-fix-review-1.md`.

---

## Assistant



Let me read the full file and the utility functions it depends on.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/utils/pdfCoords.ts"}`

---

## Assistant

Now let me check the `useTabStore` import usage and `useEditorStore` to verify the `copyToNote` logic.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useTabStore","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx","output_mode":"content"}`

---

## Assistant

Now I have enough to write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/pdf-highlight-fix-review-1.md","content":"# Code Review: PdfViewer selection snapshot refactor\n\n**Files reviewed**: `cr`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews/code directory exists"}`

---

## Assistant

The file already exists, let me read it first then overwrite.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/pdf-highlight-fix-review-1.md"}`

---

## Assistant

The file already exists with a previous review. I'll write this as a new review file with a different name.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/pdf-highlight-fix-review-2.md","content":"# Code Review: PdfViewer selectionchange snapshot refactor\n\n**Date:** 2026-03`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/pdf-highlight-fix-review-2.md`.

**Summary of findings:**

1. **Bug** -- Stale `highlights` closure in `createHighlight` and `deleteHighlight`. Both capture `highlights` via their dependency arrays, so rapid successive operations will silently overwrite each other. Fix: use functional `setHighlights((prev) => ...)` updater.

2. **Should-fix** -- `selectionchange` fires at very high frequency (every caret movement during drag). The handler does DOM measurement on every call. Should be gated behind `requestAnimationFrame` to limit to one check per frame.

3. **Should-fix** -- Unused `useTabStore` import (line 7). Dead code.

4. **Suggestion** -- `copyToNote` does not clear the selection/snapshot after use, unlike `createHighlight` which does.

5. **Suggestion** -- Stale snapshot after zoom change: `hasSelection` can briefly be true with a dead DOM selection after a scale change triggers text layer re-render.

---

