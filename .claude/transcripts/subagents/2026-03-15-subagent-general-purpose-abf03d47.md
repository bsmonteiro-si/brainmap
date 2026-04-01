# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 20:02:18
**Agent:** general-purpose
**Agent ID:** abf03d4739c0e390a
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

## Task: 2B — Extension Guides (How to Add X)

You are implementing one task from the AI-first upgrades plan. Your job is to CREATE documentation files with precise file paths and line numbers.

### Goal
Create step-by-step checklists with exact file paths for each extension point in the codebase. These guides are for AI agents that need to add new note types, edge types, CLI commands, MCP tools, Tauri commands, or Zustand stores.

### Steps

1. **Research the actual codebase** to find the precise file paths and line numbers for each extension point. Read:
   - `crates/core/src/model.rs` — note types, edge types, TypedLink, Frontmatter
   - `crates/app/src/components/Layout/fileTreeIcons.tsx` — NOTE_TYPE_ICONS mapping
   - `crates/app/src/components/GraphView/graphStyles.ts` — NOTE_TYPE_COLORS, getNodeColor
   - `crates/app/src/components/GraphView/graphIcons.ts` — NOTE_TYPE_ICON_PATHS
   - `crates/app/src/components/Editor/LinksEditor.tsx` — edge type selector list
   - `crates/cli/src/main.rs` — Commands enum, dispatch
   - `crates/cli/src/commands/mod.rs` — module list
   - `crates/mcp/src/server.rs` — dispatch_tool match block
   - `crates/mcp/src/tools/mod.rs` — all_tools(), make_tool()
   - `crates/app/src-tauri/src/lib.rs` — generate_handler! macro
   - `crates/app/src-tauri/src/commands.rs` — #[tauri::command] wrappers
   - `crates/app/src-tauri/src/handlers.rs` — handler functions
   - `crates/app/src/api/types.ts` — BrainMapAPI interface
   - `crates/app/src/api/tauri.ts` — TauriBridge class
   - `crates/app/src/api/mock/index.ts` — MockBridge class
   - `crates/app/src/stores/` — existing store patterns
   - `crates/app/src/stores/segmentStateCache.ts` — SegmentSnapshot

2. **Create `docs/extension-guides/` directory** with these 6 files:

**`add-note-type.md`** — Checklist for adding a new note type. Include actual line numbers from the files you read.

**`add-edge-type.md`** — Checklist for adding a new edge type.

**`add-cli-command.md`** — Checklist for adding a new CLI command.

**`add-mcp-tool.md`** — Checklist for adding a new MCP tool.

**`add-tauri-command.md`** — Checklist for adding a new Tauri command.

**`add-zustand-store.md`** — Checklist for adding a new Zustand store.

### Format for each guide
```markdown
# How to Add a [Thing]

## Checklist
- [ ] Step description — `file/path.rs` (line ~N)
- [ ] Step description — `file/path.ts` (line ~N)
...

## Example
Reference an existing [thing] as a pattern to follow: [specific example with path]
```

### Quality
- Every checklist item MUST include a file path
- Line numbers should be approximate (use `~` prefix) since they shift
- Each guide should reference a concrete existing example as the pattern to follow
- The checklist order should match the typical implementation order (backend first, then frontend)
- Do NOT modify CLAUDE.md (another agent handles that)

---

## Assistant



I'll research the codebase to find precise file paths and line numbers for each extension point, then create the 6 guide files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/cli/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/cli/src/commands/mod.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/mcp/src/server.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/mcp/src/tools/mod.rs"}`

---

## Assistant

Now let me read the frontend files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/components/GraphView/graphIcons.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/components/Editor/LinksEditor.tsx"}`

---

## Assistant

Now let me read the Tauri backend files and store files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/api/tauri.ts"}`

---

## Assistant

Now let me read the remaining files I need.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/api/mock/index.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/stores/segmentStateCache.ts","limit":50}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/stores/","description":"List store files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src-tauri/src/handlers.rs","limit":50}`

---

## Assistant

Now let me look at the config file for note types and edge types validation.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"note_types|edge_types","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/core/src","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/stores/graphStore.ts","limit":60}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/core/src/config.rs"}`

---

## Assistant

Now let me check a sample CLI command file and an MCP tool file for patterns.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/cli/src/commands/search.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/mcp/src/tools/search.rs"}`

---

## Assistant

Now I have all the information I need. Let me look at a sample store to understand the pattern.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/crates/app/src/stores/navigationStore.ts"}`

---

## Assistant

Now I have all the information. Let me create the directory and files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides","description":"Create extension-guides directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides/add-note-type.md","content":"# How to Add a Note Type\n\n## Checklist\n\n### Backend (R`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides/add-edge-type.md","content":"# How to Add an Edge Type\n\n## Checklist\n\n### Backend (`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides/add-cli-command.md","content":"# How to Add a CLI Command\n\n## Checklist\n\n### 1. Cre`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides/add-mcp-tool.md","content":"# How to Add an MCP Tool\n\n## Checklist\n\n### 1. Implemen`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides/add-tauri-command.md","content":"# How to Add a Tauri Command\n\n## Checklist\n\n### Ba`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides/add-zustand-store.md","content":"# How to Add a Zustand Store\n\n## Checklist\n\n### 1.`

---

## Assistant

All 6 extension guide files have been created. Here is a summary of what was done:

**Created 6 files in `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-abf03d47/docs/extension-guides/`:**

1. **`add-note-type.md`** -- 12 checklist steps covering config registration (`config.rs` line ~84), graph colors/shapes/icons (`graphStyles.ts`, `graphIcons.ts`), file tree icons (`fileTreeIcons.tsx`), and CreateNoteDialog. References `project` type as the pattern.

2. **`add-edge-type.md`** -- 7 checklist steps covering config registration (`config.rs` line ~102), LinksEditor selectable types (`LinksEditor.tsx` line ~10), and MCP tool description. References `causes` as the pattern.

3. **`add-cli-command.md`** -- 5 checklist steps: create module file, register in `mod.rs`, add `Commands` enum variant (`main.rs` line ~56), add dispatch match arm (`main.rs` line ~212), implement with three output formats. References `search` command as the pattern.

4. **`add-mcp-tool.md`** -- 5 checklist steps: implement handler function, define tool schema via `make_tool()` in `all_tools()` (`mod.rs` line ~70), add dispatch match arm (`server.rs` line ~83), use argument helpers and response envelope. References `search` tool as the pattern.

5. **`add-tauri-command.md`** -- 8 checklist steps spanning backend (DTOs in `dto.rs`, handler in `handlers.rs`, `#[tauri::command]` wrapper in `commands.rs`, registration in `lib.rs` line ~25) and frontend (TS types in `types.ts`, TauriBridge in `tauri.ts`, MockBridge in `mock/index.ts`). References both `get_stats` (read-only) and `create_node` (write with events) as patterns.

6. **`add-zustand-store.md`** -- 7 checklist steps: create store file with `create()`, include `reset()` action, wire workspace lifecycle, add to `SegmentSnapshot` in `segmentStateCache.ts` (line ~29), handle events, optional localStorage persistence. References `navigationStore.ts` and `uiStore.ts` as patterns.

Every checklist item includes a file path, and line numbers use the `~` prefix to indicate they are approximate.

---

