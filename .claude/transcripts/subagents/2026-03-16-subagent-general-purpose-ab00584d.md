# 2026-03-16 — Subagent Transcript: general-purpose

**Date:** 2026-03-16 11:48:29
**Agent:** general-purpose
**Agent ID:** ab00584d488b7af65
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

## Changes Summary

Two features added to `crates/app/src/components/Editor/PdfViewer.tsx`:

1. **Undo highlight** — `undoStackRef` stores previous `highlights[]` snapshots. `persistHighlights()` pushes prev state before saving. `undoHighlight()` pops and restores. Undo2 button in toolbar + Cmd+Z keyboard shortcut (only when PDF scroll container has focus).

2. **Overlap detection** — In `createHighlight`, before adding a new highlight, checks if an existing highlight has the same `page` and `text`. Same color = no-op (returns prev unchanged). Different color = recolors the existing highlight in place.

Key new/changed functions:

```tsx
  // Undo stack: each entry is the full highlights array before the last action
  const undoStackRef = useRef<PdfHighlight[][]>([]);

  // Persist highlights and push previous state onto undo stack
  const persistHighlights = useCallback(
    async (prev: PdfHighlight[], next: PdfHighlight[]) => {
      undoStackRef.current.push(prev);
      if (undoStackRef.current.length > 50) {
        undoStackRef.current = undoStackRef.current.slice(-50);
      }
      try {
        const api = await getAPI();
        await api.savePdfHighlights(path, next);
      } catch (e) {
        log.error("pdf-viewer", "Failed to save highlights", {
          error: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [path],
  );

  const undoHighlight = useCallback(async () => {
    const prev = undoStackRef.current.pop();
    if (prev === undefined) return;
    setHighlights(prev);
    try {
      const api = await getAPI();
      await api.savePdfHighlights(path, prev);
    } catch (e) {
      log.error("pdf-viewer", "Failed to persist undo", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }, [path]);

  const createHighlight = useCallback(async () => {
    const snap = selectionSnapshotRef.current;
    if (!snap) return;

    let prev: PdfHighlight[] = [];
    let updated: PdfHighlight[] = [];
    let changed = false;

    setHighlights((current) => {
      prev = current;
      const existing = current.find(
        (h) => h.page === snap.pageNum && h.text === snap.text,
      );
      if (existing) {
        if (existing.color === activeColor) {
          updated = current;
          return current;
        }
        updated = current.map((h) =>
          h.id === existing.id ? { ...h, color: activeColor } : h,
        );
        changed = true;
        return updated;
      }
      const highlight: PdfHighlight = {
        id: crypto.randomUUID(),
        page: snap.pageNum,
        rects: snap.rects,
        text: snap.text,
        color: activeColor,
        created_at: new Date().toISOString(),
      };
      updated = [...current, highlight];
      changed = true;
      return updated;
    });

    if (changed) {
      await persistHighlights(prev, updated);
    }

    window.getSelection()?.removeAllRanges();
    selectionSnapshotRef.current = null;
    setHasSelection(false);

    if (changed) {
      log.info("pdf-viewer", "Created/recolored highlight", {
        path, page: snap.pageNum, color: activeColor, chars: snap.text.length,
      });
    }
  }, [path, activeColor, persistHighlights]);

  const deleteHighlight = useCallback(
    async (id: string) => {
      let prev: PdfHighlight[] = [];
      let updated: PdfHighlight[] = [];
      setHighlights((current) => {
        prev = current;
        updated = current.filter((h) => h.id !== id);
        return updated;
      });
      setHoveredHighlightId(null);
      await persistHighlights(prev, updated);
    },
    [persistHighlights],
  );
```

Cmd+Z handler:
```tsx
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        if (
          undoStackRef.current.length > 0 &&
          scrollContainerRef.current?.contains(document.activeElement as Node | null)
        ) {
          e.preventDefault();
          undoHighlight();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undoHighlight]);
```

Toolbar button:
```tsx
  <button
    className="pdf-toolbar-btn"
    onClick={undoHighlight}
    title="Undo last highlight action (Cmd+Z)"
  >
    <Undo2 size={16} />
  </button>
```

Write your review to `.claude/reviews/code/pdf-highlight-undo-overlap-review-1.md`.

---

## Assistant



Let me read the full file to understand the complete context.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/PdfViewer.tsx"}`

---

## Assistant

Now let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code","description":"Create reviews directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/pdf-highlight-undo-overlap-review-1.md","content":"# Code Review: PDF Highlight Undo + Overlap Detection\n\n**File**: `cr`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/pdf-highlight-undo-overlap-review-1.md`.

**Summary of findings:**

1. **Bug** -- `createHighlight` and `deleteHighlight` assign `prev`/`updated`/`changed` as side-effects inside `setHighlights` updater functions, then read them after the call returns. React 18 concurrent mode does not guarantee synchronous updater execution, so these variables may still hold their initial values when `persistHighlights` is called, leading to wrong data being saved and pushed onto the undo stack.

2. **Should-fix** -- `undoStackRef` is not cleared when `path` changes, so switching PDFs and pressing undo would restore highlights from the previous document onto the current one.

3. **Should-fix** -- The Undo toolbar button is never disabled (unlike the Cmd+Z handler which checks stack length), giving no visual feedback about undo availability.

4. **Suggestion** -- Text-based overlap detection (`page + text`) will incorrectly match duplicate text on the same page (e.g., repeated phrases), recoloring the wrong highlight.

---

