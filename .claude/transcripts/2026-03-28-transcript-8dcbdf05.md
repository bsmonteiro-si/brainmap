# 2026-03-28 — Claude Code Session

**Date:** 2026-03-28 14:44:23
**Session:** 8dcbdf05-36e4-4640-994d-0326294cacdc

---

## User

When we think about a proper feedback loop for you, how can we optimize it for desktop apps? Is there a way to mimic a Claude Code agent to run the app and interact with it?

---

## Assistant

Great question. There are a few practical approaches for your Tauri app specifically:

## 1. Claude in Chrome + Vite Dev Server (You already have this)

Your React frontend runs on `localhost:1420` via Vite. I can use the Chrome MCP tools to:
- Navigate to the dev server
- Click elements, fill forms, interact with the UI
- Read page content and console output
- Take screenshots / record GIFs of interactions
- Run JS in the page context to inspect state (Zustand stores, DOM)

This covers the **frontend** feedback loop well. The gap is that Tauri commands (`invoke`) won't work in a plain browser — only the WebView has the IPC bridge.

## 2. Mock Bridge for Browser Testing

You already have the `MockBridge` pattern (API Bridge → TauriBridge or MockBridge). If the dev server falls back to MockBridge when `window.__TAURI__` is absent, I can test the full UI flow in Chrome against mock data. This is probably the highest-leverage thing you could do — it means I can visually verify UI changes without needing the actual Tauri shell.

## 3. Playwright/WebDriver for Automated E2E

For a more robust loop, you could add **Playwright** tests that:
- Launch against `localhost:1420` with MockBridge
- Or use Tauri's [WebDriver support](https://v2.tauri.app/develop/tests/webdriver/) to test the real app

I can run these via Bash and interpret failures. This is better for regression testing than manual Chrome interaction.

## 4. Tauri CLI for Backend Feedback

For the Rust/backend side, the existing `cargo test` + `cargo build` loop already works well. I can also run the CLI (`crates/cli`) to verify backend behavior directly.

## What I'd Recommend

The **cheapest win** is ensuring MockBridge works in the browser so I can use Chrome tools against the dev server. The flow would be:

1. I make code changes
2. Run `npm run dev` in background  
3. Use Chrome MCP to navigate to `localhost:1420`, interact with the UI, verify visually
4. Read console logs via the Chrome tool
5. Run vitest for unit coverage

Want me to check whether your current MockBridge setup already works when opening the dev server in a regular browser, or do you want to explore one of the other approaches?

---

## User

Chrome tool is very unreliable and slow. Are there more practical alternatives? Unit tests miss component interactions, visuals and a lot of nuanced behaviors I have to catch manually

---

## Assistant



You're right — Chrome MCP is clunky for tight feedback loops, and unit tests can't catch visual/interaction issues. Here are more practical alternatives:

## 1. Playwright Component Tests

Playwright can mount individual React components in a real browser and interact with them — clicks, drags, resizes, keyboard shortcuts. Unlike unit tests, you get real rendering, real CSS, real mouse events. You'd write tests like:

```ts
test('canvas node resize works', async ({ mount }) => {
  const component = await mount(<CanvasEditor file={mockCanvas} />);
  const node = component.locator('.canvas-node').first();
  await node.hover({ position: { x: 0, y: 50 } }); // edge
  await page.mouse.down();
  await page.mouse.move(200, 50);
  await page.mouse.up();
  await expect(node).toHaveCSS('width', '250px');
});
```

I can run these via Bash and get pass/fail + screenshots on failure. Catches layout, interaction, and visual regressions that vitest misses.

## 2. Playwright E2E Against Dev Server

Full app tests against `localhost:1420` with MockBridge. Tests navigate, click through file trees, open editors, drag canvas nodes — the real app in a real browser, automated. Screenshot comparison catches visual regressions.

## 3. Screenshot Diffing (Cheapest Visual Check)

A script that:
1. Launches the dev server
2. Takes screenshots of key views via Playwright
3. I read the screenshots with the Read tool (I can see images)

