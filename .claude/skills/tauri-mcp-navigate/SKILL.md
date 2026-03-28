---
name: tauri-mcp-navigate
description: Navigate and interact with the BrainMap Tauri app via tauri-mcp tools for visual testing
argument-hint: [action to perform, e.g. "open canvas Aula 1" or "verify file tree shows 6 folders"]
---

# BrainMap App Navigation via tauri-mcp

Read the playbook files at `.claude/playbooks/tauri-mcp/` for precise interaction patterns.

## Quick Start

1. **Read `00-principles.md` first** — mandatory rules for MCP usage
2. Load tools: `ToolSearch(query="select:mcp__tauri-mcp__take_screenshot")` and `ToolSearch(query="select:mcp__tauri-mcp__execute_js")`
3. Verify app: `mcp__tauri-mcp__query_page(mode="app_info")`
4. Read the relevant playbook for your task

## Playbook Index

| File | When to read |
|------|-------------|
| `01-basics.md` | Always — screenshot, sidebar nav, view state |
| `02-file-tree.md` | Working with files and folders |
| `03-tabs.md` | Managing open tabs |
| `04-editor.md` | Editing notes, toolbar, keyboard shortcuts |
| `05-canvas.md` | Canvas interactions (pan, zoom, nodes, toolbar) |
| `06-dialogs.md` | Filling forms, creating notes, confirming deletes |
| `07-search.md` | Searching and filtering notes |
| `08-helpers.md` | Reusable patterns (setNativeValue, context menus, buttons) |

## Isolated App Instance

To test without affecting the user's dev instance, launch an isolated app:

1. Run `./scripts/e2e-app.sh start` — launches BrainMap on port 1520 with socket `/tmp/brainmap-mcp-isolated.sock`
2. Use `tauri-mcp-isolated` MCP tools instead of `tauri-mcp` (loads from `.mcp.json`)
3. Open a workspace: `executeJs("import('/src/stores/segmentActions.ts').then(m => m.openFolderAsSegment('/path'))")`
4. When done: `./scripts/e2e-app.sh stop`

Use this when the user asks to "run in an isolated instance", "test visually without touching my app", or for any destructive/exploratory testing.

**Tauri v2 IPC note**: use `window.__TAURI_INTERNALS__.invoke()`, NOT `window.__TAURI__` (which doesn't exist in v2).

## Checking Logs After Interactions

**Always check logs after performing MCP interactions**, especially when verifying fixes or investigating bugs. Don't wait for something to go wrong — proactively read them.

| Instance | Log location |
|----------|-------------|
| Dev instance | `~/.brainmap/logs/brainmap.log.YYYY-MM-DD` |
| Isolated instance | `tests/e2e/logs/app/brainmap.log.YYYY-MM-DD` |
| Isolated cargo/vite output | `tests/e2e/logs/isolated-app.log` |

```bash
# After an MCP interaction on the dev instance:
grep "canvas::invert" ~/.brainmap/logs/brainmap.log.$(date +%Y-%m-%d) | tail -20

# After an MCP interaction on the isolated instance:
grep "canvas::invert" tests/e2e/logs/app/brainmap.log.$(date +%Y-%m-%d) | tail -20
```

Logs include both backend (Rust tracing) and frontend (`log.debug/info/warn/error`) output. Frontend logs have a `frontend` target and an `origin` field showing the component.

## Critical Rules

1. **ALWAYS use `execute_js` for interactions** — native `click` has Retina scaling issues
2. **NEVER use synthetic PointerEvent/WheelEvent for React Flow** — use d3-zoom manipulation
3. **NEVER modify `.textContent`/`.innerHTML` on React elements** — crashes the app. Use `type_text` MCP tool instead
4. **Take a screenshot after every action** to verify
5. **Check logs after interactions** — don't just look at screenshots, read the log output
