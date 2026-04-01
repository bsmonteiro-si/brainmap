# 2026-03-31 — Subagent Transcript: claude-code-guide

**Date:** 2026-03-31 11:45:32
**Agent:** claude-code-guide
**Agent ID:** af5de53986d783b5f
**Parent Session:** f883a568-2c46-4b8d-80eb-3464342cb895

---

## User

Explain the full hierarchy of CLAUDE.md files in Claude Code. How are global, user/local, and project-level CLAUDE.md files loaded? What is the precedence order? Where does each one live on disk? Also cover .claude/settings.json hierarchy (global vs local vs project) if relevant. Include any details about how parent directory CLAUDE.md files are discovered and merged.

---

## Assistant

I'll fetch the Claude Code documentation to explain the CLAUDE.md hierarchy and settings loading.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/claude_code_docs_map.md","prompt":"CLAUDE.md hierarchy and precedence order, settings.json hierarchy, .claude/ configuration files"}`

---

## Assistant

Let me fetch the specific memory documentation page to get detailed information about CLAUDE.md hierarchy.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/memory.md","prompt":"CLAUDE.md hierarchy, precedence order, how files load from global user local project directories, parent directory discovery, .claude/setti`

---

## Assistant

Now let me fetch the settings documentation to get details on settings.json hierarchy.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/settings.md","prompt":"settings.json hierarchy, global local project user scope precedence order disk location"}`

---

## Assistant

Let me read the full settings file with a specific offset to get the precedence information.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/settings.md","prompt":"settings precedence order, settings.json file locations by scope, how scopes merge and override each other, managed policy settings locat`

---

## Assistant

Let me read the saved file directly to get the full settings hierarchy.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/f883a568-2c46-4b8d-80eb-3464342cb895/tool-results/toolu_01JnCTzBLdoHjoem8naAq8YM.txt","limit":3000}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/f883a568-2c46-4b8d-80eb-3464342cb895/tool-results/toolu_01JnCTzBLdoHjoem8naAq8YM.txt","offset":50,"limit":5`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"Settings precedence|precedence order|file location|\\.claude|~/.claude|managed-settings","path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/f883a568-2c4`

---

## Assistant

Perfect. Now I have enough information to provide a comprehensive answer. Let me compile the full hierarchy explanation.

## CLAUDE.md Hierarchy and Loading Order

### **CLAUDE.md File Locations by Scope**

Claude Code uses a **three-tier** CLAUDE.md hierarchy based on scope:

| Scope | Location | Purpose | Shared? |
|-------|----------|---------|---------|
| **Managed Policy** | **macOS**: `/Library/Application Support/ClaudeCode/CLAUDE.md`<br/>**Linux/WSL**: `/etc/claude-code/CLAUDE.md`<br/>**Windows**: `C:\Program Files\ClaudeCode\CLAUDE.md` | Organization-wide instructions | Yes (IT-deployed) |
| **Project** | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Team instructions checked into git | Yes (via source control) |
| **User** | `~/.claude/CLAUDE.md` | Personal preferences across all projects | No (machine-local) |

### **How CLAUDE.md Files Load**

Claude Code walks **up the directory tree** from your current working directory, loading CLAUDE.md files at each level:

1. **Directory tree traversal** (walk up from cwd)
   - Starts at your current working directory
   - Checks each ancestor directory for `CLAUDE.md` or `.claude/CLAUDE.md`
   - Loads all ancestor CLAUDE.md files found (they all accumulate into context)
   - Example: if you run Claude in `foo/bar/baz/`, it loads from `foo/bar/baz/`, `foo/bar/`, `foo/`, and root `/`

2. **Lazy loading in subdirectories**
   - Files in **subdirectories below** your cwd are not loaded at launch
   - They load on-demand when Claude reads files in those subdirectories
   - This saves context for nested project structures

3. **Precedence order** (more specific overrides broader)
   - **Managed policy** CLAUDE.md (if set) — cannot be excluded
   - **Project** CLAUDE.md (`.claude/CLAUDE.md` or `./CLAUDE.md`)
   - **User** CLAUDE.md (`~/.claude/CLAUDE.md`)

### **File Imports**

CLAUDE.md files can import other files using `@path/to/file` syntax:

```markdown
See @README.md for project overview.
Personal preferences: @~/.claude/my-prefs.md
Git workflow: @docs/git-instructions.md
```

