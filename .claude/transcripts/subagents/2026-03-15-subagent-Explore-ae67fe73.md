# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 09:38:03
**Agent:** Explore
**Agent ID:** ae67fe737d4292088
**Parent Session:** bc0b2030-baf9-46cb-9e50-475bf12fe6d5

---

## User

Explore the graph rendering and styling code in the BrainMap desktop app to understand how node visual properties are applied. Look at:

1. `crates/app/src/components/GraphView.tsx` or similar - the main graph component
2. Any graph styles files (graphStyles.ts, graphConfig.ts, etc.)
3. How Cytoscape.js styles are built - especially node size, labels, colors, icons
4. How settings/preferences from the store are consumed to configure node appearance
5. Any reactive hooks or effects that update graph styles when settings change

Search in `crates/app/src/` for files related to graph rendering, node styling, and settings consumption. Look for patterns like `useUIStore`, `uiPrefs`, node size settings, label visibility settings, tooltip settings, etc.

---

## Assistant

I'll help you explore the graph rendering and styling code. Let me search through the relevant files systematically.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.ts"}`

---

## Assistant

Now let me search for graph-related styling and configuration files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts"}`

---

## Assistant

Now let me check the UI store and related settings:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

Let me continue reading the uiStore to see how settings are persisted and used:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":200,"limit":200}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"showEdgeLabels|showLegend|showClusterHulls|showEdgeParticles|showMinimap","type":"ts","path":"crates/app/src/stores"}`

---

## Assistant

Let me get more of the uiStore and check the GraphLegend component:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":400,"limit":300}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

Let me check for CSS files and look at how the graph styles are applied in the app:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -name \"*.css\" -o -name \"*.scss\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":300}`

---

## Assistant

Let me continue reading the CSS file to see the graph-related styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":300,"limit":400}`

---

## Assistant

Let me continue reading the CSS to see graph-specific styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"graph-\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1950,"limit":300}`

---

## Assistant

Perfect! Now let me check how the theme is applied at runtime and look for any additional responsive patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-theme|effectiveTheme|--ui-font|--editor-font|--tooltip|document\\.documentElement","type":"tsx","path":"crates/app/src","head_limit":30}`

---

## Assistant

Let me search more specifically for where the CSS variables are set at runtime:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":100,"limit":200}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -rn \"setProperty\\|data-theme\\|documentElement.style\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src --include=\"*.tsx\" --include=\"*.ts\" | head -30"}`

---

## Assistant

Perfect! Now let me check one more file to see the SettingsModal to understand how users configure these settings:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx","limit":250}`

---

## Assistant

Excellent! I now have a comprehensive understanding of the graph rendering and styling system. Let me compile my findings:

## Summary: BrainMap Graph Rendering & Styling Architecture

I've thoroughly explored the graph rendering and styling codebase. Here's a comprehensive overview:

### 1. **Main Graph Component: `GraphView.tsx`**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`