No Chrome MCP needed. I take an action, run the screenshot script, look at the result. Fast, reliable loop.

## 4. Tauri's Built-in WebDriver (cargo-tauri)

Tauri v2 supports WebDriver via `tauri-driver`. This tests the **actual app** including Tauri IPC — not just the browser version. Heavier to set up, but it's the only option that covers the full stack including `invoke`.

## My Recommendation

**Playwright E2E against dev server + MockBridge** gives you the best coverage-to-effort ratio. I can:
- Run real browser interactions programmatically
- Capture screenshots on failure (and read them)
- Test component interactions, drag/drop, keyboard shortcuts, visual layout
- Execute it all via Bash — no flaky Chrome MCP

The key prerequisite is making sure MockBridge works in a regular browser. Want me to check that and then set up a basic Playwright E2E harness?

---

## User

Is Claude Code currently able to accept a video as an inout and work with it?

---

## Assistant

No, Claude Code can read **images** (PNG, JPG, etc.) but not video files. I can view a screenshot or a series of screenshots, but not an MP4 or screen recording.

For practical workarounds:

- **Screenshots**: I can read those directly. A script that captures key frames works well.
- **GIFs**: The Chrome MCP tool can record GIFs, but you said it's unreliable.
- **Playwright traces**: Playwright can generate traces with screenshots at each step + a timeline. I can read the screenshots from the trace.

So the realistic feedback loop for visual/interaction verification is **automated screenshots at key moments** — which is exactly what Playwright gives you on test runs and on failures.

---

## User

Search this properly in the web and through claude-code-guide

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Research Claude Code video input","subagent_type":"claude-code-guide","prompt":"Can Claude Code accept video files as input? Can it process video recordings, screen recordings, or any `

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"web search","max_results":1}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code video input support 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code desktop app testing feedback loop automation 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code \"computer use\" desktop app testing GUI interaction 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"site:github.com msadig claude-code-video-input skill"}`

---

## Assistant

Here's what I found:

## Can Claude Code accept video input?

**Not natively**, but there are two real solutions:

### 1. Computer Use (Best for your use case)

This is the big one. As of March 2026, Claude Code has **Computer Use** — a research preview on macOS (Pro/Max plan required). It works through a perception-action loop:

1. Claude takes a **screenshot** of your desktop/window
2. Analyzes it with vision
3. Decides and executes the next action (click, type, scroll, etc.)

This means Claude Code can **launch your Tauri app, interact with it, and visually verify the result** — no Chrome MCP needed. It can do exploratory testing without pre-defined selectors and adapts when UI changes. This is exactly the desktop app feedback loop you're looking for.

### 2. Video Input Skill (Community)

There's a [community skill by msadig](https://gist.github.com/msadig/b109ff286929b79c14a8480e9b848651) that extracts frames + audio transcription from video files using ffmpeg + Whisper. You install it to `~/.claude/skills/video-input/` and it lets Claude analyze screen recordings by converting them to frames. Useful but more of a workaround than a native solution.

### 3. There's also an open feature request

