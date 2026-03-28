# Principles: How to Use MCP Effectively

These rules override everything in the other playbook files. Violating them wastes time.

## 1. Read the source code FIRST

Before touching the live app, read the relevant component source files. You have full access to the codebase. DOM archaeology via `execute_js` is for verifying behavior, not for discovering code structure.

- Need to know what a button does? Read the TSX file.
- Need to know CSS classes? Read the TSX file.
- Need to know handler logic? Read the TSX file.

MCP is for **verification**, not **exploration**.

## 2. Never test against corrupted state

Any interaction that modifies the app (clicking buttons, adding cards, inverting edges) changes the persisted file. Subsequent tests against the same file are unreliable.

Before testing a fix:
- `git checkout -- path/to/file.canvas` to restore the original
- Or use a dedicated test file that gets reset
- Or note the before-state and undo thoroughly, then **verify the undo worked** before proceeding

If you can't confirm clean state, your test results are garbage.

## 3. Diagnose before fixing

Never guess at a root cause. Follow this sequence:

1. **Reproduce** — confirm the bug exists (one MCP interaction, one screenshot)
2. **Read the code** — understand what the handler does, line by line
3. **Add a debug log** — `log.debug("canvas::invert", "before", { edge })` in the handler, trigger it, read `~/.brainmap/logs/brainmap.log.*` via grep
4. **Understand** — now you know what's actually happening vs what should happen
5. **Fix** — one targeted change
6. **Verify** — one MCP interaction, one screenshot

If step 2 doesn't reveal the bug, go to step 3. Never skip to step 5.

## 4. Minimize MCP roundtrips

Each `execute_js` call takes seconds. Batch your work:

- **Bad**: 10 calls to discover 10 elements one by one
- **Good**: 1 call that dumps all interactive elements in the view

- **Bad**: click → screenshot → check → click → screenshot → check
- **Good**: read code → make fix → single before/after verification

Target: **under 5 MCP calls** for a typical bug verification.

## 5. Never modify React DOM directly

Setting `.textContent`, `.innerHTML`, or `.innerText` on React-managed elements crashes the app by desynchronizing the virtual DOM. There are no exceptions.

Safe alternatives:
- `type_text` MCP tool for text input
- `setNativeValue` helper for form inputs
- `.click()` and `.dispatchEvent()` for interactions
- Store actions via `execute_js` if you know the API

## 6. Take screenshots deliberately, not reflexively

Screenshots are for:
- **Before state** — document what you're about to change
- **After fix** — verify the fix worked
- **Reporting to user** — show the result

Screenshots are NOT for:
- Checking if a button exists (read the source)
- Seeing DOM structure (use one `execute_js` dump)
- Every intermediate step of a multi-step action

## 7. One fix, one test cycle

Don't iterate fixes against the live app. If your first fix doesn't work:
1. Stop
2. Re-read the code
3. Add debug logging
4. Understand why it failed
5. Make the correct fix
6. Test once

Three wrong fixes cost more time than one proper diagnosis.

## 8. Reset before reporting

Before showing results to the user:
- Undo any test mutations
- Verify the canvas/file is in the expected state
- Take a clean screenshot

Don't show screenshots of corrupted state and then explain why they look wrong.
