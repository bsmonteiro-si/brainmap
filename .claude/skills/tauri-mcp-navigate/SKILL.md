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

## Critical Rules

1. **ALWAYS use `execute_js` for interactions** — native `click` has Retina scaling issues
2. **NEVER use synthetic PointerEvent/WheelEvent for React Flow** — use d3-zoom manipulation
3. **NEVER modify `.textContent`/`.innerHTML` on React elements** — crashes the app. Use `type_text` MCP tool instead
4. **Take a screenshot after every action** to verify
