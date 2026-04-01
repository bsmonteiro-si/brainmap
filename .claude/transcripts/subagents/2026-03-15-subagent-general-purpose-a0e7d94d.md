# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 20:01:49
**Agent:** general-purpose
**Agent ID:** a0e7d94d8635fd594
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

## Task: 2A — Architecture Decision Records (ADRs)

You are implementing one task from the AI-first upgrades plan. Your job is to CREATE documentation files.

### Goal
Document *why* key architectural decisions were made, so future AI agents understand the rationale and don't propose alternatives that were already considered and rejected.

### Steps

1. **Research the codebase** to understand the rationale behind each decision. Read:
   - `CLAUDE.md` for conventions and architecture notes
   - `crates/mcp/src/server.rs` for manual MCP dispatch pattern
   - `crates/app/src/stores/` for Zustand usage
   - `crates/app/src/api/bridge.ts` for the Bridge pattern
   - `crates/core/src/model.rs` for string-typed note/edge types
   - `crates/core/src/graph.rs` for virtual folder nodes
   - `crates/core/tests/seed_dataset.rs` and `seed/` for the seed dataset approach
   - `.claude/research/` and `.claude/transcripts/` for any historical context

2. **Create `docs/decisions/` directory** with these files:

**`000-template.md`:**
```markdown
# [Title]
**Date:** YYYY-MM-DD | **Status:** accepted

## Context
[What prompted this decision]

## Decision
[What was decided]

## Alternatives Considered
[What was rejected and why]

## Consequences
[Trade-offs accepted]
```

**`001-manual-mcp-dispatch.md`** — Why manual `match name { ... }` dispatch in server.rs instead of rmcp derive macros. Research the actual server.rs code to understand the pattern. Key rationale: explicit tool routing is transparent to AI (no macro magic), easy to add/remove tools, and the tool list is visible in one place.

**`002-zustand-over-alternatives.md`** — Why Zustand over Redux/Jotai/Valtio. Key rationale: minimal boilerplate, hooks-based API, easy to test (getState/setState), snapshot/restore pattern for multi-segment support.

**`003-bridge-pattern.md`** — Why BrainMapAPI interface abstraction (TauriBridge vs MockBridge). Key rationale: frontend tests run without Tauri, dev mode works with `npm run dev` alone, single interface contract.

**`004-single-core-library.md`** — Why one `brainmap-core` crate consumed by CLI, MCP, and Tauri. Key rationale: no logic duplication, single source of truth, test core once and all interfaces benefit.

**`005-string-typed-note-edge-types.md`** — Why note_type and edge rel are strings instead of Rust enums. Research model.rs to confirm. Key rationale: extensibility without code changes, auto-registration of new types, user-defined types without recompilation.

**`006-folder-nodes-virtual.md`** — Why folders are virtual graph nodes (no backing .md file). Key rationale: folders participate in graph queries/traversal, `contains` edges model directory structure, no file proliferation.

**`007-seed-dataset-as-test-fixture.md`** — Why real data from "The Book of Why" instead of synthetic test data. Key rationale: real-world messiness, covers all types, negative cases included, reusable across all interfaces.

3. **Each ADR must be substantive** — not just restating what the code does, but explaining the trade-offs. Use the template format. Set all dates to 2026-03-15 and status to "accepted".

### Quality
- Each ADR should be 15-40 lines (concise but complete)
- The "Alternatives Considered" section is the most important — it prevents AI from re-proposing rejected ideas
- Do NOT modify CLAUDE.md (another agent handles that)

---

## Assistant



I'll research the codebase to understand the rationale behind each decision, then create the ADR files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/mcp/src/server.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/core/src/model.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/core/src/graph.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/app/src/api/bridge.ts","limit":80}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.ts","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d"}`

---

## Assistant

Let me get more context from the remaining files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/core/src/model.rs","offset":100,"limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/mcp/src/server.rs","offset":100,"limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"seed/*.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":".claude/research/*.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/app/src/api/types.ts","limit":60}`

---

## Assistant

Now let me check the graph.rs for virtual folder node logic and the seed dataset structure.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"compute_folder_hierarchy|ensure_folder_nodes|virtual|folder","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/core/src/graph.rs","output_mode":"c`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"seed/**/*.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/core/tests/seed_dataset.rs","limit":50}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"segmentStateCache|SegmentSnapshot|snapshot|restore","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/crates/app/src/stores","output_mode":"files_with_ma`

---

## Assistant

I now have enough context. Let me create the directory and all ADR files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions","description":"Create decisions directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/000-template.md","content":"# [Title]\n**Date:** YYYY-MM-DD | **Status:** accepted\n\n## Conte`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/001-manual-mcp-dispatch.md","content":"# Manual MCP Tool Dispatch\n**Date:** 2026-03-15 | **St`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/002-zustand-over-alternatives.md","content":"# Zustand for Frontend State Management\n**Date:*`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/003-bridge-pattern.md","content":"# BrainMapAPI Bridge Pattern\n**Date:** 2026-03-15 | **Statu`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/004-single-core-library.md","content":"# Single Core Library Consumed by All Interfaces\n**Dat`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/005-string-typed-note-edge-types.md","content":"# String-Typed Note and Edge Types\n**Date:** `

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/006-folder-nodes-virtual.md","content":"# Virtual Folder Nodes\n**Date:** 2026-03-15 | **Statu`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/007-seed-dataset-as-test-fixture.md","content":"# Seed Dataset as Test Fixture\n**Date:** 2026`

---

## Assistant

All 8 files created. Let me verify the directory contents and do a quick line count check.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a0e7d94d/docs/decisions/ && echo \"---\" && wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/a`

---

## Assistant

All files are in the target range (18-20 lines each, template at 14). Here is a summary of what was created:

**Created `docs/decisions/` directory** with 8 ADR files:

- `/docs/decisions/000-template.md` -- Standard ADR template for future decisions
- `/docs/decisions/001-manual-mcp-dispatch.md` -- Why `match name { ... }` instead of rmcp derive macros (transparency to AI readers, `batch` tool reuse, easy auditing of tool surface)
- `/docs/decisions/002-zustand-over-alternatives.md` -- Why Zustand over Redux/Jotai/Valtio (imperative `getState()`/`setState()` for segment snapshot/restore, testable without React, minimal boilerplate)
- `/docs/decisions/003-bridge-pattern.md` -- Why `BrainMapAPI` interface with TauriBridge/MockBridge (tests without Tauri, dev mode in browser, single contract)
- `/docs/decisions/004-single-core-library.md` -- Why one `brainmap-core` crate for all interfaces (single source of truth, fix once for all, thin interface wrappers)
- `/docs/decisions/005-string-typed-note-edge-types.md` -- Why `String` instead of Rust enums for `note_type`/`rel` (extensibility without recompilation, user-defined types, graceful handling of unknown values)
- `/docs/decisions/006-folder-nodes-virtual.md` -- Why folders are virtual graph nodes without `.md` files (no file proliferation, complete graph representation, hierarchical queries via `contains` edges)
- `/docs/decisions/007-seed-dataset-as-test-fixture.md` -- Why real "Book of Why" data instead of synthetic fixtures (real-world messiness, type coverage, shared across all interface tests, doubles as documentation)

Each ADR follows the template format with Context, Decision, Alternatives Considered (with specific reasons for rejection), and Consequences (including explicit trade-offs). All dated 2026-03-15, status "accepted".

---

