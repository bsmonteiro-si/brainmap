# 2026-03-31 — Subagent Transcript: Explore

**Date:** 2026-03-31 17:10:33
**Agent:** Explore
**Agent ID:** a7cc18e0647d8ba24
**Parent Session:** cddc4168-9fe3-481a-b8cc-78916a78fa61

---

## User

Explore the E2E test infrastructure for BrainMap to understand patterns for writing a new test.

1. Read `docs/extension-guides/add-e2e-test.md` for the full guide
2. Read `tests/e2e/connect.ts` and `tests/e2e/client.ts` to understand the client API
3. Read `tests/e2e/helpers.ts` for reusable patterns
4. Read 1-2 existing spec files in `tests/e2e/*.spec.ts` to see established patterns (especially how they do: setup, interactions via executeJs, assertions, teardown)
5. Check if there are any existing canvas-related tests

Report back with:
- The full client API surface (what methods are available)
- The helper functions available
- How tests typically structure their arrange/act/assert
- Any canvas-specific test patterns that exist

---

## Assistant

I'll explore the E2E test infrastructure for BrainMap. Let me start by reading the key files you've mentioned.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-e2e-test.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/connect.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/client.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/helpers.ts"}`

---

## Assistant

Now let me find and read the spec files to understand established patterns:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/*.spec.ts"}`

---

## Assistant

Perfect! Let me read these two spec files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/file-tree.spec.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/canvas-fullscreen.spec.ts"}`

---

## Assistant

Perfect! Now let me check if there are any other canvas-related test patterns by searching for canvas references:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas|react-flow","glob":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/*.ts","output_mode":"files_with_matches"}`

---

## Assistant

Let me search differently:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas|react-flow","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e","output_mode":"files_with_matches"}`

---

## Assistant

Great! Now let me check the README for additional context:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/README.md"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile a comprehensive report.

## E2E Test Infrastructure Report for BrainMap

Based on my exploration of the E2E test infrastructure, here's what I found:

---

### **Full Client API Surface**

The `E2EClient` class provides these core methods (from `/tests/e2e/client.ts`):

| Method | Purpose | Returns |
|--------|---------|---------|
| `executeJs(code: string)` | Execute JavaScript in the WebView | Coerced result (auto-converts booleans, numbers, objects from stringified form) |
| `takeScreenshot(outputDir?: string)` | Capture a window screenshot | Screenshot data (saved to disk if outputDir provided) |
| `waitForSelector(selector: string, timeoutMs?)` | Wait for CSS selector to be visible | Promise that resolves when element appears |
| `waitForText(text: string, timeoutMs?)` | Wait for text to appear on page | Promise that resolves when text is found |
| `queryPageState()` | Get URL, title, scroll, viewport info | Page state object |
| `queryAppInfo()` | Get app name, version, OS, windows, monitors | App info object |
| `connect()` | Connect to the MCP socket | Void promise |
| `disconnect()` | Disconnect from socket | Void |

**Important detail**: All `executeJs` results are auto-coerced. The plugin returns `{result: "stringified", type: "boolean"|"number"|...}` but `E2EClient.executeJs()` handles coercion so you get native types back.

---

### **Helper Functions Available**

From `/tests/e2e/helpers.ts`:

| Helper | Purpose | Notes |
|--------|---------|-------|
| `getVisibleTreeItems(client)` | Get array of visible file tree paths | Handles collapsed folders (children in DOM but hidden via `grid-template-rows: 0fr`) by checking ancestor `.tree-children-anim--open` class |
| `clickFolder(client, folderPath)` | Toggle folder expand/collapse | Uses `data-tree-path` and `data-tree-is-folder="1"` selectors |
| `isFolderExpanded(client, folderPath)` | Check if folder is expanded | Returns boolean |
| `clickFile(client, filePath)` | Click a file in the tree | Uses `data-tree-path` selector |
| `waitForTreeLoaded(client, timeoutMs?)` | Wait for at least one tree item to render | Waits for `[data-tree-path]` selector |
| `sleep(ms)` | Sleep for given milliseconds | Used after interactions (typically 400ms for CSS animations + React renders) |
| `escapeJs(string)` | Escape strings for safe JS interpolation | Escapes backslashes, quotes, etc. |

**Key pattern**: Helpers wrap DOM interactions in IIFEs to avoid polluting global scope, use `CSS.escape()` for attribute selectors, and return sentinel strings (e.g., `'NOT_FOUND'`) for error cases instead of throwing inside `executeJs`.

---

### **Test Structure Pattern (Arrange/Act/Assert)**

Both existing spec files follow this structure:

**Setup (beforeAll):**
```typescript
beforeAll(async () => {
  client = await getClient();  // Reuses single shared connection
  // Optional: setup via executeJs importing app stores
});
```

**Individual test pattern:**
```typescript
it("describes specific behavior", async () => {
  // Arrange: Get initial state via query or helper
  const before = await getVisibleTreeItems(client);
  
  // Act: Interact with the app
  await clickFolder(client, "FolderPath");
  
  // Wait: Allow CSS animations (150ms) + React re-renders
  await sleep(400);
  
  // Assert: Verify end state (never the interaction itself)
  const after = await getVisibleTreeItems(client);
  expect(after).toContain("ExpectedItem");
});
```

**Teardown (afterAll, optional):**
```typescript
afterAll(async () => {
  // Reset app state via executeJs + store imports
  await client.executeJs(`
    (async () => {
      const { useUIStore } = await import('/src/stores/uiStore.ts');
      useUIStore.getState().resetState();
    })()
  `);
});
```

**Critical rules:**
- Each test must be **self-contained** — don't depend on prior tests running
- **Always wait 400ms** after interactions that trigger state changes (CSS animations take ~150ms)
- Assert the **end state** of the DOM, not that a handler was called
- Use `getClient()` from `connect.ts` (reuses socket across all tests in the worker)

---

### **Canvas-Specific Test Patterns**

The `/tests/e2e/canvas-fullscreen.spec.ts` file demonstrates canvas testing patterns:

**Canvas DOM selectors:**
- `.react-flow__node` — Individual nodes (use `data-id` attribute)
- `.react-flow__renderer` — Main renderer container (has `__zoom` property for viewport state)
- `.react-flow__controls-zoomin` / `.react-flow__controls-zoomout` — Zoom buttons
- `.canvas-container` / `.canvas-container.canvas-fullscreen` — Container (CSS classes indicate state)
- `.canvas-toolbar` — Toolbar buttons (identified by `title` attribute)

**Canvas setup via store:**
```typescript
await client.executeJs(`
  (async () => {
    const { useUIStore } = await import('/src/stores/uiStore.ts');
    useUIStore.getState().openCanvasInPanel('The Smoking Controversy.canvas');
    return 'opened';
  })()
`);
await sleep(1000);  // Canvas takes time to render
```

**Canvas state queries:**
```typescript
// Node count
const nodeCount = await client.executeJs(`
  (function() { return document.querySelectorAll('.react-flow__node').length; })()
`);

// Node IDs (sorted to avoid order sensitivity)
const nodeIds = await client.executeJs(`
  (function() {
    var nodes = document.querySelectorAll('.react-flow__node');
    return JSON.stringify(Array.from(nodes).map(n => n.getAttribute('data-id')).sort());
  })()
`);

// Viewport state (x, y, zoom from renderer.__zoom object)
const viewport = await client.executeJs(`
  (function() {
    var renderer = document.querySelector('.react-flow__renderer');
    if (!renderer || !renderer.__zoom) return null;
    var z = renderer.__zoom;
    return JSON.stringify({ x: z.x, y: z.y, zoom: z.k });
  })()
`);

// CSS computed styles
const style = await client.executeJs(`
  (function() {
    var el = document.querySelector('.canvas-container');
    var cs = getComputedStyle(el);
    return JSON.stringify({ position: cs.position, zIndex: cs.zIndex });
  })()
`);
```

**Canvas interaction patterns:**
```typescript
// Click fullscreen button by title
await client.executeJs(`
  (function() {
    var btns = document.querySelectorAll('.canvas-toolbar button');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].title === 'Fullscreen') {
        btns[i].click();
        return 'CLICKED';
      }
    }
    return 'NOT_FOUND';
  })()
`);

// Or use store directly for state changes
await client.executeJs(`
  (async () => {
    const { useUIStore } = await import('/src/stores/uiStore.ts');
    useUIStore.getState().toggleCanvasFullscreen();
    return 'toggled';
  })()
`);

// Zoom in/out via buttons
await client.executeJs(`
  (function() {
    var btn = document.querySelector('.react-flow__controls-zoomin');
    if (btn) { btn.click(); btn.click(); }
  })()
`);
```

**Key canvas testing insights:**
1. **Component lifecycle**: Canvas is never unmounted during state changes — use node snapshots to verify same component instance before/after operations
2. **Viewport preservation**: React Flow's zoom state (`renderer.__zoom`) persists across fullscreen and other state changes
3. **Assertions focus on node preservation**: Don't check that CSS classes changed; verify nodes survive state transitions
4. **Sorting matters**: Always sort node IDs before comparing arrays to avoid order-dependent failures
5. **Type coercion**: `JSON.stringify()` then `JSON.parse()` on the client side to handle type coercion from `executeJs`

---

### **Key Infrastructure Details**

**Socket protocol**: Newline-delimited JSON over Unix socket. The `E2EClient` handles serialization/deserialization and type coercion automatically.

**Workspace isolation**: Tests use a fresh copy of `seed/` directory (not the user's workspace).

**Logging**: App logs go to `tests/e2e/logs/app/brainmap.log.YYYY-MM-DD` (separate from dev instance to prevent interleaving).

**Reference implementations**: 
- `file-tree.spec.ts` — Folder expand/collapse visibility
- `canvas-fullscreen.spec.ts` — Canvas state preservation, zoom, viewport, node stability

All of this information is documented in the guide files at `/docs/extension-guides/add-e2e-test.md` and `/tests/e2e/README.md`.

---

