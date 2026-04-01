# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 11:24:51
**Agent:** Explore
**Agent ID:** a49e94608b66049c0
**Parent Session:** 3c1e025f-00b4-4b7e-abea-e4e723ea4e8c

---

## User

I need to understand the hover tooltip pattern used in the BrainMap desktop app. Specifically:

1. Read the graph hover tooltip implementation - there's a "rich hover tooltip" that shows tags/summary via `get_node_summary` Tauri command. Look in `crates/app/src/components/GraphView/GraphView.tsx` for the tooltip rendering and the mouseover handler.
2. Read the CSS for `.graph-node-tooltip` in `crates/app/src/App.css` to understand the tooltip styling (glassmorphism, etc.)
3. Check what data is available for a note - what does `get_node_summary` return? Look at the Tauri command handler in `crates/app/src-tauri/src/handlers.rs` or `commands.rs`.
4. Check what data the `nodes` Map in `graphStore` already contains (what fields does `NodeDto` have?) - look at `crates/app/src-tauri/src/dto.rs` for NodeDto.
5. Read the current RelatedNotesFooter.tsx at `crates/app/src/components/Editor/RelatedNotesFooter.tsx`

I want to add a hover tooltip on the related note cards showing the full note name, type, tags, summary, etc. I need to understand what data is already available client-side vs what needs an API call.

---

## Assistant

I'll help you understand the hover tooltip pattern and the data available for notes. Let me read through the relevant files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Now let me check the handlers for the `get_node_summary` command and search for the CSS tooltip styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"*.rs\" | head -20"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/*.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"get_node_summary|graph-node-tooltip","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

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

- **Grep**: `{"pattern":"graph-node-tooltip","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":10}`

---

## Assistant

Now let me get the rest of the CSS for the tooltip:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tooltip-(header|type-pill|connections|title|summary|tags|tag)","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","context":5}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Perfect! Now I have all the information needed. Let me compile a comprehensive summary of the hover tooltip pattern and data availability:

## Summary: Hover Tooltip Pattern in BrainMap Desktop App

### 1. Graph Node Tooltip Implementation

**Pattern in GraphView.tsx (lines 117-263):**
- Uses a React state `tooltip` to store hover position and data
- On `mouseover` a graph node:
  1. Renders the node's immediate data: x/y position, label (title), noteType, color, connections (node.degree)
  2. Shows basic tooltip immediately
  3. Lazy-loads enriched data (`tags`, `summary`) via `getNodeSummary()` API call
  4. Caches results in `tooltipCacheRef` to avoid redundant API calls
  5. Only updates tooltip if still hovering the same node
- On `mouseout`, clears tooltip state and hover styling

**Tooltip rendering (lines 617-636):**
```jsx
<div className="graph-node-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
  <div className="tooltip-header">
    <span className="tooltip-type-pill">{tooltip.noteType}</span>
    <span className="tooltip-connections">{tooltip.connections} links</span>
  </div>
  <span className="tooltip-title">{tooltip.label}</span>
  {tooltip.summary && <span className="tooltip-summary">{tooltip.summary}</span>}
  {tooltip.tags?.length > 0 && (
    <div className="tooltip-tags">
      {tooltip.tags.slice(0, 4).map((t) => (...))}
    </div>
  )}
</div>
```

### 2. API Data Available via `getNodeSummary`

**What comes from the API** (dto.rs, lines 191-216):
- `NodeSummaryDto` contains: path, title, note_type, tags (Vec<String>), status (Option<String>), summary (Option<String>)
- Returned by handler `handle_get_node_summary()` (handlers.rs:203-206)
- Wired as Tauri command `get_node_summary()` (commands.rs:134-136)

### 3. Client-Side Data Already Available (NodeDto from Graph Store)

**In graphStore**, nodes Map contains only `NodeDto` (dto.rs, lines 94-98):
- `path: String`
- `title: String`
- `note_type: String`

**No tags, status, or summary in NodeDto** — they're enriched via lazy API call.

### 4. CSS Styling (App.css, lines 1514-1585)

**Glassmorphism approach:**
- `backdrop-filter: blur(10px)` + `-webkit-backdrop-filter`
- Semi-transparent background: `rgba(30, 30, 30, 0.88)` (dark) / `rgba(255, 255, 255, 0.88)` (light)
- Subtle border: `rgba(255, 255, 255, 0.08)` / `rgba(0, 0, 0, 0.08)`
- Max-width: 280px
- z-index: 100
- Position: absolute, pointer-events: none

**Component styles:**
- `.tooltip-title`: font-weight 600, truncates with ellipsis
- `.tooltip-summary`: gray text, 2-line clamp (-webkit-line-clamp: 2)
- `.tooltip-tags`: flex wrap, up to 4 tags shown
- `.tooltip-tag`: 9px font, background color (--bg-tertiary)

### 5. RelatedNotesFooter Current Implementation

**Current state (RelatedNotesFooter.tsx):**
- Shows related notes as cards with:
  - Colored type bar (left border)
  - Direction indicator (→/←)
  - Relationship type (rel)
  - Title (truncated single line)
- Data comes entirely from already-loaded graph store (`nodes.get(path)`)
- No API calls, no tooltips currently

**Available data per card:**
- From `nodes.get()`: title, note_type (only)
- From edges: rel, direction
- Missing: tags, summary, status, full note details

---

## Key Insight for RelatedNotesFooter Tooltip

To add tooltips to related note cards, you have two options:

**Option A (Zero API calls):** Show only what's in `NodeDto` (title, type) — use the same glassmorphic tooltip pattern but with simpler content (no tags/summary).

**Option B (Lazy-load enrichment):** Implement the same pattern as graph hover — cache API calls via `getNodeSummary()` on mouseover, only when user hovers a card. This would require:
- Adding a tooltip state (position, data)
- Adding a cache ref (Map<string, NodeSummary>)
- On mouseover, check cache first, then lazy-fetch if missing
- Clamping tooltip position within the RelatedNotesFooter bounds

Option B gives feature parity with graph tooltips but adds 1 API call per unique card hovered (cached thereafter). Option A is instant but less rich.

---

