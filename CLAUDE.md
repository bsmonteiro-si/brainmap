# BrainMap

Structured markdown -> interactive visual knowledge graph.

**AI-first codebase.** Docs, logs, conventions, extension guides, error messages, and gotcha tables are the primary interface for agents — not supplementary documentation. Every written convention is load-bearing. When in doubt, write it down.

**Solo developer, push to main.** No PRs, no branch protection, no CI, no human code review. The mandatory review agent loops (plan-reviewer, code-reviewer, team-based reviews) are the only quality gate between code and production. Treat them accordingly — they are not optional process overhead.

## Verification

Run `./scripts/check.sh` before committing. Activate hook: `git config core.hooksPath .githooks`

## Building and Testing

`cargo build` / `cargo test`. Per-crate: `-p brainmap-core`, `-p brainmap`, `-p brainmap-mcp`. E2E tests: `cd tests/e2e && npx vitest run` (runs against a real Tauri app instance via tauri-plugin-mcp socket). See `tests/e2e/README.md` for architecture and gotchas, `docs/extension-guides/add-e2e-test.md` for adding new tests. Isolated app instance: `./scripts/e2e-app.sh start` launches a separate BrainMap on port 1520 with its own MCP socket (`/tmp/brainmap-mcp-isolated.sock`); use `tauri-mcp-isolated` MCP tools (or direct socket) to interact without touching the dev instance; `./scripts/e2e-app.sh stop` to tear down.

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
- Stale async guard: All async callbacks (file reads, image loads, plain-file fetches) must check the current path/note still matches before applying state. Pattern: `if (get().activeNote?.path === path) { set(...) }`.
- Diagnosis-first debugging: When debugging, state your hypothesis for the root cause before editing source files. If a first fix doesn't work, add `log.debug` output and read the logs before attempting a second fix — do not guess twice in a row. For structured debugging, use the `/bugfix` skill. For complex cross-cutting bugs, use the `/debug-team` skill.
- CSS verification: Before writing CSS, read existing styles on the target element and its parent chain to check for specificity conflicts. For subtle visual properties (shadow, opacity, border, gradient), state the minimum visible value — e.g., box-shadow opacity below 0.15 is invisible on dark backgrounds. For structured UI fixes, use the `/ui-fix` skill.
- Testing: Follow `docs/extension-guides/add-unit-test.md`. Frontend tests use real Zustand stores with mocked API bridge — never mock stores in store tests. DOM queries use `getByRole`/`getByLabelText`/`getByText` — never CSS class selectors. Cross-store mocks use `createMockStore` from `test-utils/storeMocks.ts` — never hand-typed objects. New Tauri handlers require tests in `handlers.rs`. New `TauriBridge` methods require contract tests in `apiBridge.contract.test.ts`. Rust tests use `tempfile::TempDir` per test — never shared mutable state. MCP tool tests verify response schema, not just `success == true`.
- Todo capture: When you notice something outside the current task's scope — a potential improvement, an unvalidated assumption, a friction point, or tech debt — write it to `.claude/todo/` rather than ignoring it or fixing it in-band. Mention any items added at the end of your response.

## Platform Gotchas Index

Known platform constraints that cause silent failures. Check the relevant section before debugging.

- Canvas / React Flow: `docs/canvas-architecture.md` § Known Platform Gotchas
- Tauri WebView: `docs/06-architecture.md` § Tauri WebView Constraints
- CodeMirror: see `.cm-line` rule in Conventions above + `docs/extension-guides/add-cm-preview-widget.md` § Pitfalls
- E2E testing: `tests/e2e/README.md` § Gotchas
- tauri-mcp bridge: see § tauri-mcp Bridge Recovery below

### tauri-mcp Bridge Recovery

