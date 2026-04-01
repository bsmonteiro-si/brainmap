# 2026-03-13 — Subagent Transcript: Explore

**Date:** 2026-03-13 14:44:51
**Agent:** Explore
**Agent ID:** a19bcc4494ed827bf
**Parent Session:** c02fcf0e-8ccb-4809-9cea-1b2a5005ee83

---

## User

Explore the BrainMap desktop app to understand:

1. How the existing graph styles and type-color system works — find `getNodeColor` or similar color utilities
2. The icon system — are they using Lucide React? Find `fileTreeIcons.tsx` and see how icons are mapped
3. Any existing blockquote styling in CSS files
4. The overall component structure in `crates/app/src/` — what directories exist, how components are organized
5. Find the main CSS/styling files for the editor preview area

Read full contents of: fileTreeIcons.tsx, any graph color/style utilities, and the main editor CSS files.

---

## Assistant

I'll explore the BrainMap desktop app to understand the styling system, icon mappings, and component structure. Let me start by examining the codebase.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.css\" | head -50"}`

---

## Assistant

Let me look at the source structure more carefully:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.tsx\" -o -name \"*.ts\" -o -name \"*.css\" \\) | grep -v node_modules | sort"}`

---

## Assistant

Now let me read the key files to understand the styling and color system:

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Now let me search for blockquote styling and editor CSS:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"blockquote","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

Let me read the full App.css file to see the blockquote styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"blockquote\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1320,"limit":100}`

---

## Assistant

Let me search for heading styles and look at editor-specific CSS:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"^\\.md-preview h[1-6]\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1260,"limit":140}`

---

## Assistant

Now let me check the editor panel and component structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type d | sort"}`

---

## Assistant

Let me look at the editor CSS styling more thoroughly:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"^\\.editor-\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":196,"limit":150}`

---

## Assistant

Let me also check the editor body styling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":731,"limit":80}`

---

## Assistant

Perfect. Now let me check one more thing - look at how the graph themes work in the frontend:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"data-theme\\|Theme\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx | head -20"}`

---

## Assistant

Excellent! Now let me compile the full findings. Let me read the full summary:

## Exploration Complete

I've thoroughly explored the BrainMap desktop app styling system. Here's what I found:

### 1. **Color System & Icon Mapping**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx`

The app uses **Lucide React** icons with a unified color system:
- 10 note type icons mapped via `NOTE_TYPE_ICONS` (Lightbulb, BookOpen, HelpCircle, FileText, List, MessageSquare, FlaskConical, TestTube, User, FolderKanban)
- Fallback: `File` icon
- Colors pulled from `getNodeColor(noteType)` utility function
- Folder icons: `FolderOpen` / `Folder` (closed) with `var(--text-secondary)` color
- `NoteTypeIcon` component renders any note type icon with colors
- `FolderTreeIcon` for folder state
- `ChevronIcon` for expand/collapse with CSS class `.tree-chevron-icon`

### 2. **Graph Styles & Color Palette**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`

Canonical color palette:
```
concept:     "#4a9eff" (blue)
book-note:   "#f39c12" (orange)
question:    "#9b59b6" (purple)
reference:   "#7f8c8d" (gray)
index:       "#1abc9c" (teal)
argument:    "#e74c3c" (red)
evidence:    "#27ae60" (green)
experiment:  "#e67e22" (light orange)
person:      "#e91e63" (pink)
project:     "#00bcd4" (cyan)
folder:      "#8e8e93" (folder gray)
```

Node shape mapping (native Cytoscape shapes):
- concept → ellipse
- book-note → roundrectangle
- question → diamond
- reference → rectangle
- index → star
- argument → triangle
- evidence → pentagon
- experiment → hexagon
- person → octagon
- project → tag
- folder → barrel

