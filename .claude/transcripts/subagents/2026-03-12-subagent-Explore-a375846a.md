# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 11:36:49
**Agent:** Explore
**Agent ID:** a375846adecde4901
**Parent Session:** a7fdd44d-3b6c-4d45-a577-1a23dfcdefa7

---

## User

Explore the graph tooltip/hover implementation in the BrainMap desktop app. I need to understand:

1. How the hover tooltip on graph nodes is implemented (look in `crates/app/src/components/Graph/` and related files)
2. The tooltip component and its styling
3. How the tooltip is triggered (Cytoscape event handlers for mouseover/mouseout)
4. The `get_node_summary` Tauri command and its usage
5. Any CSS for the tooltip (look for glassmorphism, tooltip classes)

Be thorough - check GraphView.tsx, any tooltip component files, graph styles, and CSS files.

---

## Assistant

I'll explore the graph tooltip/hover implementation in the BrainMap desktop app thoroughly. Let me start by getting the context and then systematically examining the relevant files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find crates/app/src -type f -name \"*.tsx\" -o -name \"*.ts\" | grep -i \"graph\\|tooltip\" | head -20"}`

---

## Assistant

Let me now search for tooltip-related files and examine the key components:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*[Tt]ooltip*"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | xargs grep -l \"tooltip\\|Tooltip\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.css\" -o -name \"*.scss\" | head -20"}`

---

## Assistant

Now let me check the CSS files and find the tooltip styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"graph-node-tooltip\\|tooltip\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.css\" -n"}`

---

## Assistant

Let me read the specific CSS for the tooltip:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1548,"limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"getNodeSummary\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" -n | head -20"}`

---

## Assistant

Now let me check the API types and implementations:

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

Now let me check the Rust backend for the get_node_summary command:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -type f \\( -name \"*.rs\" \\) | xargs grep -l \"get_node_summary\" | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -type f -name \"*.rs\" | xargs grep -l \"get_node_summary\" | head -10"}`

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

Now let me check the DTO definitions:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src -name \"dto.rs\" -o -name \"dto\" -type d"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

Now let me check the graph styles to understand the hover and styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

Perfect! Now let me check the RelatedNotesFooter to see how it also uses the tooltip similar pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx","limit":150}`

---

## Assistant

Let me also check the mock API to see how getNodeSummary works in test mode:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","limit":100}`

---

## Assistant

Perfect! Now let me create a comprehensive summary document. Let me gather a bit more information about the full CSS section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1429,"limit":100}`

---

## Assistant

Excellent! Now I have all the information needed. Let me create a comprehensive exploration report for the user.

## Graph Tooltip/Hover Implementation - Complete Exploration Report

I've thoroughly explored the BrainMap desktop app's graph tooltip/hover implementation. Here's a comprehensive breakdown:

### 1. **Tooltip Component & Rendering**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx` (lines 118-128, 627-646)

**Tooltip State Structure:**
```typescript
tooltip: {
  x: number;                  // Rendered position left (clamped within container)
  y: number;                  // Rendered position top (clamped within container)
  nodePath: string;          // The note's file path
  label: string;             // Node title
  noteType: string;          // Note type (concept, book-note, etc.)
  color: string;             // Node color from palette
  connections: number;       // In-degree (number of incoming links)
  tags?: string[];           // Lazy-loaded tags array
  summary?: string | null;   // Lazy-loaded summary text
} | null
```

**Cache Management:**
- `tooltipCacheRef` uses a `Map<string, NodeSummary>` to cache enriched data per node
- Cache prevents redundant API calls when re-hovering nodes
- Lives for the duration of the GraphView component mount

### 2. **Hover Event Handlers (Cytoscape Integration)**

**Trigger Events:**

**mouseover "node" event (lines 216-265):**
- Clears previous hover state defensively
- Applies neighborhood highlighting:
  - Dims all elements with `hover-dim` class (opacity 0.25)
  - Brightens neighbors with `hover-bright` class
- Animates pulse on hovered node: shadow-blur 22, shadow-opacity 1.0 over 400ms
- Calculates tooltip position:
  - Offset: +12px from node's rendered X, -8px from rendered Y
  - Clamped to container bounds (280px max width, ~180px max height)
- Shows basic tooltip immediately with basic data (nodePath, label, noteType, color, connections)
- **Lazy-loads enriched data:** Fetches tags and summary via `getNodeSummary()` Tauri command if not cached
- Updates tooltip only if still hovering the same node (prevents stale updates)

