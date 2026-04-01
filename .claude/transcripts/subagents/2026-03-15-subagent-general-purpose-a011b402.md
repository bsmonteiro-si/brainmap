# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 20:01:24
**Agent:** general-purpose
**Agent ID:** a011b402e539ede84
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

## Task: 2C — Error Recovery Guide

You are implementing one task from the AI-first upgrades plan. Your job is to CREATE a documentation file.

### Goal
Document what an AI agent should do when encountering each BrainMapError code. This is an AI-first error handling guide — not user-facing docs, but instructions for AI agents that encounter errors while working with the codebase.

### Steps

1. **Read `crates/core/src/error.rs`** to get all BrainMapError variants and their error_code() mappings.

2. **Read usage examples** in:
   - `crates/core/src/workspace.rs` — how errors are created and returned
   - `crates/mcp/src/server.rs` — how errors become response envelopes
   - `crates/app/src-tauri/src/commands.rs` — how errors cross the Tauri IPC boundary

3. **Create `docs/error-recovery.md`** with one section per error code. Each section must have:
   - **Error code** (from `error_code()`)
   - **Rust variant** (from the enum)
   - **Cause** — when this error is returned
   - **Data** — what context the error carries (fields in the variant)
   - **AI action** — specific steps an AI should take to diagnose and fix
   - **Example** — a concrete scenario

### Content (research the actual error.rs to get accurate variants)

Cover ALL error variants including:
- FILE_NOT_FOUND
- DUPLICATE_PATH
- INVALID_YAML
- BROKEN_LINK_TARGET
- DUPLICATE_LINK
- LINK_NOT_FOUND
- HAS_BACKLINKS
- INVALID_ARGUMENT
- INVALID_WORKSPACE
- WORKSPACE_EXISTS
- INDEX_CORRUPT
- CONFIG_ERROR
- IO_ERROR (transparent)
- YAML_ERROR (transparent)
- SQLITE_ERROR (transparent)

### Quality
- Each entry should be actionable — not just "this error means X" but "when you see this, do Y"
- Include the actual Rust variant signature (fields and types)
- Do NOT modify CLAUDE.md (another agent handles that)

---

## Assistant



I'll start by reading the error source file and the key usage files to understand all error variants and how they're used.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":100}`

---

## Assistant

Now let me look at how errors are used in workspace.rs to understand typical scenarios.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"BrainMapError::","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","output_mode":"content","-n":true}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"\\.map_err\\(|\\.to_string\\(\\)\\)|BrainMapError","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-n":true}`

---

## Assistant

Now let me check how Tauri commands convert errors to strings (the IPC boundary pattern).

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"map_err\\(|\\.to_string\\(\\)\\)\\?|Result<.*String>\"","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content","-n":true,"head_li`

---

## Assistant

I have all the information I need. Let me create the documentation file.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a011b402/docs/","description":"List docs directory"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a011b402/docs/error-recovery.md","content":"# BrainMap Error Recovery Guide\n\nAI-first reference for handling `BrainM`

---

## Assistant

The file has been created at `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/worktrees/agent-a011b402/docs/error-recovery.md`.

**Summary:** Created `docs/error-recovery.md` covering all 15 `BrainMapError` variants with their error codes, Rust variant signatures (including field types), causes, carried data, actionable AI recovery steps, and concrete examples. The guide also documents the three error propagation patterns across MCP (structured JSON envelope with `is_error: true`), CLI (JSON envelope to stdout), and Tauri (stringified via `.to_string()` across IPC).

---

