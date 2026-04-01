# 2026-03-27 — Subagent Transcript: claude-code-guide

**Date:** 2026-03-27 19:36:13
**Agent:** claude-code-guide
**Agent ID:** a42c36f9d9b8aa3b8
**Parent Session:** 8dcbdf05-36e4-4640-994d-0326294cacdc

---

## User

How do I enable and use Computer Use in Claude Code? What are the setup steps, requirements, and configuration needed? How do I activate it for testing desktop apps? What commands or settings are involved?

---

## Assistant

I'll fetch the Claude Code documentation to find comprehensive information about Computer Use setup and configuration.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/claude_code_docs_map.md","prompt":"Find documentation about Computer Use in Claude Code"}`

---

## Assistant

Now let me fetch the specific documentation on Computer Use in Claude Code:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/desktop.md","prompt":"Find the Computer Use section - enable computer use, requirements, app permissions, and testing desktop apps"}`

---

## Assistant

The output is too large. Let me read the saved file to get the specific Computer Use section:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/8dcbdf05-36e4-4640-994d-0326294cacdc/tool-results/toolu_01NUjmVYkGx2ubw2QAy75Kc2.txt","limit":200}`

---

## Assistant

Perfect! Now let me search for more details about computer use requirements and browser tool setup:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/chrome.md","prompt":"Find prerequisites and getting started for Chrome/browser integration in Claude Code"}`

---

## Assistant

Excellent! Now I have comprehensive information about Computer Use in Claude Code. Let me provide a detailed answer:

## Computer Use in Claude Code: Complete Setup Guide

**Computer Use** is a macOS-only research preview feature that lets Claude control your screen, click apps, type, and interact with native applications directly. It's useful for testing desktop apps, iOS simulators, GUIs without CLIs, and automating workflows through graphical interfaces.

### Requirements

- **macOS only** (not available on Windows or Linux)
- **Pro or Max plan** (not available on Team or Enterprise plans)
- Claude Desktop app must be running
- Two macOS system permissions required

### Step 1: Enable Computer Use

1. Open Claude Desktop
2. Go to **Settings → Desktop app → General**
3. Toggle **Computer use** on
4. You'll be prompted to grant two macOS permissions

### Step 2: Grant System Permissions

Computer use requires two macOS permissions (the Settings page shows the current status):

1. **Accessibility**: Allows Claude to click, type, and scroll
   - Click the badge in Settings if denied → System Settings opens automatically
2. **Screen Recording**: Allows Claude to see what's on your screen
   - Click the badge in Settings if denied → System Settings opens automatically

Both must be granted before Computer Use becomes active.

### Step 3: Use Computer Use

Once enabled and permissions are granted, simply ask Claude to do something that requires it:

```text
Test the iOS simulator app by launching it and opening the login screen
```

Claude will handle the rest. The first time it uses an app, you'll see a prompt asking for permission for that specific app.

### App-Level Permissions

When Claude first needs to use an app, a session prompt appears. You can:
- **Allow for this session**: approval lasts 30 minutes (or session duration)
- **Deny**: prevent access to that app

Access tiers are fixed by app category:

| Tier         | Capabilities                                          | Apps                    |
|--------------|-------------------------------------------------------|-------------------------|
| View only    | See the app in screenshots only                       | Browsers, trading apps  |
| Click only   | Click, scroll, but no typing or keyboard shortcuts   | Terminals, IDEs         |
| Full control | Click, type, drag, keyboard shortcuts                | Everything else         |

### Configuration Options

In **Settings → Desktop app → General**:

- **Denied apps**: Pre-block apps without prompting (though Claude may affect them indirectly)
- **Unhide apps when Claude finishes**: Auto-restore hidden windows after Claude finishes (default: on)

### When Computer Use Is Used

Claude automatically tries the most precise tool first:

1. **Connectors** (GitHub, Slack, etc.) if available
2. **Bash** for shell commands
3. **Chrome extension** for browser work (if set up)
4. **Computer use** only for things nothing else can handle (native apps, iOS simulator, hardware panels, proprietary tools)

### Testing Desktop Apps

For Tauri, Flutter, or other native apps, you can ask Claude:

```text
Launch the app and test the login flow by entering these credentials...
Then verify the dashboard loads correctly
```

Claude will:
- Open the app
- Interact through the GUI
- Take screenshots to verify behavior
- Make adjustments if needed

### Safety Notes

Unlike the sandboxed Bash tool, computer use runs on your real desktop with access to whatever you approve. Claude checks each action for potential prompt injection from on-screen content, but your trust boundary is broader. See the [computer use safety guide](https://support.claude.com/en/articles/14128542) for best practices.

### Browser Alternative: Claude in Chrome

For web app testing, **Claude in Chrome** is a faster, more precise alternative:

1. Install [Claude in Chrome extension](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)
2. Run `claude --chrome` or `/chrome` in a session
3. Claude controls your browser without needing Accessibility/Screen Recording permissions

This is preferred for browser work since it's more targeted and doesn't require system permissions.

---

**Key Resources:**
- [Desktop docs - Computer Use section](https://code.claude.com/docs/en/desktop.md)
- [Computer Use safety guide](https://support.claude.com/en/articles/14128542)
- [Chrome browser integration](https://code.claude.com/docs/en/chrome.md) (faster for web apps)

For your BrainMap desktop app testing, Computer Use would let Claude test the Tauri app directly through the GUI, while Chrome would handle testing the embedded web components in your app.

---

