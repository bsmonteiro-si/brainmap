# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 16:42:25
**Agent:** Explore
**Agent ID:** ad6926d0588f132f2
**Parent Session:** f677a8ff-6516-4865-b3c8-dfc9f49743e0

---

## User

Explore the BrainMap project for:

1. The data model spec at `docs/02-data-model.md` - what edge types and note types exist, especially anything related to references or citations
2. The CSS/styling for the editor area - look in `crates/app/src/` for CSS files related to the editor, any custom styling for inline elements
3. How the existing `[[wiki-link]]` or note link syntax works end-to-end (if it exists) - from the editor through to the core parser
4. The frontmatter fields and how `source` is currently used

Search for patterns like "cite", "ref", "source", "wiki", "link" in the codebase.

---

## Assistant

I'll help you explore the BrainMap project for information about the data model, editor styling, wiki-link syntax, and frontmatter fields. Let me start by searching across the codebase systematically.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cite|citation|reference|ref","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","type":"rust"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"wiki.*link|link.*wiki|\\[\\[.*\\]\\]","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","type":"rust"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"source|frontmatter","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","type":"rust","head_limit":30}`

---

## Assistant

Great start! I have the data model spec. Now let me search for the link parser, CSS for the editor, and how the `source` field is used in practice.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"mention|link|markdown|extract.*link|parse.*link","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","type":"rust","output_mode":"content","context":5}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*Editor*.tsx"}`

---

## Assistant

Now let me search for the CSS and examine the model more closely to understand inline links and the source field:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"InlineLink|mentioned-in","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","type":"rust","output_mode":"content","context":3}`

---

## Assistant

Let me search for more editor-related files to understand the styling better:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.css"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.md|markdown|link|href","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"typescript","head_limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/LinksEditor.tsx","limit":80}`

---

## Assistant

Let me check the index and workspace files to understand how mentioned-in edges work:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"mentioned-in|inline.*link","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs","output_mode":"content","context":5,"head_limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/*.md"}`

---

## Assistant

Now let me check the cmLinkNavigation file to see how links are handled in the editor:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sourced-from|source","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed","head_limit":20}`

---

## Assistant

Let me look at a seed file example and search for how the source field is actually used:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causal Inference.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"source:\\s*[\"\\']","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed","output_mode":"content","head_limit":15}`

---

## Assistant

Perfect! Now let me check if there's a view of the editor with frontmatter:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"source|Source","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor","output_mode":"content","head_limit":20}`

---

## Assistant

Now let me check the app CSS and search for any styling related to editor panels:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1,"limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"editor-panel|frontmatter","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","type":"css","head_limit":10}`

---

## Assistant

Let me read more of the CSS file to find editor panel styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"editor-panel\\|frontmatter\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -40"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" -o -name \"*Editor*.module.css\" 2>/dev/null"}`

---

## Assistant

Let me read the CSS sections I found:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":371,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":628,"limit":150}`

---

## Assistant

Perfect! Now I have enough information. Let me compile a comprehensive report for the user.

## Exploration Report: BrainMap Data Model, Editor, and Link System

I've thoroughly explored the BrainMap codebase and compiled the key findings across the four areas you requested:

### 1. **Data Model Specification** (`docs/02-data-model.md`)

**Note Types** (11 types):
- concept, book-note, question, reference, index, argument, evidence, experiment, person, project
- Custom types are auto-registered on first use with a warning

**Edge Types** (15 types):
- **Hierarchical**: contains, part-of
- **Causal/Logical**: causes, supports, contradicts, extends, depends-on, exemplifies
- **Temporal**: precedes, leads-to, evolved-from
- **Associative**: related-to, authored-by, sourced-from
- **Inline (system-generated)**: mentioned-in

**Frontmatter Fields**:
- **Required**: id (UUID, auto-generated), title, type, created, modified
- **Optional**: tags (string[]), status (draft|review|final|archived), source (string), summary (string), links (TypedLink[])
- **Type-specific**: Extra fields stored in a flattened HashMap (e.g., domain, maturity, aliases for concepts; chapter, page-range for book-notes)

**Citation/Reference Handling**:
- `source` field is a free-text string (e.g., "The Book of Why, Ch.1" or "General knowledge; not directly from The Book of Why") — shown in the frontmatter form with placeholder "Source reference…"
- `sourced-from` edge type exists for explicit relationships to reference notes
- Seeds use `source` extensively to track origins (file at `/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causal Inference.md` has `source: The Book of Why, Introduction + Ch1`)

---

### 2. **Link Parsing & Inline Links** (End-to-End)

**Parser** (`crates/core/src/parser.rs`):
- Extracts inline links using regex: `\[([^\]]*)\]\(([^)]+\.md)\)` (standard markdown link syntax)
- Creates `InlineLink` structs with: target (normalized path), label (optional), position (byte offset)
- Inline links are stored separately from frontmatter links in the `Note` struct

