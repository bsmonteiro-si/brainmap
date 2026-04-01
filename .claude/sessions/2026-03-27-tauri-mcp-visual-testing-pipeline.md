# 2026-03-27 — tauri-plugin-mcp Integration & Visual Testing Pipeline

## What Was Done

1. **Researched Claude Code video input and desktop app testing options**
   - Confirmed Claude Code CLI cannot accept video files natively (feature request: anthropics/claude-code#12676)
   - Evaluated Computer Use (Desktop-only, not CLI), Playwright (no WKWebView driver on macOS), Claude in Chrome (unreliable per user)
   - Discovered `tauri-plugin-mcp` — purpose-built MCP plugin for Tauri apps that exposes screenshot, DOM query, click, and JS execution via IPC socket

2. **Integrated tauri-plugin-mcp into BrainMap**
   - Added Rust dependency (`tauri-plugin-mcp` from git) to `crates/app/src-tauri/Cargo.toml`
   - Registered plugin in `lib.rs` (debug builds only) with IPC socket at `/tmp/brainmap-mcp.sock`
   - Installed guest JS bindings (`npm install tauri-plugin-mcp`) and initialized `setupPluginListeners()` in `main.tsx` (dev only)
   - Built MCP server from source (npm-published package was broken — missing shebang)
   - Configured `.mcp.json` to point to locally-built server

3. **Tested all MCP capabilities against the live app**
   - Screenshots: `take_screenshot(inline=true)` — works, captures window buffer (doesn't need foreground)
   - Element finding: `query_page(mode='find_element')` — works
   - Clicking: `execute_js` with DOM `.click()` — works (native `click` tool has Retina 2x scaling issues)
   - Canvas pan/zoom: d3-zoom direct manipulation on `.react-flow__renderer.__zoom` — works
   - Text input: `type_text` MCP tool — works for React-controlled inputs
   - Context menus: `dispatchEvent(new MouseEvent('contextmenu'))` — works
   - Discovered: synthetic PointerEvent/WheelEvent are ignored by React Flow; direct DOM `.textContent` modification crashes React

4. **Designed the full automated testing pipeline**
   - Target: implement in worktree → build → launch isolated instance → visually test → merge
   - Blocker: MCP servers are session-scoped (can't dynamically connect to new socket)
   - Solution designed: direct socket client script (not yet built)
   - Research saved at `.claude/research/visual-testing-pipeline.md`

5. **Cataloged all 208 user interactions across the entire app**
   - Organized by area: sidebar, file tree, tabs, editor, canvas, dialogs, search, graph, settings, etc.
   - Classified: 29 covered, 155 need patterns, 24 need research
   - Prioritized into 4 tiers
   - Saved at `.claude/research/visual-testing-interaction-coverage.md`

6. **Created playbook library for agent navigation (8 files)**
   - `00-principles.md` — mandatory rules for effective MCP usage
   - `01-basics.md` — screenshot, sidebar, view state
   - `02-file-tree.md` — expand, open, list, toolbar, context menus
   - `03-tabs.md` — switch, close, new, list
   - `04-editor.md` — toolbar, view modes, content, shortcuts
   - `05-canvas.md` — pan, zoom, nodes, toolbar, context menus, text editing
   - `06-dialogs.md` — fill inputs, submit, cancel, confirm delete
   - `07-search.md` — search, filter, click results
   - `08-helpers.md` — setNativeValue, context menus, type_text, React DOM warning

7. **Fixed canvas edge "Invert direction" bug**
   - Bug: clicking "Invert direction" didn't visually swap the edge direction
   - Root cause: React Flow doesn't re-render an edge when source/target change but the array position and id stay the same
   - Fix: changed `setEdges` from `map()` to filter+append (remove old edge, add inverted one), forcing React Flow to reconcile as a new element. Also set handle/marker keys explicitly to `undefined` instead of conditional spread.
   - 16 unit tests added in `canvasEdgeHandlers.test.ts`
   - File: `crates/app/src/components/Editor/canvasNodes.tsx` lines 1162-1186

## Key Decisions and Patterns

- **`execute_js` is the universal interaction tool** — native `click` has Retina scaling issues, `mouse_action(drag)` doesn't work with React Flow, synthetic PointerEvent/WheelEvent are ignored. All reliable interactions go through `execute_js`.
- **`setNativeValue` pattern** — required for React controlled inputs. Uses `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set` then dispatches `input` + `change` events.
- **Canvas d3-zoom manipulation** — `.react-flow__renderer.__zoom` object has `x`, `y`, `k` (zoom). Update it and set `.react-flow__viewport.style.transform` to match.
- **Canvas text editing** — double-click `.canvas-text-node-body` → textarea `.canvas-text-node-edit` appears → use `type_text` MCP tool → click `.react-flow__pane` to commit.
- **Never modify React DOM directly** — setting `.textContent`/`.innerHTML` crashes the app by desynchronizing the virtual DOM.
- **React Flow edge re-rendering** — changing source/target via `map()` with same id doesn't trigger re-render. Must remove+re-add the edge.
- **Playbooks over monolithic skill** — interaction patterns organized as focused files agents load selectively, not one giant skill.

## Files Changed

| File | Change |
|------|--------|
| `crates/app/src-tauri/Cargo.toml` | Added `tauri-plugin-mcp` dependency |
| `crates/app/src-tauri/src/lib.rs` | Registered MCP plugin (debug only) |
| `crates/app/src/main.tsx` | Added `setupPluginListeners()` init |
| `crates/app/package.json` | Added `tauri-plugin-mcp` JS bindings |
| `crates/app/package-lock.json` | Lock file update |
| `.mcp.json` | MCP server config for Claude Code |
| `crates/app/src-tauri/capabilities/default.json` | Auto-generated capability update |
| `crates/app/src-tauri/gen/schemas/*.json` | Auto-generated schema updates |
| `crates/app/src/components/Editor/canvasNodes.tsx` | Fixed `handleInvert` edge handler |
| `crates/app/src/components/Editor/canvasEdgeHandlers.test.ts` | New: 16 edge handler unit tests |
| `.claude/playbooks/tauri-mcp/00-principles.md` | New: MCP usage principles |
| `.claude/playbooks/tauri-mcp/01-basics.md` | New: basic patterns |
| `.claude/playbooks/tauri-mcp/02-file-tree.md` | New: file tree patterns |
| `.claude/playbooks/tauri-mcp/03-tabs.md` | New: tab bar patterns |
| `.claude/playbooks/tauri-mcp/04-editor.md` | New: editor patterns |
| `.claude/playbooks/tauri-mcp/05-canvas.md` | New: canvas patterns |
| `.claude/playbooks/tauri-mcp/06-dialogs.md` | New: dialog patterns |
| `.claude/playbooks/tauri-mcp/07-search.md` | New: search patterns |
| `.claude/playbooks/tauri-mcp/08-helpers.md` | New: reusable helpers |
| `.claude/playbooks/tauri-mcp/README.md` | New: playbook index |
| `.claude/skills/tauri-mcp-navigate/SKILL.md` | New: thin pointer to playbooks |
| `.claude/research/visual-testing-pipeline.md` | New: pipeline design doc |
| `.claude/research/visual-testing-interaction-coverage.md` | New: 208-action coverage matrix |

## Current Test Status

- Rust tests: not run this session (no Rust changes beyond Cargo.toml)
- Vitest: 16/16 passed (canvasEdgeHandlers.test.ts)
- Full suite not run

## Remaining Known Items

- **Pipeline not yet built**: worktree isolation, parameterized sockets/ports, direct socket client script — all designed but not implemented. See `.claude/research/visual-testing-pipeline.md`.
- **Interaction coverage at 14%**: 155 patterns still need writing (Tier 2-4). See `.claude/research/visual-testing-interaction-coverage.md`.
- **MCP server from source**: built at `/tmp/tauri-plugin-mcp/` — ephemeral location. Should be moved to a stable path or the npm package should be fixed upstream.
- **Canvas file corrupted**: the Aula 1.canvas file was modified during testing (edges inverted, text cards added). Needs manual cleanup or `git checkout`.
- **Session lesson**: MCP should be used for verification only, not exploration. Read source code first. Never test against corrupted state. Documented in `00-principles.md` and feedback memory.
