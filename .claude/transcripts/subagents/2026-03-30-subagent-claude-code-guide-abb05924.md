# 2026-03-30 — Subagent Transcript: claude-code-guide

**Date:** 2026-03-30 13:43:24
**Agent:** claude-code-guide
**Agent ID:** abb05924432ef4802
**Parent Session:** ef7ce461-6110-4d5e-bb73-b8dd8f64d38f

---

## User

I need to understand the current state of "agent teams" in Claude Code. Specifically:

1. What are agent teams? How do they work?
2. How do you define and configure them?
3. Can agents within a team communicate with each other (e.g., one agent gates another)?
4. Can a team enforce a workflow like "agent A must complete and approve before agent B can proceed"?
5. What's the current maturity level — is this stable, experimental, or upcoming?
6. Any examples of team configurations?

Search for documentation on agent teams, TeamCreate, team workflows, and any related features.

---

## Assistant

I'll search for documentation on agent teams in Claude Code and the Claude Agent SDK.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/claude_code_docs_map.md","prompt":"agent teams, team creation, team workflows, agent communication"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://platform.claude.com/llms.txt","prompt":"agent teams, team workflows, agent communication, multi-agent coordination"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code agent teams configuration workflow"}`

---

## Assistant

Great! I found the official documentation. Let me fetch the detailed agent teams documentation directly.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/agent-teams.md","prompt":"agent teams, team creation, communication, workflows, gating, approval, quality gates, hooks"}`

---

## Assistant

Perfect! Now I have comprehensive information about agent teams. Let me also check your settings to see that you have agent teams already enabled.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

Based on my research, here's a comprehensive overview of agent teams in Claude Code:

## What Are Agent Teams?

Agent teams coordinate **multiple independent Claude Code instances** working together on a shared task. Unlike subagents (which run within a single session and report back to the main agent), teammates:

- Run as **completely separate Claude Code sessions** with their own context windows
- **Communicate directly with each other** via a messaging system (not just through the lead)
- Share a **task list** where they self-coordinate work
- Can be interacted with directly without going through the lead

## How Agent Teams Work

**Architecture:**
- **Team lead**: your main Claude Code session that creates the team and coordinates work
- **Teammates**: separate Claude Code instances that work on assigned tasks
- **Task list**: shared work items stored at `~/.claude/tasks/{team-name}/`
- **Mailbox**: messaging system for inter-agent communication
- **Team config**: stored at `~/.claude/teams/{team-name}/config.json`

**Key mechanics:**
- Task dependencies are **managed automatically** — when a teammate completes a task, blocked tasks automatically unlock
- Teammates load the same project context as you: CLAUDE.md, MCP servers, skills
- Messages arrive at the lead automatically; teammates don't need polling
- File locking prevents race conditions when multiple teammates claim the same task

## Configuration & Setup

**Current Status:** Experimental and disabled by default. You already have it enabled in your settings:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

**Requirements:** Claude Code v2.1.32+. You can verify: `claude --version`

**Display Modes:**
- **In-process** (default): teammates run in your terminal; use Shift+Down to cycle through them
- **Split panes** (tmux/iTerm2): each teammate gets its own pane, visible simultaneously
- Configure via `~/.claude.json`:
  ```json
  {
    "teammateMode": "tmux"  // or "in-process"
  }
  ```

## Can Agents Gate Each Other? Quality Gates & Workflows

Yes, through **hook-based quality gates**:

1. **`TeammateIdle` hook**: runs when a teammate is about to go idle
   - Exit code 2 to send feedback and keep them working
   - Perfect for "don't stop until you've addressed this"

2. **`TaskCreated` hook**: runs when a task is being created
   - Exit code 2 to prevent creation and send feedback
   - Validate task definitions before allowing them

3. **`TaskCompleted` hook**: runs when a task is being marked complete
   - Exit code 2 to prevent completion and send feedback
   - **This is your enforcement point** — can block task completion until criteria are met

