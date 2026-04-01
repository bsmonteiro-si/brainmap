# 2026-03-16 — Subagent Transcript: Explore

**Date:** 2026-03-16 17:09:46
**Agent:** Explore
**Agent ID:** aa3ed82d32c6e54fb
**Parent Session:** ace20328-a0ad-4593-a8e0-9c5670a209e5

---

## User

Explore the BrainMap codebase to understand how callout blocks (QUESTION, SOURCE) and line breaks are styled differently between Preview mode and Edit mode.

Focus on:
1. The MarkdownPreview.tsx component and how it renders callout blocks
2. The cmMarkdownDecorations.ts file for Edit mode decorations
3. App.css for relevant styling (callout classes, spacing, line-height)
4. Any remark plugins that handle callouts

I need to understand the visual gap between Preview and Edit mode for callout blocks (padding, borders, spacing) and general text line-height/spacing.

Be thorough - read the full contents of these files:
- crates/app/src/components/Editor/MarkdownPreview.tsx
- crates/app/src/components/Editor/cmMarkdownDecorations.ts
- crates/app/src/App.css

Also look for any other CSS files that might affect editor styling.

---

## Assistant

I'll help you explore the BrainMap codebase to understand the styling differences between Preview and Edit modes for callout blocks. Let me start by reading the key files you mentioned.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me read the App.css in chunks to get the relevant styling information.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me search for the relevant CSS classes related to callouts and editor styling.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.callout|\\.md-preview|\\.cm-blockquote|line-height|padding|margin|spacing","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content"}`

---

## Assistant

Let me get more specific CSS sections for callouts and the editor.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1815,"limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1090,"limit":100}`

---

## Assistant

Now let me look for more CSS related to the editor body and check for any other relevant files.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.editor-body|cm-line|cm-content","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","head_limit":60}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/*.css"}`

---

## Assistant

Let me read the editor-body CSS section more carefully.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":1051,"limit":200}`

---

## Assistant

Now let me look for any remark plugins related to callouts.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*callout*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*Callout*"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*remark*"}`

---

## Assistant

Perfect! Let me read the callout-related files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts"}`

---

## Assistant

Now let me read the CodeMirror callout decorations file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts"}`

---

## Assistant

Perfect! Now let me search for additional CSS related to callout widgets in the main App.css:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-callout\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

Let me check if there are any other CSS files related to the editor:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -name \"*.css\" -o -name \"*.scss\" 2>/dev/null"}`

---

## Assistant

Let me check for the RemarkInlineSource plugin as well since it was mentioned:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me create a comprehensive analysis document:

## Summary

I've thoroughly explored the BrainMap codebase to understand how callout blocks (QUESTION, SOURCE) and line breaks are styled differently between Preview and Edit modes. Here's the complete analysis:

---

## **1. Preview Mode Callout Rendering**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx`

### How Callouts are Rendered:
- **Detection:** `extractCalloutFromChildren()` inspects React children from blockquote elements, looking for the `CALLOUT_RE` pattern: `/^\[!(\w[\w-]*)\][ \t]*(.*)$/m`
- **Processing:** The custom `blockquote` component in ReactMarkdown intercepts blockquote rendering and transforms callout syntax into structured callout elements
- **Structure:** Returns a div with three parts:
  - `.callout` wrapper (main container)
  - `.callout-header` (type label + icon + title)
  - `.callout-body` (content paragraphs)

### Preview Mode CSS Styling (lines 1903-1943 in App.css):

