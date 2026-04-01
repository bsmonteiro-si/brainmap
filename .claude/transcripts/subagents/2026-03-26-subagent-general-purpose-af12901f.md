# 2026-03-26 — Subagent Transcript: general-purpose

**Date:** 2026-03-26 14:03:38
**Agent:** general-purpose
**Agent ID:** af12901f1dd2a901f
**Parent Session:** e8095182-9e32-4b51-8df7-3e5729ec3943

---

## User

You are a code reviewer. Review the following changed files for the "Edge label font size and font family controls" feature in the BrainMap project. This is a frontend-only change (TypeScript/React/CSS). Focus on correctness, not style.

## Review Criteria

(From .claude/agents/code-reviewer.md — adapted for TypeScript/React)

### 1. Correctness
- Logic bugs? Missed conditions?
- Error handling cover all failure modes?
- Is state consistent after mutations?

### 2. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 3. Test Coverage
- Is every new behavior tested?
- Are error paths tested?
- Do tests verify end state?

### 4. Performance
- Unnecessary re-renders? Large clones?

## Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If a file has no issues, skip it. If the code is solid, say so briefly.

## Changed Files

Read these files and review the changes:

1. `crates/app/src/components/Editor/CanvasEditor.tsx` — Added `CanvasSnapshotContext` + `useCanvasSnapshot` hook (around lines 41-55), `stablePushSnapshot` ref-backed callback (search for "pushSnapshotRef"), and wrapping `<CanvasSnapshotContext.Provider>` around the return JSX.

2. `crates/app/src/components/Editor/canvasTranslation.ts` — Extended `JsonCanvasEdge` interface with `labelFontSize?` and `labelFontFamily?` (around line 57-70); updated `canvasToFlow` edge mapping (around line 191-196); updated `flowToCanvas` edge serialization (around line 308-316).

3. `crates/app/src/components/Editor/canvasNodes.tsx` — In `CanvasEdgeInner`: added `useCanvasSnapshot` import + hook, `showLabelFormat` state, `labelFormatRef`, `pointerdown` dismiss effect, `handleLabelFont` handler, `labelStyle` computation, applied `labelStyle` to both label display and input, added Label format picker dropdown in toolbar.

4. `crates/app/src/App.css` — Added `.canvas-edge-label-format-picker` CSS class (search for that string).

5. `crates/app/src/components/Editor/canvasTranslation.test.ts` — Added 4 new tests in "edge labelFontSize and labelFontFamily" describe block at the end of the file.

Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/edge-label-font-controls-review-1.md`

---

## Assistant



I'll read all the changed files to review them.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.test.ts"}`

---

## Assistant

Now let me read the relevant parts of CanvasEditor.tsx and canvasNodes.tsx.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","limit":100}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CanvasEdgeInner|CanvasEdge","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-edge-label-format","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-n":true,"-C":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":860,"limit":290}`

---

## Assistant

Now let me check the `pushSnapshotRef` / `stablePushSnapshot` pattern in CanvasEditor.tsx.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pushSnapshot|stablePushSnapshot|CanvasSnapshotContext","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":t`

---

## Assistant

Now let me check if there's an issue with the `pushSnapshot` being defined after it's used in the ref pattern.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":385,"limit":55}`

---

## Assistant

Now let me check the Provider wrapping in the return JSX.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"CanvasSnapshotContext.Provider","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true,"-C":3}`

---

## Assistant

Now let me check one potential issue -- the `commitLabel` function strips `data` when only `isNew` was set, but now `labelFontSize`/`labelFontFamily` could also be in data. Let me verify.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":916,"limit":20}`

---

## Assistant

Good -- `commitLabel` correctly strips only `isNew` and preserves `restData` (which includes `labelFontSize`/`labelFontFamily`). That's correct.

Let me check one more thing -- whether the `pushSnapshot` ref is used before `pushSnapshot` is defined (hoisting issue with `useCallback`).

The code at line 397 does `const pushSnapshotRef = useRef(pushSnapshot)` but `pushSnapshot` is defined at line 432. In JavaScript, `const` declarations are hoisted but are in the temporal dead zone until the declaration is reached. However, this is inside a function component body that runs sequentially, so `pushSnapshot` at line 397 would be `undefined` on the first render. But line 398 `pushSnapshotRef.current = pushSnapshot` runs every render, so after the first render it would be the correct value. The `useRef(pushSnapshot)` on line 397 only sets the initial value, and since `stablePushSnapshot` accesses `pushSnapshotRef.current` (which gets updated on line 398 every render), the first render's initial `undefined` is immediately overwritten. Wait -- actually, line 397 and 398 both run before 432 in a single render pass. Let me re-examine.

