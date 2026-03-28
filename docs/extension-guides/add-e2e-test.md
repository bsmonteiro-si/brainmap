# How to Add an E2E Test

An E2E test verifies app behavior by interacting with a real running BrainMap instance via the tauri-plugin-mcp socket. Use this when you need to test visual behavior, multi-component interactions, or anything that unit tests can't cover.

For architecture details and gotchas, see `tests/e2e/README.md`.

## Reference implementations

- `file-tree.spec.ts` — Expand/collapse folders, visibility assertions

## Prerequisites

The E2E infrastructure is in `tests/e2e/`. If `node_modules/` doesn't exist, run:

```bash
cd tests/e2e && npm install --cache /tmp/npm-cache
```

## Checklist

### 1. Identify the DOM structure

**Before writing any test code**, read the component source to understand:

- CSS class names and `data-*` attributes you can target
- How visibility/state is managed (CSS classes, DOM presence, store state)
- What events the component responds to (click, contextmenu, keyboard)

Do not discover DOM structure via `execute_js` — that's for verification, not exploration.

### 2. Write helpers if needed

**File**: `tests/e2e/helpers.ts`

Add reusable interaction functions. Follow the existing pattern:

```typescript
export async function clickMyElement(
  client: E2EClient,
  identifier: string,
): Promise<void> {
  const safe = escapeJs(identifier);
  const result = await client.executeJs(`
    (function() {
      var el = document.querySelector('[data-my-attr="' + CSS.escape('${safe}') + '"]');
      if (!el) return 'NOT_FOUND';
      el.click();
      return 'CLICKED';
    })()
  `);
  if (result === "NOT_FOUND") {
    throw new Error(`Element not found: ${identifier}`);
  }
}
```

Rules:
- Always use `escapeJs()` for string interpolation into JS code
- Always use `CSS.escape()` for attribute selector values
- Return sentinel strings (`'NOT_FOUND'`) for error cases — don't throw inside `executeJs`
- Wrap JS in an IIFE `(function() { ... })()` to avoid polluting the global scope

### 3. Write the spec file

**File**: `tests/e2e/<area>.spec.ts`

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { type E2EClient } from "./client.js";
import { getClient } from "./connect.js";
import { sleep } from "./helpers.js";

describe("My Area", () => {
  let client: E2EClient;

  beforeAll(async () => {
    client = await getClient();
  });

  it("does something specific", async () => {
    // Arrange: get initial state
    // Act: interact with the app
    // Wait: allow for animations / React re-renders
    await sleep(400);
    // Assert: verify end state
  });
});
```

Rules:
- **Each test must be self-contained.** Do not depend on prior tests having run. If your test needs a folder expanded, expand it yourself.
- **Wait after interactions.** CSS animations (150ms) and React re-renders need time. Use `await sleep(400)` after clicks that trigger state changes.
- **Assert end state, not interactions.** Check what the DOM looks like after, not that a click handler was called.
- Use `getClient()` from `connect.ts` — it returns a shared socket connection.

### 4. Handle visibility correctly

The file tree (and other components) may hide elements via CSS rather than removing them from the DOM. Common patterns:

| Technique | How to detect visibility |
|-----------|------------------------|
| `display: none` | `el.offsetParent === null` |
| `grid-template-rows: 0fr` | Walk ancestors for `.tree-children-anim--open` class |
| `opacity: 0` | `getComputedStyle(el).opacity === '0'` |

When in doubt, check the component's CSS in `App.css`. The `getVisibleTreeItems()` helper shows the ancestor-walk pattern.

### 5. Take screenshots for visual review

```typescript
import * as fs from "node:fs";
import * as path from "node:path";

// Save to the screenshots directory
const dir = path.join(import.meta.dirname, "screenshots");
fs.mkdirSync(dir, { recursive: true });
await client.takeScreenshot(dir);
```

Screenshots are `.gitignored` and saved as timestamped JPEGs. Use them for debugging and visual review, not as assertions (no snapshot comparison yet).

### 6. Run and verify

```bash
cd tests/e2e
npx vitest run <your-spec-name>    # run just your test
npx vitest run                      # run all tests
```

The app window will appear on screen during the test. Watch it to visually confirm the interactions match your expectations.

### 7. Interacting with app stores

For complex setup (opening workspaces, switching segments, etc.), import from the Vite module graph:

```typescript
await client.executeJs(`
  (async () => {
    const { useWorkspaceStore } = await import('/src/stores/workspaceStore.ts');
    const info = useWorkspaceStore.getState().info;
    return JSON.stringify(info);
  })()
`);
```

This gives you access to the actual React app state. Use it for setup/teardown, not for assertions — assert via the DOM instead.

### 8. Available client methods

| Method | Purpose |
|--------|---------|
| `client.executeJs(code)` | Run JS in the WebView, returns coerced result |
| `client.takeScreenshot(dir?)` | Capture window screenshot |
| `client.waitForSelector(sel, ms?)` | Wait for CSS selector to be visible |
| `client.waitForText(text, ms?)` | Wait for text to appear on page |
| `client.queryPageState()` | Get URL, title, scroll, viewport |
| `client.queryAppInfo()` | Get app name, version, OS, windows |

## Maintenance

- When component DOM structure changes (class names, data attributes), update the helpers in `helpers.ts`
- When new Tauri commands are added, they're available immediately via `__TAURI_INTERNALS__.invoke()`
- The test workspace is a fresh copy of `seed/` — if seed data changes, tests may need updating
