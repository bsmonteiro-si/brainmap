# 2026-03-12 — Subagent Transcript: general-purpose

**Date:** 2026-03-12 11:51:51
**Agent:** general-purpose
**Agent ID:** a5c7ac70af9509109
**Parent Session:** 279be677-6d3a-444c-a7e0-844e319db25f

---

## User

You are reviewing an implementation plan for BrainMap. Here is the plan:

---
# Fix: App always shows seed data regardless of selected folder

## Context

The SegmentPicker (opening screen) always shows the seed/ dataset regardless of which folder the user opens or which recently-opened segment they select. The root cause is a Tauri v1 → v2 detection mismatch: the `isTauri()` function checks for `window.__TAURI__` (v1 global), but the app uses Tauri v2 (`@tauri-apps/api: ^2.2.0`) which injects `window.__TAURI_INTERNALS__` instead. Since `isTauri()` always returns `false`, the app always uses `MockBridge` which hardcodes "The Book of Why" seed data.

## Root Cause

**File:** `crates/app/src/api/bridge.ts:3-5`

```ts
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}
```

- Tauri v2 does NOT set `window.__TAURI__` unless `app.withGlobalTauri: true` is in `tauri.conf.json`
- Tauri v2 sets `window.__TAURI_INTERNALS__` instead
- Result: `isTauri()` → `false` → `MockBridge` cached → seed data always shown

## Fix

### Step 1: Fix `isTauri()` detection

**File:** `crates/app/src/api/bridge.ts`

Change the detection to check for `__TAURI_INTERNALS__` (Tauri v2's actual global):

```ts
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
```

### Step 2: Verify the fix

1. Run `cd crates/app && npm run build` to rebuild the frontend
2. Run `cd crates/app && cargo tauri dev` (from src-tauri) to launch the app
3. Test: Open Folder with a non-seed directory → should show that directory's contents
4. Test: Open a recently-opened segment → should show correct contents
5. Test: Close workspace and reopen → should still work

### Step 3: Run existing tests

```bash
cd crates/app && npm run test
```

Existing tests should still pass since they run in jsdom (no `__TAURI_INTERNALS__`) and correctly fall back to MockBridge.

### Step 4: Update CLAUDE.md

No CLAUDE.md update needed — the fix is a one-line bug fix, no new features or architectural changes.
---

Here are the review criteria:

## What to Review

### 1. Architectural Alignment
- Does the plan respect the existing module boundaries? (parser, graph, index, workspace, config)
- Does it route mutations through `Workspace` as the orchestration layer?
- Does it avoid leaking implementation details across module boundaries?
- Is it consistent with the specs in `docs/`?

### 2. Scope and Complexity
- Is the plan doing more than what was asked? Flag any scope creep.
- Are there simpler alternatives to what's proposed?
- Are abstractions justified or premature?
- Does it avoid backwards-compatibility hacks or dead code?

### 3. Edge Cases and Risks
- What failure modes are unhandled? (disk full, concurrent access, invalid UTF-8, path traversal)
- Are there ordering dependencies between steps that aren't called out?
- What happens if the implementation is interrupted halfway?

### 4. Test Strategy
- Does the plan include tests for each new behavior?
- Are edge cases and error paths tested, not just happy paths?
- Do tests verify end state (classic approach), not just mock interactions?

### 5. Data Model Impact
- Do changes to types break serialization compatibility with existing workspaces?
- Are new fields backward-compatible (optional, with defaults)?
- Does the plan account for the seed dataset still passing?

## Output Format

Write your review as a list of findings. For each finding:
- **Category**: one of [architecture, scope, edge-case, testing, data-model, performance, clarity]
- **Severity**: one of [blocker, should-fix, suggestion]
- **Finding**: what the problem is
- **Recommendation**: what to do instead

If you find no issues in a category, skip it. If the plan is solid, say so briefly and explain why.

Do NOT pad your review with praise or filler. Only real findings.

IMPORTANT: Write your review to `.claude/reviews/plans/fix-istauri-detection-review-1.md`. Do research first - read the actual bridge.ts file and check how Tauri v2 actually exposes its globals in the @tauri-apps/api package source.

---

## Assistant



Let me research the actual code first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/tauri.conf.json","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me check how `@tauri-apps/api` v2 actually checks for Tauri internals.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"__TAURI__","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@tauri-apps/api","output_mode":"content","head_limit":20}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"__TAURI_INTERNALS__","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@tauri-apps/api","output_mode":"content","head_limit":20}`

---

## Assistant

Let me check how `invoke` from `@tauri-apps/api/core` detects the Tauri environment.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"__TAURI_INTERNALS__\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@tauri-apps/api/core.js","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"TAURI_INTERNALS\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@tauri-apps/api/core.js","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"TAURI_INTERNALS\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@tauri-apps/api/core.js","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"TAURI\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@tauri-apps/api/core.js","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"TAURI","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/node_modules/@tauri-apps/api/core.js","output_mode":"content"}`

---

## Assistant

Good. Now I have the full picture. The `invoke` function in `@tauri-apps/api/core` directly accesses `window.__TAURI_INTERNALS__` without any guard check. This confirms the plan's root cause analysis is correct. Now let me write the review.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/.claude/plans/partitioned-knitting-acorn-agent-a5c7ac70af9509109.md","content":"# Review: Fix isTauri() detection plan\n\nWriting review to `.claude/reviews/plans/fix-i`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/fix-istauri-detection-review-1.md","content":"# Plan Review: Fix isTauri() detection\n\n## Verification of Root Cause\n\`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/fix-istauri-detection-review-1.md`.

**Summary of findings:**

1. **should-fix (edge-case):** The `__TAURI_INTERNALS__` global is an internal detail, but acceptable since the app pins `@tauri-apps/api ^2.x` and this matches what the library itself uses internally. Suggested checking both globals for extra safety, but not a blocker.

2. **suggestion (edge-case):** The cached API pattern means detection runs once. If called before Tauri injects globals, MockBridge gets cached permanently. Unlikely in practice given the async/React lifecycle.

3. **suggestion (testing):** No unit test for `isTauri()` itself. A trivial test setting `window.__TAURI_INTERNALS__ = {}` would prevent future regressions.

**Verdict:** The plan is correct and well-scoped. Root cause verified against the actual `@tauri-apps/api` v2 source — `core.js` line 202 uses `window.__TAURI_INTERNALS__.invoke()`, confirming the `__TAURI__` check is wrong. No blockers found.

---

