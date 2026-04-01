# 2026-03-30 — Subagent Transcript: Explore

**Date:** 2026-03-30 10:39:32
**Agent:** Explore
**Agent ID:** afe44195ee30fba3f
**Parent Session:** ef7ce461-6110-4d5e-bb73-b8dd8f64d38f

---

## User

Read these files and report their contents back to me. I need to understand where to place new sections:

1. `docs/06-architecture.md` - read the full file, I need to find where Tauri-specific constraints would fit
2. `tests/e2e/README.md` - read the full file, I need to see what gotchas are already documented
3. `CLAUDE.md` - read lines around the CodeMirror spacing rule and the Conventions section to find exact placement points
4. `docs/extension-guides/add-cm-preview-widget.md` - read the Pitfalls section

Report the exact line numbers and surrounding content for each insertion point.

---

## Assistant

I'll read those files for you to identify the exact insertion points.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/README.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-cm-preview-widget.md"}`

---

## Assistant

Perfect! I have all four files. Let me compile the exact line numbers and surrounding content for each insertion point:

## Insertion Points Report

### 1. **`docs/06-architecture.md`** — Tauri-specific constraints placement

**Location: After the "Performance Considerations" section (line 360)**

Lines 360-375 contain performance considerations. This is the ideal place to add Tauri-specific constraints. The section discusses Canvas rendering, Web Workers, and future scaling — a new subsection on Tauri constraints would fit naturally here.

**Exact insertion point:**
```
(Line 375 ends with: "The architecture supports all of these without structural changes — the core library abstractions (Graph Engine, Indexer) hide the storage backend from consumers.")

→ INSERT NEW SECTION HERE

(Line 377 begins: "## Tauri IPC Strategy")
```

**Surrounding context:** Lines 360-377

---

### 2. **`tests/e2e/README.md`** — Gotchas section

**Location: Already well-documented (lines 82-134)**

The "Gotchas" section is comprehensive and clearly laid out. Current gotchas cover:
- Tauri v2 IPC internals (lines 84-94)
- Config overrides CLI flag (lines 103-109)
- `execute_js` results type coercion (lines 111-115)
- Collapsed folders CSS behavior (lines 117-122)
- npm run dev hardcoding (lines 123-125)
- WebView readiness (lines 127-129)
- Path escaping (lines 131-134)

**Insertion point:** After line 134 (end of path escaping gotcha)

---

### 3. **`CLAUDE.md`** — CodeMirror spacing rule and Conventions section

**CodeMirror spacing rule location: Lines 31**

```
(Line 30 ends with "- Canvas docs: When modifying Canvas code...")
(Line 31): "- CodeMirror spacing: NEVER add `margin` or `padding` to `.cm-line` elements — it breaks mouse hit-testing. Use block widget decorations (`Decoration.widget({ widget, block: true })`) with a matching `estimatedHeight` getter instead; CM6 includes these in its height map."
```

This is the exact rule. It's part of the Conventions section (lines 25-32).

**Conventions section header:** Line 25
**Conventions section ends:** Line 32
**Canvas docs rule ends at:** Line 32

**Insertion point for new Conventions entries:** After line 32 (before the blank line at 33)

**Surrounding context:** Lines 25-35

---

### 4. **`docs/extension-guides/add-cm-preview-widget.md`** — Pitfalls section

**Location: Lines 244-255**

The Pitfalls section is a well-structured table with 7 entries:

| Pitfall | Line |
|---------|------|
| `Transaction` has no `view` | 248 |
| `Widget.eq()` must compare cache | 249 |
| `view.dispatch()` after `await` | 250 |
| Indented fences | 251 |
| Mermaid SVG hardcodes width | 252 |
| Settings in `useEffect` deps | 253 |
| Dynamic import for large libs | 254 |
| `securityLevel: "strict"` | 255 |

**Insertion point:** After line 255 (last pitfall row), before the blank line at 256

**Exact context:**
```
(Line 244): "## Pitfalls learned from the mermaid implementation"
(Line 245): blank line
(Line 246-255): Table rows
(Line 256): blank line
(Line 257): "## File summary"
```

---

## Summary Table

| File | Section | Line Range | Insertion Point |
|------|---------|-----------|-----------------|
| `docs/06-architecture.md` | After Performance Considerations | 360-377 | After line 375 |
| `tests/e2e/README.md` | Gotchas (end) | 82-134 | After line 134 |
| `CLAUDE.md` | Conventions | 25-32 | After line 32 |
| `docs/extension-guides/add-cm-preview-widget.md` | Pitfalls table | 244-255 | After line 255 |

---

