# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 11:52:54
**Agent:** Explore
**Agent ID:** a8a496e6c0e51e352
**Parent Session:** 5b0e6283-4f0a-4591-bea0-adbf6ce9d7ae

---

## User

Explore the CodeMirror editor setup in the BrainMap desktop app at /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/.

I need to understand:
1. What "prettify" / decoration tricks are currently implemented for the editor's edit mode (not preview mode). Look for CodeMirror extensions, decorations, widgets, replace decorations, line decorations, etc. that enhance how markdown elements look in the editor.
2. Specifically look at files related to: cmFormatting, cmLinkNavigation, callout handling, any CodeMirror plugins/extensions.
3. Check the editor CSS files for any special styling of markdown elements in edit mode.
4. Look at how the editor is set up (what extensions are loaded) - likely in EditorPanel or similar.

Focus on edit mode decorations - things that make raw markdown look prettier while editing. List every element that has special treatment and describe what it does.

Be very thorough - check all .ts and .tsx files in the editor/components area, and all CSS files.

---

## Assistant

I'll explore the CodeMirror editor setup thoroughly, focusing on decorations, extensions, and styling for edit mode. Let me start with a broad search.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f \\( -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.css\" \\) | grep -E \"(editor|Editor|cm|CodeMirror)\" | head -20"`

---

## Assistant

Good! Now let me look for all editor-related files and CSS:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/**/*.{ts,tsx,css}"}`

---

## Assistant

Let me also find editor CSS files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.css\" | grep -i editor"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.css\""}`

---

## Assistant

Now let me read the key files. Let me start with the MarkdownEditor setup and then the decoration/extension files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Now let me read the remaining decoration/extension files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListSpacing.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCopyReference.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

Now let me check the CSS file and look for any other decoration/styling related files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","limit":300}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.css\" -o -name \"*.scss\""}`

---

## Assistant

Let me continue reading the CSS file to find editor-related styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-\\|editor-\\|codemirror\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -100"}`

---

## Assistant

Let me read the relevant CSS sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1027,"limit":100}`

---

## Assistant

Now let me check for any preprocessor-related files or other decoration files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorToolbar.tsx","limit":150}`

---

## Assistant

Now let me check for any markdown syntax highlighting or additional CSS related to callouts and editor styling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"callout\\|blockquote\\|heading\\|list\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -50"}`

---

## Assistant

Let me read those CSS sections:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1695,"limit":100}`

---

## Assistant

Let me also check if there are any other markdown preview styling and editor hero/metadata styles:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"editor-hero\\|meta-\\|heading\\|emphasis\\|strong\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -60"}`

---

## Assistant

Let me read the editor hero styles:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":500,"limit":100}`

---

## Assistant

Now let me check for markdown preview styling to see heading styling there too:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"md-preview\\|\\.cm-\\|h[1-6]\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | grep -E \"h[1-6]|md-preview h\" | head -50"}`

---

## Assistant

Let me read the markdown preview heading styles and related:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1628,"limit":80}`

---

## Assistant

Perfect! Now let me check if there are any syntax highlighting theme rules in the editor that specifically handle markdown elements:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"@media\\|\\.cm-line\\|theme\\|Tags\\.\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check if there are any remarkCalloutMerge or other related files I should look at:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

Perfect! Now I have a comprehensive view. Let me compile all the findings into a thorough report.

## CodeMirror Editor Setup: Complete Decoration & Prettification Analysis

Based on my thorough exploration of the BrainMap desktop app's editor implementation, here is every "prettify" and decoration trick currently implemented for the editor's edit mode (not preview mode):

---

### **1. DECORATIONS & VISUAL ENHANCEMENTS**

#### **A. Callout Block Decorations** (`cmCalloutDecorations.ts`)
This is the most sophisticated decoration system in the editor:

- **Header line widget replacement**: The raw `[!type] title {` syntax is completely replaced with a styled widget showing:
  - Colored SVG icon (specific icons for ai-answer, source, question, key-insight; fallback info circle)
  - Uppercase type label (e.g., "AI ANSWER")
  - Optional title text (with separator dash if present)
  - Widget appears only when cursor is NOT on the header line (cursor-aware)

- **Line background tinting**: 
  - Header line: `color-mix(in srgb, ${color} 12%, transparent)` with 3px colored left border
  - Body lines: `color-mix(in srgb, ${color} 6%, transparent)` with same left border
  - Left padding of 8px on all lines

- **Closing brace `}` replacement**: 
  - When cursor is NOT on the closing line, it's replaced with a zero-height block widget (invisible)
  - When cursor IS on the closing line, it shows raw `}` with tinted background
  - This prevents visual clutter while preserving CodeMirror's height map accuracy

- **Fold markers**: 
  - Callout bodies can be collapsed/expanded via CodeMirror's fold service
  - Keyboard shortcuts: `Ctrl+Shift+[` / `Ctrl+Shift+]` to fold/unfold
  - Fold range: from end of header line to end of closing line

