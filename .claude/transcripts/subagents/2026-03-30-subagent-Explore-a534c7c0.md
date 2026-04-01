# 2026-03-30 — Subagent Transcript: Explore

**Date:** 2026-03-30 10:37:17
**Agent:** Explore
**Agent ID:** a534c7c0fce45efe0
**Parent Session:** ef7ce461-6110-4d5e-bb73-b8dd8f64d38f

---

## User

Search the BrainMap codebase for platform-specific gotchas, workarounds, and constraints that have been documented or implemented. I'm looking for things like:

1. Comments mentioning "workaround", "hack", "gotcha", "caveat", "quirk", "bug", "FIXME", "HACK", "XXX"
2. Tauri WebView restrictions (things that work in browser but not in Tauri)
3. React Flow internal behavior that required workarounds
4. CodeMirror 6 constraints (the .cm-line spacing rule is already known)
5. CSS specificity battles
6. Race conditions or timing issues
7. Browser API limitations in the Tauri context

Search in:
- `crates/app/src/` (TypeScript/React frontend)
- `crates/app/src-tauri/` (Rust backend)
- `docs/` (any documented gotchas)
- CLAUDE.md

Focus on finding concrete platform constraints that a developer would repeatedly trip over. Don't include general code comments — only things that represent "if you don't know this, you'll waste time debugging."

Return a structured list of what you find, grouped by platform/framework.

---

## Assistant

I'll search the BrainMap codebase systematically for platform-specific gotchas and documented workarounds.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f \\( -name \"*.ts\" -o -name \"*.tsx\" -o -name \"*.rs\" -o -name \"*.md\" \\) | head -20"}`

---

## Assistant

Now let me search for the specific patterns in the codebase:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"workaround|hack|gotcha|caveat|quirk|FIXME|HACK|XXX","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"workaround|hack|gotcha|caveat|quirk|FIXME|HACK|XXX","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"workaround|hack|gotcha|caveat|quirk|FIXME|HACK|XXX","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md"}`

---

## Assistant

Good start! I found some references. Now let me search more broadly for specific issues and race conditions:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"bug|race|timing|restriction|limitation|issue","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Tauri|WebView|WebGL|browser|scroll|focus","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/tests/e2e/README.md"}`

---

## Assistant

Excellent! Now let me search for more specific patterns related to React Flow, CodeMirror, and race conditions:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"React.*Flow|ReactFlow|canvasNodes|canvasTranslation","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs","output_mode":"content","head_limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/canvas-architecture.md"}`

---

## Assistant

Now let me search for CSS specificity and React Flow internal behavior issues:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-line|specificity|!important|margin|padding|height.*auto|NODE_TYPES","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-canvas-node-type.md"}`

---

## Assistant

Now let me search for race condition handling and specific Tauri issues:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"stale|concurrent|race|await|async|lock|mutex|Promise|AbortController","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores","output_mode":"content","head_limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/README.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs"}`

---

## Assistant

Let me search for more specific race condition code and look at the editorStore:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"race|stale.*raw|fetch.*note|segmentId|noteId.*changed","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","head_limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":100}`

---

## Assistant

Let me continue reading the editorStore and search for race condition handling:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","offset":100,"limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"AbortController|AbortSignal|cancelled|discards.*stale|activeNote.*changed|segmentId.*changed","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","h`

---

## Assistant

Perfect! Now let me check that specific test that mentions the race condition:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.test.ts","offset":520,"limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"readPlainFile.*then|raw.*cancelled|viewMode.*raw","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","output_mode":"content","head_limit":40}`

---

## Assistant

Excellent! Now let me search for additional documentation on known constraints:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"localStorage|IPC|invoke|command|WebView|Tauri.*restriction|browser.*not.*supported","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs","output_mode":"content","head_limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions"}`

---

## Assistant

Let me check the decisions directory properly:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions -type f -name \"*.md\" | head -10"}`

---

## Assistant

Let me search for more information about localStorage and check the decisions:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions/003-bridge-pattern.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"__TAURI__|IPC|invoke|localStorage|zoom|counter-zoom","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":60}`

---

## Assistant

Perfect! Now let me compile a comprehensive report. Let me search for a few more specific things about CM6 and color/styling:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"cm-line.*margin|cm-line.*padding|Decoration.widget|block.*widget|estimatedHeight","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src","output_mode":"content","head_limit":4`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"specificity|!important.*color|!important.*background","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","head_limit":50}`

---

## Assistant

Let me check the App.css for the CodeMirror line spacing rule:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"cm-line\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css | head -20"}`

---

## Assistant

Let me read that specific section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":2082,"limit":30}`

---

## Assistant

Now let me search for the specific comment about not adding margin/padding to cm-line:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 2 -B 2 \"NEVER add.*margin\\|NEVER.*margin.*cm-line\" /Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile the comprehensive report:

## Platform-Specific Gotchas, Workarounds, and Constraints Found

### **Tauri 2 Frontend-Backend Communication**

