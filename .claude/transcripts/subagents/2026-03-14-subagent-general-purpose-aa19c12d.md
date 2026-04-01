# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 12:04:03
**Agent:** general-purpose
**Agent ID:** aa19c12df92a7fca7
**Parent Session:** b0628a66-649e-4349-8f3f-68ebe391e247

---

## User

Research how IntelliJ IDEA and Obsidian handle multiple workspaces/vaults being open simultaneously. Do NOT write any code or edit any files - this is research only.

Search the web for:
1. **IntelliJ IDEA multi-project**: How does IntelliJ handle multiple projects? (separate windows vs single window with modules, project-level settings vs IDE-level settings, how keymaps/themes are global but run configs are per-project)
2. **Obsidian multi-vault**: How does Obsidian handle multiple vaults? (vault switcher, separate windows per vault, vault-scoped plugins/settings vs global appearance, .obsidian folder per vault)
3. **VS Code multi-workspace**: How does VS Code handle workspaces? (multi-root workspaces, workspace settings vs user settings, extension host per workspace)
4. **Common patterns and pitfalls**: State isolation, settings hierarchy (global → workspace → folder), how tabs/editors are scoped

Summarize the key patterns, trade-offs, and best practices for implementing multi-workspace support in a desktop app.

---

## Assistant



I'll research how these IDEs handle multiple workspaces/vaults simultaneously.

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"WebSearch","max_results":1}`

---

## Assistant



I'll research all four areas in parallel.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"IntelliJ IDEA multiple projects open simultaneously separate windows modules architecture"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Obsidian multiple vaults open simultaneously vault switcher separate windows settings isolation"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"VS Code multi-root workspace architecture settings hierarchy user vs workspace settings"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"desktop app multi-workspace state isolation patterns best practices"}`

---

## Assistant

Let me get more detail on the specific aspects that matter most.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"IntelliJ IDEA project settings vs IDE global settings .idea folder structure what is stored where"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Obsidian .obsidian folder structure vault-scoped plugins settings vs global appearance settings"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"VS Code extension host per workspace process isolation multi-root workspace"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Obsidian vault switcher implementation each vault separate Electron window process"}`

---

## Assistant

Now I have enough information to write a comprehensive research summary.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/.claude/plans/resilient-sleeping-rabin-agent-aa19c12df92a7fca7.md","content":"# Research: Multi-Workspace Patterns in Desktop Apps\n\n## 1. IntelliJ IDEA — Multi-Projec`

---

## Assistant

Here is the research summary:

---

## IntelliJ IDEA: One Project Per Window + Modules

IntelliJ uses a **window-per-project** model. Each open project gets its own OS window. To work with related codebases in a single window, you attach them as **modules** within one project (or use Gradle composite builds for separate repos).

**Settings split into two tiers:**
- **IDE-global** (stored in `~/Library/.../JetBrains/`): theme, keymaps, plugins, debugger settings, code completion. These are muscle-memory/personal-preference things.
- **Project-level** (stored in `<project>/.idea/` as XML files): SDK, code style, inspection profiles, run configurations, VCS mappings. Partially version-controlled — `workspace.xml` (window layout, recent files, cursor positions) is gitignored as personal state.

Key insight: some global settings (code style, inspections) can be **copied down** to project level for team sharing.

## Obsidian: One Vault Per Window, Fully Isolated

Obsidian uses the most aggressive isolation model. Each vault is a folder on disk, and each open vault gets its own **separate Electron window**. The vault switcher always opens a new window (no "replace in same window" option).

**There are NO global settings.** Everything lives in `<vault>/.obsidian/`:
- Plugins (installed binaries + config), themes, appearance, hotkeys, core plugin settings — all per-vault.
- This is the #1 complaint from multi-vault users. Workaround is manually copying/symlinking `.obsidian/` between vaults.

Content is fully isolated: internal links only resolve within a vault, each vault has its own graph and search index.

## VS Code: Multi-Root Workspace with Layered Settings

VS Code has the most sophisticated model. A single window can contain **multiple root folders** via a `.code-workspace` file. Settings use a four-tier hierarchy:

**Default < User < Workspace < Folder** (higher = more specific = wins)

Critical rule: in multi-root mode, only **resource-scoped** settings (those that apply to files/folders) are honored at the folder level. **Window-scoped** settings (theme, UI layout) can only be set at user or workspace level — this prevents conflicts like "folder A wants dark theme, folder B wants light."

One extension host process runs per window (not per folder). Language servers choose their own isolation strategy.

## Key Patterns and Recommendations

**Three architectural models exist:**
1. **Window-per-workspace** (IntelliJ, Obsidian) — simple isolation, window sprawl
2. **Multi-root single window** (VS Code) — powerful but complex settings resolution
3. **Switcher-based** (Slack, SaaS apps) — one active workspace at a time, fast switching

**Settings hierarchy best practice (consensus across all three):**
- **Global**: theme, fonts, keymaps, zoom (user-level preferences)
- **Workspace**: project-specific config (graph layout defaults, panel sizes)
- **Personal/local**: window layout, open tabs, cursor positions (never shared)

**State isolation checklist — isolate per workspace:** file tree, search index, graph, open tabs, undo/redo stack, link resolution. **Share globally:** theme, keymaps, fonts, zoom.

**Top pitfalls to avoid:**
1. No global settings layer (Obsidian's mistake — forces config duplication)
2. Leaking state between workspaces (undo stack, dirty flags, search results)
3. Memory bloat from keeping multiple workspaces loaded (lazy-load inactive ones)
4. File watcher conflicts if workspaces overlap in the filesystem
5. Tab identity confusion if same filename exists in multiple workspaces

The full research document with tables, per-app breakdowns, and a recommended architecture section for BrainMap is written to `/Users/bsmonteiro/.claude/plans/resilient-sleeping-rabin-agent-aa19c12df92a7fca7.md`.

---