```css
.md-preview .callout {
  border-left: 3px solid var(--callout-color);        /* Left accent border */
  border-right: 1px solid color-mix(...15%...);       /* Subtle right border */
  border-top: 1px solid color-mix(...15%...);         /* Subtle top border */
  border-bottom: 1px solid color-mix(...15%...);      /* Subtle bottom border */
  margin: 0.75em 0 1em;                               /* Vertical spacing */
  padding: 0;                                          /* No internal padding */
  border-radius: 0 6px 6px 0;                         /* Rounded right corners */
  overflow: hidden;
  background: color-mix(in srgb, var(--callout-color) 5%, transparent);  /* Very light tint */
}

.md-preview .callout-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;                                  /* Header-specific padding */
  font-weight: 600;
  font-size: 0.85em;
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.md-preview .callout-body {
  padding: 8px 12px 10px 16px;                        /* Body-specific padding */
  color: var(--text-secondary);
}

.md-preview .callout-body p { margin: 0; }            /* Remove default p margins */
.md-preview .callout-body p + p { margin-top: 0.5em; } /* Inter-paragraph spacing */
```

**Key Preview Mode Characteristics:**
- Left border: **3px colored** (primary accent)
- Right/top/bottom borders: **1px subtle** (15% color opacity)
- Header padding: **6px 12px**
- Body padding: **8px 12px 10px 16px** (left-aligned at 16px)
- Callout margin: **0.75em 0 1em**
- Line-height: **1.7** (from `.md-preview` container)

---