**Example gating workflow:**
```
Agent A completes security review task
↓
TaskCompleted hook runs (e.g., "validate review meets coverage requirements")
↓
Exit code 2 if validation fails
↓
Task marked incomplete; teammate gets feedback to fix it
↓
Only after re-submission passes does the task mark complete
↓
Dependent task unblocks for Agent B
```

## Can You Enforce "Agent A Must Complete Before B Proceeds"?

**Yes, via task dependencies:**

```
When you ask Claude to create a task, include dependency specifications:
"Create task X1 for reviewer A: security review
 Create task X2 for reviewer B: performance review, depends on X1"
```

- Teammates can't claim X2 until X1 is marked complete
- Task completion automatically unblocks dependent tasks
- The system prevents race conditions with file locking

**Approval gates work too:**
```
"Spawn an architect teammate to plan the refactor.
 Require plan approval before they make any changes."
```
Teammate works in read-only plan mode until the lead approves. The lead makes decisions autonomously based on criteria you provide ("only approve plans that include test coverage").

## Maturity Level

**Current Status:** **Experimental** (not production-ready). Known limitations:

- No session resumption with in-process teammates (can't `/resume` or `/rewind`)
- Task status can lag — teammates sometimes fail to mark tasks complete
- Shutdown can be slow (they finish current work first)
- One team per session (can't run multiple teams simultaneously)
- No nested teams (teammates can't spawn their own teams)
- Split-pane mode requires tmux or iTerm2 (not VS Code, Windows Terminal, Ghostty)
- Lead is fixed (can't promote teammate to lead)
- Permissions set at spawn time (can adjust individual teammates after, but not before)

## Team Creation & Control Examples

**Request a team explicitly:**
```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

**Claude proposes a team:**
Claude may suggest creating a team if it detects parallel work benefits you. You confirm before it proceeds.

**Control semantics (all natural language via lead):**
```
// Assign work
"Give the security task to Teammate-1"

// Require approval
"Require plan approval before they make changes"

// Talk to teammates directly
Shift+Down to cycle through (in-process mode)
Click into pane (split-pane mode)

// Shut down gracefully
"Ask the researcher teammate to shut down"

// Clean up team
"Clean up the team" (only lead can do this)
```

## Best Practices for Agent Teams

1. **Start with 3-5 teammates** — balances parallel work with coordination overhead
2. **Task sizing**: 5-6 tasks per teammate keeps productivity without excessive context-switching
3. **Avoid file conflicts**: each teammate should own different files
4. **Start with research/review first**: easier boundaries than parallel implementation
5. **Give enough context**: include task-specific details in spawn prompt (teammates don't inherit lead's conversation history)
6. **Monitor and steer**: check progress frequently; don't let teams run unattended
7. **Wait for teammates**: prevent the lead from starting its own work before teammates finish
8. **Pre-approve permissions**: reduce interruptions by allowing common operations in advance

## Token Costs

**Significant:** agent teams use far more tokens than single sessions because each teammate is a separate Claude instance with its own context window. Token usage scales linearly with team size. Worthwhile for research/review/new features, but routine tasks are more cost-effective in a single session.

---

## In Your Project

I notice you already have `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled in your settings.json. This means you could start using agent teams right now for tasks like:

- **Parallel code reviews** (security, performance, test coverage reviewers)
- **Multi-angle investigation** (e.g., different hypotheses for debugging)
- **Feature development** (each teammate owns a module)
- **Cross-layer changes** (frontend, backend, test teammates working in parallel)

You can control teams entirely via natural language through the lead — no special configuration files or deployment needed beyond what you've already set up.

---

Sources:
- [Agent Teams Documentation](https://code.claude.com/docs/en/agent-teams.md)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide.md)
- [Best Practices](https://code.claude.com/docs/en/best-practices.md)
- [Claude Code Agent Teams: Setup & Usage Guide 2026](https://claudefa.st/blog/guide/agents/agent-teams)

---

