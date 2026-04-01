# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 10:34:46
**Agent:** Explore
**Agent ID:** a1759dea12f3709cc
**Parent Session:** bc0b2030-baf9-46cb-9e50-475bf12fe6d5

---

## User

Explore how graph node labels, icons, and label backgrounds are styled in this Cytoscape.js-based graph view. I need to understand:

1. The Cytoscape stylesheet definitions for node labels (font-size, color, etc.), node icons (width/height of background-image), and the label background (text-background-color, text-background-opacity, text-background-padding, text-background-shape).

2. How the existing "Graph Tooltip" settings work in the Settings modal — look at `crates/app/src/components/Settings/SettingsModal.tsx` for the tooltip section to understand the UI pattern (range inputs with labels).

3. The uiStore (`crates/app/src/stores/uiStore.ts`) — find the tooltip size state fields (tooltipFontSize, tooltipPillSize, etc.), their defaults, the "Overall" setter that scales proportionally, and the individual setters. Also check what `PersistedPrefs` fields exist.

4. How CSS variables are applied in App.tsx for tooltip sizes (the useEffect that sets --tooltip-font-size etc.).

5. The graphStyles.ts file that defines Cytoscape stylesheet — find the exact font-size, width, height, and label background properties used for nodes.

Focus on files:
- crates/app/src/components/GraphView/graphStyles.ts
- crates/app/src/components/Settings/SettingsModal.tsx
- crates/app/src/stores/uiStore.ts
- crates/app/src/App.tsx

Be thorough - I need exact line numbers, current default values, and the full pattern for how tooltip settings flow from store → CSS variables → visual output.

---

## Assistant

I'll thoroughly explore the graph node styling, tooltip settings, and how they flow through the codebase. Let me start by examining the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

Now let me search for where tooltip CSS variables are actually used in components.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--tooltip-(font-size|pill-size|connections-size|summary-size|tag-size)","type":"css"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"var\\(--tooltip-","glob":"**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/GraphView/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"--tooltip-","glob":"**/*.css"}`

---

## Assistant

Good! Now let me search for where these tooltip CSS variables are used in components:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"tooltip-font-size|tooltip-pill-size|tooltip-connections-size|tooltip-summary-size|tooltip-tag-size","glob":"crates/app/src/components/**/*.tsx","output_mode":"files_with_matches"}`

---

## Assistant

Let me search in CSS files more specifically:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | head -20"}`

---

## Assistant

Let me search for tooltip components:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/**/*[Tt]ooltip*"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"tooltip\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components --include=\"*.tsx\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":1,"limit":100}`

---

## Assistant

Let me search for where the tooltip is actually rendered and styled:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"tooltip\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx | head -40"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":870,"limit":50}`

---

## Assistant

Now let me search for the CSS for graph node tooltip in App.css:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"graph-node-tooltip\\|tooltip-\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -60"}`

---

## Assistant

Perfect! Now let me get the actual CSS definitions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":2020,"limit":100}`

---

## Assistant

Excellent! Now let me look at the node icon definitions in graphStyles to understand those better:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"background-image\\|background-width\\|background-height\\|width\\|height\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts | head -`

---

## Assistant

Now let me look at graphIcons.ts to see how icons are created:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts"}`

---

## Assistant

Perfect! Now let me check how node icons are applied in GraphView:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"getNodeIconSvg\\|iconSvg\\|data(size)\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx | head -30"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":440,"limit":30}`

---

## Assistant

Now let me find where node sizing by in-degree is calculated:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"BASE_NODE_SIZE\\|in-degree\\|degree\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx | head -30"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx","offset":475,"limit":20}`

---

## Assistant

Perfect! Now I have enough information. Let me compile a comprehensive report.

## Comprehensive Analysis: Graph Node Labels, Icons, and Label Backgrounds

I've thoroughly explored the graph styling system. Here's the complete breakdown:

