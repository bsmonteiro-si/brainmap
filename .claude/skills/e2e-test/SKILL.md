---
name: e2e-test
description: Write and run E2E tests that verify app behavior through the tauri-plugin-mcp socket. Use after implementing a feature or bugfix that needs end-to-end verification, or when the user asks for E2E test coverage.
argument-hint: [what to test, e.g. "canvas fullscreen preserves content" or "file tree context menu creates folder"]
---

# E2E Test Skill

Write E2E tests that verify real app behavior via the tauri-plugin-mcp socket. The test suite spins up a real BrainMap instance, runs tests against it, and tears down.

## Critical Constraint: Test What Actually Broke

If this test is for a bugfix, you MUST test the **exact failure mode** that the bug caused, not just that the feature "works." Ask yourself:

- What specific state was lost, corrupted, or wrong?
- What was the user's exact experience of the bug?
- If this test had existed before the fix, would it have caught the bug?

A test that passes on both the broken and fixed code is worthless. Design assertions that would **fail on the broken code**.

Examples:
- Bug: "fullscreen destroys canvas content" → Assert node IDs and text are identical before/after toggle. Don't just assert "a canvas renders."
- Bug: "undo doesn't work after paste" → Assert undo restores the pre-paste state exactly. Don't just assert "undo button exists."
- Bug: "file tree loses selection after rename" → Assert the renamed file is selected. Don't just assert "file tree renders."

## Before Writing Any Code

1. **Read the extension guide**: `docs/extension-guides/add-e2e-test.md` — the full checklist
2. **Read the relevant playbook**: `.claude/playbooks/tauri-mcp/` — interaction patterns for the area you're testing
3. **Read the existing tests**: `tests/e2e/*.spec.ts` — follow established patterns
4. **Read the component source**: understand CSS classes, data attributes, store interactions, and event handlers

Do NOT write tests by discovering DOM structure through `executeJs`. Read the source first.

## Step 1: Design the Test Cases

Before writing code, list the test cases. For each:

- **Name**: descriptive, starts with what's being verified
- **Arrange**: what state the app needs to be in
- **Act**: what interaction triggers the behavior
- **Assert**: what DOM state proves correctness — be specific about what values to check

For bugfixes, include at least one test that directly exercises the failure mode.

Present the test plan to the user before proceeding.

## Step 2: Write the Spec File

**File**: `tests/e2e/<area>.spec.ts`

Follow these patterns from the extension guide and existing tests:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { type E2EClient } from "./client.js";
import { getClient } from "./connect.js";
import { sleep } from "./helpers.js";

describe("Area Name", () => {
  let client: E2EClient;
  const screenshotsDir = path.join(import.meta.dirname, "screenshots");

  beforeAll(async () => {
    client = await getClient();
    fs.mkdirSync(screenshotsDir, { recursive: true });
    // Setup: navigate to the right view
  });

  afterAll(async () => {
    // Cleanup: restore app to neutral state
  });

  it("specific behavior being verified", async () => {
    // Arrange → Act → sleep(400-500) → Assert
  });
});
```

### Rules

- **Each test is self-contained** — don't depend on prior tests
- **`sleep(400-500)` after interactions** — CSS animations + React re-renders need time
- **Assert DOM state, not store state** — `executeJs` with async `import()` returns `{}` for complex values; use DOM queries instead
- **Wrap JS in IIFEs** — `(function() { ... })()` to avoid polluting global scope
- **Use `escapeJs()` + `CSS.escape()`** for interpolated strings
- **Store imports for setup only** — use `import('/src/stores/...ts')` for navigation/setup, but assert via DOM

### Interaction Patterns

All interactions go through `client.executeJs()`. Refer to the playbooks for exact patterns:

| Action | Playbook |
|--------|----------|
| Sidebar navigation | `01-basics.md` |
| File tree clicks | `02-file-tree.md` |
| Tab management | `03-tabs.md` |
| Editor interactions | `04-editor.md` |
| Canvas (React Flow) | `05-canvas.md` |
| Dialogs and forms | `06-dialogs.md` |
| Search | `07-search.md` |

**Never use native MCP `click`/`type_text` in E2E tests** — use `executeJs` with DOM queries.

### Common Gotchas

- `executeJs` with `async () => import(...)` returns `{}` for non-string results — parse JSON inside the JS, or use DOM assertions instead
- React Flow nodes: query `.react-flow__node` with `data-id` attribute
- Canvas toolbar buttons: query `.canvas-toolbar button` by `title` attribute
- Visibility: elements hidden via CSS are still in DOM — check computed styles or class ancestry
- Canvas opens in left panel via `openCanvasInPanel()`, not `openTab()` with kind `"canvas"`

## Step 3: Add Helpers If Needed

If your test needs reusable interaction patterns, add them to `tests/e2e/helpers.ts`. Follow the existing `clickFolder`/`getVisibleTreeItems` patterns.

## Step 4: Run and Verify

```bash
cd tests/e2e && npx vitest run <spec-name>
```

The E2E setup launches a real app instance (~15s warm, ~3min cold compile). If port 1520 is busy, it fails fast with instructions.

All tests must pass. If a test fails, diagnose from the error message — don't guess. Read the component source to understand what the DOM actually looks like.

## Step 5: Verify the Bug-Catch Property

For bugfix tests, mentally (or actually) revert the fix and confirm the test would fail. If you can't convince yourself the test catches the bug, the assertions are too weak — tighten them.

## Step 6: Independent Review

After all tests pass, spawn a `general-purpose` agent to review the test suite. Pass it **facts only** — no interpretation or self-assessment. The agent must receive:

1. **The original user request** — the bug report or feature description, verbatim
2. **What was changed** — list of modified files and a one-line summary of each change
3. **The full test file** — the complete spec file content
4. **The test results** — pass/fail output from the vitest run

The agent reviews against these criteria:

1. **Missing scenarios** — Are there user-reachable paths that aren't tested? Edge cases? Error states? State transitions the user would hit naturally?
2. **Missing assertions** — Do existing tests assert enough? Could a test pass on broken code because the assertions are too loose?
3. **Test quality** — Should tests be compacted (duplicated setup), split (testing too many things), or restructured? Are `sleep()` durations justified? Are tests self-contained?
4. **Anything else** — Does the test follow project conventions (`docs/extension-guides/add-e2e-test.md`)? Are there gotchas it falls into? Would a new contributor understand what each test verifies?

The agent writes its feedback to `.claude/reviews/e2e/<spec-name>-review.md`.

Read the review. For any finding marked `missing-scenario` or `weak-assertion`, update the tests. For `suggestion` items, use judgment. Run the tests again after changes.
