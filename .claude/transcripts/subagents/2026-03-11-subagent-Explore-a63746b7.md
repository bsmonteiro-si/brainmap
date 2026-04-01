# 2026-03-11 — Subagent Transcript: Explore

**Date:** 2026-03-11 14:33:19
**Agent:** Explore
**Agent ID:** a63746b71073c7a9f
**Parent Session:** d7eab5ae-10f3-42af-9241-01d1073ad22b

---

## User

Find the components for the metadata panel, related notes panel, and search panel in the BrainMap desktop app at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/. I need to understand:

1. Where these panels are defined (file paths)
2. How their expanded/collapsed state is managed (is there a state variable, store, or default prop?)
3. Any collapsible/expandable UI pattern they use (accordion, toggle, etc.)

Search thoroughly in crates/app/src/components/ and crates/app/src/stores/.

---

## Assistant

I'll search thoroughly for the metadata panel, related notes panel, and search panel components in the desktop app.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.tsx\" -o -name \"*.ts\" | head -50"}`

---

## Assistant

Let me search more specifically in the src/ directory:

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

Great! Now let me search for InspectorPanel and other panels. Let me look for all component files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components -type f \\( -name \"*.tsx\" -o -name \"*.ts\" \\) | sort"}`

---

## Assistant

I see SearchPanel. Now let me search for "InspectorPanel" or "MetadataPanel" or "RelatedNotes":

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"InspectorPanel|MetadataPanel","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src"}`

---

## Assistant

Let me read the EditorPanel to understand the structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx"}`

---

## Assistant

Now let me check the FrontmatterForm and look for other metadata-related components:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"expanded|collapsed|toggle","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","output_mode":"files_with_matches"}`

---

## Assistant

Now let me check the uiStore and graphStore to understand all the state management:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

Perfect! Now let me check the AppLayout to see how all panels are assembled:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

Excellent! Now let me check if there are any CSS files to understand the styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" | sort"}`

---

## Assistant

Let me read the CSS to understand the styling patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":300}`

---

## Assistant

Let me continue reading the CSS and search for more panel-related styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":300,"limit":300}`

---

## Assistant

Perfect! Now let me get the rest of the CSS and search for related-notes styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":600}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile the comprehensive findings:

## Summary

I've thoroughly explored the BrainMap desktop app components and found the three panels you asked about. Here's the complete breakdown:

### 1. **Metadata Panel (FrontmatterForm)**

**File Path:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx`

**State Management:**
- Uses local component state with `useState(true)` (expanded by default)
- No Zustand store integration
- `expanded` state controls visibility of metadata fields

**Collapsible Pattern:**
- Click-to-toggle accordion pattern
- Button with class `section-toggle` displays chevron: `{expanded ? "▾" : "▸"}`
- `aria-expanded={expanded}` attribute for accessibility
- Metadata displays when `expanded === true`
- Fields shown: Title, Type, Tags, Status, Source (if present)

**CSS Classes:**
- `.frontmatter-form` - Container (flex column, background secondary)
- `.section-toggle` - Button (width 100%, text-align left)
- `.frontmatter-fields` - Content wrapper (hidden when collapsed)

---

### 2. **Related Notes Panel (RelatedNotesFooter)**

**File Path:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/RelatedNotesFooter.tsx`

**State Management:**
- Uses local component state: `expanded` and `showAll` (both useState)
- Initially collapsed (`expanded = false`)
- `showAll` resets when active note changes
- No Zustand store integration

**Collapsible Pattern:**
- Click-to-toggle accordion
- Button displays chevron: `{expanded ? "▾" : "▸"}`
- Shows 10 related notes by default, "Show X more…" button reveals rest
- Returns `null` if no activeNote or no related notes

**Related Notes Display:**
- Shows both outgoing (→) and incoming (←) relationships
- Each item displays: direction arrow, relationship type (rel badge), and title
- Related notes rendered as clickable items to jump between notes

**CSS Classes:**
- `.related-notes-footer` - Container (border-top, background secondary)
- `.related-notes-toggle` - Toggle button
- `.related-notes-list` - Content (max-height 180px, overflow-y auto)
- `.related-note-item` - Individual link item

---

### 3. **Search Panel (SearchPanel)**

**File Path:**
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Search/SearchPanel.tsx`

**State Management:**
- Uses Zustand store: `expanded` state from `useUIStore`
- Exposes `toggleSearchExpanded()` action to toggle state
- **Initial state:** `searchExpanded: true` (expanded by default)
- Managed in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` (line 142)

**Collapsible Pattern:**
- Click-to-toggle accordion
- Button with class `section-toggle` displays chevron: `{expanded ? "▾" : "▸"}`
- `aria-expanded={expanded}` for accessibility
- Uses `aria-controls="search-content"` pattern
- Search input and filters hidden when not expanded

**Features:**
- Search input (debounced 300ms)
- Type filter dropdown (dropdown populated from workspace noteTypes)
- Result display with title, type badge, and snippet
- Click to select and open note

**Layout Integration:**
- Panel managed by AppLayout with ResizablePanel
- Has `collapsible`, `collapsedSize="28px"` attributes
- Panel state synced to Zustand via `panelSizes.search`

**CSS Classes:**
- `.search-panel` - Container (flex column)
- `.section-toggle` - Toggle button
- `#search-content` - Content wrapper (flex column, flex: 1)
- `.search-input-bar` - Search controls
- `.search-results` - Results container (flex: 1, overflow auto)
- `.search-result-item` - Individual result

---

### **Layout Assembly**

All three panels are composed in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx`:

- **EditorPanel** (contains Metadata + Related Notes): Right-center panel (60% default)
- **SearchPanel**: Right-bottom panel (40% default, collapsible)
- Panels use `react-resizable-panels` library with horizontal and vertical separators
- Panel sizes persisted via `useUIStore.panelSizes` to localStorage (`brainmap:panelSizes`)

---

### **Key Patterns**

1. **Metadata** - Local state, always visible by default
2. **Related Notes** - Local state, hidden by default, smart pagination
3. **Search** - Zustand store, visible by default, synced to layout engine

All three use the same `.section-toggle` CSS pattern for their collapsible headers, providing visual consistency across the app.

---

