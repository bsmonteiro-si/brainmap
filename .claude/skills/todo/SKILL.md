---
name: todo
description: Capture an observation, improvement idea, assumption, friction point, or tech debt as a todo item for future sessions.
argument: Description of what was observed or the idea
---

# Todo Skill

Capture something worth remembering for future work. This is for things noticed outside the current task's scope that shouldn't be lost.

## Types

| Type | What it is | Lifecycle |
|------|-----------|-----------|
| `improvement` | Something that works but could be better (perf, UX, code quality) | Persists until acted on or discarded |
| `assumption` | Something we believe but haven't validated | **Transient** — moves to gotchas table if proven false, deleted if validated true |
| `idea` | Feature or architectural exploration worth considering | Persists until acted on or discarded |
| `friction` | Workflow or tooling pain point | Persists until resolved or accepted |
| `debt` | Tech debt noticed but out of scope | Persists until addressed or deliberately accepted |

## Steps

1. **Determine type and area** from the user's description. If ambiguous, ask.
   - Areas: `canvas`, `editor`, `core`, `tauri`, `e2e`, `workflow`, `infra`

2. **Write the todo file** to `.claude/todo/<slug>.md`:
   ```markdown
   ---
   type: <type>
   area: <area>
   source: <current session slug or context>
   ---

   <Clear description of the observation and why it matters.>
   ```
   Use a descriptive slug (e.g., `canvas-viewport-race-assumption.md`, `editor-memoize-store-selectors.md`).

3. **Update `.claude/todo/INDEX.md`** — add one line: `- [Title](filename.md) — one-line summary (<area>, <type>)`

4. **Confirm** — tell the user what was captured and which type it was filed under.

## Rules

- One item per file. Don't combine multiple observations.
- For assumptions: include what we believe AND what would prove it wrong — this makes validation actionable.
- Don't duplicate: check INDEX.md first. If a similar item exists, update it instead of creating a new one.
- Keep descriptions concise but specific — a future agent should understand the item without extra context.
- If an assumption has been proven false during the current session, skip the todo and go straight to the relevant gotchas table.