The `tauri-mcp` and `tauri-mcp-isolated` MCP servers (defined in `.mcp.json`) depend on a Node.js bridge server built from the [P3GLEG/tauri-plugin-mcp](https://github.com/P3GLEG/tauri-plugin-mcp) repo. The built artifact lives at `/tmp/tauri-plugin-mcp/mcp-server-ts/build/index.js`. Because `/tmp/` is ephemeral, macOS can purge it on reboot or disk pressure.

**Symptom**: `/mcp` reconnect fails, `tauri-mcp-isolated` tools are unavailable, E2E tests can't connect.

**Fix** (run these steps in order):
```bash
cd /tmp && git clone https://github.com/P3GLEG/tauri-plugin-mcp.git tauri-plugin-mcp
cd /tmp/tauri-plugin-mcp/mcp-server-ts && npm install --cache /tmp/npm-cache && npx tsc
```
Then reconnect via `/mcp`. If the isolated app was running, restart it: `./scripts/e2e-app.sh stop && ./scripts/e2e-app.sh start`.

**When to check**: Before debugging MCP connection failures, verify `/tmp/tauri-plugin-mcp/mcp-server-ts/build/index.js` exists. If missing, run the fix above. Do not waste time diagnosing socket or protocol issues when the bridge server itself is gone.

## Logging

`BRAINMAP_LOG` env (tracing EnvFilter). Defaults: CLI=warn, MCP=info, Tauri=`info,frontend=debug`. Logs: `~/.brainmap/logs/` (backend + frontend). Frontend logs are forwarded to backend via `write_log` Tauri command (tracing target `frontend`, original component in `origin` field). All frontend log levels including `debug` are persisted to the log file. Frontend: `import { log } from "../utils/logger"`. **Check logs first** when debugging — frontend issues are in the same log file. See `docs/logging.md`.

### Frontend Logger API

Signature: `log.level(target, msg, fields?)` where level is `error`/`warn`/`info`/`debug`. Example: `log.debug("canvas::viewport", "restore complete", { x: vp.x, y: vp.y, zoom: vp.zoom })`. Never use `console.log`/`console.debug` — they don't reach the log file.

### Debugging Workflow

When adding debug logs for troubleshooting: use `log.debug(target, msg, fields?)`. Read results yourself via `grep pattern ~/.brainmap/logs/brainmap.log.YYYY-MM-DD` — never ask the user to check logs. You are always responsible for fetching and analyzing log output. When interacting via MCP tools (dev or isolated instance), **always check logs after interactions** — don't rely only on screenshots. Isolated instance logs are at `tests/e2e/logs/app/brainmap.log.YYYY-MM-DD` (separated via `BRAINMAP_LOG_DIR`).

## Reference Docs

**Before implementing**, check `docs/extension-guides/` for step-by-step recipes: `add-callout-type`, `add-canvas-node-type`, `add-e2e-test`, `add-inline-command`, `add-cli-command`, `add-cm-preview-widget`, `add-edge-type`, `add-file-type-editor`, `add-mcp-tool`, `add-note-type`, `add-panel-tab`, `add-tauri-command`, `add-unit-test`, `add-zustand-store`. Follow the guide if one matches your task. **Before making architectural decisions**, check `docs/decisions/` for prior ADRs. Error recovery: `docs/error-recovery.md`. Changelog: `docs/CHANGELOG.md`.

## Agents

Six agent definitions live in `.claude/agents/`. Review agents are mandatory; layer agents are used by team skills (`/feature-team`, `/debug-team`).

### Review Agents (mandatory)

- **plan-reviewer** (`.claude/agents/plan-reviewer.md`): Reviews implementation plans for architectural alignment, scope, edge cases, test strategy, and data model impact.
- **code-reviewer** (`.claude/agents/code-reviewer.md`): Reviews implemented code for correctness, Rust quality, function design, test coverage, serialization, and performance.

### Layer Agents (for teams)

- **rust-core** (`.claude/agents/rust-core.md`): Owns `crates/core/`, `crates/cli/`, `crates/mcp/`. Rust data layer, workspace API, CLI commands, MCP tools.
- **tauri-backend** (`.claude/agents/tauri-backend.md`): Owns `crates/app/src-tauri/`. Tauri commands, DTOs, file watcher, IPC bridge.
- **frontend** (`.claude/agents/frontend.md`): Owns `crates/app/src/`. React components, Zustand stores, CSS, CodeMirror extensions.
- **e2e-qa** (`.claude/agents/e2e-qa.md`): Owns `tests/e2e/`. E2E test specs, helpers, MCP socket client, visual verification.

## Mandatory Feedback Loops

### Planning Feedback Loop

Whenever you create an implementation plan (whether in plan mode or not), you MUST follow this process:

1. Write the plan to `.claude/reviews/plans/<descriptive-name>.md`.
2. Read `.claude/agents/plan-reviewer.md` for the review criteria.
3. Immediately spawn one or more `general-purpose` agents to review the plan. Each agent must:
   - Receive the full plan content, the original user request, and the review criteria from the agent definition file.
   - Focus on a distinct aspect if multiple agents are used (e.g., one on architecture, one on edge cases/testing).
   - Write its feedback to `.claude/reviews/plans/<descriptive-name>-review-<N>.md`.
4. Read all review files. For any finding with severity `blocker` or `should-fix`, update the plan in place.
5. Only after incorporating feedback (or confirming there are no blocker/should-fix findings), present the final plan to the user.

### Code Review Feedback Loop

Whenever you finish implementing code (a complete feature, a step in a plan, or a meaningful chunk of work), you MUST follow this process:

1. Read `.claude/agents/code-reviewer.md` for the review criteria.
2. Spawn one or more `general-purpose` agents to review the changed files. Each agent must:
   - Receive the list of changed files, the diff or full file contents, the original user request, and the review criteria from the agent definition file.
   - If there are many changed files, split across agents by area (e.g., one for core, one for CLI).
   - Write its feedback to `.claude/reviews/code/<descriptive-name>-review-<N>.md`.
3. Read all review files. For any finding with severity `bug` or `should-fix`, fix the code.
4. After fixing, spawn the review agent(s) again on the updated files. Write new feedback to `.claude/reviews/code/<descriptive-name>-review-<N>-pass-<M>.md`.
5. Repeat until there are no more `bug` or `should-fix` findings.
6. Only then consider the implementation done.

### Team-Based Reviews (Large Changes)

When a change touches **5+ files across 2+ areas** (e.g., core + frontend, canvas + stores + CSS), upgrade from subagents to a review team. Reviewers as teammates can cross-pollinate findings:

1. Follow the same review criteria from the agent definition files.
2. Instead of spawning independent subagents, create a review team with one reviewer per area.
3. Reviewers investigate their area and **message each other** when findings may affect another area (e.g., "store change breaks undo path — check canvas undo/redo").
4. Cap cross-communication to **one round** — reviewer reports finding, affected reviewer checks it, done.
5. After all reviewers report, converge findings into the same `.claude/reviews/` files as the subagent flow.
6. Fix/iterate the same way as the standard loop.

For smaller changes (< 5 files or single area), the standard subagent flow above is sufficient.

### Unbiased Handoff Rule

When spawning reviewers, investigators, or teammates, pass **context without conclusion**:

- **Pass**: facts (diff, file paths, test results, user request, symptoms, reproduction steps, what was tried and what happened)
- **Do NOT pass**: your interpretation ("I did X because Y", "this fixes the Z problem", "I think the root cause is X", "the best approach is Y")

Let the agent form its own judgment from the raw evidence. If you frame the handoff around your conclusion, the agent will confirm it instead of challenging it.

### Rules

- Never skip the feedback loops. They run even for small changes.
- Review files accumulate in `.claude/reviews/` -- do not delete them during a session.
- If a review agent raises a `suggestion`, note it but do not block on it. Use judgment.
- When spawning review agents, always pass the full content of the relevant agent definition file as part of the prompt -- do not summarize it.
- Follow the Unbiased Handoff Rule — never frame a review or investigation prompt around your own conclusion.
- For cross-layer features, consider the `/feature-team` skill to parallelize implementation across stack layers.

## Review Cleanup

After committing, move session review files to `.claude/reviews/archive/`. On new sessions, archive files older than 7 days.

## Documentation Maintenance

Every plan MUST include updating docs (`CLAUDE.md`, `README.md`, `docs/`) if changes affect them. Docs are part of the deliverable.