**File:** `tests/e2e/README.md`, `api/bridge.ts`, `api/tauri.ts`

1. **`__TAURI_INTERNALS__` vs `__TAURI__`**: Tauri v2 does NOT expose `window.__TAURI__`. The IPC bridge is at `window.__TAURI_INTERNALS__.invoke()`. This differs from Tauri v1 which used `window.__TAURI__.core.invoke()`.

2. **Config overrides use CLI flag, not env var**: Tauri v2 does NOT support `TAURI_CONFIG` env var. Use the `--config` CLI flag instead: `npx tauri dev --config '{"build":{"devUrl":"http://localhost:1520",...}}'`

3. **WebView readiness after socket**: After the socket file appears, the WebView may not have loaded frontend JS yet. Polling `document.readyState` and `window.__TAURI_INTERNALS__` until both are ready is necessary before executing JS.

4. **Coordinate transforms across zoom**: Global `document.documentElement.style.zoom` (from app zoom feature) breaks coordinate math — `getBoundingClientRect()` returns zoomed coords but mouse events and DPI-based APIs don't. Solutions implemented:
   - Drag-drop conversion: `physicalPos / (dpr * zoom)`
   - Canvas counter-zoom: Container applies `zoom: 1/uiZoom` with `width/height: uiZoom*100%` to neutralize global zoom
   - Context menu positions multiply by `uiZoom` to compensate

---

### **React Flow (Canvas Editor) Internal Behavior**

**File:** `docs/canvas-architecture.md`, `CanvasEditor.tsx`, `canvasNodes.tsx`, `canvasTranslation.ts`

1. **NODE_TYPES must be module-level**: If `NODE_TYPES` object is recreated on each render, React Flow will unmount/remount all nodes, losing internal state. Must be a const at module scope, not inside a component.

2. **Handle ID convention**: Source handles use bare IDs (`"top"`, `"right"`, `"bottom"`, `"left"`). Target handles use `{side}-target` suffix (`"top-target"`, etc.). This convention is enforced in `canvasToFlow`/`flowToCanvas` translation.

3. **Parent-relative positioning**: JSON Canvas stores absolute positions; React Flow needs parent-relative. The translation layer subtracts parent position for children during `canvasToFlow()` and adds it back in `flowToCanvas()`. Parent nodes must precede children in the nodes array.

4. **Fixed vs auto-height nodes**: 
   - Fixed-size shapes (circle, diamond): use `style: { width, height }`
   - Auto-expanding shapes: use `style: { width, minHeight }` (height auto-grows from content)
   - Set consistently in both `canvasToFlow()` and `addNodeAtMenu()`/`addNodeAtCenter()`

5. **Child component saves via context**: Child components (node toolbars, text editing) call `setNodes`/`setEdges` which does NOT trigger parent's `handleNodesChange`. Must follow with `scheduleSave()` from `CanvasSaveContext` to ensure persistence.

6. **Viewport restore deferred**: Uses `pendingViewportRef` + `nodesInitialized` hook. Viewport is applied via `requestAnimationFrame` once React Flow has measured all nodes. Prevents overwriting from transient mount/unmount cycles via `hasRestoredViewportRef` guard.

7. **Collapsed folders in file tree use CSS, not DOM removal**: File tree uses `grid-template-rows: 0fr` + `overflow: hidden` for collapse animation. Children are **in the DOM** but have zero height. Naive `querySelector` will find them. Use `getVisibleTreeItems()` helper to check `.tree-children-anim--open` class on ancestors.

---

### **CodeMirror 6 Constraints**

**File:** `CLAUDE.md`, `App.css:2082-2085`, `cmCalloutDecorations.ts`, `cmMermaidDecorations.ts`

1. **NO margin/padding on `.cm-line`**: NEVER add `margin` or `padding` to `.cm-line` elements — breaks mouse hit-testing. Use `Decoration.widget({ widget, block: true })` with a matching `estimatedHeight` getter instead. CodeMirror 6 includes these in its height map.
   - Current code: `.cm-line` only has `font-family` and `font-size` with `!important`
   - Callout decorations use `Decoration.widget()` with `estimatedHeight` getters for spacing

2. **Block widgets need estimatedHeight**: All block-level widget decorations must provide an `estimatedHeight` getter so CM6's height map remains accurate. See implementation in `cmCalloutDecorations.ts` (line 243, 257, 338) and `cmMermaidDecorations.ts` (line 151).

---

### **Race Conditions: Stale Async Fetch Handling**

**File:** `editorStore.test.ts:528-546`, `editorStore.ts:168-177`

1. **Raw file content fetch race**: When switching notes while a raw content fetch is in-flight, the old fetch result is discarded. Pattern used:
   ```typescript
   api.readPlainFile(path).then(file => {
     // Guard: check if still viewing same note and same mode
     if (get().viewMode === "raw" && get().activeNote?.path === path) {
       set({ rawContent: file.body });
     }
   })
   ```
   Test at `editorStore.test.ts:528` verifies stale results are ignored when note changes mid-fetch.

