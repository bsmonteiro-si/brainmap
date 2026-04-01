# 2026-03-31 — Claude Code Session

**Date:** 2026-03-31 20:24:05
**Session:** 56acfd52-83e2-41c2-966c-d320c101fc16

---

## Slash Command

<command-name>/clear</command-name>
            <command-message>clear</command-message>
            <command-args></command-args>

---

## User

Can Claude code receive gifs or any forms of video?

---

## Assistant

Claude Code can read **images** (PNG, JPG, GIF as a static image, etc.) via the Read tool — it's multimodal. However:

- **GIFs**: Read as a static image (you'll see the first frame or a composite, not the animation).
- **Video files** (MP4, MOV, etc.): **Not supported**. The Read tool cannot play or interpret video content.

So in practice, if you want to show Claude Code something visual, **screenshots (PNG/JPG)** are the most reliable format. For animated sequences, a series of screenshots at key moments works better than a GIF.

---

## User

Be sure about this. Research in the web and your docs

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Research Claude Code media support","subagent_type":"claude-code-guide","prompt":"Can Claude Code receive and process GIFs or video files? What image/media formats does it support? I n`

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Web search Claude media capabilities","subagent_type":"general-purpose","prompt":"Search the web for what media formats Claude (the AI model) and Claude Code (the CLI tool) can receive`

---

## Assistant

Here's the confirmed picture:

**Supported image formats**: JPEG, PNG, GIF, WebP

**Animated GIFs**: Accepted but only the **first frame** is analyzed. Claude does not see the animation sequence.

**Video files**: **Not supported** at all. There's an open feature request (anthropics/claude-code#12676) but nothing implemented. The workaround is extracting key frames from video and sending them as individual images.

**Input methods in Claude Code**:
- Drag and drop images into the CLI
- Paste with Ctrl+V
- Reference file paths directly

**Limits**: 5 MB per image, max 8000x8000 px, images auto-downsampled above 1568 px on the longest edge.

So my initial answer was mostly correct — I should have specified that GIFs are accepted but only the first frame is visible, not just "a static image or composite."

---

