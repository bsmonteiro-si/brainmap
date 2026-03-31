---
name: isolated-test
description: Launch an isolated BrainMap instance, perform a task (verify a fix, test a feature, reproduce a bug), and tear down. Use when the user says "test this", "verify visually", "run isolated", or after implementing a UI fix.
argument-hint: [what to test, e.g. "canvas fullscreen preserves content" or "file tree drag-drop works"]
---

# Isolated App Test

Launch an isolated BrainMap instance, perform a visual test, and tear down cleanly.

## Before You Start

**Read the playbooks.** This is not optional. Do NOT proceed to Step 1 until you have read the relevant files.

1. Read `.claude/playbooks/tauri-mcp/00-principles.md` — mandatory interaction rules
2. Read `.claude/playbooks/tauri-mcp/01-basics.md` — sidebar nav, screenshots, view state
3. Read the playbook for whatever you're testing (see index in `.claude/skills/tauri-mcp-navigate/SKILL.md`)

Every interaction pattern is documented in the playbooks — do not improvise or guess at APIs.

## Step 1: Launch

```bash
./scripts/e2e-app.sh start
```

Save the temp workspace path from the output (e.g., `/tmp/brainmap-e2e-isolated-ws-XXXXXX`).

Load the MCP tools:

```
ToolSearch(query="select:mcp__tauri-mcp-isolated__execute_js,mcp__tauri-mcp-isolated__take_screenshot,mcp__tauri-mcp-isolated__query_page")
```

## Step 2: Open Workspace

```js
mcp__tauri-mcp-isolated__execute_js(code=`
import('/src/stores/segmentActions.ts').then(function(m) { return m.openFolderAsSegment('/tmp/brainmap-e2e-isolated-ws-XXXXXX'); })
`)
```

Take a screenshot to confirm the workspace loaded.

## Step 3: Navigate and Test

Use `execute_js` with patterns from the playbooks. Refer to:

- **Sidebar navigation**: `01-basics.md`
- **File tree interactions**: `02-file-tree.md`
- **Opening/closing tabs**: `03-tabs.md`
- **Editor interactions**: `04-editor.md`
- **Canvas (React Flow)**: `05-canvas.md` — toolbar buttons, node clicks, pan/zoom, context menus
- **Dialogs and forms**: `06-dialogs.md`
- **Search**: `07-search.md`
- **Reusable patterns**: `08-helpers.md` — setNativeValue, context menus, button clicks

Take a screenshot after each meaningful action.

## Step 4: Check Logs

**Always check logs after interactions** — don't rely only on screenshots.

```bash
grep -i "error\|warn\|crash\|panic" tests/e2e/logs/app/brainmap.log.$(date +%Y-%m-%d) | tail -20
```

## Step 5: Tear Down

```bash
./scripts/e2e-app.sh stop
```

**Always tear down**, even if the test failed.

## Step 6: Report

Summarize: what was tested, what screenshots showed, whether logs had errors, pass/fail.
