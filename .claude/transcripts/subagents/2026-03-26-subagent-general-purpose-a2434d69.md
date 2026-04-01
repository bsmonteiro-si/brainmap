# 2026-03-26 — Subagent Transcript: general-purpose

**Date:** 2026-03-26 13:44:08
**Agent:** general-purpose
**Agent ID:** a2434d691addfcbd5
**Parent Session:** e8095182-9e32-4b51-8df7-3e5729ec3943

---

## User

You are a plan reviewer for the BrainMap project. Review the implementation plan below using the criteria provided.

## Review Criteria

You are reviewing an implementation plan for BrainMap, a Rust knowledge graph tool. Your job is to find real problems before code gets written.

### Project Context

- Rust workspace: `crates/core` (library), `crates/cli` (CLI), `crates/tauri-plugin` (desktop)
- Core library owns all data operations; interfaces are thin wrappers
- Files (.md with YAML frontmatter) are source of truth
- In-memory graph + SQLite FTS5 index
- Specs live in `docs/` (vision, data model, CLI spec, MCP spec, desktop, architecture, roadmap)

### What to Review

#### 1. Architectural Alignment
- Does the plan respect the existing module boundaries?
- Does it route mutations through `Workspace` as the orchestration layer?
- Does it avoid leaking implementation details across module boundaries?
- Is it consistent with the specs in `docs/`?

#### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?
- Are abstractions justified or premature?
- Does it avoid backwards-compatibility hacks or dead code?

#### 3. Edge Cases and Risks
- What failure modes are unhandled?
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

#### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?
- Do tests verify end state, not just mock interactions?

#### 5. Data Model Impact
- Do changes to types break serialization compatibility with existing workspaces?
- Are new fields backward-compatible (optional, with defaults)?
- Does the plan account for the seed dataset still passing?

### Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.

Do NOT pad your review with praise or filler. Only real findings.

---

## Plan to Review

# Plan: Edge Label Font Size & Font Family Controls

## Context

Canvas edges can have text labels, but their font size is hardcoded to `11px` in CSS and there is no font family control. Users want to style edge labels the same way they style text cards — choosing font size and font family via a toolbar picker. This adds a "Label format" dropdown to the edge toolbar, analogous to the existing text format picker on node toolbars.

---

## Affected Files

| File | Change |
|------|--------|
| `crates/app/src/components/Editor/canvasTranslation.ts` | Extend `JsonCanvasEdge` with `labelFontSize?` and `labelFontFamily?`; pass through in `canvasToFlow`; serialize back in `flowToCanvas` |
| `crates/app/src/components/Editor/canvasNodes.tsx` | Add "Label format" picker button + dropdown to `CanvasEdge` toolbar; apply inline styles to label display |
| `crates/app/src/App.css` | Add CSS for `.canvas-edge-label-format-picker` (mirror `.canvas-text-format-picker`) |
| `docs/canvas-architecture.md` | Update Edge Architecture section; add `labelFontSize`/`labelFontFamily` to translation layer docs |

---

## Implementation Steps

### Step 1 — Data model (`canvasTranslation.ts`)

1. Extend `JsonCanvasEdge` (around line 57):
   ```typescript
   labelFontSize?: number;
   labelFontFamily?: string;
   ```

2. In `canvasToFlow`, pass these through to edge `data` alongside existing fields (label, edgeType, color):
   ```typescript
   data: {
     label: e.label ?? "",
     edgeType: e.edgeType,
     labelFontSize: e.labelFontSize,
     labelFontFamily: e.labelFontFamily,
   }
   ```

3. In `flowToCanvas`, read them from edge data and emit only when non-default:
   ```typescript
   if (ed.data?.labelFontSize && ed.data.labelFontSize !== 11)
     edge.labelFontSize = Number(ed.data.labelFontSize);
   if (ed.data?.labelFontFamily)
     edge.labelFontFamily = String(ed.data.labelFontFamily);
   ```
   Default stripping follows the existing pattern (`fontSize != 13` for nodes, `labelFontSize != 11` for edge labels).

### Step 2 — Edge toolbar + label display (`canvasNodes.tsx`)

**Toolbar state**: Add `showLabelFormat` boolean state alongside existing `showColorPicker` state in `CanvasEdge`.

**"Label format" button**: Add a `Type` (or `ALargeSmall`) icon button in the toolbar between Delete and Color Picker (or at end). Clicking it toggles `showLabelFormat` and closes the color picker.

**Dropdown (`canvas-edge-label-format-picker`)**: A dropdown rendered below the toolbar (similar to `.canvas-text-format-picker` on nodes), containing two sections:
- **Size**: buttons for `[11, 13, 16, 20, 24]` px (reuse `FONT_SIZES` constant already defined at line 30)
- **Font**: buttons for Sans / Serif / Mono / Sketch (reuse `FONT_FAMILIES` constant already defined at line 31–36)

Clicking a size/font calls a handler that runs:
```typescript
setEdges(eds => eds.map(ed => {
  if (ed.id !== id) return ed;
  return { ...ed, data: { ...ed.data, labelFontSize: size } };
}));
scheduleSave();
```

**Dismiss**: `showLabelFormat` closes when: another toolbar button is opened, or user clicks outside (use `useEffect` with a `mousedown` listener on `document` — same pattern used by existing color pickers).