[anthropics/claude-code#12676](https://github.com/anthropics/claude-code/issues/12676) tracks native video input support — not shipped yet.

## Recommendation for BrainMap

**Computer Use** is the most practical path for your feedback loop:
- Build/launch the Tauri app
- Claude interacts with it directly (clicks file tree, opens canvas, resizes nodes, etc.)
- Claude sees the result via screenshots and iterates

This gives you the visual + interaction coverage that unit tests miss, without the Chrome MCP flakiness.

Want me to look into how to set up Computer Use for your dev workflow?

Sources:
- [Computer Use in Claude Code](https://www.mindstudio.ai/blog/what-is-claude-code-computer-use)
- [Claude Code March 2026 Features](https://help.apiyi.com/en/claude-code-2026-new-features-loop-computer-use-remote-control-guide-en.html)
- [Video Input Skill](https://gist.github.com/msadig/b109ff286929b79c14a8480e9b848651)
- [Feature Request: Video Input](https://github.com/anthropics/claude-code/issues/12676)
- [Claude Code Desktop](https://code.claude.com/docs/en/desktop)
- [Automating E2E UI Testing with Computer Use](https://medium.com/@itsmo93/automating-e2e-ui-testing-with-claudes-computer-use-feature-c9f516bbbb66)

---

## User

Help me set it up, please.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code computer use setup guide macOS how to enable 2026"}`

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Research Computer Use setup","subagent_type":"claude-code-guide","prompt":"How do I enable and use Computer Use in Claude Code? What are the setup steps, requirements, and configuratio`

---

## Assistant

Here's how to set it up:

## Computer Use Setup

### Requirements
- **macOS** (only platform supported)
- **Claude Pro or Max plan**
- **Claude Desktop app** installed and running

### Step 1: Enable in Claude Desktop

1. Open **Claude Desktop** (the app, not CLI)
2. Go to **Settings → Desktop app → General**
3. Toggle **Computer use** on

### Step 2: Grant macOS Permissions

You'll be prompted for two permissions:

1. **Accessibility** (System Settings → Privacy & Security → Accessibility)
   — lets Claude click, type, scroll
2. **Screen Recording** (System Settings → Privacy & Security → Screen Recording)
   — lets Claude see your screen

Both must be enabled. Restart the app after granting them.

### Step 3: Use It

Computer Use works through **Claude Desktop / Cowork**, not Claude Code CLI. When you ask Claude to interact with a GUI app, it automatically falls back to Computer Use when no better tool (connector, bash, chrome) can handle it.

For your workflow, you'd ask something like:

> "Launch the BrainMap app, open a canvas file, add a text card, resize it, and verify the layout looks correct"

Claude will take screenshots, click, type, scroll — and iterate visually.

### App Permission Tiers

First time Claude accesses an app, you'll get a prompt. Access levels are fixed by category:

| Tier | What Claude can do | Apps |
|------|-------------------|------|
| View only | See in screenshots | Browsers, trading apps |
| Click only | Click + scroll, no typing | Terminals, IDEs |
| Full control | Click, type, drag, shortcuts | Everything else |

Your Tauri app should get **full control**.

### Important Caveat

This runs through **Claude Desktop/Cowork**, not the CLI where we're working now. So the workflow would be:

1. **Here in Claude Code CLI** → write code, run tests, build
2. **In Claude Desktop** → launch the app, visually test with Computer Use

They're separate sessions. You can't do both from here.

---

### Alternative: Stay in CLI with Playwright

If you'd rather keep everything in one place (here in CLI), the Playwright E2E approach against your dev server with MockBridge is still the best option. I can set that up too — it runs entirely from the terminal and I can read failure screenshots.

Which do you prefer — Computer Use via Desktop, Playwright here in CLI, or both?

Sources:
- [Computer Use Setup Guide](https://www.mindstudio.ai/blog/claude-code-computer-use-mac-setup-guide)
- [Let Claude use your computer in Cowork](https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork)
- [Claude Desktop Docs](https://code.claude.com/docs/en/desktop)
- [Dispatch and Computer Use](https://claude.com/blog/dispatch-and-computer-use)

---

## User

Does it work with Claude Code?

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code CLI computer use terminal --computer-use flag 2026"}`

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Check if computer use works in Claude Code CLI","subagent_type":"claude-code-guide","prompt":"Does Computer Use work in Claude Code (the CLI tool)? Not Claude Desktop or Cowork, but sp`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"\"claude code\" CLI \"computer use\" enabled terminal screenshot click 2026 site:code.claude.com OR site:github.com/anthropics"}`

---

## Assistant

**No, Computer Use does not work in Claude Code CLI.** It's a **Claude Desktop-only** feature.

The docs are clear: you enable it in **Settings → Desktop app → General** — there's no CLI flag, no terminal equivalent. It requires macOS Accessibility + Screen Recording permissions that are tied to the Desktop app, not a terminal process.

So your options for GUI-level feedback loops are:

| Approach | Where it runs | What it covers |
|----------|--------------|----------------|
| **Computer Use** | Claude Desktop (separate app) | Full native app interaction |
| **Claude in Chrome** (`--chrome`) | Claude Code CLI | Web UI only (your dev server) |
| **Playwright E2E** | Claude Code CLI | Web UI via dev server + MockBridge |
| **Video Input Skill** | Claude Code CLI | Analyze screen recordings as frames |

For staying in **this CLI session**, Playwright E2E against your Vite dev server with MockBridge is the most practical automated feedback loop I can set up. Want me to go that route?

Sources:
- [Claude Code Desktop - Computer Use](https://code.claude.com/docs/en/desktop)
- [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference)
- [Screenshot Support CLI Issue](https://github.com/anthropics/claude-code/issues/12644)

---

## User

Is there a Playwright approach similar for desktop apps?

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Playwright testing Tauri desktop app WebDriver E2E 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Tauri v2 E2E testing Playwright WebView integration test 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Playwright CDP connect Tauri macOS WebKit WebView testing"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"TestDriver AI Tauri desktop app testing Claude Code integration"}`

---

## Assistant

Great finds. There are actually **two purpose-built MCP solutions** for exactly your use case:

## 1. `tauri-plugin-mcp` (Best fit)

[github.com/P3GLEG/tauri-plugin-mcp](https://github.com/P3GLEG/tauri-plugin-mcp)

A Tauri plugin + MCP server that lets Claude Code **directly interact with your running Tauri app**:
- Screenshot capture
- DOM access
- Simulated user inputs (clicks, typing)
- Window management

This runs from **right here in the CLI** — no Claude Desktop needed. You install it as a Tauri plugin, it exposes an MCP server, and Claude Code connects to it.

## 2. `tauri-mcp` 

[github.com/dirvine/tauri-mcp](https://github.com/dirvine/tauri-mcp)

Similar concept — an MCP server for Tauri v2 apps with process management, window manipulation, input simulation, debugging tools, and IPC interaction.

## 3. Playwright + TestDriver AI

[docs.testdriver.ai/v6/apps/tauri-apps](https://docs.testdriver.ai/v6/apps/tauri-apps)

Adds AI vision capabilities to Playwright — selectorless testing using natural language. But this is a separate product, not integrated into Claude Code.

## The macOS Problem with Standard Playwright

Standard Playwright/WebDriver E2E against the **actual Tauri app** doesn't work well on macOS because Tauri uses WKWebView, and there's no native WKWebView driver. The CDP approach only works on Windows (Edge WebView2). There's a [community workaround](https://github.com/danielraffel/tauri-webdriver) but it's experimental.

## Recommendation

**`tauri-plugin-mcp`** is the most practical path — it's designed exactly for Claude Code + Tauri. The workflow would be:

1. Add the plugin to your Tauri app
2. Configure it as an MCP server in Claude Code
3. I can then launch your app, take screenshots, click elements, inspect DOM — all from this CLI session

Want me to look into how to integrate `tauri-plugin-mcp` into BrainMap?

Sources:
- [tauri-plugin-mcp](https://github.com/P3GLEG/tauri-plugin-mcp)
- [tauri-mcp](https://github.com/dirvine/tauri-mcp)
- [TestDriver for Tauri](https://docs.testdriver.ai/v6/apps/tauri-apps)
- [Tauri WebDriver docs](https://v2.tauri.app/develop/tests/webdriver/)
- [macOS tauri-webdriver workaround](https://github.com/danielraffel/tauri-webdriver)
- [Playwright CDP for Tauri](https://github.com/Haprog/playwright-cdp)

---

## User

Help me set tauri-plugin-mcp and test it. Let's go through small steps

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"select:WebFetch","max_results":1}`

---

## Assistant



Let me start by reading the plugin's README to understand the setup steps.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://github.com/P3GLEG/tauri-plugin-mcp","prompt":"Extract the complete setup and installation instructions. Include: Cargo.toml dependencies, Rust code changes needed, npm package installa`

---

