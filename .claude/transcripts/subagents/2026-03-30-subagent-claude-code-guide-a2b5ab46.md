# 2026-03-30 — Subagent Transcript: claude-code-guide

**Date:** 2026-03-30 10:34:20
**Agent:** claude-code-guide
**Agent ID:** a2b5ab46c5e06049c
**Parent Session:** 6fab24a0-cfe4-4922-8801-fb7b6fb9a44a

---

## User

I need a comprehensive overview of Claude Code's "agent teams" feature. Cover:
1. What agent teams are and how they differ from regular subagents
2. How to define and configure teams
3. Communication patterns between team members (SendMessage, etc.)
4. Isolation modes (worktrees, etc.)
5. Use cases and best practices
6. Any limitations or gotchas
7. How teams are created, managed, and coordinated

Be thorough — I want the full picture of current capabilities.

---

## Assistant

I'll fetch the Claude Code documentation to give you a comprehensive overview of agent teams.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/claude_code_docs_map.md","prompt":"Find documentation about agent teams, subagents, team configuration, communication patterns, and isolation modes"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code agent teams feature documentation 2026"}`

---

## Assistant

Now let me fetch the official agent teams documentation directly:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/agent-teams.md","prompt":"Extract comprehensive information about agent teams, including configuration, communication patterns, isolation modes, use cases, limi`

---

## Assistant

Perfect! I now have the complete official documentation. Let me provide you with a comprehensive overview of Claude Code's agent teams feature.

---

# Comprehensive Overview of Claude Code Agent Teams

## 1. What Agent Teams Are & How They Differ from Subagents

**Agent Teams** are a coordinated group of independent Claude Code sessions that work in parallel, managed by a single **team lead** session. Each teammate runs as a separate instance with its own context window, and they can communicate directly with each other.

### Key Differences from Subagents

| Aspect | Subagents | Agent Teams |
|--------|-----------|------------|
| **Execution** | Run within the main session's context | Each teammate is a fully independent session |
| **Communication** | Only report results back to main agent | Teammates message each other directly |
| **Coordination** | Main agent manages all work explicitly | Shared task list enables self-coordination |
| **Use Cases** | Quick, focused tasks returning results | Complex work requiring peer discussion and collaboration |
| **Token Cost** | Lower (results summarized back) | Higher (each teammate is a full Claude instance) |

**In short**: Use subagents for isolated, focused work. Use agent teams when teammates need to share findings, debate ideas, and coordinate independently.

---

## 2. How to Define and Configure Teams

### Enable Agent Teams (Required)

Agent teams are **experimental and disabled by default**. Enable via settings.json:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Or via environment variable in your shell.

### Start Your First Team

Simply ask Claude in natural language. Claude handles all team creation and spawning:

```
I'm designing a CLI tool that helps developers track TODO comments across
their codebase. Create an agent team to explore this from different angles: one
teammate on UX, one on technical architecture, one playing devil's advocate.
```

Claude automatically:
- Creates the team
- Spawns teammates with appropriate roles
- Builds a shared task list
- Coordinates work based on your prompt

### Specify Team Composition

You can control team size and model selection explicitly:

```
Create a team with 4 teammates to refactor these modules in parallel.
Use Sonnet for each teammate.
```

Or let Claude decide based on task complexity — it evaluates whether parallel work adds real value before spawning.

---

## 3. Communication Patterns Between Team Members

### Architecture Components

| Component | Purpose |
|-----------|---------|
| **Team Lead** | Main session that creates team, spawns teammates, coordinates work |
| **Teammates** | Separate Claude Code instances assigned tasks |
| **Task List** | Shared work items stored in `~/.claude/tasks/{team-name}/` |
| **Mailbox** | Messaging system for inter-agent communication |

### How Teammates Communicate

**Direct Messaging:**
- `message`: Send to one specific teammate
- `broadcast`: Send to all teammates (use sparingly—costs scale with team size)
- Messages are delivered automatically; the lead doesn't need to poll

**Shared Task List:**
- All agents see task status and claim available work
- Tasks have three states: pending, in-progress, completed
- Tasks can have dependencies; blocked tasks unblock automatically
- Task claiming uses file locking to prevent race conditions

**Idle Notifications:**
- When a teammate finishes and goes idle, they automatically notify the lead

### Talking to Teammates Directly

You can message any teammate without going through the lead:

**In-process mode** (default):
- Press Shift+Down to cycle through teammates
- Type to send messages directly
- Press Ctrl+T to toggle task list visibility

**Split-pane mode** (tmux/iTerm2):
- Click into a teammate's pane to interact directly
- Each teammate has their own full terminal view

---

## 4. Isolation Modes (Worktrees, Split-Panes, In-Process)

### Display Modes

Agent teams support two isolation/display approaches:

#### 1. **In-Process Mode** (Default)
- All teammates run inside your main terminal
- Use Shift+Down to cycle through teammates
- Works in any terminal (no extra setup)
- `"auto"` default uses this if not in tmux

#### 2. **Split-Pane Mode** (Requires tmux or iTerm2)
- Each teammate gets its own terminal pane
- See everyone's output simultaneously
- Click into any pane to interact directly
- Requires:
  - **tmux**: install via package manager
  - **iTerm2**: install `it2` CLI + enable Python API in preferences

### Configuration

Set display mode in `~/.claude.json` (global):
```json
{
  "teammateMode": "in-process"
}
```

Or per-session via CLI flag:
```bash
claude --teammate-mode in-process
```

### Worktree Isolation (Related)

While not unique to agent teams, Git worktrees provide manual parallel session isolation. Each teammate can work on different worktrees to avoid file conflicts. See [common-workflows: Worktrees](https://code.claude.com/docs/en/common-workflows.md#run-parallel-claude-code-sessions-with-git-worktrees).

---

## 5. Use Cases and Best Practices

### Strongest Use Cases

**1. Research and Review**
- Multiple teammates investigate different aspects in parallel
- Share and challenge findings
- Example: Parallel code review with security, performance, and test-coverage reviewers

```
Create an agent team to review PR #142. Spawn three reviewers:
- One focused on security implications
- One checking performance impact
- One validating test coverage
Have them each review and report findings.
```

**2. New Modules or Features**
- Each teammate owns a separate piece
- No stepping on each other's code
- Great for cross-layer coordination (frontend, backend, tests)

**3. Debugging with Competing Hypotheses**
- Teammates test different theories in parallel
- More likely to find root cause faster than sequential investigation
- Teammates debate and challenge each other's theories

```
Users report the app exits after one message instead of staying connected.
Spawn 5 agent teammates to investigate different hypotheses. Have them talk to
each other to try to disprove each other's theories, like a scientific debate.
```

**4. Cross-Layer Coordination**
- Changes spanning frontend, backend, and tests
- Each owned by different teammate

### When NOT to Use Agent Teams

- **Sequential work**: single session is more efficient
- **Same-file edits**: coordination overhead and conflict risk
- **Routine tasks**: not worth the token cost
- **High interdependencies**: teammates spend time waiting instead of working

### Best Practices

#### 1. **Give Teammates Enough Context**
Teammates load CLAUDE.md, MCP servers, and skills automatically, but NOT the lead's conversation history:

```
Spawn a security reviewer teammate with the prompt: "Review the authentication 
module at src/auth/ for security vulnerabilities. Focus on token handling, 
session management, and input validation. The app uses JWT tokens stored in 
httpOnly cookies. Report any issues with severity ratings."
```

#### 2. **Choose Appropriate Team Size**
- Start with **3-5 teammates** for most workflows
- Have **5-6 tasks per teammate** to keep productivity high
- Token costs scale linearly with team size
- Coordination overhead increases beyond team size ~6

#### 3. **Size Tasks Appropriately**
- **Too small**: coordination overhead > benefit
- **Too large**: teammates work isolated too long, risk wasted effort
- **Just right**: self-contained units (a function, test file, review layer)

#### 4. **Wait for Teammates to Finish**
The lead may start implementing itself. Keep it focused:
```
Wait for your teammates to complete their tasks before proceeding
```

#### 5. **Start with Research and Review**
If new to agent teams, begin with clear-boundary tasks (PR review, library research, bug investigation) before parallel implementation.

#### 6. **Avoid File Conflicts**
Two teammates editing the same file → data loss. Break work so each teammate owns different files.

#### 7. **Monitor and Steer**
- Check in on progress regularly
- Redirect failing approaches
- Synthesize findings as they arrive
- Don't let teams run unattended too long

#### 8. **Pre-Approve Common Permissions**
Reduce permission prompts by pre-approving common operations in `settings.json` before spawning teammates.

---

## 6. Limitations and Gotchas

Agent teams are **experimental**. Key limitations:

### Resumption
- **No session resumption with in-process teammates**: `/resume` and `/rewind` don't restore in-process teammates. The lead may try messaging non-existent teammates. Spawn new ones if this happens.

### Task Coordination
- **Task status lag**: teammates sometimes fail to mark tasks complete, blocking dependent tasks. Manually update if stuck or nudge the teammate.

### Shutdown Behavior
- **Slow shutdown**: teammates finish their current request/tool call before exiting (can take time)
- **One team per session**: a lead can only manage one team at a time
- **No nested teams**: teammates cannot spawn their own teams
- **Lead is fixed**: the session creating the team is permanent lead; can't promote teammates or transfer leadership

### Permissions
- **All teammates start with lead's permission mode**. You can change individual teammate modes after spawning, but not at spawn time.

### Environment
- **Split panes**: not supported in VS Code integrated terminal, Windows Terminal, or Ghostty. Only in-process mode works there.
- **Display mode requirements**:
  - tmux/iTerm2 needed for split-pane mode
  - In-process works anywhere

### Orphaned Sessions
If tmux persists after team ends:
```bash
tmux ls
tmux kill-session -t <session-name>
```

---

## 7. How Teams Are Created, Managed, and Coordinated

### Team Creation Flow

1. **You request** (explicitly or implicitly via task complexity)
2. **Claude proposes** team structure and teammate roles
3. **You approve** (stays in your control)
4. **Claude spawns** teammates in isolated sessions
5. **Teammates load** project context (CLAUDE.md, MCP servers, skills)
6. **Shared task list** is created at `~/.claude/teams/{team-name}/config.json`

### Team Storage

```
~/.claude/teams/{team-name}/config.json     # Team config (members, roles)
~/.claude/tasks/{team-name}/                # Task list files
```

Team config includes:
- `members` array with each teammate's name, agent ID, and type
- Teammates can read this to discover other members

### Task Management

**The Lead Creates and Assigns:**
```
Ask the lead to assign this refactoring to the architecture teammate
```

**Or Teammates Self-Claim:**
After finishing one task, teammates pick up the next unassigned, unblocked task automatically.

**Task States:**
- Pending
- In Progress
- Completed

**Task Dependencies:**
- Specify dependencies when creating tasks
- Blocked tasks automatically unblock when dependencies complete
- Uses file locking to prevent race conditions

### Team Control Commands

```
// Specify composition
Create a team with 4 teammates. Use Sonnet for each.