Graph styling includes:
- 6px base node size (scales by in-degree via `data(size)`)
- Glow shadow effect with `shadow-blur: 10, shadow-opacity: 0.7`
- Label background pills (`text-background-color: rgba(0,0,0,0.65)`)
- Labels hidden until ~127% zoom (`min-zoomed-font-size: 14`)
- Thin semi-transparent edges (`line-opacity: 0.35`, width `0.8`)
- Vee arrowheads with `arrow-scale: 0.6`
- Edge gradients applied imperatively (not CSS, because Cytoscape doesn't support data() mappers in gradients)
- Focus mode: focal node gets `width: 20, height: 20, border-width: 2.5, border-color: #ffffff`
- Hover neighborhood: non-neighbors dim to `opacity: 0.25`

### 3. **Theme Variables & CSS Structure**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

CSS variables defined in `:root` (default light mode):
```
--bg-primary:     #ffffff
--bg-secondary:   #f5f5f5
--bg-tertiary:    #e8e8e8
--text-primary:   #1a1a1a
--text-secondary: #555555
--text-muted:     #888888
--border-color:   #ddd
--accent:         #4a9eff (primary blue, matches concept color)
--accent-hover:   #3a8eef
--danger:         #e74c3c (matches argument color)
--success:        #27ae60 (matches evidence color)
--warning:        #f39c12 (matches book-note color)
--ui-font-family:      system-ui defaults
--ui-font-size:        13px
--editor-font-family:  monospace
--editor-font-size:    14px
--editor-inset-shadow: inset 0 1px 3px rgba(0,0,0,0.06)
```

Dark mode (`[data-theme="dark"]`) overrides all variables with inverted colors.

Derived variables (`:root` second block):
```
--ui-font-lg: calc(var(--ui-font-size) + 1px)    // 14px
--ui-font-sm: calc(var(--ui-font-size) - 1px)    // 12px
--ui-font-xs: calc(var(--ui-font-size) - 2px)    // 11px
```

### 4. **Editor Preview & Blockquote Styling**

**Lines 1327-1335 in App.css:**
```css
.md-preview blockquote {
  border-left: 3px solid var(--accent);
  margin: 0 0 1em;
  padding: 8px 12px 8px 16px;
  color: var(--text-secondary);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border-radius: 0 4px 4px 0;
}
.md-preview blockquote p { margin: 0; }
```

Blockquotes have:
- Left blue accent border (3px)
- 6% accent color background tint (via `color-mix`)
- Subtle padding (8px top/bottom, 16px left)
- Right-side border-radius (rounded on right side only)
- Secondary text color for the quote content

**Heading styles (lines 1268-1284):**
- All headings: 85% text color mixed with accent (tinted)
- h1: 1.6em, no left border
- h2/h3: 1.3em/1.1em with 3px left accent border + 10px padding
- h4-h6: 1em, no special styling
- All have `font-weight: 600, line-height: 1.3, margin: 1.4em 0 0.5em`

### 5. **Component Structure**

**Directory layout:**
```
crates/app/src/
  ├── components/
  │   ├── CommandPalette/
  │   ├── Editor/              (MarkdownEditor, MarkdownPreview, FrontmatterForm, etc.)
  │   ├── GraphView/          (GraphView, GraphLegend, GraphToolbar, etc.)
  │   ├── Layout/             (FileTreePanel, SegmentPicker, CreateFolderDialog, etc.)
  │   ├── Search/
  │   ├── Settings/
  │   └── StatusBar/
  ├── stores/                 (Zustand stores: editorStore, graphStore, uiStore, etc.)
  ├── utils/                  (Utilities: resolveNotePath, logger, fuzzyMatch, etc.)
  ├── api/                    (Bridge pattern: bridge.ts, tauri.ts, mock/)
  ├── hooks/
  └── App.tsx, App.css, main.tsx
```

### 6. **Editor Panel Architecture**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx`

The editor has:
- Hero header (`.editor-hero`) with title, type pill, status dot, source attribution
- View toggle buttons: Edit/Preview modes
- Focus mode button (⤢/⤣ symbols)
- Two-layer opacity-based transition between edit & preview (both mounted simultaneously)
- Metadata section with frontmatter form
- Related notes footer
- Editor toolbar with formatting buttons
- 1.4em title size, large colored type pill
- `.editor-body` with flex layout and inset shadow

### 7. **MarkdownPreview Component**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`

- Uses `react-markdown` + `remark-gfm` for parsing
- Custom link handler for internal note navigation (triggers `selectNode()` + `openNote()`)
- External links open with `target="_blank"`
- `.md-preview` wrapper div receives all styles
- Custom `components` prop to override default renderers

### Summary

The BrainMap app has a **unified, consistent design system**:
- **Single color palette** in `graphStyles.ts` used everywhere (graph nodes, file tree icons, theme accents)
- **CSS variables** for theme flexibility (light/dark toggle via `data-theme` attribute)
- **Icon system** leverages Lucide React with automatic color mapping
- **Preview styling** uses accent colors for blockquotes, headings, links
- **Type-color correlation**: concept (blue) is the primary accent; danger (red), success (green), warning (orange) match argument, evidence, book-note colors

All paths are absolute from the codebase root.

---

