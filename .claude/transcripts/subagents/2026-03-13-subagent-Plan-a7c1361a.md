# 2026-03-13 — Subagent Transcript: Plan

**Date:** 2026-03-13 14:59:09
**Agent:** Plan
**Agent ID:** a7c1361af8eb9b1a5
**Parent Session:** c355e4cd-4ac3-4961-a1fd-3225a475b274

---

## User

## Task
Replace abstract Cytoscape node shapes (ellipse, diamond, barrel, etc.) with meaningful SVG icons matching the Files view (Lucide icons: Lightbulb for concept, BookOpen for book-note, User for person, Folder for folder, etc.).

## Current Architecture

**File tree icons** (`crates/app/src/components/Layout/fileTreeIcons.tsx`):
- Maps note types to Lucide React icons: concept→Lightbulb, book-note→BookOpen, question→HelpCircle, reference→FileText, index→List, argument→MessageSquare, evidence→FlaskConical, experiment→TestTube, person→User, project→FolderKanban, folder→Folder
- Uses `getNodeColor()` from graphStyles for consistent colors

**Graph nodes** (`crates/app/src/components/GraphView/graphStyles.ts`):
- `NOTE_TYPE_SHAPES` maps types to native Cytoscape shapes (ellipse, roundrectangle, diamond, etc.)
- `graphStylesheet` uses `shape: "data(shape)"`, `background-color: "data(color)"`, `width/height: "data(size)"`
- Nodes are small (base size 8px, scaled by in-degree) with glow effect
- No `background-image` currently used

**GraphView.tsx** (node creation, ~line 286-295):
```typescript
const cyNodes = filteredNodes.map((n) => ({
  data: {
    id: n.path, label: n.title,
    color: getNodeColor(n.note_type),
    noteType: n.note_type,
    shape: getNodeShape(n.note_type),
    size: 8,
  },
}));
```

**GraphLegend.tsx**: Uses SVG `SHAPE_PATHS` to render shape previews in legend. Needs to match.

## Approach: Cytoscape `background-image` with SVG Data URIs

Cytoscape supports `background-image` on nodes using SVG data URIs. The approach:
1. Create a utility that converts each Lucide icon to an SVG data URI string (white stroke, no fill — Lucide icons are stroke-based)
2. Add a `NOTE_TYPE_ICON_SVGS` mapping in graphStyles.ts
3. Change node shape to uniform `ellipse` (or `roundrectangle`) so the icon is the distinguishing visual
4. Set `background-image: "data(iconSvg)"` in the stylesheet
5. Add `iconSvg` to node data in GraphView.tsx
6. Update GraphLegend to show Lucide icons instead of shape paths

Key considerations:
- Lucide icons are 24x24 SVG with `stroke` (not fill), `stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`
- SVG data URIs need proper encoding for Cytoscape
- Node size is small (8-12px) — icons need to be visible but not overwhelming
- Keep the colored glow effect (shadow-color: data(color))
- Icon color should be white on the colored background for contrast
- `background-image-containment` and `background-fit` control icon sizing within node

Design the implementation plan with specific file changes needed.

---

## Assistant



I'll explore the codebase to understand the current implementation details before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