**Model** (`crates/core/src/model.rs`):
```rust
pub struct InlineLink {
    pub target: String,           // normalized workspace-relative path
    pub label: Option<String>,    // link text
    pub position: usize,          // byte position in body
}
```

**Graph Edge Generation** (`crates/core/src/workspace.rs`):
- Inline links are converted to `Edge` with `rel: "mentioned-in"` and `kind: EdgeKind::Inline`
- Stored in the graph but visually distinguished (dashed line, muted color per data model spec) from explicit typed edges

**Editor Support** (`crates/app/src/components/Editor/cmLinkNavigation.ts`):
- Cmd+Click (or Ctrl+Click) on markdown links `[label](path)` navigates to the linked note
- Class `.cm-cmd-link-hover` applied when hovering over link with Cmd held
- Uses CodeMirror extension system with DOM event handlers for click/mousemove
- Links are resolved from relative paths using `resolveNotePath()` utility

**Frontmatter Links**:
- Stored as `TypedLink` objects with `target` (path or UUID) and `rel` (relationship type)
- Editable in the FrontmatterForm via `LinksEditor` component
- Excludes auto-generated types (contains, part-of, mentioned-in) from user selection

---

### 3. **CSS/Styling for Editor**

**Location**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css`

**Editor Panel** (lines 371–493):
```css
.editor-panel-container { /* Flex column, full height */
.editor-panel { /* Main content area, flex column */
.editor-placeholder { /* Loading state */
.editor-empty-state { /* No note selected */
```

**Frontmatter Styling** (lines 628–777):
```css
.frontmatter-form { 
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.frontmatter-fields {
  padding: 4px clamp(16px, 3%, 40px) 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.frontmatter-form label { /* Title, Type, Status, etc. */
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ui-font-sm);
}

.frontmatter-form input,
.frontmatter-form select {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.frontmatter-form textarea { /* Summary */
  min-height: 48px;
  resize: vertical;
}

.frontmatter-input-error {
  border-color: #e55 !important; /* Red border for invalid title */
}
```

**Tab Bar** (lines 378–477):
```css
.tab-item--active {
  color: var(--text-primary);
  font-weight: 500;
  background: var(--bg-primary);
  box-shadow: inset 0 -3px 0 var(--accent); /* Bottom accent bar */
}
```

**Theme Colors** (lines 1–90):
- Light: white bg, dark text, accent blue (#4a9eff)
- Dark: #1e1e1e bg, light text, accent blue (#5aaeFF)
- Dracula, Solarized Light themes also defined

---

### 4. **Source Field Usage**

**In Data Model**:
- Optional string field in frontmatter
- No type-specific constraints; free-form text
- Indexed for search but not used for graph relationships

**In UI** (`crates/app/src/components/Editor/FrontmatterForm.tsx`, lines 35–96):
```tsx
const source = fm?.source !== undefined ? (fm.source ?? "") : (note.source ?? "");
// ...
<label>
  <span>Source</span>
  <input
    type="text"
    value={source}
    placeholder="Source reference…"
    onChange={(e) => updateFrontmatter({ source: e.target.value || null })}
  />
</label>
```

**Seed Examples**:
- `source: "The Book of Why, Ch.1"`
- `source: "The Book of Why, Introduction + Ch1"`
- `source: "General knowledge; not directly from The Book of Why"`
- `source: "The Book of Why, Chapter 2"`

**Related Edge Types**:
- `sourced-from` — for explicit typed relationship (e.g., "This concept sourced from that reference note")
- `source` is metadata; `sourced-from` is relational

**File Handling**:
- PDFs have source annotation: `> Source: [filename](path)` added to body when extracted (`crates/app/src/components/Editor/PdfViewer.tsx`, line 453)
- Plain files show path in metadata footer: `<span className="meta-source">{path}</span>`

---

### **Summary**

- **Data Model**: 11 note types, 15 edge types, with `source` as a free-text origin reference and `sourced-from` as the explicit relational equivalent
- **Wiki-Links**: Standard markdown `[label](path.md)` syntax, parsed into `InlineLink` structs, converted to `mentioned-in` edges, Cmd+Click navigable in editor
- **Editor CSS**: Frontmatter form is a secondary sticky panel above the markdown body, with labeled input fields for Title/Type/Status/Tags/Source/Summary; theme-aware with light/dark/Dracula/Solarized variants
- **Source Field**: Unstructured text field in frontmatter, displayed in edit form, used in seeds to track origins (books, papers, URLs); complements the `sourced-from` edge type

**Key Files**:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md` — comprehensive spec
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs` — inline link extraction
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` — data structures
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/FrontmatterForm.tsx` — frontmatter UI
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts` — link navigation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` — all styling

---