**mouseout "node" event (line 267):**
- Calls `clearHoverState()` which:
  - Removes shadow animations from all nodes
  - Removes `hover-dim` and `hover-bright` classes
  - Clears tooltip state (`setTooltip(null)`)

**mouseover canvas background (lines 212-214):**
- Clears hover state when user hovers over empty space

### 3. **Lazy-Loading Pattern**

**Code Flow (lines 247-264):**
```typescript
// Show basic tooltip immediately
const cached = tooltipCacheRef.current.get(nodePath);
if (cached) {
  // Use cached enriched data
  setTooltip({ ...baseTooltip, tags: cached.tags, summary: cached.summary });
} else {
  // Show basic tooltip first
  setTooltip(baseTooltip);
  // Fetch enriched data asynchronously
  getAPI().then((api) =>
    api.getNodeSummary(nodePath).then((summary) => {
      tooltipCacheRef.current.set(nodePath, summary);
      // Only update if still hovering this node
      setTooltip((prev) =>
        prev && prev.nodePath === nodePath
          ? { ...prev, tags: summary.tags, summary: summary.summary }
          : prev,
      );
    }).catch(() => { /* ignore tooltip fetch errors */ }),
  );
}
```

This ensures the tooltip appears immediately while enriching it progressively.

### 4. **Tooltip JSX Rendering**

**Location:** GraphView.tsx lines 627-646

```tsx
{tooltip && (
  <div className="graph-node-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
    <div className="tooltip-header">
      <span className="tooltip-type-pill" style={{ background: tooltip.color }}>
        {tooltip.noteType}
      </span>
      <span className="tooltip-connections">{tooltip.connections} links</span>
    </div>
    <span className="tooltip-title">{tooltip.label}</span>
    {tooltip.summary && <span className="tooltip-summary">{tooltip.summary}</span>}
    {tooltip.tags && tooltip.tags.length > 0 && (
      <div className="tooltip-tags">
        {tooltip.tags.slice(0, 4).map((t) => (
          <span key={t} className="tooltip-tag">{t}</span>
        ))}
      </div>
    )}
  </div>
)}
```

Structure:
- Header row: type pill (colored) + connections count
- Title (bold, ellipsized)
- Summary (up to 2 lines via `-webkit-line-clamp: 2`)
- Up to 4 tags (displays first 4 if more exist)

### 5. **CSS Styling - Glassmorphism Design**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` (lines 1548-1623)

**Main Container (.graph-node-tooltip):**
```css
position: absolute;
z-index: 100;
pointer-events: none;           /* Allows clicking through to nodes */
border-radius: 6px;
padding: 8px 10px;
font-size: 11px;
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
display: flex;
flex-direction: column;
gap: 4px;
max-width: 280px;
backdrop-filter: blur(10px);    /* Glassmorphism blur */
-webkit-backdrop-filter: blur(10px);  /* Safari support */
```

**Theme-specific backgrounds:**
- **Dark:** `rgba(30, 30, 30, 0.88)` with `rgba(255, 255, 255, 0.08)` border
- **Light:** `rgba(255, 255, 255, 0.88)` with `rgba(0, 0, 0, 0.08)` border

**Child Elements:**
- **.tooltip-header:** Flex row, space-between, gap 8px
- **.tooltip-type-pill:** Inline-block, 1px 6px padding, 9999px border-radius (pill shape), white text, 9px font-weight 600, text-transform capitalize
- **.tooltip-connections:** 9px text-muted, nowrap
- **.tooltip-title:** 600 weight, text-primary, ellipsized
- **.tooltip-summary:** text-secondary, 10px, line-height 1.3, 2-line clamp via `-webkit-line-clamp`
- **.tooltip-tags:** Flex wrap, 3px gap, margin-top 1px
  - **.tooltip-tag:** 0 4px padding, 3px border-radius, 9px font-, bg-tertiary, text-secondary

### 6. **Backend Tauri Command: `get_node_summary`**