**Label rendering**: In the label display span (around line 1010), apply inline style:
```typescript
style={{
  fontSize: data.labelFontSize ?? 11,
  fontFamily: data.labelFontFamily ?? undefined,
}}
```
Remove the hardcoded `font-size: 11px` from `.canvas-edge-label` in CSS (or reduce it to a fallback only).

### Step 3 — CSS (`App.css`)

Add `.canvas-edge-label-format-picker` styling mirroring `.canvas-text-format-picker` (lines 6045+). Key differences:
- Position above toolbar (`bottom: 100%; margin-bottom: 4px`) — same as node format picker
- Shares `.canvas-text-format-btn` and `.canvas-text-format-btn.active` classes (no new classes needed for buttons)
- `.canvas-text-format-section-label` is already defined — reuse

Remove or relax `font-size: 11px` from `.canvas-edge-label` since it will now be applied as an inline style with the same default.

### Step 4 — Canvas architecture doc update

Update `docs/canvas-architecture.md`:
- **Edge Architecture** section: mention `labelFontSize` and `labelFontFamily` as optional per-edge data fields; note toolbar now has a Label format picker
- **Translation Layer** section: update default-stripping note to include `labelFontSize != 11`

---

## Constants to Reuse

Both already defined at the top of `canvasNodes.tsx`:
- `FONT_SIZES = [11, 13, 16, 20, 24]` (line 30)
- `FONT_FAMILIES = [{ id, label }, ...]` (lines 31–36)

---

## Backward Compatibility

- Both new fields are optional in `JsonCanvasEdge` — existing `.canvas` files load fine (default 11px / inherited font-family).
- Omitting defaults on save keeps `.canvas` files minimal and compatible with other JSON Canvas viewers.

---

## Verification

1. Open a `.canvas` file → create edges with labels → select an edge → confirm toolbar shows new "Label format" button
2. Click the button → pick a font size → label updates immediately
3. Pick a font family → label updates immediately
4. Save (Cmd+S) → inspect the `.canvas` file JSON → `labelFontSize`/`labelFontFamily` appear only when non-default
5. Reload the file → formatting is preserved
6. Edge with default 11px and no family → NOT emitted to JSON (default stripping works)
7. Undo/redo after changing label format restores previous value (snapshots include edge data)
8. Run `cargo test` — no Rust changes, all 124 tests pass
9. Spot-check: node text format picker still works unchanged

---

Write your review findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/edge-label-font-controls-review-1.md`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor -name \"canvasTranslation.ts\" -o -name \"canvasNodes.tsx\" | head -5","description":"Find canvas editor f`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans","description":"Check review`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts","offset":1,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":1,"limit":80}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-edge-label|CanvasEdge|canvas-edge|label.*font|font.*label","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"conte`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-edge-label|font-size: 11","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","context":2}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":860,"limit":220}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts","offset":100,"limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts","offset":219,"limit":120}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-text-format-picker|canvas-text-format-btn|canvas-text-format-section","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","context":2,"head_l`

---

## Assistant

Now I have enough context to write a thorough review. Let me check one more thing about the undo/redo pattern and the existing color picker dismiss pattern.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"undo|redo|history|snapshot","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","context":1,"head_limit":20}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"undo|redo|useUndoRedo|history","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor","output_mode":"content","context":2,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"useUndoRedo|useTemporalStore|temporal|CanvasEditor.*undo","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor","output_mode":"content","context":2,"head_li`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"undo|redo|Cmd\\+Z","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","context":2,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pushSnapshot|onNodesChange|onEdgesChange","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","context":3,"head_l`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":540,"limit":30}`

---

## Assistant

Now I have a thorough picture. Let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/edge-label-font-controls-review-1.md","content":"# Plan Review: Edge Label Font Size & Font Family Controls\n\nReviewed `

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/edge-label-font-controls-review-1.md`.

Here is a summary of findings:

---

**Findings (4 should-fix, 1 blocker-adjacent, 1 suggestion):**

1. **[edge-case] [should-fix] Font styles not applied to the inline edit input.** The plan applies `fontSize`/`fontFamily` to the label display `<div>` but not to the `<input>` used during inline editing, causing a visible size jump when the user enters edit mode.

2. **[edge-case] [should-fix] Undo/redo will not cover font format changes.** The canvas undo system snapshots only on `"remove"`/`"add"` edge change types. Direct `setEdges(...)` calls (used by the color handler and the planned font handler) bypass this. Without explicitly calling `pushSnapshot()` before the mutation, `Cmd+Z` will not revert font changes — contradicting verification step 7.

3. **[edge-case] [should-fix] Dismiss uses `mousedown` but existing pickers use `pointerdown`.** The plan says to use a `mousedown` listener for outside-click dismissal, but `ColorPickerDropdown` uses `pointerdown`. Should be consistent.

4. **[edge-case] [should-fix] Default-stripping condition uses loose truthiness for `labelFontSize`.** `if (ed.data?.labelFontSize && ...)` would suppress `0` (corrupt but possible). Use `!= null` instead.

5. **[testing] [should-fix] No automated tests planned.** The translation functions are pure and directly testable. Round-trip tests for default-stripping, absent fields, and non-default values should be added.

6. **[edge-case] [suggestion]** Toolbar position with no label may cause crowding; consider enabling the format picker only when a label exists.

---

