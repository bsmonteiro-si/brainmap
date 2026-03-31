---
name: debug-team
description: Spawn a competing-hypothesis debug team for complex cross-cutting bugs. Use when a single-agent /bugfix session has already failed or the bug clearly spans multiple systems (e.g., React Flow + state + CSS interacting).
argument: Description of the bug, what has already been tried, and which systems are suspected
---

# Debug Team Skill

You are launching a multi-agent debugging team for a complex bug. This is the heavy artillery — use it when single-agent debugging has failed or the bug clearly involves multiple interacting systems.

## Step 0: Triage — Is a Team Actually Needed?

Before creating a team, honestly assess whether the overhead is justified. A debug team has real costs: team creation, task assignment, mailbox routing, shutdown protocol, and context duplication. Ask yourself:

1. **Will investigators need to message each other mid-investigation?** If the axes are independent and investigators just report back to you, parallel subagents achieve the same result faster.
2. **Will investigators need to implement fixes in different files?** If the fix is likely a single-file change, you don't need coordinated implementation.
3. **Does the bug span 3+ truly independent systems that need coordinated fixes?** If it's contained to one layer (e.g., purely frontend DOM/events), subagents suffice.

If the answer to all three is **no**, tell the user: "This bug doesn't need team overhead — two parallel subagents investigating [axis A] and [axis B] will get the same result faster. Want me to do that instead?" Only proceed with the full team if at least one answer is **yes**, or if the user explicitly wants the team anyway.

## Step 1: Identify Investigation Axes

Based on the bug description and what has already been tried, identify 2-3 independent investigation axes. Common splits for BrainMap:

- **State management** (Zustand stores, React Flow internal state, refs)
- **Rendering / lifecycle** (React component lifecycle, useEffect timing, mount/unmount)
- **Underlying library** (@xyflow/react internals, CodeMirror 6, Cytoscape.js)
- **CSS / styling** (specificity, computed styles, counter-zoom interactions)
- **Platform constraints** (Tauri WebView restrictions, coordinate transforms, IPC timing)
- **Data flow** (translation layer, serialization, file watcher events)

## Step 2: Spawn the Team

Create a team with one investigator per axis. Each teammate gets:

- A clear scope: "Investigate whether the bug is caused by [axis]"
- The bug description and what has already been tried
- Read-only investigation only — no source file edits allowed
- Instructions to check the relevant Platform Gotchas section
- Instructions to add `log.debug` statements and read logs to gather evidence
- A deliverable: "Report your findings as: hypothesis, evidence for, evidence against, confidence level (high/medium/low)"

Each investigator must receive the full content of their agent definition file (which includes a "When Investigating" section specific to debug teams).

| Investigation Axis | Agent Definition | When to use |
|-------------------|-----------------|-------------|
| Data and state (Rust) | `.claude/agents/rust-core.md` | Bug may originate from parsing, graph ops, or locking |
| IPC and bridging | `.claude/agents/tauri-backend.md` | Bug may be DTO conversion, command handling, or file watcher |
| Rendering, state, and styling | `.claude/agents/frontend.md` | Bug may be React lifecycle, store state, or CSS |
| End-to-end reproduction | `.claude/agents/e2e-qa.md` | Bug needs a minimal repro or visual documentation |

Example team spawn:

```
Create a debug team with 2 investigators for [bug]:

Teammate "frontend-investigator" (read .claude/agents/frontend.md for full context):
Investigate whether [bug] is caused by React rendering or Zustand state issues.
Follow the "When Investigating" section. Report: hypothesis, evidence for/against,
confidence level.

Teammate "tauri-investigator" (read .claude/agents/tauri-backend.md for full context):
Investigate whether [bug] is caused by IPC, DTO conversion, or event handling.
Follow the "When Investigating" section. Report: hypothesis, evidence for/against,
confidence level.
```

## Step 3: Evaluate and Converge

Once all investigators report back:

1. Compare findings — look for corroboration or contradiction between hypotheses
2. If investigators found evidence that points to the same root cause from different angles, that's high confidence
3. If findings conflict, identify what specific check would resolve the disagreement
4. Present the converged diagnosis to the user with the combined evidence

## Step 4: Fix (Single Agent)

After the user confirms the diagnosis, implement the fix yourself (the lead). Do not delegate the fix to a teammate — at this point you have the full picture and can make a targeted change.

1. Implement the fix based on the confirmed diagnosis
2. Remove all temporary debug logging from all investigators
3. Run relevant tests
4. If the fix doesn't work, do NOT re-run the team immediately — first check if the investigators missed something by adding more targeted logging at the specific failure point

## Rules

- **Unbiased Handoff**: When spawning investigators, pass facts only — bug symptoms, reproduction steps, relevant file paths, what was tried and what happened. Do NOT pass your hypothesis or suspected root cause. Let each investigator form their own conclusions from the evidence.
- Teammates investigate only — they never edit source files (beyond debug logging)
- Each teammate must check the relevant Platform Gotchas before reporting
- The lead makes the final fix, not a teammate
- Cap at 3 investigators — more than that creates coordination overhead without proportional insight
- Always clean up debug logging after the fix is confirmed
