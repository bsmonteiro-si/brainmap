# 2026-03-22 — Subagent Transcript: Explore

**Date:** 2026-03-22 14:23:08
**Agent:** Explore
**Agent ID:** a118f39aeca6d0d5e
**Parent Session:** 5a4e73f3-9763-4aad-a8d8-60f48fd48e7c

---

## User

Explore how this project organizes agent context and documentation. I need to understand:

1. What's in `.claude/agents/` — read each agent file to understand the format and level of detail
2. What's in `docs/extension-guides/` — list all guides and read one or two to understand the format
3. What's in `docs/decisions/` — list ADRs
4. What's in `.claude/research/` — list all research files
5. What's in `CLAUDE.md` — how is project context structured there
6. What's in `.claude/projects/*/memory/` — how are memories organized

I want to understand the existing patterns for providing context to agents so we can design Canvas-specific context files that fit naturally.

---

## Assistant

I'll systematically explore these directories to understand the context organization patterns in this project.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f \\( -path \"*/.claude/agents/*\" -o -path \"*/docs/extension-guides/*\" -o -path \"*/docs/decisions/*\" -o -path \"*/.claude/resear`

---

## Assistant

Now let me look at the main project directories:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/plan-reviewer.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/code-reviewer.md"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/extension-guides/*.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/decisions/*.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":".claude/research/*.md","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Now let me read a few example extension guides and an ADR to understand the format:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-file-type-editor.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-tauri-command.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions/006-folder-nodes-virtual.md"}`

---

## Assistant

Now let me read a research file and check the memory file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/research/canvas-integration.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/memory/MEMORY.md","limit":100}`

---

## Assistant

Let me check one more extension guide to see the range of formats:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-note-type.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/decisions/000-template.md"}`

---

## Assistant

Now let me check the directory structure to see what's in the main CLAUDE.md:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/.claude/projects/ 2>/dev/null | head -20"}`

---

## Assistant

Perfect. Now I have a comprehensive understanding of the project's context organization. Let me compile my findings into a clear report.

## Summary of Context Organization Patterns in BrainMap

I've completed a thorough exploration of how the BrainMap project organizes agent context and documentation. Here's what I found:

---

### 1. **Agent Definitions (`.claude/agents/`)**

Two mandatory review agents with clear, focused responsibilities:

- **`plan-reviewer.md`** (65 lines): Evaluates implementation plans for architectural alignment, scope, complexity, edge cases, testing, and data model impact. Output format is structured findings with: Category (architecture/scope/edge-case/testing/data-model/performance/clarity), Severity (blocker/should-fix/suggestion), Finding, Recommendation.

- **`code-reviewer.md`** (65 lines): Reviews Rust code for correctness, Rust idioms, function design, test coverage, serialization/API surface, and performance. Output format: File path + line range, Severity (bug/should-fix/suggestion), Finding with code snippet, Fix with corrected code.

**Pattern:** Agent files are lightweight role definitions (~65 lines each), not full specs. They define review criteria, severity levels, and output format. They're used by spawning `general-purpose` agents and passing the full agent definition as part of the prompt.

---

### 2. **Extension Guides (`docs/extension-guides/`)**

11 task-specific guides, each 50-280 lines, following a consistent pattern:

- **Architecture overview** (ASCII diagram showing data flow)
- **Numbered checklist** (5-14 steps, each with file path, checkbox, code snippet)
- **Example reference** (point to existing implementation with file paths + line numbers)
- **Common pitfalls** (2-6 end-of-guide warnings)
- **Optional: file-type table** (for extensible systems like editors)

Examples:
- `add-file-type-editor.md` (14 steps): Used by Canvas, Excalidraw, PDF viewers. Most detailed guide.
- `add-tauri-command.md` (8 steps): Backend → Frontend → Tests pattern.
- `add-note-type.md` (4 steps per section): Backend/CLI/MCP/Desktop Graph/Desktop Editor/Tests.

**Pattern:** Guides are implementation recipes, not specifications. They're referenced in CLAUDE.md as "Before implementing, check `docs/extension-guides/`".

---

### 3. **Architecture Decision Records (`docs/decisions/`)**

8 ADRs, 15-20 lines each, following RFC-style template:

```
# [Title]
**Date:** YYYY-MM-DD | **Status:** accepted

## Context
## Decision
## Alternatives Considered
## Consequences
```