Now let me look at GraphView.tsx to understand how nodes are created and the minimap.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/GraphView/*.ts*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.test.ts"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/node_modules/lucide-react/dist/esm/icons/ 2>/dev/null | head -5 || echo \"not found at root\"; ls /Users/bsmonteiro/Desktop/Personal/brainmap`

---

## Assistant

Let me check how Lucide icons expose their SVG path data, since we need raw SVG strings (not React components) for Cytoscape data URIs.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/lucide-react/dist/esm/ | head -10","description":"Check lucide-react ESM structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/lucide-static 2>/dev/null && echo \"exists\" || echo \"no lucide-static\"","description":"Check if lucide-static pack`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/lucide-react/dist/esm/icons/lightbulb.js 2>/dev/null | head -20","description":"Check how Lucide exports icon data"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/lucide/ 2>/dev/null && echo \"lucide base exists\" || echo \"no lucide base\"","description":"Check for base lucide p`

---

## Assistant

Good -- Lucide icons export their path data as `__iconNode` arrays. Let me check a few more icons to confirm the pattern, and also look at node sizes in the stylesheet more carefully.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/lucide-react/dist/esm/icons/book-open.js | head -25","description":"Check book-open icon structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/lucide-react/dist/esm/icons/folder.js | head -20","description":"Check folder icon structure"}`

---

## Assistant

Now let me check the GraphToolbar for any shape-related UI elements.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

Now let me check the cluster hulls file since it uses `note_type` data from nodes.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphHulls.ts","limit":30}`

---

## Assistant

I have enough context. Let me now look at how the existing `NOTE_TYPE_SHAPES` map is consumed elsewhere (to ensure I catch all references).

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"NOTE_TYPE_SHAPES|getNodeShape","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"SHAPE_PATHS","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

Now I have a complete picture. Here is the implementation plan.

---

## Implementation Plan: Replace Cytoscape Node Shapes with SVG Icons

### Overview

Replace the current system where 11 note types are distinguished by abstract Cytoscape shapes (ellipse, diamond, barrel, etc.) with meaningful SVG icons matching the Files view (Lucide icons). Nodes will use a uniform `ellipse` shape with colored backgrounds, and the Lucide icon rendered as a white SVG `background-image` via data URI.

### Key Design Decisions

1. **SVG data URIs built at module load time** -- not at render time. Each icon's SVG path data is extracted from `lucide-react`'s exported `__iconNode` arrays and converted into a complete `<svg>` string encoded as a `data:image/svg+xml` URI. This avoids runtime cost per node.

2. **Uniform node shape** -- All nodes become `ellipse`. The icon is the distinguishing visual, not the shape. This simplifies the stylesheet and makes the graph more visually coherent.

3. **Node size increase** -- Icons need minimum ~14px to be legible. Increase base node size from 8 to 14, with in-degree scaling adjusted accordingly (e.g., `Math.max(14, 14 + indegree * 1.5)`). The selected/highlighted/focus sizes also need proportional bumps.

4. **White icon on colored background** -- The SVG uses `stroke: white` (Lucide icons are stroke-based, not fill-based). The `background-color: data(color)` remains. The icon is centered inside the node via `background-fit: contain` and `background-width/height: 65%`.

5. **`getNodeShape` kept but simplified** -- It now always returns `"ellipse"` (or could be removed). A new `getNodeIconSvg(noteType)` function returns the data URI string.

### Step-by-step Implementation

#### Step 1: Create `graphIcons.ts` -- SVG data URI generator

New file: `crates/app/src/components/GraphView/graphIcons.ts`

This module will:
- Define a `NOTE_TYPE_ICON_PATHS` record mapping each note type to an array of SVG element descriptors (extracted from Lucide's `__iconNode` format: `[tagName, {d, ...attrs}]`).
- Provide a `buildSvgDataUri(paths, strokeColor)` helper that:
  - Builds a complete `<svg xmlns="..." width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` wrapper.
  - Renders each element (path, line, circle, rect, polyline, polygon) from the icon node array.
  - Returns `data:image/svg+xml,${encodeURIComponent(svgString)}`.
- Export `getNodeIconSvg(noteType: string): string` which returns the cached data URI for white-stroke icons.
- Export `getNodeIconSvgColored(noteType: string): string` for the legend (colored stroke on transparent background).

The icon mapping mirrors `fileTreeIcons.tsx`:
- concept: Lightbulb paths
- book-note: BookOpen paths  
- question: HelpCircle paths
- reference: FileText paths
- index: List paths
- argument: MessageSquare paths
- evidence: FlaskConical paths
- experiment: TestTube paths
- person: User paths
- project: FolderKanban paths
- folder: Folder paths
- fallback: File paths

The path data will be hardcoded (copied from `lucide-react/dist/esm/icons/*.js`) rather than importing at runtime, because Cytoscape needs plain strings, not React components. This also avoids a build-time dependency on Lucide's internal module structure.

#### Step 2: Modify `graphStyles.ts`

Changes:
- Keep `NOTE_TYPE_SHAPES` but change all values to `"ellipse"` (or remove the map and have `getNodeShape` always return `"ellipse"`). Keeping it allows easy reversion.
- Add import of `getNodeIconSvg` from `./graphIcons`.
- Export a new `getNodeIconSvg` re-export for use by GraphView.
- Update `graphStylesheet` node selector:
  - Add `"background-image": "data(iconSvg)"` 
  - Add `"background-fit": "contain"`
  - Add `"background-width": "65%"`
  - Add `"background-height": "65%"`
  - Add `"background-image-containment": "over"` (icon can extend slightly beyond node bounds if needed)
  - Add `"background-clip": "none"`
  - Change `shape` from `"data(shape)"` to `"ellipse"` (hardcoded, since all nodes are now ellipse)
  - Increase base dimensions consideration: the `width: "data(size)"` / `height: "data(size)"` pattern remains, but the base value in GraphView changes from 8 to 14.
- Update `node:selected` style: bump width/height from 16 to 22.
- Update `node.highlighted` style: bump from 12 to 18.
- Update `node.graph-focus-node` style: bump from 20 to 28, border-width proportional.

#### Step 3: Modify `GraphView.tsx`

Changes in the node data mapping (~line 286-295):
```typescript
const cyNodes = filteredNodes.map((n) => ({
  data: {
    id: n.path,
    label: n.title,
    color: getNodeColor(n.note_type),
    noteType: n.note_type,
    iconSvg: getNodeIconSvg(n.note_type),  // NEW
    size: 14,  // was 8
  },
}));
```

Remove the `shape` data field (no longer needed since stylesheet uses hardcoded `"ellipse"`).

Update the in-degree size calculation (~line 325-327):
```typescript
n.data("size", Math.max(14, 14 + n.indegree(false) * 1.5));
```

Update the import line to add `getNodeIconSvg` (from graphIcons or re-exported from graphStyles).

Remove the `getNodeShape` import if no longer used here.

#### Step 4: Modify `GraphLegend.tsx`

Replace the `SHAPE_PATHS` / `ShapeIcon` approach with Lucide React icons (reusing `fileTreeIcons.tsx`):

```typescript
import { NOTE_TYPE_COLORS } from "./graphStyles";
import { NoteTypeIcon } from "../Layout/fileTreeIcons";

export function GraphLegend() {
  return (
    <div className="graph-legend">
      {Object.entries(NOTE_TYPE_COLORS).map(([type, color]) => (
        <div key={type} className="legend-item">
          <NoteTypeIcon noteType={type} size={12} />
          <span className="legend-label">{type}</span>
        </div>
      ))}
    </div>
  );
}
```

This eliminates the `SHAPE_PATHS` record, the `ShapeIcon` component, and the `getNodeShape` import entirely. The legend now shows the same Lucide icons used in the file tree, colored by type -- a perfect visual match.

#### Step 5: Update `graphStyles.test.ts`

- The `getNodeShape` tests need updating. Either:
  - (a) Remove the `getNodeShape` describe block if the function is removed.
  - (b) Update expectations to all return `"ellipse"` if the function is kept as a passthrough.
- Add new tests for `getNodeIconSvg`:
  - Returns a string starting with `"data:image/svg+xml,"` for each known type.
  - Returns a fallback icon URI for unknown types.
  - All 11 types have distinct icon URIs.
  - The SVG content contains `stroke="white"` (or `%23ffffff`/`%23fff` in encoded form).

#### Step 6: Create `graphIcons.test.ts`

New test file for the `graphIcons.ts` module:
- `getNodeIconSvg` returns valid data URI for all 11 types.
- `getNodeIconSvgColored` returns URIs with type-specific colors.
- `buildSvgDataUri` produces valid SVG markup.
- Each type produces a unique SVG (no duplicate mappings).
- Fallback returns the File icon SVG for unknown types.

#### Step 7: Minimap consideration

The minimap (line 410-437 in GraphView.tsx) uses a simplified stylesheet with `width: 4, height: 4` nodes and `"background-color": "data(color)"`. It does NOT use shapes or icons -- nodes are too small. No changes needed for the minimap, as it relies on `data(color)` which still exists.

#### Step 8: Adjust CSS/visual tuning

The glow effect (`shadow-blur`, `shadow-color`) remains unchanged -- it uses `data(color)` which is unaffected. However, with larger nodes (14px base vs 8px), the glow parameters may need slight adjustment:
- `shadow-blur: 10` might need to increase to 12-14 for proportional glow.
- The fcose layout parameters (repulsion, edge length) may need a small bump since nodes are larger.

This is a tuning step best done visually after the core changes.

#### Step 9: Update CLAUDE.md

Update the "Current Status" section to reflect:
- Node shapes replaced with Lucide SVG icons matching file tree.
- Uniform ellipse shape with white icon on colored background.
- GraphLegend uses Lucide React icons.
- New file: `graphIcons.ts`.

### Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `graphIcons.ts` | CREATE | SVG data URI builder + icon path definitions for all 11 types |
| `graphStyles.ts` | MODIFY | Uniform ellipse shape, add background-image stylesheet properties |
| `GraphView.tsx` | MODIFY | Add `iconSvg` to node data, increase base size to 14, remove `shape` |
| `GraphLegend.tsx` | MODIFY | Replace ShapeIcon with NoteTypeIcon from fileTreeIcons |
| `graphStyles.test.ts` | MODIFY | Update/remove getNodeShape tests, add getNodeIconSvg tests |
| `graphIcons.test.ts` | CREATE | Unit tests for SVG data URI generation |
| `CLAUDE.md` | MODIFY | Update current status |

### Risks and Mitigations

1. **SVG encoding issues** -- Cytoscape is particular about `background-image` data URIs. Using `encodeURIComponent()` is more reliable than base64 for SVG. Test with Cytoscape before finalizing.

2. **Icon legibility at small sizes** -- 14px with 65% icon area means the icon renders at ~9px. Lucide icons with stroke-width 2 should remain recognizable. If not, increase to 16px base or 70% background-width. This requires visual testing.

3. **Performance** -- SVG data URIs are computed once at module load (11 icons + 1 fallback = 12 strings). No runtime cost per node beyond passing the string as data. No concern.

4. **Hardcoded SVG paths** -- If `lucide-react` updates icon paths in a future version, the hardcoded paths in `graphIcons.ts` would be stale vs the file tree icons. Mitigation: add a comment with the Lucide version used, and a test that could optionally cross-reference.

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts` - Core stylesheet and shape/color maps to modify
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` - Node data construction, size calculation, imports
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx` - Legend rendering to replace with Lucide icons
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx` - Reference for icon-to-type mapping and NoteTypeIcon component to reuse in legend
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.test.ts` - Existing tests to update for new icon behavior

---

