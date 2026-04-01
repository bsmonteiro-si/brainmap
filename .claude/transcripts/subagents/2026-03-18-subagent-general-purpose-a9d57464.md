# 2026-03-18 — Subagent Transcript: general-purpose

**Date:** 2026-03-18 12:41:53
**Agent:** general-purpose
**Agent ID:** a9d57464367b7af86
**Parent Session:** 210e9b86-df86-4c62-9036-efbf3f129063

---

## User

You are reviewing code changes for BrainMap, a Tauri+React app with CodeMirror 6.

## Review Criteria (from .claude/agents/code-reviewer.md)
Find real defects, not style nits.
1. Correctness - Logic bugs, off-by-one, missed conditions
2. Quality - Naming, function design
3. Test Coverage - Are changes tested?
4. Performance - Unnecessary work

### Output Format
For each finding: **File**, **Severity** (bug/should-fix/suggestion), **Finding**, **Fix**.
Do NOT report: missing comments, style preferences.

## Changed Files

### 1. NEW: `cmListNesting.ts`
Custom CM6 extension for IntelliJ-style ordered list marker cycling on Tab. Tab on a numbered list line indents it and changes the marker style based on depth (1. → a. → i. → 1. cycle).

Read: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListNesting.ts`

### 2. NEW: `cmListNesting.test.ts`
Tests for the pure functions (toRoman, fromRoman, markerForKind, parseIndex, kindForDepth).

Read: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListNesting.test.ts`

### 3. MODIFIED: `MarkdownEditor.tsx`
Added `listNestingKeymap` to the keymap array before `indentWithTab`.

Read: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx`

### 4. MODIFIED: `App.tsx`
Reverted Cmd+H handler (removed openSearchPanel import and handler).

Read lines 1-20 and 187-195 of: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx`

## Key concerns:
- Does the Tab handler correctly fall through to `indentWithTab` for non-ordered-list lines (unordered lists, code blocks, plain text)?
- Is the regex `/^(\s*)(\d+|[a-z]+)\.\s/` correct? Does it accidentally match things that aren't list markers?
- Edge cases: cursor at start of line vs end, empty list items, very deep nesting

Write review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editor-list-nesting-review-1.md`

---

## Assistant



Let me read the changed files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListNesting.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListNesting.test.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":1,"limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx","offset":187,"limit":10}`

---

## Assistant

Now let me check the `parseIndex` function more carefully for the ambiguity between single-char alpha and single-char roman numerals.

The key issue: `parseIndex("i")` — is `i` alpha (index 9) or roman (index 1)? Let me trace through:
- `marker.match(/^\d+$/)` → no
- `marker.length === 1` → yes, so `return marker.charCodeAt(0) - 96` → `105 - 96 = 9`

But when converting from depth 2 (roman), `markerForKind("roman", 1)` = `"i"`. Then if we Shift-Tab back, `parseIndex("i")` returns 9 (alpha), not 1 (roman). This is a bug.

Let me also check the multi-selection edge case and the regex more carefully.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"parseIndex","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmListNesting.ts","output_mode":"content"}`

---

## Assistant

Now let me also check whether multi-cursor with mixed ordered/non-ordered lines is handled correctly. Looking at lines 75-110 again: the `continue` on line 80 skips non-matching ranges but doesn't add them to `selections`. If some ranges match and others don't, the non-matching ranges are dropped from the selection entirely. Let me verify.

Line 77: if the selection spans multiple lines, it also `continue`s without adding to selections. And line 112: if nothing matched, returns false. But if *some* ranges match and others don't, the dispatch at line 114-117 only includes `selections` from matching ranges — the non-matching cursor positions are lost.

Let me also check whether `v.` (roman 5) gets parsed correctly: `"v"` has length 1, so `parseIndex("v")` returns `118 - 96 = 22` (alpha). But if this was a roman marker, it should be 5. Same bug as with `"i"`.

Now let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editor-list-nesting-review-1.md","content":"# Code Review: Editor List Nesting Extension\n\n**Files reviewed:**\n- `crate`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/editor-list-nesting-review-1.md`.

## Summary of Findings

**1 bug, 2 should-fix, 1 suggestion:**

1. **Bug — `parseIndex` ambiguity:** Single-character roman numerals (`i`, `v`, `x`) are misidentified as alpha characters. `parseIndex("i")` returns 9 (alpha) instead of 1 (roman). This corrupts the list index when Shift-Tabbing from roman depth. Fix: pass the expected `MarkerKind` (derived from current depth) into `parseIndex`.

2. **Should-fix — Multi-cursor selection loss:** When some cursors are on ordered list lines and others aren't, non-matching cursor positions are silently dropped from the editor selection after dispatch. Fix: push non-matching `range` objects unchanged into the `selections` array.

3. **Should-fix — Overly broad regex:** `/^(\s*)(\d+|[a-z]+)\.\s/` matches arbitrary words like `etc. ` or `hello. ` as list markers. Fix: tighten to single alpha char or valid roman numeral patterns.

4. **Suggestion — No integration tests** for the Tab handler itself (CM EditorView interaction), only pure function unit tests.

The keymap ordering in `MarkdownEditor.tsx` is correct — `listNestingKeymap` before `indentWithTab` ensures proper fallthrough.

---