// Require plan approval (for risky work)
Spawn an architect teammate to refactor authentication.
Require plan approval before they make any changes.

// Talk to a teammate directly
Message the security reviewer teammate with: "Focus on JWT token handling"

// Assign work
Assign the database schema refactor to the backend teammate

// Shut down gracefully
Ask the researcher teammate to shut down

// Clean up (ALWAYS use lead for this)
Clean up the team
```

### Enforce Quality Gates with Hooks

Use [hooks](https://code.claude.com/docs/en/hooks.md) to enforce rules:

- `TeammateIdle`: runs when teammate about to go idle. Exit code 2 to send feedback and keep working.
- `TaskCreated`: prevent task creation with code 2 if criteria not met.
- `TaskCompleted`: prevent marking complete with code 2 if quality gate fails.

Example hook configuration in `settings.json`:
```json
{
  "hooks": {
    "TeammateIdle": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "./check-quality.sh"
          }
        ]
      }
    ]
  }
}
```

### Token Usage and Costs

- **Each teammate = separate Claude instance** consuming its own context
- **Token cost scales linearly** with number of teammates
- **Trade-off**: more tokens vs. faster parallel completion
- For research, review, and new features: extra tokens usually worthwhile
- For routine tasks: single session more cost-effective

See [costs documentation](https://code.claude.com/docs/en/costs.md#agent-team-token-costs) for specific usage guidance.

---

## Summary Table

| Feature | Capability |
|---------|------------|
| **Parallel Workers** | 3-5+ independent Claude sessions, 5-6 tasks each |
| **Communication** | Direct messaging, shared task list, auto-idle notifications |
| **Isolation** | Split panes (tmux/iTerm2) or in-process (any terminal) |
| **Context** | Each teammate loads CLAUDE.md, MCP servers, skills separately |
| **Coordination** | Shared task list with auto-dependency management, file-lock claim safety |
| **Best For** | Research, parallel reviews, competing hypotheses, cross-layer features |
| **Token Cost** | High (linear scaling with team size) |
| **Status** | Experimental; requires v2.1.32+; disabled by default |
| **Limitations** | No resume, one team/session, no nesting, fixed lead, permission mode global |

---

## Next Steps

- **Start lightweight**: Use subagents for quick, focused work first
- **Try agent teams** for research, review, or competing hypothesis investigation
- **Manual parallel sessions**: Git worktrees for manual multi-session coordination
- **Hook automation**: Enforce quality gates and approval workflows via hooks

Sources:
- [Orchestrate teams of Claude Code sessions - Claude Code Docs](https://code.claude.com/docs/en/agent-teams.md)
- [Claude Code Documentation Map](https://code.claude.com/docs/en/claude_code_docs_map.md)

---

