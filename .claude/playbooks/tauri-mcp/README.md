# BrainMap App Automation via tauri-mcp

Playbook files for navigating and interacting with the BrainMap Tauri desktop app using `tauri-mcp` MCP tools. Read only the files relevant to your task.

## Prerequisites

- BrainMap Tauri app running (`cd crates/app && npm run tauri dev`)
- MCP socket active at `/tmp/brainmap-mcp.sock`
- `tauri-mcp` MCP server connected (verify with `query_page(mode='app_info')`)

## Critical Rules

1. **ALWAYS use `execute_js` for clicking and interacting** — the native `click` tool has Retina 2x coordinate scaling issues on macOS.
2. **NEVER use synthetic PointerEvent/WheelEvent for React Flow** — they are ignored. Use d3-zoom direct manipulation instead.
3. **NEVER guess coordinates from screenshots** — screenshot resolution differs from CSS pixels.
4. **NEVER modify `.textContent`, `.innerHTML`, or `.innerText` on React-managed elements** — this crashes the app. Use the `type_text` MCP tool or `setNativeValue` helper instead.
5. **Take a screenshot after every action** to verify the result.

## Tool Loading

Before using any `tauri-mcp` tool, load it first:

```
ToolSearch(query="select:mcp__tauri-mcp__take_screenshot")
ToolSearch(query="select:mcp__tauri-mcp__execute_js")
ToolSearch(query="select:mcp__tauri-mcp__query_page")
```

## What Does NOT Work

| Action | Why |
|--------|-----|
| Native `click` tool with exact positioning | Retina 2x scaling — coordinates land at wrong positions |
| `mouse_action(drag)` on React Flow canvas | React Flow uses `setPointerCapture`, ignores synthetic events |
| Dispatching `WheelEvent` for React Flow zoom | d3-zoom doesn't process synthetic wheel events |
| Dispatching `PointerEvent` sequences | `setPointerCapture` only works with real OS-level input |
| `query_page(mode='map')` on complex views | Times out on large DOMs (canvas with many nodes) |

## Playbook Index

| File | Covers |
|------|--------|
| `01-basics.md` | Screenshot, verify app, sidebar nav, view state dump |
| `02-file-tree.md` | Expand, open, list, toolbar, context menus, rename |
| `03-tabs.md` | Switch, close, new tab, list open tabs |
| `04-editor.md` | Toolbar buttons, view modes, read/write content, keyboard shortcuts |
| `05-canvas.md` | Pan, zoom, nodes, toolbar, context menus, add/delete |
| `06-dialogs.md` | Fill React inputs, submit, cancel, confirm delete |
| `07-search.md` | Search, filter by type, click results |
| `08-helpers.md` | `setNativeValue`, dump all elements, dismiss menus |

## Research

Full pipeline design (worktree isolation, headless testing, merge flow): `.claude/research/visual-testing-pipeline.md`
Interaction coverage matrix (208 actions cataloged): `.claude/research/visual-testing-interaction-coverage.md`
