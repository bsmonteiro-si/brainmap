# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 14:56:25
**Agent:** Explore
**Agent ID:** a25b0e6021f61fd82
**Parent Session:** c355e4cd-4ac3-4961-a1fd-3225a475b274

---

## User

I need to understand two things:

1. **How graph nodes are currently rendered** in the Cytoscape.js graph — specifically how node shapes are assigned by note type. Look at graph styles, shapes, and any related config in `crates/app/src/`.

2. **How file tree icons work** — specifically the `fileTreeIcons.tsx` file and how icons are mapped to note types using Lucide React icons.

Search for:
- `fileTreeIcons.tsx` — the icon mapping for the Files view
- Graph styles — look for node shape definitions, `graphStyles` or similar
- Any mapping of note types to visual properties (shapes, colors, icons)

Be thorough — show me the relevant code sections for both the graph node shapes and the file tree icons.

---

## Assistant

I'll search for the graph node rendering and file tree icon implementations.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*fileTreeIcons*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*graphStyles*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*graphStyle*"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"node.*shape|shape.*node|registerShape|registerNodeShape","path":"crates/app/src"}`

---

## Assistant

Now let me read the file tree icons file and graph styles file:

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

Perfect! Let me also check how the graph nodes are initialized with these shapes and colors:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"getNodeShape|getNodeColor|NOTE_TYPE_SHAPES","path":"crates/app/src/components/GraphView","output_mode":"content","context":3}`

---

## Assistant

Now let me check the GraphLegend component to see the full shape rendering:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx"}`

---

## Assistant

Perfect! Now I have all the information. Let me provide a comprehensive summary:

## Summary: Graph Node Rendering and File Tree Icons

### 1. File Tree Icons (`fileTreeIcons.tsx`)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx`

**Note Type Icon Mapping** (Lucide React icons):
```typescript
const NOTE_TYPE_ICONS: Record<string, LucideIcon> = {
  concept: Lightbulb,
  "book-note": BookOpen,
  question: HelpCircle,
  reference: FileText,
  index: List,
  argument: MessageSquare,
  evidence: FlaskConical,
  experiment: TestTube,
  person: User,
  project: FolderKanban,
  folder: Folder,
};
```

**Key Components:**
- `getIconForType(noteType)` — returns the appropriate Lucide icon for a note type (fallback: `File`)
- `NoteTypeIcon` — React component that renders an icon with the corresponding `getNodeColor()` color and configurable size (default 14px)
- `FolderTreeIcon` — renders a folder icon (open/closed states) in secondary text color
- `ChevronIcon` — render chevron for expand/collapse with CSS class toggle for animation

---

### 2. Graph Styles and Node Shapes (`graphStyles.ts`)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`

**Color Palette** (all 11 note types):
```typescript
export const NOTE_TYPE_COLORS: Record<string, string> = {
  concept: "#4a9eff",
  "book-note": "#f39c12",
  question: "#9b59b6",
  reference: "#7f8c8d",
  index: "#1abc9c",
  argument: "#e74c3c",
  evidence: "#27ae60",
  experiment: "#e67e22",
  person: "#e91e63",
  project: "#00bcd4",
  folder: "#8e8e93",
};
```

**Shape Mapping** (all native Cytoscape shapes):
```typescript
const NOTE_TYPE_SHAPES: Record<string, string> = {
  concept: "ellipse",
  "book-note": "roundrectangle",
  question: "diamond",
  reference: "rectangle",
  index: "star",
  argument: "triangle",
  evidence: "pentagon",
  experiment: "hexagon",
  person: "octagon",
  project: "tag",
  folder: "barrel",
};
```

**Node Rendering Details:**
- Shape is applied via Cytoscape data property: `shape: "data(shape)"` in stylesheet
- Color is applied via: `"background-color": "data(color)"`
- Node size is dynamic: `width: "data(size)"` and `height: "data(size)"` (sized by in-degree)
- Labels appear when zoomed past ~127% (`min-zoomed-font-size: 14`)
- Glow effect applied via shadow: `shadow-blur: 10`, `shadow-color: data(color)`, `shadow-opacity: 0.7`
- Label background: rounded pill with dark semi-transparent background (`rgba(0,0,0,0.65)`)

**Graph Initialization** (from `GraphView.tsx`):
```typescript
data: {
  id: n.path,
  label: n.title,
  color: getNodeColor(n.note_type),
  noteType: n.note_type,
  shape: getNodeShape(n.note_type),
  size: 8,  // base size, scaled by in-degree
}
```

---

### 3. Graph Legend (`GraphLegend.tsx`)

**Location:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphLegend.tsx`

**SVG Shape Paths** (for legend display):
Each shape has an SVG path definition for rendering a small 10×10 preview in the legend:
- Ellipse, rounded rectangle, diamond, rectangle, star, triangle, pentagon, hexagon, octagon, tag, and (implicitly) barrel

The legend iterates through all `NOTE_TYPE_COLORS` entries and displays each type with its color and shape using the `ShapeIcon` component.

---

### Integration Points

1. **`fileTreeIcons.tsx`** imports `getNodeColor` from `graphStyles.ts` to ensure consistent colors across file tree and graph
2. **`GraphView.tsx`** imports both `getNodeColor` and `getNodeShape` to initialize node data properties
3. **`GraphLegend.tsx`** imports `getNodeShape` and `NOTE_TYPE_COLORS` to display the complete type palette
4. **Unified palette:** Both file tree icons and graph nodes use the same canonical color mapping to ensure visual consistency

All 11 note types (including the virtual "folder" type) have consistent icon, color, and shape assignments across the UI.

---

