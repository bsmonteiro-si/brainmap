---
name: save-session
description: Save a summary of the current session to .claude/sessions/ for future context
argument-hint: [optional focus area or notes]
---

# Save Session Notes

Save a structured summary of the current conversation to `.claude/sessions/` so future Claude Code sessions have context about what was done.

## Steps

1. **Review the ENTIRE conversation from start to finish** — Scan every message in the session transcript, not just the most recent task. This includes early exploration, architectural decisions, refactoring, debugging, and any work done before the final task. If the session built an entire project or feature from scratch, document the full journey — not just the last step.

2. **Determine the filename** — Use the format `YYYY-MM-DD-<meaningful-slug>.md`. The slug should capture the primary theme (e.g., `auth-enforcement-and-e2e-tests`, `pipeline-execution-bug-fix`). If multiple sessions happen on the same date, add a sequence suffix (`-2`, `-3`).

3. **Read existing sessions for tone and depth** — Run `ls .claude/sessions/` and read the most recent file to match the established format. If no prior sessions exist, use the structure below.

4. **Write the session file** with these sections:

### Required Sections

**Title** — `# YYYY-MM-DD — <Descriptive Title>`

**What Was Done** — Numbered list of each distinct change. For each item:
- What the problem or goal was
- What was changed and why
- Which files were affected

**Key Decisions and Patterns** — Architectural choices, patterns established, or conventions adopted that future sessions should know about.

**Files Changed** — Table with `| File | Change |` columns listing every modified or created file.

**Current Test Status** — Final pass/fail counts for backend pytest, frontend Vitest, frontend lint, and Playwright E2E.

### Optional Sections (include when relevant)

**Context From Previous Session** — If this session continued from a prior one, summarize what was already done.

**Remaining Known Items** — Things that are fine for now but worth noting: tech debt, deferred features, warnings.

### Subagent Work (include when relevant)

If subagents ran during this session, check `.claude/transcripts/subagents/` for transcripts from today's date. Include a **Subagent Work** section summarizing what each subagent accomplished and which files it changed. Only include subagent work that is relevant — skip trivial or failed runs.

## Guidelines

- **Cover the FULL session**: The most common mistake is only documenting the last task. Go back to the very beginning of the conversation and capture everything: project setup, architecture decisions, initial implementations, refactors, bug fixes, and the final task. A future reader should understand the complete arc of what happened in this session.
- Be specific about root causes and fixes, not just "fixed a bug."
- Include file paths so future sessions can jump straight to relevant code.
- Note any non-obvious gotchas discovered (e.g., "PostgreSQL enums use member names not values", "SQLite can't add NOT NULL columns without defaults").
- Keep it factual and concise — this is a reference document, not a narrative.
- If the user provides focus notes via `$ARGUMENTS`, emphasize those areas.
- This skill should be invoked at the end of every session. It is part of the standard development workflow.

$ARGUMENTS