- Initializes Cytoscape.js instance with fcose and dagre layout plugins
- Manages node/edge data syncing from graph store
- Implements 5 different graph layouts: force, hierarchical, radial, concentric, grouped-by-type
- Handles interactive features: selection, hover effects, context menus, tooltips
- Manages overlay canvases for cluster hulls and edge particles
- Features a minimap (read-only Cytoscape instance)
- Applies edge gradient coloring imperatively (data mappers don't work for gradients in Cytoscape)
- Node sizing based on in-degree: `Math.max(BASE_NODE_SIZE, BASE_NODE_SIZE + indegree * 2)`

### 2. **Graph Styling: `graphStyles.ts`**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`

**Color Palette:**
```
concept: #4a9eff (blue)
book-note: #f39c12 (orange)
question: #9b59b6 (purple)
reference: #7f8c8d (gray)
index: #1abc9c (teal)
argument: #e74c3c (red)
evidence: #27ae60 (green)
experiment: #e67e22 (orange-brown)
person: #e91e63 (pink)
project: #00bcd4 (cyan)
folder: #8e8e93 (gray) — virtual nodes
```

**Cytoscape Stylesheet Features:**
- All nodes use `ellipse` shape with Lucide SVG icons as background images
- Base node size: 18px, grows with in-degree
- Labels hidden until ~127% zoom (`min-zoomed-font-size: 14`)
- Glowing shadow effect (blur 10, color data-bound)
- Label background pills (dark semi-transparent)
- Edge line-opacity: 0.35 (thin, semi-transparent)
- Edge types: dashed (Implicit), dotted (Inline), solid (Explicit)
- Hover effects dim non-neighbors to 12% opacity
- Selected nodes: 28px with enhanced glow
- Home nodes: gold border + glow (#ffd700)
- Focus nodes: 32px with bright glow

### 3. **Graph Icons: `graphIcons.ts`**

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts`

- SVG data URI generator for Lucide React icons
- Extracts icon paths for each note type
- Colored stroke (note type color) + white variant for selected nodes
- Caching: keyed by `"noteType|color"` for colored, by noteType for white
- Used imperatively in GraphView: `getNodeIconSvg(noteType, color)` and `getNodeIconSvgWhite(noteType)`

### 4. **Styling System: `uiStore.ts` + `App.tsx`**

**Storage:** Zustand store with localStorage persistence (`brainmap:uiPrefs`)

**CSS Variable Mapping (set at runtime via `App.tsx` lines 276-284):**
```javascript
--ui-font-family: uiFontFamily
--ui-font-size: uiFontSize + "px"
--editor-font-family: editorFontFamily
--editor-font-size: editorFontSize + "px"
--tooltip-font-size: tooltipFontSize + "px"
--tooltip-pill-size: tooltipPillSize + "px"
--tooltip-connections-size: tooltipConnectionsSize + "px"
--tooltip-summary-size: tooltipSummarySize + "px"
--tooltip-tag-size: tooltipTagSize + "px"
```

**Theme System:**
- Global theme set via `data-theme` attribute on `document.documentElement`
- 8 theme options: light, dark, dracula, solarized-light, solarized-dark, nord, tokyo-night, one-dark
- Per-panel overrides: Files panel and Editor panel can inherit or override global theme
- CSS custom properties for all color variables: `--bg-primary`, `--text-primary`, `--accent`, etc.

**Zoom:** Applied at document root level (`document.documentElement.style.zoom`) to preserve Cytoscape mouse hit-testing accuracy.

### 5. **Graph Control Features**

**GraphToolbar** (`GraphToolbar.tsx`):
- Toggle edge labels (appear at ~80% zoom+ auto or manual toggle)
- Toggle legend (color swatches for all note types)
- 5 layout options (dropdown)
- Edge type filter (popover with checkboxes for shown/hidden edge types)
- Minimap toggle
- Cluster hulls toggle (convex hull visualization by type)
- Edge particles toggle (directional animation on edges)
- Home note button (radial layout centered on home note)
- Focus clear button (× button when focus mode active)

**GraphLegend** (`GraphLegend.tsx`):
- Glassmorphic overlay (backdrop-filter blur 10px)
- Shows all note type icons + colored pills + labels
- Positioned top-right, dismissible via toolbar toggle

### 6. **Interactive Features**

**Node Hover:**
- Neighborhood highlight: dims non-neighbors to 12% opacity
- Pulse glow effect (shadow-blur increased)
- Lazy-loaded rich tooltip: type pill, title, connection count, tags, summary
- Tooltip cache per node path

**Node Selection:**
- White icon on type-colored circle background (inverted)
- Neighborhood highlight (same as hover)
- Connected edges highlighted
- Stored in editor state, reflected in graph

**Context Menu:**
- Right-click node → "Focus in Graph", "Set as Home Note" / "Unset"
- Folder nodes skip home note option
- Click-outside or Escape dismisses

**Layout Transitions:**
- Animated (500ms ease-in-out-sine) on layout change
- Different params for each layout type:
  - **Force**: 75000 node repulsion, 280 edge length, 2500 iterations
  - **Hierarchical**: Dagre plugin, LR direction, 120 rank separation
  - **Radial**: Breadthfirst with circle option, centered on home or most-connected
  - **Concentric**: Ring layout by degree
  - **Grouped**: Pre-positioned type clusters, then fcose with gravity 0.25

### 7. **CSS Structure: `App.css`**

**Theme Variables** (lines 1-210):
- 8 theme blocks with complete color palettes
- Glassmorphism variables for modals/tooltips
- Light, dark theme variants for glass effects

**Graph-Specific Classes** (lines 294-2156):
- `.graph-container`: Dark background (#13131a)
- `.graph-toolbar`: Glassmorphic (blur 12px, theme-aware colors)
- `.graph-legend`: Positioned overlay, theme-aware
- `.graph-node-tooltip`: Glassmorphic, font-size driven by CSS vars
- `.graph-canvas-overlay`: For hulls and particles
- `.graph-stats`: Node/edge count display
- `.graph-minimap`: 160×110px read-only view

### 8. **Settings Modal: `SettingsModal.tsx`**

**Configurable UI Elements:**
- **Appearance:** Theme (system/8 options), per-panel theme override
- **Panel Layout:** Content/editor proportions for files/graph/search tabs (10-90% range)
- **Editor Font:** Family (presets + custom), size (10-28px), line numbers toggle
- **Interface Font:** Family (presets + custom), size (10-20px)
- **Graph Tooltip:** Overall size (10-28px), type pill size, links, summary, tags (independent scales)
- Reset buttons for fonts and layout

All settings persisted to localStorage and applied reactively via Zustand subscribers.

### Key Architectural Insights

1. **Separation of Concerns:**
   - Data rendering (GraphView) separate from styling (graphStyles.ts)
   - Icon generation isolated (graphIcons.ts)
   - Settings UI decoupled from business logic (useUIStore)

2. **Performance Optimizations:**
   - Icon caching by type|color combination
   - Staggered node entrance animation (first load only)
   - Lazy tooltip enrichment via async API calls
   - Canvas-based overlays (hulls, particles) for minimal reflow
   - Minimap only instantiated when visible

3. **Reactivity Pattern:**
   - UIStore subscribes trigger React effect hooks
   - Effects update Cytoscape state imperatively or apply CSS variables
   - Zustand selectors provide granular subscriptions (not re-rendering on unrelated changes)

4. **Theme Integration:**
   - CSS custom properties enable per-theme styling
   - Glassmorphism effects consistent across light/dark themes
   - Runtime zoom applied at root for correct hit-testing with Cytoscape

---

