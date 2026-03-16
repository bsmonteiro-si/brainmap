# BrainMap

Structured markdown -> interactive visual knowledge graph.

## Verification

Run `./scripts/check.sh` before committing. Activate hook: `git config core.hooksPath .githooks`

## Building and Testing

`cargo build` / `cargo test`. Per-crate: `-p brainmap-core`, `-p brainmap`, `-p brainmap-mcp`.

## Project Structure

`crates/core` (parser, graph, FTS5, workspace), `crates/cli` (clap, 21 cmds), `crates/mcp` (rmcp, 24 tools + 3 resources), `crates/app/src-tauri` (Tauri v2 + React, excluded from workspace). `docs/` specs, `seed/` test dataset.

## Architecture

`.md` with YAML frontmatter = source of truth -> in-memory graph + SQLite FTS5. Consumers: CLI, Tauri app, MCP server. All writes through `workspace.rs`. Per-slot locking for multi-segment; Zustand snapshot/restore for segment switching. Folders are virtual graph nodes from directory structure.

## Data Model

Frontmatter: `title`, `type`, `tags`, `status`, `created`, `modified`, `source`, `summary`, `links`. 11 note types, 15 edge types. See `docs/02-data-model.md`.

## Conventions

- Rust 2021, resolver v2; `thiserror` `BrainMapError`; all API through `workspace.rs`
- Folder nodes: virtual, in `Graph.nodes` only (not `Workspace.notes`)
- MCP: manual dispatch, `Arc<Mutex<Workspace>>`
- Envelope: `{"success": bool, "data": ..., "error": {"code": ..., "message": ...}}`
- CodeMirror spacing: NEVER add `margin` or `padding` to `.cm-line` elements — it breaks mouse hit-testing. Use block widget decorations (`Decoration.widget({ widget, block: true })`) with a matching `estimatedHeight` getter instead; CM6 includes these in its height map.

## Logging

`BRAINMAP_LOG` env (tracing EnvFilter). Defaults: CLI=warn, MCP=info, Tauri=info. Logs: `~/.brainmap/logs/`. Frontend: `import { log } from "../utils/logger"`. **Check logs first** when debugging. See `docs/logging.md`.

## Reference Docs

Extension guides: `docs/extension-guides/`. ADRs: `docs/decisions/`. Error recovery: `docs/error-recovery.md`. Changelog: `docs/CHANGELOG.md`.

## Review Agents

Two review agents are defined in `.claude/agents/`. These are NOT optional -- they are mandatory parts of the development workflow described below.

- **plan-reviewer** (`.claude/agents/plan-reviewer.md`): Reviews implementation plans for architectural alignment, scope, edge cases, test strategy, and data model impact.
- **code-reviewer** (`.claude/agents/code-reviewer.md`): Reviews implemented code for correctness, Rust quality, function design, test coverage, serialization, and performance.

## Mandatory Feedback Loops

### Planning Feedback Loop

Whenever you create an implementation plan (whether in plan mode or not), you MUST follow this process:

1. Write the plan to `.claude/reviews/plans/<descriptive-name>.md`.
2. Read `.claude/agents/plan-reviewer.md` for the review criteria.
3. Immediately spawn one or more `general-purpose` agents to review the plan. Each agent must:
   - Receive the full plan content and the review criteria from the agent definition file.
   - Focus on a distinct aspect if multiple agents are used (e.g., one on architecture, one on edge cases/testing).
   - Write its feedback to `.claude/reviews/plans/<descriptive-name>-review-<N>.md`.
4. Read all review files. For any finding with severity `blocker` or `should-fix`, update the plan in place.
5. Only after incorporating feedback (or confirming there are no blocker/should-fix findings), present the final plan to the user.

### Code Review Feedback Loop

Whenever you finish implementing code (a complete feature, a step in a plan, or a meaningful chunk of work), you MUST follow this process:

1. Read `.claude/agents/code-reviewer.md` for the review criteria.
2. Spawn one or more `general-purpose` agents to review the changed files. Each agent must:
   - Receive the list of changed files, the diff or full file contents, and the review criteria from the agent definition file.
   - If there are many changed files, split across agents by area (e.g., one for core, one for CLI).
   - Write its feedback to `.claude/reviews/code/<descriptive-name>-review-<N>.md`.
3. Read all review files. For any finding with severity `bug` or `should-fix`, fix the code.
4. After fixing, spawn the review agent(s) again on the updated files. Write new feedback to `.claude/reviews/code/<descriptive-name>-review-<N>-pass-<M>.md`.
5. Repeat until there are no more `bug` or `should-fix` findings.
6. Only then consider the implementation done.

### Rules

- Never skip the feedback loops. They run even for small changes.
- Review files accumulate in `.claude/reviews/` -- do not delete them during a session.
- If a review agent raises a `suggestion`, note it but do not block on it. Use judgment.
- When spawning review agents, always pass the full content of the relevant agent definition file as part of the prompt -- do not summarize it.

## Review Cleanup

After committing, move session review files to `.claude/reviews/archive/`. On new sessions, archive files older than 7 days.

## Documentation Maintenance

Every plan MUST include updating docs (`CLAUDE.md`, `README.md`, `docs/`) if changes affect them. Docs are part of the deliverable.