## **2. Edit Mode Callout Decorations**

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts`

### How Edit Mode Works:
- **Scanning:** `scanCallouts()` function finds callout ranges using the brace syntax: `/^\[!(\w[\w-]*)\]([^\n{]*)\{\s*$/`
- **Three Features:**
  1. **Tinted background + colored left border** on all callout lines
  2. **Inline header widget** (cursor-aware: shows rendered header when not editing, raw syntax when cursor on header)
  3. **Fold markers** for collapsing callout bodies

### Edit Mode Styling (from cmCalloutDecorations.ts, lines 280-290):

```javascript
const headerBg = `background: color-mix(in srgb, ${color} 12%, transparent); 
                   border-left: 3px solid ${color}; 
                   padding-left: 8px;`;

const bodyBg = `background: color-mix(in srgb, ${color} 6%, transparent); 
                border-left: 3px solid ${color}; 
                padding-left: 8px;`;
```

**Base theme (lines 423-448):**
```javascript
".cm-callout-widget-header": {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "2px 8px",           /* Widget-specific padding */
  borderRadius: "4px",
  fontSize: "0.9em",
  background: "color-mix(in srgb, var(--callout-color) 12%, transparent)",
}
```

**Key Edit Mode Characteristics:**
- Left border: **3px colored** (same as preview)
- Header line background: **12% color opacity**
- Body line background: **6% color opacity** (lighter than header)
- Padding-left on lines: **8px** (NOT 16px like preview body)
- Widget header padding: **2px 8px** (minimal)
- Line-height: **1.7** (from `.editor-body .cm-editor .cm-content`)

---

## **3. Main Visual Gap Analysis**

### Line-Height (Vertical Spacing):
- **Preview:** `.md-preview { line-height: 1.7; }` (line 1822)
- **Edit:** `.editor-body .cm-editor .cm-content { line-height: 1.7; }` (line 1087)
- **Status:** ✓ **SAME** - both use 1.7

### Paragraph Spacing Inside Callouts:
- **Preview:**
  - `.callout-body p { margin: 0; }` - removes default p margins
  - `.callout-body p + p { margin-top: 0.5em; }` - adds spacing between consecutive paragraphs
  
- **Edit:** No special handling; raw text uses default CodeMirror line spacing
  - Lists have extra spacing: `.cm-list-line { margin-bottom: 0.12em; }` (line 1091)
  
- **Status:** ✗ **DIFFERENT** - Preview has explicit `0.5em` inter-paragraph spacing

### Padding & Borders:
- **Preview callout-body:** 
  - Padding: `8px 12px 10px 16px` (left side: 16px for alignment)
  - Border: left only (3px) + subtle right/top/bottom (1px @ 15% opacity)
  
- **Edit callout lines:**
  - Padding-left: `8px` (applied via inline style on `.cm-line` elements)
  - Border: left only (3px)
  - No right/top/bottom borders
  
- **Status:** ✗ **DIFFERENT** - Edit mode has 8px left padding vs. preview's 16px left padding

### Background Tinting:
- **Preview:**
  - Callout: `color-mix(in srgb, var(--callout-color) 5%, transparent)`
  - Header: `color-mix(in srgb, currentColor 8%, transparent)`
  
- **Edit:**
  - Header line: `color-mix(in srgb, ${color} 12%, transparent)` (darker)
  - Body line: `color-mix(in srgb, ${color} 6%, transparent)`
  
- **Status:** ✗ **DIFFERENT** - Edit header is 12% (preview default is ~5%), more visually distinct

---

## **4. Inline Source Citations**

**Files:**
- Preview: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts` (lines 1-103)
- Edit decorations: `cmMarkdownDecorations.ts` (lines 1206-1219)

### Preview Mode (`.inline-source`):
```css
.inline-source {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-bottom: 1.5px solid var(--accent);
  font-style: italic;
  color: var(--text-secondary);
}

.inline-source-tag {
  color: var(--accent);
  font-size: 0.8em;
  font-weight: 600;
  font-style: normal;
  margin-right: 4px;
  text-transform: uppercase;
  opacity: 0.7;
}
```

### Edit Mode Decorations (lines 1206-1219):
```css
.editor-body .cm-editor .cm-source-tag {
  color: var(--accent);
  opacity: 0.45;                    /* Lower opacity in edit */
  font-size: 0.85em;
}

.editor-body .cm-editor .cm-source-content {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-bottom: 1.5px solid var(--accent);
  color: var(--text-secondary);
  font-style: italic;
}

.editor-body .cm-editor .cm-source-bracket {
  opacity: 0.3;                     /* Brackets very dim */
}
```

**Status:** ✗ **DIFFERENT** - Edit mode has lower tag opacity (0.45 vs. implicit 1.0), different bracket handling

---

## **5. Key File References**

| File | Purpose |
|------|---------|
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownPreview.tsx` | Preview rendering; blockquote-to-callout transformation |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCalloutDecorations.ts` | Edit mode callout decorations; scanning & widget rendering |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMarkdownDecorations.ts` | Edit mode decorations for all markdown elements (HR, blockquotes, code, links, inline source) |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutTypes.ts` | Callout type definitions (colors, labels, icons) |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/calloutPreprocess.ts` | Brace-to-blockquote syntax conversion |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkCalloutMerge.ts` | Remark plugin merging consecutive blockquotes into single callout |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/remarkInlineSource.ts` | Remark plugin for inline source citations |
| `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css` | All CSS styling (lines 1051-1220 for edit mode, 1815-1943 for preview) |

---

## **6. Summary of Styling Gaps**

| Element | Preview | Edit Mode | Gap |
|---------|---------|-----------|-----|
| Callout left border | 3px colored | 3px colored | None |
| Callout right border | 1px subtle (15%) | None | Edit missing |
| Callout top/bottom borders | 1px subtle (15%) | None | Edit missing |
| Body padding-left | 16px | 8px | **8px difference** |
| Header padding | 6px 12px | 2px 8px (widget) | Compact in edit |
| Background opacity | 5-8% | 6-12% | Edit slightly darker |
| Inter-paragraph spacing | 0.5em | 0 (raw text) | **Missing in edit** |
| Line-height | 1.7 | 1.7 | None |
| Inline source tag opacity | ~1.0 | 0.45 | **Lower in edit** |

---

This comprehensive analysis shows the main visual gaps are:
1. **Missing subtle borders** on right/top/bottom in edit mode
2. **Reduced left padding** (8px vs. 16px) in edit body
3. **No inter-paragraph spacing** in edit callout bodies
4. **Darker background tinting** in edit headers (12% vs. ~5%)
5. **Dimmer inline source tags** in edit mode (0.45 opacity)

---