2. **Image preview race in canvas nodes**: Same pattern used in `canvasNodes.tsx:546-565` for loading image previews — `cancelled` flag guards against setting state for stale fetches.

3. **Concurrent tab switches guarded**: `editorStore.ts` guards with `if (isLoading) return;` to prevent concurrent tab switches. `savingInProgress` flag prevents concurrent saves.

---

### **CSS Specificity and Styling Battles**

**File:** `App.css` (extensive)

1. **`!important` used selectively**: Applied to CodeMirror styling (`.cm-line`, `.cm-editor` overrides), selection backgrounds (`.cm-selectionBackground`), and theme-critical rules (callout colors, accent colors). Pattern: theme variables (`var(--accent)`, `var(--bg-primary)`) with `!important` to override library defaults.

2. **Color-mix fallback for browser compatibility**: Uses `color-mix(in srgb, ...)` with fallback colors:
   ```css
   background: rgba(99, 179, 237, 0.12); /* fallback for browsers without color-mix */
   background: color-mix(in srgb, var(--accent) 5%, transparent);
   ```

3. **Callout line left-margin rule**: `.editor-body .cm-editor .cm-callout-line { margin-left: 6px !important; }` — only exception is a controlled margin on a non-`.cm-line` element for visual indent.

---

### **localStorage Constraints**

**File:** `docs/10-ux-improvements.md`, `uiStore.ts`, `canvas-architecture.md`

1. **localStorage works in Tauri v2 but can be cleared**: Tauri v2 supports localStorage, but OS cache management or app reinstall can clear it. Acceptable for UI preferences (panel sizes, viewport cache, theme settings) where loss is non-critical. Key pattern: `brainmap:<setting>` (e.g., `brainmap:uiPrefs`, `brainmap:canvasViewports`).

2. **Viewport persistence key**: Canvas stores viewport in `brainmap:canvasViewports` — a JSON object mapping path → `{x, y, zoom}`.

3. **No persistent store plugin for simple settings**: Decision made (doc 10) to NOT add `tauri-plugin-store` just for panel sizes — localStorage is acceptable and avoids Rust dependency bloat.

---

### **File Tree Panel Specifics**

**File:** `tests/e2e/README.md`, `FileTreePanel.tsx:1268`, `useExternalDragDrop.ts`

1. **Collapsed folders use CSS grid animation**: File tree uses `grid-template-rows: 0fr` + `overflow: hidden` for collapse. Children are in DOM but have zero height. Test helper `getVisibleTreeItems()` walks ancestors checking `.tree-children-anim--open` class instead of relying on `offsetHeight`.

2. **Drag position requires zoom compensation**: External drag-drop converts Tauri `PhysicalPosition` accounting for both device pixel ratio AND global zoom: `x = px / (dpr * zoom)`.

---

### **Canvas Auto-Save Mechanics**

**File:** `CanvasEditor.tsx`, `canvas-architecture.md`

1. **Child components bypass handleNodesChange**: When child components call `setNodes`/`setEdges` directly via `useReactFlow()`, the parent's `handleNodesChange` is NOT triggered. All child mutations must be followed by `scheduleSave()` from `CanvasSaveContext`.

2. **Debounce + guard against concurrent saves**: 1500ms debounce timer with `savingRef` guard prevents concurrent writes. Save on unmount checks `pendingSaves.has(path)` to catch unsaved state.

3. **Cmd+S dispatches custom event**: App.tsx dispatches `"canvas:save"` event (not a standard keyboard shortcut), which CanvasEditor listens for to cancel pending debounce and save immediately.

---

### **E2E Testing Quirks**

**File:** `tests/e2e/README.md`

1. **npm run dev hardcodes `--port 1420`**: The `package.json` dev script is `vite --port 1420`, overriding `vite.config.ts`. E2E setup handles this via `--config` CLI override of `beforeDevCommand`.

2. **executeJs results wrapped as strings**: The plugin wraps all results as `{result: "stringified-value", type: "boolean"|...}`. Client method `executeJs()` handles coercion automatically, but raw socket calls must type-coerce `"false"` → boolean `false`.

3. **Path escaping in helpers**: When interpolating file paths into `executeJs` strings, use `CSS.escape()` for attribute selectors and escape JS special characters (quotes, backslashes).

---

### **Documentation Requirements**

**File:** `CLAUDE.md`

1. **Canvas architecture doc is authoritative**: When modifying Canvas code, check `docs/canvas-architecture.md` for contradictions. Update docs if you add/remove/rename components, change data flow, state management, keyboard shortcuts, or integration points.

2. **Extension guides are mandatory**: Always check `docs/extension-guides/` before implementing (recipes for adding callout types, canvas nodes, inline commands, CLI commands, MCP tools, etc.).

3. **Decision records capture constraints**: `docs/decisions/` contains architectural choices and their tradeoffs (e.g., bridge pattern for API abstraction, manual MCP dispatch, folder nodes as virtual graph nodes).

---

This represents the accumulation of hard-won debugging knowledge across Tauri, React Flow, CodeMirror, race conditions, and platform constraints.

---

