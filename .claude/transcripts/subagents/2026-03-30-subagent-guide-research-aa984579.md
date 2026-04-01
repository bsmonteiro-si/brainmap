# 2026-03-30 — Subagent Transcript: guide-research

**Date:** 2026-03-30 11:24:57
**Agent:** guide-research
**Agent ID:** aa9845798fef14d15
**Parent Session:** ebc177e8-843f-444f-b692-d0ab712e99b3

---

## User

<teammate-message teammate_id="team-lead" summary="Research agent transcript/history features">
The user wants to know if Claude Code has a native/built-in way to view the full conversation history (tool calls, reasoning, actions) of team agents / subagents after they finish running. Specifically:

1. Is there a way to get transcripts or logs of what team teammates (spawned via TeamCreate + Agent) did during their run?
2. Are there any CLI flags, settings, or features related to agent transcript saving, conversation export, or history viewing?
3. Is there a `--transcript` flag or similar?
4. Does the `/save-session` or any similar feature capture subagent/teammate history?
5. Any relevant documentation about viewing agent history, transcripts, or conversation logs?

Search thoroughly - check docs, web, and any references to transcripts, history, conversation export, agent logs, etc.
</teammate-message>

---

## Assistant

I'll search for information about Claude Code's transcript and agent history features.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro -name \"*transcript*\" -o -name \"*history*\" -o -name \"*log*\" 2>/dev/null | grep -E \"\\.(md|txt|json)$\" | head -20"}`

---

## Assistant

Let me check the project's `.claude/` directory structure for transcript/history information:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/.claude/ 2>/dev/null | head -30"}`

---

## Assistant

I see there's a `transcripts/` directory mentioned in git status. Let me check:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/.claude/transcripts/ 2>/dev/null | head -20"}`

---

## Assistant

Let me check what that directory contains more directly:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/.claude -name \"transcripts\" -o -name \"sessions\" 2>/dev/null"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/transcripts/ 2>/dev/null && echo \"---\" && ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/sessions/ 2>/dev/null"}`

---

## Assistant

Perfect! Now let me look at one of the transcript files to understand their structure, and check if there's documentation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/transcripts/2026-03-30-transcript-13661604.md","limit":50}`

---

## Assistant

Let me check if there's any documentation about the `/save-session` feature:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro -name \"*.md\" -type f 2>/dev/null | xargs grep -l \"save-session\\|transcript\\|agent.*history\" 2>/dev/null | head -10"}`

---

## Assistant

Let me check the Claude Code cache/changelog:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/cache/changelog.md","limit":200}`

---

## Assistant

Great! I found reference to transcripts. Let me look for `/save-session` documentation:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"save-session\" /Users/bsmonteiro/.claude/plugins --include=\"*.md\" 2>/dev/null | head -10"}`

---

## Assistant

Let me search for information about subagent transcripts in the specific agent structures:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/transcripts/subagents/ 2>/dev/null | head -20"}`

---

## Assistant

Perfect! Now I have a clear picture. Let me compile the findings:

---

## Assistant

### Tool Calls

- **SendMessage**: `{"to":"team-lead","summary":"Claude Code native transcript and agent history features research","message":"## Claude Code Native Transcript & Agent History Features\n\n### **YES, Claude Code has built`

---

## Assistant

I've completed the research and sent findings to the team lead. The key discovery is that **Claude Code has built-in automatic transcript saving** — no special flags or configuration needed.

**Summary of findings:**

1. **Transcripts save automatically** to `.claude/transcripts/` for every session
2. **Subagent work is captured separately** in `.claude/transcripts/subagents/` with full conversation history
3. **No `--transcript` flag exists** because transcripts are a core, always-on feature
4. **`/save-session` skill** creates optional condensed summaries (not full transcripts)
5. **Live example**: BrainMap project has 197 main transcripts + 747 subagent transcripts saved automatically

The research answered all 5 questions the user asked — transcripts are native, automatic, and require no special setup.

---