**Frontend API (TypeScript):**
- **File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts` (lines 26-28)
- **Implementation:** `invoke<NodeSummary>("get_node_summary", { path })`

**Backend Handler Stack:**

1. **Command Definition** (`crates/app/src-tauri/src/commands.rs` lines 134-136):
```rust
#[tauri::command]
pub fn get_node_summary(state: State<'_, AppState>, path: String) -> Result<NodeSummaryDto, String> {
    state.with_workspace(|ws| handlers::handle_get_node_summary(ws, &path))
}
```

2. **Handler** (`crates/app/src-tauri/src/handlers.rs` lines 202-206):
```rust
pub fn handle_get_node_summary(ws: &Workspace, path: &str) -> Result<NodeSummaryDto, String> {
    let note = ws.read_note(path).map_err(|e: BrainMapError| e.to_string())?;
    Ok(NodeSummaryDto::from(note))
}
```

3. **DTO Conversion** (`crates/app/src-tauri/src/dto.rs` lines 201-216):
```rust
#[derive(Debug, Serialize)]
pub struct NodeSummaryDto {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    pub status: Option<String>,
    pub summary: Option<String>,
}

impl From<&Note> for NodeSummaryDto {
    fn from(note: &Note) -> Self {
        Self {
            path: note.path.as_str().to_string(),
            title: note.frontmatter.title.clone(),
            note_type: note.frontmatter.note_type.clone(),
            tags: note.frontmatter.tags.clone(),
            status: note.frontmatter.status.as_ref().map(|s| { ... }),
            summary: note.frontmatter.summary.clone(),
        }
    }
}
```

**Flow:**
- Reads the full note from the Workspace (via `ws.read_note()`)
- Extracts frontmatter fields: title, tags, status, summary
- Returns lightweight summary (no body content)

**TypeScript Interface** (src/api/types.ts lines 50-57):
```typescript
export interface NodeSummary {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  summary: string | null;
}
```

### 7. **Hover Styling via Cytoscape Classes**

**Location:** `crates/app/src/components/GraphView/graphStyles.ts` (lines 155-197)

Applied via `cy.elements().addClass("hover-dim")` and `.removeClass()`:

**Dimmed elements (.hover-dim):**
- **Nodes:** opacity 0.25, shadow-opacity 0.1
- **Edges:** line-opacity 0.12

**Brightened neighbors (.hover-bright):**
- **Nodes:** shadow-blur 14, shadow-opacity 0.95
- **Edges:** line-opacity 0.7, width 1.2

**Conflict resolution:**
- Selected nodes keep higher opacity even when dimmed (0.5 for highlighted, 1.0 for selected)

### 8. **Related Notes Tooltip Pattern** (Similar implementation)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`

The RelatedNotesFooter component uses a **nearly identical pattern** for tooltips on hover:
- Same `tooltip` state with lazy-loading via `getNodeSummary()`
- Same caching mechanism (`tooltipCacheRef`)
- CSS class: `.related-note-tooltip` (same glassmorphism styling)
- Triggered on `onMouseEnter` of card elements
- Positioned absolutely within the footer container
- Shows enriched data (tags, summary, status) progressively

### 9. **Key Design Decisions**

1. **Immediate feedback:** Basic tooltip shows instantly, enrichment loads asynchronously
2. **Cache persistence:** Per-component lifecycle (cleared on unmount, persists for tab switches)
3. **Safe state updates:** Only updates tooltip if still hovering the same node (prevents stale renders)
4. **Error tolerance:** Ignores tooltip fetch failures gracefully (`.catch(() => {})`)
5. **Glassmorphism:** Backdrop blur + semi-transparent backgrounds for modern aesthetic
6. **Non-intrusive:** `pointer-events: none` allows clicking through to nodes
7. **Constrained positioning:** Clamped to viewport bounds to prevent overflow
8. **Neighborhood highlight:** Full context via dimming + brightening on hover

### 10. **File Summary**

| File | Purpose |
|------|---------|
| `GraphView.tsx` | Main tooltip state, event handlers, rendering, lazy-load logic |
| `graphStyles.ts` | Cytoscape hover-dim/hover-bright class definitions |
| `RelatedNotesFooter.tsx` | Secondary tooltip implementation (related notes) |
| `App.css` (lines 1548-1623) | `.graph-node-tooltip` and child element styling |
| `api/types.ts` | `NodeSummary` interface definition |
| `api/tauri.ts` | Frontend invocation of `get_node_summary` Tauri command |
| `commands.rs` (lines 134-136) | Tauri command registration |
| `handlers.rs` (lines 202-206) | Rust handler implementation |
| `dto.rs` (lines 191-216) | `NodeSummaryDto` serialization |

This is a well-architected, performant implementation with graceful degradation, caching, and a polished glassmorphic visual style.

---