Actually wait -- `useCallback` at line 432 returns a memoized function. The hooks run in order during render. So during the first render:
- Line 397: `pushSnapshotRef = useRef(undefined)` (pushSnapshot hasn't been declared yet -- but actually `const` with `useCallback` means the variable exists but is in the TDZ)

Actually no. `const pushSnapshot = useCallback(...)` at line 432 -- in JS, `const` is block-scoped and hoisted to the top of the block but in the TDZ. Accessing it before declaration would throw a ReferenceError. But wait, this is JSX compiled to JS -- all these lines are in the same function body. So line 397 `useRef(pushSnapshot)` would throw a ReferenceError because `pushSnapshot` is a `const` that hasn't been initialized yet.

Let me verify this more carefully -- maybe it's actually a `let` or maybe the compiled output handles it differently. Actually, looking at the code, the `pushSnapshot` is used in many places before line 432 (e.g., at line 397). If this were truly a TDZ issue, the component would crash on every render. Since this is a working feature, there must be something I'm missing. Let me look more carefully.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"const pushSnapshot","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","output_mode":"content","-n":true}`

---

## Assistant

This IS a TDZ issue. Line 397 references `pushSnapshot` which is declared at line 432 with `const`. This would throw a ReferenceError at runtime. However, since this is clearly working code (it was committed and presumably tested), let me check if there's a different `pushSnapshot` variable in scope, or if this pattern was pre-existing before this feature.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && git log --oneline -5 -- crates/app/src/components/Editor/CanvasEditor.tsx","description":"Check recent commits to CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && git diff HEAD -- crates/app/src/components/Editor/CanvasEditor.tsx | head -80","description":"Check uncommitted changes in CanvasEditor.ts`

---

## Assistant

So `pushSnapshotRef = useRef(pushSnapshot)` at line 397 is newly added code that references `pushSnapshot` (defined at line 432). This IS a TDZ bug -- accessing a `const` variable before its declaration throws a ReferenceError. This is a real bug introduced by this feature.

Wait, let me reconsider. In the compiled JS output (via Vite/esbuild), `const` may get transformed to `var` which would make it `undefined` rather than a TDZ error. Let me check if this actually works at runtime by checking if esbuild/Vite preserves `const`.

Actually, for modern browsers and Vite in dev mode, esbuild does often preserve `const`. But even if it gets downleveled to `var`, the `useRef(pushSnapshot)` would be `useRef(undefined)` on the first render, and then line 398 `pushSnapshotRef.current = pushSnapshot` would also be `undefined` because it also runs before line 432. The `pushSnapshotRef.current` only gets the correct value on the second render.

But actually, `stablePushSnapshot` (line 399) captures `pushSnapshotRef.current` at call time (not at creation time), so as long as `pushSnapshotRef.current` is updated before anyone calls `stablePushSnapshot`, it works. The question is: can `stablePushSnapshot` be called during the first render? No -- it's passed as context and consumed by child components, which would call it in event handlers (not during render). By the time any event handler fires, at least one render has completed, and line 398 on the second render would have updated the ref.

Actually wait -- line 398 runs EVERY render, including the first. But on the first render, `pushSnapshot` hasn't been declared yet (line 432). So line 398 would also be a TDZ error on the first render.

Hmm, but this code is working in production (it was committed). Let me check if esbuild specifically transpiles this away.

Actually, I just realized: esbuild in Vite dev mode uses ESM with native browser support. Modern browsers DO enforce TDZ for `const`. But the thing is, this code IS working, which means either:
1. The TDZ is not enforced in this context (unlikely for modern browsers)
2. There's something about the compilation I'm not seeing

Let me check if this is actually a `function` declaration being hoisted.

No, line 432 clearly shows `const pushSnapshot = useCallback(...)`. This should be a TDZ error.

Actually, I just realized something. Vite/esbuild transforms JSX/TSX files. Let me check if `const` inside React function components gets preserved. In ESM mode with esbuild, `const` IS preserved. But wait -- if this code is genuinely crashing, someone would have noticed. Let me just flag it as a potential bug and move on.

Actually, I need to be more careful. Let me re-read: line 397 in the current file (post-diff) is the new code. This WAS working before the diff because this code didn't exist. The new code at line 397-399 references `pushSnapshot` which is at line 432. This is new code that could be a TDZ bug.

But wait, the existing code at line 544 (`[onNodesChange, scheduleSave, pushSnapshot]`) -- the same `pushSnapshot` -- is also used as a dependency. That works because `useCallback` dependency arrays are just values that don't cause TDZ issues during array construction -- they're evaluated when the hook runs, and by that point `pushSnapshot` hasn't been initialized. But `useCallback` just stores the deps and returns the same function... hmm, this gets complicated.

Actually, I realize I was wrong. In JavaScript, the TDZ only applies within the same scope. Lines 397 and 432 are in the same function body. The `const` at 432 means accessing `pushSnapshot` at line 397 (which executes first in the function body) WILL throw a ReferenceError due to TDZ.

This is a genuine bug. The fix is to move lines 397-399 below line 432 (after `pushSnapshot` is defined).

Now let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/edge-label-font-controls-review-1.md","content":"# Code Review: Edge label font size and font family controls\n\n## Findi`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/edge-label-font-controls-review-1.md`.

**Summary of findings:**

1. **Bug** (severity: bug) -- `CanvasEditor.tsx` lines 397-399: The `pushSnapshotRef = useRef(pushSnapshot)` block is placed before `const pushSnapshot = useCallback(...)` at line 432. Since `pushSnapshot` is a `const`, accessing it before its declaration triggers a Temporal Dead Zone `ReferenceError`, crashing the component on every render. Fix: move the ref block below the `pushSnapshot` declaration.

2. Three **suggestions** (non-blocking): no reset-to-default button in the label format picker (consistent with existing node pattern), minor asymmetry in empty-string handling between serialization/deserialization, and a missing round-trip test for default values.

The translation layer (`canvasTranslation.ts`), test coverage, edge toolbar UI, and CSS are all solid.

---

