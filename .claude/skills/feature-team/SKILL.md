---
name: feature-team
description: Spawn a layer-based implementation team for features that touch 3+ layers of the BrainMap stack. Each teammate owns one layer and implements against a shared interface contract.
argument: Feature description and which layers are involved
---

# Feature Team Skill

You are parallelizing a cross-layer feature implementation. BrainMap has 4 layers:

1. **Core** (`crates/core/`) — Rust structs, workspace methods, graph operations
2. **CLI / MCP** (`crates/cli/`, `crates/mcp/`) — command wrappers, tool dispatch
3. **Tauri commands** (`crates/app/src-tauri/`) — Rust command handlers, DTOs, events
4. **Frontend** (`crates/app/src/`) — React components, Zustand stores, Vitest tests

## Step 1: Define the Interface Contract

Before spawning any teammates, the lead (you) must define the shared interfaces:

- **DTO shapes**: exact Rust structs and their TypeScript equivalents
- **Command signatures**: Tauri command names, parameters, return types
- **Event payloads**: if the feature involves Tauri events, define the event name and payload shape
- **Store API**: if a new store action or state field is needed, define it

Write the contract to `.claude/reviews/plans/<feature-name>-contract.md`. This is the source of truth that all teammates implement against.

Run the Planning Feedback Loop on this contract before proceeding.

## Step 2: Spawn Teammates

Create a team with one teammate per layer that needs changes. Not every feature touches all 4 layers — only spawn what's needed.

Each teammate receives:

- The full interface contract from Step 1
- The relevant extension guide from `docs/extension-guides/` (e.g., `add-tauri-command.md`, `add-mcp-tool.md`)
- Their scope: which files they own, which tests they must pass
- The rule: **do not modify files outside your layer** — if you need something from another layer, message that teammate

Each teammate must receive the full content of their agent definition file as part of their prompt.

| Layer | Agent Definition | Spawn when needed |
|-------|-----------------|-------------------|
| Core (crates/core, cli, mcp) | `.claude/agents/rust-core.md` | Feature adds/changes workspace API, graph ops, CLI commands, or MCP tools |
| Tauri backend (crates/app/src-tauri) | `.claude/agents/tauri-backend.md` | Feature adds/changes Tauri commands, DTOs, or file watcher events |
| Frontend (crates/app/src) | `.claude/agents/frontend.md` | Feature adds/changes React components, stores, or CSS |
| E2E QA (tests/e2e) | `.claude/agents/e2e-qa.md` | Feature needs new E2E test coverage |

Example team spawn for a feature touching core + Tauri + frontend:

```
Create a feature team for [feature]:

Teammate "core" (read .claude/agents/rust-core.md for full context):
Implement [feature] per the interface contract at .claude/reviews/plans/<name>-contract.md.
The contract defines the exact struct shapes and workspace methods to add.

Teammate "tauri" (read .claude/agents/tauri-backend.md for full context):
Implement Tauri command handlers per the interface contract. The contract defines
command signatures and DTO shapes.

Teammate "frontend" (read .claude/agents/frontend.md for full context):
Implement React components and store changes per the interface contract. The contract
defines the API bridge methods and DTO types to consume.
```

## Step 3: Coordinate Interface Changes

If a teammate discovers the contract needs adjustment (e.g., a field needs to be optional, a new event is needed):

1. Teammate messages the lead with the proposed change and reason
2. Lead updates the contract file
3. Lead messages affected teammates about the change
4. Teammates adapt their implementations

Do not let teammates change interfaces unilaterally — all contract changes go through the lead.

## Step 4: Integration

After all teammates report done:

1. Verify no file conflicts between teammates
2. Run the full test suite: `cargo test` (Rust) + `npx vitest run` (frontend)
3. Fix any integration issues yourself (the lead) — these are typically at layer boundaries
4. Run the Code Review Feedback Loop on the combined changes (use team-based reviews if 5+ files across 2+ areas)

## Rules

- Always define the interface contract before spawning teammates
- Run the Planning Feedback Loop on the contract
- **Unbiased Handoff**: When spawning teammates, pass the contract, the user's original request, and the agent definition. Do NOT pass "I think the best approach for your layer is X" — let each teammate decide their implementation approach within the contract boundaries.
- Teammates must not modify files outside their layer
- All interface changes go through the lead
- Each teammate runs their layer's tests before reporting done
- The lead handles integration and cross-layer fixes
- Cap at 4 teammates (one per layer) — never split a single layer across teammates