### 1. **Cytoscape Stylesheet Definitions (graphStyles.ts)**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`

**Node Label Properties** (lines 54-69):
- `font-size: "11px"` — base label font size (fixed)
- `color: "#cccccc"` — label text color (light gray)
- `text-valign: "bottom"` — vertical alignment (bottom of node)
- `text-halign: "center"` — horizontal alignment (centered)
- `text-margin-y: 5` — 5px margin below node
- `text-max-width: "100px"` — max label width before wrapping
- `text-wrap: "ellipsis"` — truncate with ellipsis if too long
- `min-zoomed-font-size: 14` — labels hidden until zoomed to ~127% (11px × 1.27 ≈ 14px threshold)

**Node Icon Properties** (lines 45-53):
- `width: "data(size)"` — dynamic width based on `data(size)` value
- `height: "data(size)"` — dynamic height based on `data(size)` value
- `background-image: "data(iconSvg)"` — SVG data URI from node data
- `background-fit: "contain"` — fit entire image within bounds
- `background-width: "100%"` — stretch to fill node width
- `background-height: "100%"` — stretch to fill node height
- `background-clip: "none"` — no clipping

**Label Background Properties** (lines 65-69):
- `text-background-color: "rgba(0,0,0,0.65)"` — dark semi-transparent black
- `text-background-opacity: 0.75` — 75% opacity
- `text-background-padding: "3px"` — 3px padding around label text
- `text-background-shape: "roundrectangle"` — rounded rectangle pill shape

### 2. **Node Sizing System**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`

**Base Node Size** (line 17):
```
const BASE_NODE_SIZE = 18;
```

**Dynamic Size Calculation** (line 481):
```typescript
n.data("size", Math.max(BASE_NODE_SIZE, BASE_NODE_SIZE + n.indegree(false) * 2));
```
- Default: 18px
- Scales by: +2px per incoming edge
- Minimum: 18px
- Formula: `18 + (in-degree × 2)`
- Result: nodes with more backlinks appear larger

**State Overrides** (lines 82-156 in graphStyles.ts):
- **Selected**: width: 28, height: 28
- **Highlighted** (hovered neighbor): width: 22, height: 22
- **Focus node** (graph focus mode): width: 32, height: 32
- **Home node** (index/entry point): width: 26, height: 26 + gold border

### 3. **Icon System (graphIcons.ts)**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts`

**SVG Data URI Generation** (lines 126-138):
- SVG size: fixed 24×24 viewBox
- Stroke width: 2 pixels
- Stroke color: dynamic (per note type color, or white for selected)
- Icons: 10 distinct Lucide React icons (lightbulb, book-open, help-circle, file-text, list, message-square, flask, test-tube, user, folder-kanban)

**Icon Rendering Flow** (GraphView.tsx lines 446-447):
```typescript
iconSvg: getNodeIconSvg(n.note_type, getNodeColor(n.note_type)),
iconSvgWhite: getNodeIconSvgWhite(n.note_type),
```
- Color matched to note type (12-color palette from `NOTE_TYPE_COLORS`)
- White variant cached separately for selected state

### 4. **Tooltip Settings in Settings Modal (SettingsModal.tsx)**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`

**UI Pattern** (lines 226-277):
- Section header: "Graph Tooltip"
- 5 independent range sliders:

| Label | Range | Default | Line(s) |
|-------|-------|---------|---------|
| Overall | 10-28 px | 18 px | 233-235 |
| Type pill | 8-24 px | 14 px | 241-244 |
| Links | 8-24 px | 14 px | 250-253 |
| Summary | 8-24 px | 15 px | 259-262 |
| Tags | 8-24 px | 14 px | 268-271 |

**Key Pattern**:
- Each slider triggers a `setTooltip*` function from UIStore
- "Overall" slider (line 233) triggers `setTooltipFontSize` which **scales all others proportionally**
- Individual sliders allow fine-tuning after overall adjustment
- "Reset tooltip to defaults" button (line 274) calls `resetTooltipPrefs()`

