# 2026-03-27 — Subagent Transcript: claude-code-guide

**Date:** 2026-03-27 19:36:53
**Agent:** claude-code-guide
**Agent ID:** a4d077a9cb574c205
**Parent Session:** 8dcbdf05-36e4-4640-994d-0326294cacdc

---

## User

Does Computer Use work in Claude Code (the CLI tool)? Not Claude Desktop or Cowork, but specifically the `claude` CLI. Can I enable computer use from the terminal? Is there a flag like --computer-use or a setting to enable it? Check the docs thoroughly.

---

## Assistant

I'll check the Claude Code documentation thoroughly to answer your question about Computer Use support in the CLI tool.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/claude_code_docs_map.md","prompt":"Computer Use in Claude Code CLI - is it supported? Are there flags or settings to enable it?"}`

---

## Assistant

Let me fetch the desktop documentation which mentions Computer Use:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/desktop.md","prompt":"Computer Use - is it available in CLI? Can you enable it from the terminal?"}`

---

## Assistant

Let me get the specific section on Computer Use:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/8dcbdf05-36e4-4640-994d-0326294cacdc/tool-results/toolu_01N7rzjacb1og8CUEY3N6sc2.txt","offset":1,"limit":50`

---

## Assistant

Now let me check the CLI reference to see if there's any computer use support there:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/cli-reference.md","prompt":"Computer use in CLI - is it supported? Any flags?"}`

---

## Assistant

Based on my thorough review of the Claude Code documentation, here's the answer to your question:

**No, Computer Use does not work in Claude Code (the CLI tool).** Computer Use is **only available in Claude Desktop** (the graphical application), not the terminal CLI.

## Key findings:

1. **Desktop-only feature**: The documentation states:
   > "Computer use is a research preview on macOS that requires a Pro or Max plan. It is not available on Team or Enterprise plans. The Claude Desktop app must be running."

2. **No CLI flags**: There is no `--computer-use` flag or any equivalent in the CLI reference. The complete CLI flags list does not include computer use.

3. **What CLI can do instead**: The CLI has these related capabilities:
   - `--chrome`: Browser integration for web automation via Chrome (requires the Chrome extension)
   - Standard tools: Bash, file read/edit, web search, etc.

4. **Why it's Desktop-only**: Computer Use requires real-time screen capture, mouse/keyboard control, and macOS system permissions (Accessibility + Screen Recording). These aren't available in a terminal environment.

## Your options if you need screen/GUI automation from the CLI:

- **Use Claude Desktop** instead — it has full Computer Use support on macOS
- **Use Claude in Chrome** with `--chrome` flag for web-based tasks
- **Use bash scripts** for automation that can be executed from the terminal
- **Use Dispatch** (from the Cowork tab) which can spawn Desktop Code sessions that have Computer Use enabled

If you need to automate tasks that specifically require GUI interaction, Claude Desktop is your best option.

---

