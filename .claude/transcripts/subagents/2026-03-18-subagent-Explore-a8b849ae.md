# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 14:44:47
**Agent:** Explore
**Agent ID:** a8b849ae8e5e0b6d3
**Parent Session:** 210e9b86-df86-4c62-9036-efbf3f129063

---

## User

Quick exploration in /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/:

1. **Link format**: How are internal links written in this app? Check:
   - `cmLinkNavigation.ts` — what link format does it parse/navigate?
   - `cmFormatting.ts` — what does the Cmd+K "insert link" shortcut produce?
   - Look at a few seed markdown files in `/Users/bsmonteiro/Desktop/Personal/brainmap/seed/` to see actual link syntax used
   - Check the frontmatter `links` field format in `docs/02-data-model.md` or similar
   
   I need to know: does this app use `[[wiki-links]]` or standard `[text](path)` markdown links?

2. **EditorPanel rendering**: Read `EditorPanel.tsx` lines 295-345 to understand when the toolbar (including the DocumentOutline button) renders. Is there a condition that hides it? Does it only show in "edit" mode? Check if the outline button only appears for notes (not plain files or untitled tabs).

---

## Assistant

I'll explore the link format and EditorPanel rendering for you. Let me start with parallel searches.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/*.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md","limit":100}`

---

## Assistant

Good! Now let me read one of the seed files to see the actual link format in use, and then check EditorPanel.tsx:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Counterfactual Reasoning.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx","limit":400}`

---

## Assistant

Perfect! Now let me check the DocumentOutline component to understand its rendering better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/DocumentOutline.tsx","limit":150}`

---

## Assistant

Excellent! I have all the information needed. Let me provide you with a comprehensive answer.

## Summary

### 1. Link Format

**BrainMap uses standard Markdown link syntax: `[text](path)`**

Evidence:
- **cmLinkNavigation.ts (line 7)**: The link regex is `/\[([^\]]*)\]\(([^)]*)\)/g` — this matches standard markdown links `[label](url)`.
- **cmFormatting.ts (line 214)**: The `insertLink()` function produces `[](url)` templates.
- **docs/02-data-model.md (lines 64-68)**: Confirms in-content links use "standard markdown syntax for portability":
  ```markdown
  [Judea Pearl](People/Judea Pearl.md)
  [structural causal models](Concepts/Structural Causal Models.md)
  ```
- **Actual seed files** (e.g., Counterfactual Reasoning.md): The frontmatter uses relative paths like `./The Ladder of Causation.md`, but the document body would contain standard markdown links when used in-content.

**Not wiki-links.** The app does NOT use `[[wiki-links]]` syntax. It uses standard `[text](path)` markdown, where paths are relative to the workspace (e.g., `Concepts/Causal Inference.md` or `./The Ladder of Causation.md`).

---

### 2. EditorPanel Toolbar Rendering

Looking at **EditorPanel.tsx lines 299-377** (the active note section), here's when the toolbar (including DocumentOutline) renders:

**The DocumentOutline button (≡) only appears when:**
1. `activeNote` exists (i.e., a note with frontmatter is open — lines 299-415)
2. It appears in the `editor-hero-top` div (lines 303-338), specifically on line 321-324

**The DocumentOutline does NOT appear for:**
- **Plain files** (lines 84-189): Plain text files show only Edit/Preview/Raw toggles, `#` (line numbers), and focus mode — no DocumentOutline.
- **Untitled tabs** (lines 192-270): Untitled scratch notes show only the same toggles as plain files — no DocumentOutline.

**Code structure:**
- Line 321-324: `<DocumentOutline editorView={editorViewRef.current} content={editedBody ?? activeNote?.body ?? ""} />`
  - This is only in the active note rendering block (the `return` at line 299)
  - It's placed **after** the view toggles and **before** the line numbers toggle
  - There's no condition that hides it — it's implicitly only present when `activeNote` is truthy (confirmed at line 293-297 where activeNote state is accessed)

**When viewMode is "raw"**, the frontmatter form is hidden (line 376), but the DocumentOutline button remains visible and functional in the toolbar.

---

### Absolute File Paths

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts` — link parsing
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmFormatting.ts` — link insertion (Cmd+K)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx` — toolbar rendering logic
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/DocumentOutline.tsx` — outline button component
- `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md` — data model spec

---