### 5. **UIStore Tooltip State (uiStore.ts)**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

**Constants** (lines 63-67):
```typescript
export const DEFAULT_TOOLTIP_SIZE = 18;
export const DEFAULT_TOOLTIP_PILL_SIZE = 14;
export const DEFAULT_TOOLTIP_CONNECTIONS_SIZE = 14;
export const DEFAULT_TOOLTIP_SUMMARY_SIZE = 15;
export const DEFAULT_TOOLTIP_TAG_SIZE = 14;
```

**PersistedPrefs Fields** (lines 119-123):
```typescript
tooltipFontSize?: number;
tooltipPillSize?: number;
tooltipConnectionsSize?: number;
tooltipSummarySize?: number;
tooltipTagSize?: number;
```

**UIState Fields** (lines 183-187):
```typescript
tooltipFontSize: number;
tooltipPillSize: number;
tooltipConnectionsSize: number;
tooltipSummarySize: number;
tooltipTagSize: number;
```

**Initial Values** (lines 382-386):
```typescript
tooltipFontSize: storedPrefs.tooltipFontSize ?? DEFAULT_TOOLTIP_SIZE,
tooltipPillSize: storedPrefs.tooltipPillSize ?? DEFAULT_TOOLTIP_PILL_SIZE,
tooltipConnectionsSize: storedPrefs.tooltipConnectionsSize ?? DEFAULT_TOOLTIP_CONNECTIONS_SIZE,
tooltipSummarySize: storedPrefs.tooltipSummarySize ?? DEFAULT_TOOLTIP_SUMMARY_SIZE,
tooltipTagSize: storedPrefs.tooltipTagSize ?? DEFAULT_TOOLTIP_TAG_SIZE,
```

**"Overall" Setter — Proportional Scaling** (lines 527-535):
```typescript
setTooltipFontSize: (v: number) => {
  const scale = v / DEFAULT_TOOLTIP_SIZE;  // ratio relative to default 18px
  const pill = Math.round(DEFAULT_TOOLTIP_PILL_SIZE * scale);
  const conn = Math.round(DEFAULT_TOOLTIP_CONNECTIONS_SIZE * scale);
  const summ = Math.round(DEFAULT_TOOLTIP_SUMMARY_SIZE * scale);
  const tag = Math.round(DEFAULT_TOOLTIP_TAG_SIZE * scale);
  set({ tooltipFontSize: v, tooltipPillSize: pill, tooltipConnectionsSize: conn, tooltipSummarySize: summ, tooltipTagSize: tag });
  savePrefs({ tooltipFontSize: v, tooltipPillSize: pill, tooltipConnectionsSize: conn, tooltipSummarySize: summ, tooltipTagSize: tag });
}
```

**Individual Setters** (lines 536-551):
- `setTooltipPillSize(v)` — updates only `tooltipPillSize`, saves to prefs
- `setTooltipConnectionsSize(v)` — updates only `tooltipConnectionsSize`, saves to prefs
- `setTooltipSummarySize(v)` — updates only `tooltipSummarySize`, saves to prefs
- `setTooltipTagSize(v)` — updates only `tooltipTagSize`, saves to prefs

**Reset** (lines 552-555):
```typescript
resetTooltipPrefs: () => {
  set({ 
    tooltipFontSize: DEFAULT_TOOLTIP_SIZE,
    tooltipPillSize: DEFAULT_TOOLTIP_PILL_SIZE,
    tooltipConnectionsSize: DEFAULT_TOOLTIP_CONNECTIONS_SIZE,
    tooltipSummarySize: DEFAULT_TOOLTIP_SUMMARY_SIZE,
    tooltipTagSize: DEFAULT_TOOLTIP_TAG_SIZE
  });
  savePrefs({ /* all defaults */ });
}
```

