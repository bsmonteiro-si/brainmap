# 2026-03-30 — Agent Teams Exploration & Setup

## What Was Done

1. **Researched Claude Code agent teams capabilities**
   - Spawned claude-code-guide agent to get comprehensive overview of agent teams feature
   - Documented key differences from subagents: independent sessions, inter-agent messaging, shared task lists, self-coordination
   - Identified communication patterns: direct messaging, broadcast, shared task list with dependency management, idle notifications
   - Mapped display modes: in-process (Shift+Down/Up cycling) vs split-pane (tmux/iTerm2)

2. **Identified genuine use cases for BrainMap**
   - Cross-layer feature implementation (core → CLI/MCP → Tauri commands → React frontend)
   - Upgrading mandatory review feedback loops (reviewers that cross-reference each other's findings)
   - Competing hypothesis debugging (teammates debate and disprove theories)
   - Multi-file refactoring with no-overlap file ownership

3. **Enabled agent teams for the project**
   - Added `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "1"` env var to `.claude/settings.json`
   - Added `teammateMode: "in-process"` to `~/.claude.json` (global config — not a settings.json field)

4. **Tested agent teams with split-pane mode (iTerm2)**
   - User ran a 2-teammate research task: Rust backend architecture + React frontend architecture
   - Teammates successfully coordinated: shared backend-frontend boundary findings via direct messages
   - Confirmed split-pane mode works with iTerm2

5. **Explored navigation between modes**
   - Discovered `--teammate-mode split|in-process` CLI flag for per-session override without config changes
   - User can switch freely between split panes and in-process without editing files

## Key Decisions and Patterns

- **`teammateMode` goes in `~/.claude.json`, NOT `.claude/settings.json`** — the settings.json schema rejects it as an unrecognized field
- **CLI flag override**: `claude --teammate-mode in-process` overrides the default for a single session — no config file changes needed
- **Best first test for teams**: pure research tasks (no file edits) with two teammates that must share findings — safe and demonstrates inter-agent communication
- **In-process navigation**: Shift+Down/Up to cycle teammates, Ctrl+T to toggle task list

## Files Changed

| File | Change |
|------|--------|
| `.claude/settings.json` | Added `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` env var |
| `~/.claude.json` | Added `teammateMode: "in-process"` |

## Current Test Status

No code changes — research/configuration session only.

## Remaining Known Items

- Agent teams are experimental — no session resumption with in-process teammates, one team per session, no nested teams
- User wants to continue testing in-process mode in a follow-up session
- Potential next step: try a team for the mandatory code review feedback loop (reviewers that cross-reference findings)
