# 2026-03-30 — Insights-Driven Agent Infrastructure & Platform Gotchas

## Context From Previous Session

Earlier today (`2026-03-30-agent-teams-exploration.md`), agent teams were researched, enabled, and tested with split-pane mode. This session built on that by analyzing the `/insights` usage report and implementing concrete improvements.

## What Was Done

1. **Analyzed Claude Code `/insights` report**
   - Read the full `~/.claude/usage-data/report.html` — a usage analytics report covering 3,898 messages across 296 sessions (2026-02-25 to 2026-03-28)
   - Identified key friction patterns: 93 wrong-approach instances, 93 buggy-code instances, repeated misdiagnosis loops, visual/CSS misses, framework gotchas rediscovered across sessions
   - Evaluated each suggestion in the report for practicality (e.g., the hooks suggestion for auto-running `tsc --noEmit` after every Edit would be too noisy)

2. **Distributed platform gotchas across architecture docs**
   - Added 8-row "Known Platform Gotchas" table to `docs/canvas-architecture.md` (NODE_TYPES must be module-level, node.measured during resize, child setNodes bypasses onNodesChange, window.prompt blocked, viewport restore races, React Flow CSS specificity, counter-zoom, drag-drop double scaling)
   - Added 6-row "Tauri WebView Constraints" table to `docs/06-architecture.md` (window.prompt blocked, __TAURI_INTERNALS__ v2, TAURI_CONFIG not supported, global zoom coordinate math, stale async, localStorage volatility)
   - Added maintenance triggers to canvas-architecture.md "Keeping This Doc Current" checklist (new gotcha discovered, dependency upgraded)
   - Added "Platform Gotchas Index" section to CLAUDE.md pointing to all four gotcha locations (canvas, Tauri, CodeMirror, E2E)
   - Decision: distributed across architecture docs rather than centralized, because the review agent already checks the doc matching the area you're touching

3. **Implemented three-tier debugging workflow**
   - **Tier 1 — CLAUDE.md convention** (always-on): "State hypothesis before editing. After a failed fix, add log.debug before trying again — do not guess twice in a row."
   - **Tier 2 — `/debug` skill** (opt-in, single agent): 4-step structured workflow (read code path → gather evidence with logging → present 2-3 hypotheses and wait for confirmation → only then fix)
   - **Tier 3 — `/debug-team` skill** (opt-in, multi-agent): Spawns 2-3 competing hypothesis investigators per investigation axis, each read-only. Lead converges findings and makes the fix.

4. **Implemented `/feature-team` skill for cross-layer implementation**
   - Lead defines interface contract (DTOs, command signatures, event payloads) → runs Planning Feedback Loop on contract → spawns one teammate per layer → teammates implement against contract → lead integrates
   - Each teammate owns one layer and must not modify files outside scope

5. **Added team-based reviews to mandatory feedback loops**
   - Threshold: 5+ files across 2+ areas triggers upgrade from subagents to review team
   - Reviewers as teammates can cross-pollinate findings ("store change breaks undo path — check canvas undo/redo")
   - Capped at one round of cross-communication to avoid token bloat

6. **Created four layer-scoped agent definitions**
   - `rust-core.md`: crates/core, cli, mcp — Rust conventions, workspace API, test commands, debug axis: data and state
   - `tauri-backend.md`: crates/app/src-tauri — command→handler pattern, DTOs, per-slot locking, debug axis: IPC and bridging
   - `frontend.md`: crates/app/src — React/Zustand/CSS conventions, all platform gotchas, debug axis: rendering, state, styling
   - `e2e-qa.md`: tests/e2e — MCP socket protocol, executeJs coercion, screenshot-after-action, debug axis: reproduction
   - Each agent carries: scope table, key conventions, platform gotchas, file boundaries, test commands, reference docs, "When Investigating" section for debug teams

7. **Codified the Unbiased Handoff Rule**
   - Added to CLAUDE.md Mandatory Feedback Loops: "pass context without conclusion" — facts (diff, symptoms, reproduction steps) but not interpretation ("I think the root cause is X")
   - Added to `/debug` skill: when escalating to debug-team, strip your hypothesis
   - Added to `/debug-team` skill: first rule, investigators get facts only
   - Added to `/feature-team` skill: teammates get contract and user request, not lead's preferred implementation approach

8. **Added AI-first and solo-dev context to CLAUDE.md header**
   - Two bold paragraphs at the very top so every agent (main session, subagent, teammate) sees them
   - Saved to memory for future sessions

## Key Decisions and Patterns

- **Distributed gotchas over centralized**: Gotchas live next to the architecture they relate to, not in a single file. The review agent already checks the matching doc, so gotchas get maintained naturally. CLAUDE.md has an index pointing to all locations.
- **Tiered escalation**: Debugging goes convention → skill → team. Each tier only fires when the previous isn't enough. Same pattern for reviews (subagent → team) and implementation (single agent → feature team).
- **Unbiased Handoff Rule**: The agent triggering a review/investigation passes facts, not conclusions. This prevents confirmation bias when the lead spawns reviewers or investigators.
- **Agent definitions are reusable**: The four layer agents are referenced by both `/feature-team` and `/debug-team` — context lives in one place, skills just point to it.
- **Gotcha maintenance via checklist triggers**: Two new items in canvas-architecture.md "What to update" checklist ensure gotchas get added when discovered and re-verified on dependency upgrades.

## Files Changed

| File | Change |
|------|--------|
| `CLAUDE.md` | Added AI-first/solo-dev header, stale async convention, diagnosis-first convention, Platform Gotchas Index, expanded Agents section (6 agents), team-based reviews, Unbiased Handoff Rule |
| `docs/canvas-architecture.md` | Added "Known Platform Gotchas" table (8 rows), added 2 maintenance triggers to "Keeping This Doc Current" |
| `docs/06-architecture.md` | Added "Tauri WebView Constraints" table (6 rows) |
| `.claude/agents/rust-core.md` | Created — layer agent for crates/core, cli, mcp |
| `.claude/agents/tauri-backend.md` | Created — layer agent for crates/app/src-tauri |
| `.claude/agents/frontend.md` | Created — layer agent for crates/app/src |
| `.claude/agents/e2e-qa.md` | Created — layer agent for tests/e2e |
| `.claude/skills/debug/SKILL.md` | Created — tier 2 structured debugging skill |
| `.claude/skills/debug-team/SKILL.md` | Created — tier 3 competing hypothesis debug team |
| `.claude/skills/feature-team/SKILL.md` | Created — cross-layer implementation team |
| `.claude/settings.json` | Added `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` env var |

## Current Test Status

No application code was changed — only docs, agent definitions, and skill definitions. No tests to run.

## Remaining Known Items

- **Visual/CSS verification protocol** (report improvement #3) was discussed but not implemented — lower priority than diagnosis-first and teams
- **Agent teams are experimental** — known limitations include no session resumption with in-process teammates, task status can lag, one team per session
- **Token cost of teams** is significant — each teammate is a separate Claude instance. The tiered approach mitigates this by only using teams for complex scenarios
- The gotcha tables should be validated against current code — they were populated from the insights report and codebase exploration, but some entries describe already-implemented workarounds rather than active traps