### 6. **CSS Variables Applied in App.tsx**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

**useEffect Hook** (lines 273-285):
```typescript
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty("--ui-font-family", uiFontFamily);
  root.style.setProperty("--ui-font-size", `${uiFontSize}px`);
  root.style.setProperty("--editor-font-family", editorFontFamily);
  root.style.setProperty("--editor-font-size", `${editorFontSize}px`);
  root.style.setProperty("--tooltip-font-size", `${tooltipFontSize}px`);
  root.style.setProperty("--tooltip-pill-size", `${tooltipPillSize}px`);
  root.style.setProperty("--tooltip-connections-size", `${tooltipConnectionsSize}px`);
  root.style.setProperty("--tooltip-summary-size", `${tooltipSummarySize}px`);
  root.style.setProperty("--tooltip-tag-size", `${tooltipTagSize}px`);
}, [uiFontFamily, uiFontSize, editorFontFamily, editorFontSize, tooltipFontSize, tooltipPillSize, tooltipConnectionsSize, tooltipSummarySize, tooltipTagSize]);
```

**Dependency Array**: All 5 tooltip size fields trigger re-render when changed

### 7. **CSS Variables Defaults in App.css**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Root Declarations** (lines 22-26):
```css
--tooltip-font-size: 18px;
--tooltip-pill-size: 14px;
--tooltip-connections-size: 14px;
--tooltip-summary-size: 15px;
--tooltip-tag-size: 14px;
```

### 8. **Graph Node Tooltip Rendering (GraphView.tsx)**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`

**State** (lines 211-221):
```typescript
const [tooltip, setTooltip] = useState<{
  x: number;
  y: number;
  label: string;
  noteType: string;
  color: string;
  connections: number;
  summary?: string;
  tags?: string[];
} | null>(null);
```

**Rendered JSX** (lines 872-891):
```jsx
{tooltip && (
  <div className="graph-node-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
    <div className="tooltip-header">
      <span className="tooltip-type-pill" style={{ background: tooltip.color }}>{tooltip.noteType}</span>
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

### 9. **Tooltip CSS Styling in App.css**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Tooltip Container** (lines 2026-2047):
```css
.graph-node-tooltip {
  position: absolute;
  z-index: 9999;
  pointer-events: none;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: var(--tooltip-font-size);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 380px;
  backdrop-filter: blur(10px);
  background: var(--glass-bg-dense);
  border: 1px solid var(--glass-border-strong);
}
```

**Sub-components** (lines 2048-2096):
- `.tooltip-header` (2048-2052): flex row, space-between, 8px gap
- `.tooltip-type-pill` (2054-2062): font-size `var(--tooltip-pill-size)`, padding 3px 10px, rounded pill
- `.tooltip-connections` (2063-2067): font-size `var(--tooltip-connections-size)`, muted color, no-wrap
- `.tooltip-title` (2068-2074): font-weight 600, ellipsis overflow
- `.tooltip-summary` (2075-2083): font-size `var(--tooltip-summary-size)`, 2-line clamp, secondary color
- `.tooltip-tags` (2084-2089): flex wrap, 3px gap
- `.tooltip-tag` (2090-2096): font-size `var(--tooltip-tag-size)`, padding 2px 6px, tertiary bg

---

## Complete Data Flow

**User adjusts "Overall" slider in Settings** 
→ `setTooltipFontSize(newValue)` in uiStore 
→ calculates proportional scale factor 
→ rounds and sets all 5 size fields 
→ calls `savePrefs()` to localStorage 
→ App.tsx useEffect detects change 
→ sets `--tooltip-font-size` CSS variable (and others)
→ CSS applies to `.graph-node-tooltip`, `.tooltip-type-pill`, `.tooltip-connections`, `.tooltip-summary`, `.tooltip-tag`
→ Tooltip re-renders with new sizes on next hover

All current default values, line numbers, and exact CSS properties are documented above.

---