Examples:
- `006-folder-nodes-virtual.md`: Why folders exist as in-memory graph nodes, not `.md` files.
- `001-manual-mcp-dispatch.md`: Why MCP tools are manually dispatched instead of auto-generated.
- `003-bridge-pattern.md`: Tauri API abstraction over concrete implementations.

**Pattern:** ADRs are lightweight (one page), focused on trade-offs. They're referenced in CLAUDE.md as "Before making architectural decisions, check `docs/decisions/`".

---

### 4. **Research Documents (`.claude/research/`)**

8 exploratory documents, 100-150 lines each:

- **`canvas-integration.md`**: JSON Canvas spec overview, React Flow API reference, BrainMap integration points, custom node types, seed examples. Written before implementation.
- **`excalidraw-integration.md`**: Similar structure (spec → library facts → integration points → seed examples).
- **`linking-notes-to-folders.md`**: Exploration of folder linking semantics.
- **Others**: PDF roadmap, editor/files panel gap analysis, AI-first codebase audit.

**Pattern:** Research documents capture domain knowledge (specs, library facts, existing integrations) before implementation. They're referenced in CLAUDE.md indirectly (in memory file: "research at `.claude/research/excalidraw-integration.md`").

---

### 5. **Project Memory (`~/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/memory/MEMORY.md`)**

Single persistent file (70 lines) organized by sections:

- **Project Status**: Phase completion timeline + feature list (one-liners per feature with key details)
- **Architecture**: Tech stack, API bridge pattern, workspace locking, DTOs
- **Key Patterns**: Conventions, serialization rules, testing approach
- **Test Coverage**: Stats + config details
- **Feedback**: Links to feedback documents (CodeMirror spacing, plain files, debugging workflow)
- **References**: Links to reference docs
- **Build Notes**: Platform-specific instructions

**Pattern:** Memory is a dense index of project state + references to longer docs. It's auto-persisted and survives across sessions. Features include pointers to relevant research/code locations.

---

### 6. **CLAUDE.md (Project Root)**

Main project instructions file (99 lines) structured as:

- **Quick start**: Verification, building, testing
- **Project structure**: Directory layout
- **Architecture**: Data flow, subsystems
- **Data model**: Frontmatter fields, type counts
- **Conventions**: Language, MCP patterns, CodeMirror rules
- **Logging**: Env var, log locations, frontend logger API, debugging workflow
- **Reference docs**: Pointer to extension guides + ADRs
- **Review agents**: Description + mandatory feedback loops (planning + code review)
- **Review cleanup**: Archive old reviews
- **Documentation maintenance**: Every plan updates docs

**Pattern:** CLAUDE.md is the source of truth for development workflow. It's concise, with heavy use of file path references and pointers to longer docs. It documents the two mandatory review loops with specific file paths for feedback output.

---

### **Key Insights for Canvas Context Design**

1. **Hierarchical referencing**: CLAUDE.md → specific guides/ADRs/research docs. Never duplicate—reference instead.
2. **Consistency of detail**: Each document type has a narrow scope:
   - Guides = checklists (how to extend)
   - ADRs = decisions (why it's this way)
   - Research = background (specs + lib facts)
   - Memory = current state + pointers
3. **Actionable format**: All guides use numbered checklists with file paths + line numbers. No vague references.
4. **Testing is built-in**: Every guide includes a "Tests" section. Every ADR notes testability trade-offs.
5. **Review feedback is structured**: Agents output findings with severity levels and specific recommendations. No prose rambling.
6. **Feedback loops are mandatory**: Not optional—CLAUDE.md explicitly states "Never skip the feedback loops."

---

### **Recommended Pattern for Canvas-Specific Context**

Based on this exploration, here's what would fit naturally:

1. **`.claude/research/canvas-editor-patterns.md`** (~150 lines): Deep dive into CanvasEditor implementation, node type architecture, sync patterns with graph.
2. **`docs/extension-guides/extend-canvas-node-types.md`** (~80 lines): Checklist for adding new node types (FileNode, TextNode, etc.).
3. **`docs/decisions/008-canvas-as-spatial-representation.md`** (~20 lines): Why Canvas complements the automatic graph view.
4. **Canvas section in CLAUDE.md**: Brief pointer to Canvas tab kind and research doc.
5. **Canvas features in MEMORY.md**: One-liner per feature (zoom restore, toolbar positioning, edge labels) with pointers.

This maintains the existing pattern of layered, referenced documentation without duplication.

---

