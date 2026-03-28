# BrainMap

Structured markdown -> interactive visual knowledge graph.

## Verification

Run `./scripts/check.sh` before committing. Activate hook: `git config core.hooksPath .githooks`

## Building and Testing

`cargo build` / `cargo test`. Per-crate: `-p brainmap-core`, `-p brainmap`, `-p brainmap-mcp`. E2E tests: `cd tests/e2e && npx vitest run` (runs against a real Tauri app instance via tauri-plugin-mcp socket). See `tests/e2e/README.md` for architecture and gotchas, `docs/extension-guides/add-e2e-test.md` for adding new tests.

## Project Structure

`crates/core` (parser, graph, FTS5, workspace), `crates/cli` (clap, 21 cmds), `crates/mcp` (rmcp, 24 tools + 3 resources), `crates/app/src-tauri` (Tauri v2 + React, excluded from workspace). `docs/` specs, `seed/` test dataset (`.md` notes + `.canvas` sample).

## Architecture

`.md` with YAML frontmatter = source of truth -> in-memory graph + SQLite FTS5. Consumers: CLI, Tauri app, MCP server. All writes through `workspace.rs`. Per-slot locking for multi-segment; Zustand snapshot/restore for segment switching. Folders are virtual graph nodes from directory structure. Non-markdown file types (`.excalidraw`, `.canvas`, `.pdf`) use dedicated editor components via the custom tab kind pattern (see `docs/extension-guides/add-file-type-editor.md`). Canvas architecture: `docs/canvas-architecture.md` (component hierarchy, data flow, state management, extension points).

## Data Model

Frontmatter: `title`, `type`, `tags`, `status`, `created`, `modified`, `source`, `summary`, `links`. 11 note types, 15 edge types. See `docs/02-data-model.md`.

## Conventions

- Rust 2021, resolver v2; `thiserror` `BrainMapError`; all API through `workspace.rs`
- Folder nodes: virtual, in `Graph.nodes` only (not `Workspace.notes`)
- MCP: manual dispatch, `Arc<Mutex<Workspace>>`
- Envelope: `{"success": bool, "data": ..., "error": {"code": ..., "message": ...}}`
- CodeMirror spacing: NEVER add `margin` or `padding` to `.cm-line` elements — it breaks mouse hit-testing. Use block widget decorations (`Decoration.widget({ widget, block: true })`) with a matching `estimatedHeight` getter instead; CM6 includes these in its height map.
- Canvas docs: When modifying Canvas code (`CanvasEditor.tsx`, `canvasNodes.tsx`, `canvasTranslation.ts`, `canvasShapes.ts`, `CanvasPanel.tsx`, canvas CSS, or canvas-related uiStore settings), check `docs/canvas-architecture.md` for contradictions with your changes. Update the doc if you add/remove/rename components, change data flow, modify state management patterns, add keyboard shortcuts, or change integration points. The extension guide `add-canvas-node-type.md` must also be updated if the node type creation process changes.

## Logging

`BRAINMAP_LOG` env (tracing EnvFilter). Defaults: CLI=warn, MCP=info, Tauri=`info,frontend=debug`. Logs: `~/.brainmap/logs/` (backend + frontend). Frontend logs are forwarded to backend via `write_log` Tauri command (tracing target `frontend`, original component in `origin` field). All frontend log levels including `debug` are persisted to the log file. Frontend: `import { log } from "../utils/logger"`. **Check logs first** when debugging — frontend issues are in the same log file. See `docs/logging.md`.

### Frontend Logger API

Signature: `log.level(target, msg, fields?)` where level is `error`/`warn`/`info`/`debug`. Example: `log.debug("canvas::viewport", "restore complete", { x: vp.x, y: vp.y, zoom: vp.zoom })`. Never use `console.log`/`console.debug` — they don't reach the log file.

### Debugging Workflow

When adding debug logs for troubleshooting: use `log.debug(target, msg, fields?)`. Read results yourself via `grep pattern ~/.brainmap/logs/brainmap.log.YYYY-MM-DD` — never ask the user to check logs. You are always responsible for fetching and analyzing log output.

## Reference Docs

**Before implementing**, check `docs/extension-guides/` for step-by-step recipes: `add-callout-type`, `add-canvas-node-type`, `add-e2e-test`, `add-inline-command`, `add-cli-command`, `add-cm-preview-widget`, `add-edge-type`, `add-file-type-editor`, `add-mcp-tool`, `add-note-type`, `add-panel-tab`, `add-tauri-command`, `add-zustand-store`. Follow the guide if one matches your task. **Before making architectural decisions**, check `docs/decisions/` for prior ADRs. Error recovery: `docs/error-recovery.md`. Changelog: `docs/CHANGELOG.md`.

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
