# 2026-03-30 — Subagent Transcript: Explore

**Date:** 2026-03-30 13:47:52
**Agent:** Explore
**Agent ID:** a855b36a742ed04c9
**Parent Session:** ef7ce461-6110-4d5e-bb73-b8dd8f64d38f

---

## User

I need to understand the existing skill and agent structure in this project. Read these files:

1. All files in `.claude/skills/` - glob for `**/*` to find all skill definitions
2. All files in `.claude/agents/` - glob for `**/*` to find all agent definitions
3. `.claude/settings.json` or `.claude/settings.local.json` if they exist

Report the full content of each file found, especially the structure/format of skill SKILL.md files and agent .md files.

---

## Assistant

I'll search for all the files in the `.claude/` directory structure to understand the skill and agent setup.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":".claude/skills/**/*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":".claude/agents/**/*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":".claude/settings*.json","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Now let me read all the skill and agent definition files, plus the settings files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/skills/git-ship/SKILL.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/skills/save-session/SKILL.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/skills/tauri-mcp-navigate/SKILL.md"}`

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/settings.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/settings.local.json"}`

---

## Assistant

Perfect! I have all the information. Let me provide you with a comprehensive report.

## Skill and Agent Structure Report

### Skills (`.claude/skills/`)

The project has **3 custom skills** defined with SKILL.md files:

#### 1. **git-ship** (`git-ship/SKILL.md`)
- **Name**: git-ship
- **Description**: Stage, commit, and push all changes with an auto-generated meaningful commit message
- **Argument**: Optional message override or extra context
- **Purpose**: Complete git workflow automation (inspect changes, stage, commit with meaningful message, push)
- **Key Rules**: Never force push to main/master, never commit secrets, follows commit style guide

#### 2. **save-session** (`save-session/SKILL.md`)
- **Name**: save-session
- **Description**: Save a summary of the current session to `.claude/sessions/` for future context
- **Argument**: Optional focus area or notes
- **Purpose**: Document the full conversation arc (including early exploration, architectural decisions, refactoring, debugging)
- **Structure**: Required sections (Title, What Was Done, Key Decisions, Files Changed, Test Status), Optional sections (Context From Previous, Remaining Known Items), Subagent work
- **Critical Pattern**: Must review ENTIRE conversation from start to finish, not just final task

#### 3. **tauri-mcp-navigate** (`tauri-mcp-navigate/SKILL.md`)
- **Name**: tauri-mcp-navigate
- **Description**: Navigate and interact with the BrainMap Tauri app via tauri-mcp tools for visual testing
- **Argument**: Action to perform (e.g., "open canvas Aula 1" or "verify file tree shows 6 folders")
- **Purpose**: Delegates to playbook files in `.claude/playbooks/tauri-mcp/`
- **Playbooks Referenced**: 00-principles, 01-basics, 02-file-tree, 03-tabs, 04-editor, 05-canvas, 06-dialogs, 07-search, 08-helpers
- **Key Feature**: Can launch isolated app instance via `./scripts/e2e-app.sh` for non-destructive testing
- **Critical Rules**: Use `execute_js` for interactions (not native click), never modify `.textContent`/`.innerHTML` on React elements, always take screenshot after action, check logs after interactions

### Agents (`.claude/agents/`)

The project has **2 custom agent definitions**:

#### 1. **plan-reviewer.md**
- **Role**: Reviewing implementation plans for BrainMap
- **Project Context**: Rust workspace (crates/core, crates/cli, crates/tauri-plugin), files as source of truth, in-memory graph + SQLite FTS5 index
- **Review Categories**: Architectural Alignment, Scope and Complexity, Edge Cases and Risks, Test Strategy, Data Model Impact
- **Output Format**: List of findings with Category (architecture/scope/edge-case/testing/data-model/performance/clarity), Severity (blocker/should-fix/suggestion), Finding, Recommendation
- **Philosophy**: Find real problems, only real findings (no padding or filler)

#### 2. **code-reviewer.md**
- **Role**: Reviewing Rust code for BrainMap
- **Project Context**: Same workspace structure, uses `thiserror` for error handling, `serde` for serialization, behavior-based tests
- **Review Categories**: Correctness, Rust Quality, Function Design, Test Coverage, Serialization and API Surface, Performance
- **Output Format**: List of findings with File (path/line range), Severity (bug/should-fix/suggestion), Finding (with code snippet), Fix (with corrected code)
- **Philosophy**: Find real defects not style nits, no unnecessary comments expected
- **What NOT to Report**: Missing docstrings, style preferences, TODOs (unless masking a bug)

### Settings Configuration (`.claude/settings.json`)

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"  // Enables agent teams feature
  },
  "hooks": {
    "SubagentStop": [...],     // Saves subagent transcript on stop
    "SessionEnd": [...]        // Saves session transcript on end
  }
}
```

### Settings Local (`.claude/settings.local.json`)

Extensive permissions configuration including:
- **Environment**: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- **NPM/Poetry/Pip**: Install, test, build, lint, dev server commands
- **Tools**: curl, python3, WebSearch, grep, find, lsof, tmux, docker
- **Domain Fetches**: github.com, anthropic docs, raw.githubusercontent.com, various developer sites
- **Git Operations**: remote, push, git -C (for specific project), with hardcoded paths to personal projects
- **MCP Servers**: All tauri-mcp tools enabled (query_page, execute_js, take_screenshot, mouse_action, type_text)
- **Feature Flags**: `enableAllProjectMcpServers: true`, specific MCP servers enabled (slack)

### Key Structural Patterns

1. **Skills are action-oriented** with clear step-by-step instructions and output formats
2. **Agents are review-oriented** with detailed context about the BrainMap project architecture
3. **Hooks auto-save transcripts** on session/subagent completion for continuity
4. **Experimental teams feature** is enabled globally
5. **Playbook-driven approach** for complex interactions (tauri-mcp-navigate delegates to playbooks)

---