- **Cursor-aware behavior**: All widget replacements check cursor position and show raw syntax when editing that line

#### **B. List Line Spacing** (`cmListSpacing.ts`)
- **Line decoration class**: `.cm-list-line` added to any line matching `^\s*(?:[-*+]|\d+[.)]) `
- **CSS effect**: `margin-bottom: 0.12em` for vertical breathing room between list items
- **Plugin type**: ViewPlugin that updates on viewport changes for efficiency

#### **C. Syntax Highlighting** (MarkdownEditor.tsx)
CodeMirror HighlightStyle rules for markdown elements:

- **Headings (h1-h6)**: 
  - `tags.heading1`: 1.5em, 700 font-weight, accent color (#4a9eff light / #5aaeFF dark)
  - `tags.heading2`: 1.3em, 600 font-weight, same accent
  - `tags.heading3`: 1.15em, 600 font-weight, same accent
  - `tags.heading4`: 1.05em, 600 font-weight, same accent

- **Emphasis/Bold**:
  - `tags.emphasis`: italic
  - `tags.strong`: 700 font-weight

---

### **2. INTERACTIVE FEATURES**

#### **A. Cmd+Click Link Navigation** (`cmLinkNavigation.ts`)
- **Hover detection**: Detects when cursor is over a markdown link `[label](url)`
- **Visual feedback**:
  - Cursor changes to pointer on Cmd+hover over a local markdown link
  - Applied via `.cm-cmd-link-hover` class on editor root element
  - Affects `.cm-content` cursor style

- **Keyboard aware**: Tracks Cmd/Ctrl key press/release via keydown/keyup events
- **Click handler**: Cmd+Click on a link navigates to the linked note (resolves relative paths)

#### **B. Copy File Reference Context Menu** (`cmCopyReference.ts`)
- **Right-click menu**: Custom context menu appears on right-click with text selected
- **Menu item**: "Copy File Reference" that copies path with line numbers (e.g., `/path/to/note.md#L12-L18`)
- **UI**: Glassmorphic dark menu positioned near cursor, auto-clamped to viewport
- **Dismiss handlers**: Closes on outside click, Escape key, or scroll

---

### **3. CSS STYLING & THEMING**

#### **A. Editor Container Styling** (App.css, lines 1035-1094)
```
.editor-body .cm-editor:
- background-color: var(--bg-primary) [theme-controlled]
- color: var(--text-primary)
- Font: var(--editor-font-family) !important
- Font-size: var(--editor-font-size) !important
```

#### **B. Gutter & Line Number Styling**:
```
.cm-gutters:
- background: var(--bg-secondary)
- color: var(--text-muted)
- border-right-color: var(--border-color)

.cm-activeLineGutter:
- background: var(--bg-tertiary)

.cm-activeLine:
- background: color-mix(in srgb, var(--accent) 5%, transparent)
```

#### **C. Cursor & Selection**:
```
.cm-cursor:
- border-left-color: var(--accent)

.cm-selectionBackground:
- background: color-mix(in srgb, var(--accent) 20%, transparent)
```

#### **D. Content Padding**:
```
.cm-content:
- padding-left: clamp(12px, 3%, 36px)
- padding-right: clamp(12px, 3%, 36px)
- line-height: 1.7
```

#### **E. List Line Spacing CSS**:
```
.cm-list-line:
- margin-bottom: 0.12em
```

#### **F. Callout Widget Styling** (baseTheme in cmCalloutDecorations.ts):
```
.cm-callout-widget-header:
- display: inline-flex
- align-items: center
- gap: 6px
- padding: 2px 8px
- border-radius: 4px
- font-size: 0.9em
- background: color-mix(in srgb, var(--callout-color) 12%, transparent)

.cm-callout-widget-label:
- font-weight: 600
- text-transform: uppercase
- font-size: 0.85em
- letter-spacing: 0.03em

.cm-callout-widget-title:
- font-weight: 400
- opacity: 0.85
- ::before content: "—" separator with 4px margin & 0.4 opacity
```

---

### **4. FORMATTING TOOLBAR & KEYBINDINGS** (cmFormatting.ts + EditorToolbar.tsx)

The editor includes a visual toolbar for markdown formatting with these features:

- **Bold**: Cmd+B → `toggleWrap(view, "**")`
- **Italic**: Cmd+I → `toggleWrap(view, "*")`
- **Strikethrough**: Cmd+Shift+X → `toggleWrap(view, "~~")`
- **Inline Code**: Cmd+E → `toggleWrap(view, "`")`
- **H1/H2/H3**: Cmd+Shift+1/2/3 → `setHeading(view, level)`
- **Bulleted List**: Cmd+L → `toggleLinePrefix(view, "- ")`
- **Numbered List**: Cmd+Y → `toggleOrderedList(view)` with auto-increment
- **Blockquote**: Cmd+' → `toggleLinePrefix(view, "> ")`
- **Link**: Cmd+K → `insertLink(view)`
- **Horizontal Rule**: Cmd+Shift+H → `insertAtCursor(view, "\n---\n")`
- **Callout Picker**: ☰ button opens popover to insert callout blocks

**Smart toggleWrap behavior**:
- If selection is already wrapped with markers → unwrap
- If selection is empty → insert marker pair and place cursor between
- If selection has text → wrap the text
- Adjusts selection to keep content in view

**toggleLinePrefix behavior**:
- If all selected lines have prefix → remove it
- Otherwise → add prefix to lines that don't have it
- Preserves cursor position intelligently

---

### **5. CALLOUT-SPECIFIC FEATURES**

#### **Callout Header Icons** (SVG Data URIs)
Built programmatically with type-specific icon paths:
- **ai-answer** (Bot icon)
- **source** (BookOpen icon)
- **question** (HelpCircle icon)
- **key-insight** (Lightbulb icon)
- **Fallback**: Info circle for unknown types

#### **Callout Type Definitions** (calloutTypes.ts)
```typescript
{
  "ai-answer": { color: "#4a9eff", label: "AI Answer", Icon: Bot },
  "source": { color: "#f39c12", label: "Source", Icon: BookOpen },
  "question": { color: "#9b59b6", label: "Question", Icon: HelpCircle },
  "key-insight": { color: "#27ae60", label: "Key Insight", Icon: Lightbulb }
}
```

#### **Callout Preprocessor** (calloutPreprocess.ts)
Converts brace-delimited callout syntax to blockquote syntax before markdown parsing:
- Input: `[!type] title { body }`
- Output: `> [!type] title` + `> body lines`
- Respects fenced code blocks inside callouts

#### **Remark Plugin** (remarkCalloutMerge.ts)
Merges consecutive blockquotes after a callout header so blank lines within callouts don't split them into separate blockquotes.

---

### **6. THEMING SYSTEM**

All decorations respect the global theme system with CSS custom properties:
- **Light theme**: `[data-theme="light"]` variables
- **Dark theme**: `[data-theme="dark"]`
- **Additional themes**: Dracula, Solarized Light/Dark, Nord, Tokyo Night, One Dark

Variables used in decorations:
- `--callout-color`: Per-callout-type color
- `--accent`: Primary accent (#4a9eff)
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`, `--text-muted`
- `--editor-font-family`, `--editor-font-size`

---

### **7. ADDITIONAL EDIT-MODE FEATURES**

#### **View Modes**
- **Edit** (focused here): Raw markdown with decorations
- **Preview**: Rendered HTML (separate component)
- **Raw**: Undecorated source code

#### **Line Numbers**
- Optional: toggled via `showLineNumbers` in UIStore
- Gutter styling via `.cm-gutters` CSS
- Read-only setting persisted

#### **Auto-Save**
- Debounced 1.5s debounce on content changes
- Persisted per-tab state
- Note: does NOT apply to raw view

#### **Undo/Redo**
- Cmd+Z / Cmd+Y (or Cmd+Shift+Z)
- Uses CodeMirror's history() extension

---

### **FILE LOCATIONS**

The complete implementation spans these files:

1. **Decoration Extensions**:
   - `/crates/app/src/components/Editor/cmCalloutDecorations.ts` (461 lines)
   - `/crates/app/src/components/Editor/cmListSpacing.ts` (54 lines)
   - `/crates/app/src/components/Editor/cmLinkNavigation.ts` (111 lines)
   - `/crates/app/src/components/Editor/cmCopyReference.ts` (137 lines)

2. **Formatting & Commands**:
   - `/crates/app/src/components/Editor/cmFormatting.ts` (297 lines)
   - `/crates/app/src/components/Editor/EditorToolbar.tsx` (126 lines)

3. **Callout Handling**:
   - `/crates/app/src/components/Editor/calloutTypes.ts` (35 lines)
   - `/crates/app/src/components/Editor/calloutPreprocess.ts` (120 lines)
   - `/crates/app/src/components/Editor/remarkCalloutMerge.ts` (74 lines)

4. **Core Editor Setup**:
   - `/crates/app/src/components/Editor/MarkdownEditor.tsx` (169 lines)
   - `/crates/app/src/components/Editor/EditorPanel.tsx` (394 lines)

5. **Styling**:
   - `/crates/app/src/App.css` (lines 1027-1094, 1618-1747 for edit mode)

---

### **SUMMARY OF EDIT-MODE "PRETTIFICATION"**

The editor uses a layered approach:

1. **Syntax highlighting** for markdown elements (colored, sized headings; bold/italic styling)
2. **Line decorations** for list spacing and callout backgrounds
3. **Block widget replacements** for callout headers (hides raw syntax, shows styled widget) and closing braces
4. **Interactive event handlers** for link navigation and context menus
5. **CSS theming** with color-mix and theme variables for consistent styling
6. **Toolbar & keybindings** for easy markdown formatting
7. **Cursor-aware behavior** that shows raw syntax when editing a line, hides decorations elsewhere

All of this is designed to give a polished, VS Code-like authoring experience while preserving the ability to edit raw markdown.

---

