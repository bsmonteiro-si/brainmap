---
name: debug
description: Structured single-agent debugging workflow that enforces diagnosis before fixing. Use for non-trivial bugs where guessing would waste iterations.
argument: Description of the bug or unexpected behavior
---

# Debug Skill

You are debugging a problem. Follow this workflow strictly — do NOT skip steps or edit source files until Step 4.

## Step 1: Understand the Code Path

Read the relevant source files end-to-end. Trace the execution path from entry point to where the bug manifests. If the bug involves UI, check the component hierarchy and any store interactions.

Check the Platform Gotchas Index in CLAUDE.md — the bug may be a known platform constraint.

## Step 2: Gather Evidence

Add `log.debug(target, msg, fields?)` statements at key points in the code path to trace actual runtime behavior. Read the logs yourself via `grep pattern ~/.brainmap/logs/brainmap.log.YYYY-MM-DD` (or the isolated instance logs at `tests/e2e/logs/app/` if applicable). Never ask the user to check logs.

If the bug is visual/CSS: inspect the relevant styles, check for specificity conflicts with parent rules, and identify the exact element being affected.

## Step 3: Present Hypotheses

List 2-3 hypotheses for the root cause. For each hypothesis:

- **What**: one-sentence description of the suspected cause
- **Evidence for**: what you observed that supports this
- **Evidence against**: what doesn't fit (be honest)
- **How to confirm**: what specific check would prove or disprove it

Present these to the user. **Wait for confirmation before proceeding to Step 4.** If the user picks a hypothesis, proceed with that one. If none seem right, go back to Step 2 and gather more evidence.

## Step 4: Implement the Fix

Only now edit source files. Implement the fix for the confirmed hypothesis. After fixing:

1. Remove any temporary debug logging added in Step 2
2. Run relevant tests (`cargo test` for Rust, `npx vitest run` for frontend)
3. If the fix doesn't work, do NOT guess again — go back to Step 2 with new logging targeting what you learned from the failed fix

## Rules

- Never edit source files in Steps 1-3 (logging additions are OK)
- Never guess at a root cause without evidence
- If a fix fails, always add more logging before trying again
- Check `docs/canvas-architecture.md` § Known Platform Gotchas for canvas bugs
- Check `docs/06-architecture.md` § Tauri WebView Constraints for Tauri bugs
- Check `docs/extension-guides/add-cm-preview-widget.md` § Pitfalls for CodeMirror bugs
- If escalating to `/debug-team`, follow the Unbiased Handoff Rule: pass symptoms, reproduction steps, file paths, and what was tried — do NOT pass your hypothesis or suspected root cause. Let investigators form their own conclusions.
