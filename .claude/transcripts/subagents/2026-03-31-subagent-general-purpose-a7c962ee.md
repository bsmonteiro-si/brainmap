# 2026-03-31 — Subagent Transcript: general-purpose

**Date:** 2026-03-31 18:29:07
**Agent:** general-purpose
**Agent ID:** a7c962eebbf9f55a5
**Parent Session:** 56acfd52-83e2-41c2-966c-d320c101fc16

---

## User

Search the web for what media formats Claude (the AI model) and Claude Code (the CLI tool) can receive and process. Specifically:
1. Can Claude process animated GIFs?
2. Can Claude process video files?
3. What image formats does Claude support?
4. Any recent announcements about video/GIF support in Claude?

Use WebSearch to find this information. Do NOT edit any files. Return your findings.

---

## Assistant



I don't have a WebSearch tool available in my current environment. Let me check what tools I do have access to.

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"web search internet browse","max_results":5}`

---

## Assistant



Good, WebSearch is available. Let me run the searches.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude AI supported image formats vision capabilities 2025 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude AI animated GIF support processing"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude AI video file support processing 2025 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Claude Code CLI image video file input support"}`

---

## Assistant

Let me get one more specific search to confirm the GIF first-frame behavior from the official docs.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://platform.claude.com/docs/en/build-with-claude/vision","prompt":"What image formats does Claude support? Does Claude support animated GIFs - does it process all frames or just the first`

---

## Assistant

Here are the findings:

## 1. Can Claude process animated GIFs?

**Partially.** Claude accepts GIF as a supported image format (`image/gif`), but it only processes the **first frame** of an animated GIF. It does not analyze the animation sequence or any subsequent frames. For practical purposes, sending an animated GIF to Claude is equivalent to sending a static image of the first frame.

## 2. Can Claude process video files?

**No.** Claude has no native video file support -- not via the API, not on claude.ai, and not in Claude Code. There is an open feature request on GitHub (issue #12676) for video input support in Claude Code, but it remains unimplemented. The workaround is to extract key frames from a video and send them as individual images (up to 600 per API request). Community-built skills exist that automate this frame-extraction workflow, but they are not official Anthropic features.

## 3. What image formats does Claude support?

According to the official Anthropic docs, Claude supports exactly four image formats:

- **JPEG** (`image/jpeg`)
- **PNG** (`image/png`)
- **GIF** (`image/gif`)
- **WebP** (`image/webp`)

Size limits:
- API: 5 MB per image, up to 600 images per request (100 for 200k context models)
- claude.ai: 10 MB per image, up to 20 images per turn
- Max resolution: 8000x8000 px (reduced to 2000x2000 when sending more than 20 images in one API request)
- Optimal performance: 1568 px or less on the longest edge

Claude Code specifically supports image input via drag-and-drop, clipboard paste (Ctrl+V), or file path reference, with a 5 MB per-image limit.

## 4. Recent announcements

- **URL-based image sources** were added to the Claude Vision API (January 2026), allowing you to pass image URLs directly instead of base64-encoding.
- **Files API for images** is available (beta), letting you upload once and reference by `file_id` across multiple requests.
- No announcements about native video support or full animated GIF frame analysis have been made as of March 2026.

Sources:
- [Vision - Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/vision)
- [Video Input Support Feature Request - Claude Code GitHub #12676](https://github.com/anthropics/claude-code/issues/12676)
- [Claude Code Image Attachment Guide](https://smartscope.blog/en/generative-ai/claude/claude-code-image-guide/)
- [Can Claude Analyze Video? - Vomo AI](https://vomo.ai/blog/can-claude-analyze-video)
- [Claude in Chrome GIF Analysis Feature Request #14805](https://github.com/anthropics/claude-code/issues/14805)

---