- Relative paths resolve relative to the CLAUDE.md file (not the working directory)
- Absolute and `~/` paths are supported
- Imported files can recursively import others (max 5 hops)
- External imports require first-time approval

### **Excluding CLAUDE.md Files**

Large monorepos can exclude irrelevant ancestor CLAUDE.md files via `claudeMdExcludes` in `.claude/settings.local.json`:

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/absolute/path/to/other-team/.claude/rules/**"
  ]
}
```

**Exception**: Managed policy CLAUDE.md cannot be excluded — organization-wide instructions always apply.

### **Organizing with `.claude/rules/`**

For larger projects, split instructions into topic-specific files in `.claude/rules/`:

```
your-project/
├── .claude/
│   ├── CLAUDE.md              # Main project instructions
│   └── rules/
│       ├── code-style.md      # All projects load by default
│       ├── testing.md
│       └── frontend/
│           ├── react.md       # Path-scoped: only for src/frontend/**
│           └── css.md
```

**Path-scoped rules** (using YAML frontmatter) only load when Claude reads matching files:

```markdown
---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# API Development Rules
- All endpoints must validate input
- Use standard error format
```

Rules without `paths` load at startup like `.claude/CLAUDE.md`.

---

## `settings.json` Hierarchy

### **Settings File Locations by Scope**

| Scope | Location | Shared? | Purpose |
|-------|----------|---------|---------|
| **Managed** | **macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`<br/>**Linux/WSL**: `/etc/claude-code/managed-settings.json`<br/>**Windows**: `C:\Program Files\ClaudeCode\managed-settings.json` | Yes (IT-deployed) | Enforced org policies |
| **User** | `~/.claude/settings.json` | No | Personal defaults across all projects |
| **Project** | `.claude/settings.json` | Yes (git-committed) | Team settings for this repo |
| **Local** | `.claude/settings.local.json` | No (git-ignored) | Personal overrides in this repo only |

### **Settings Precedence Order** (highest to lowest priority)

1. **Managed settings** (server-managed, MDM/OS policies, or file-based)
   - Within file-based managed settings: `managed-settings.d/*.json` files override `managed-settings.json`
   - Server-managed > MDM/OS policies > file-based
   - Only one managed source applies; they do not merge across tiers
2. **Local project settings** (`.claude/settings.local.json`)
3. **Shared project settings** (`.claude/settings.json`)
4. **User settings** (`~/.claude/settings.json`)

**Lower-priority scopes cannot override managed settings** — managed policies always enforce.

### **Other Configuration Files**

| Config | User | Project | Local | Managed |
|--------|------|---------|-------|---------|
| **Subagents** | `~/.claude/agents/` | `.claude/agents/` | None | Via managed settings |
| **MCP servers** | `~/.claude.json` | `.mcp.json` | `.mcp.json` | Via `managed-mcp.json` |
| **CLAUDE.md** | `~/.claude/CLAUDE.md` | `./CLAUDE.md` or `./.claude/CLAUDE.md` | None | System-level CLAUDE.md |
| **Rules** | `~/.claude/rules/` | `.claude/rules/` | None | Via managed settings |

### **How Arrays and Objects Merge**

When the same setting appears at multiple scopes:

- **Scalar values** (strings, booleans, numbers): higher-priority scope completely replaces lower one
- **Arrays**: concatenated and de-duplicated across all active scopes
- **Objects**: deep-merged, with higher-priority scope values taking precedence

Example: if `permissions.allow` is set at user and project scope, both arrays merge into context.

---

## Key Points Summary

- **CLAUDE.md discovery**: walks **up** directory tree from cwd; all ancestors load; subdirectories load on-demand
- **CLAUDE.md scope precedence**: Managed > Project > User
- **settings.json precedence**: Managed > Local project > Shared project > User
- **Managed policies** (both CLAUDE.md and settings) cannot be overridden by lower scopes
- **Monorepos**: use `claudeMdExcludes` to skip irrelevant ancestor CLAUDE.md files
- **Context efficiency**: Use `.claude/rules/` with `paths` for path-scoped rules that load on-demand
- **Team sharing**: Project CLAUDE.md and `.claude/settings.json` are git-committed; `.claude/settings.local.json` is git-ignored

Sources:
- [Claude Code Memory Documentation](https://code.claude.com/docs/en/memory.md)
- [Claude Code Settings Documentation](https://code.claude.com/docs/en/settings.md)

---

