# 2026-03-27 — Subagent Transcript: claude-code-guide

**Date:** 2026-03-27 19:33:55
**Agent:** claude-code-guide
**Agent ID:** ae81654bf5ca45b9f
**Parent Session:** 8dcbdf05-36e4-4640-994d-0326294cacdc

---

## User

Can Claude Code accept video files as input? Can it process video recordings, screen recordings, or any video format (MP4, WebM, etc.)? What media types does Claude Code support as input? Does it support any form of video analysis or frame extraction from videos?

---

## Assistant

I'll check the Claude Code documentation to answer your questions about video input support.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/claude_code_docs_map.md","prompt":"What media types and file formats does Claude Code support as input? Does it support video files, screen recordings, or any v`

---

## Assistant

Let me fetch the detailed documentation on what Claude Code can do and what input types it supports.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/overview.md","prompt":"What types of input can Claude Code accept? What media formats does it support? Can it process videos, images, or other file types?"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/tools-reference.md","prompt":"What tools and capabilities does Claude Code have? Can it read or process videos?"}`

---

## Assistant

Let me also check if there's specific documentation about image support or media capabilities.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/common-workflows.md","prompt":"Does Claude Code support images, videos, or other media formats? Can you work with images in Claude Code?"}`

---

## Assistant

Based on my review of the Claude Code documentation, here's a comprehensive answer to your questions:

## Video File Support in Claude Code

**No, Claude Code does not accept video files as input.** Claude Code cannot process video recordings, screen recordings, or any video format (MP4, WebM, MOV, etc.) directly.

## Supported Media Types

Claude Code **does support images** as input, but this is the extent of its media capabilities:

### Images (Supported)
You can include images in your Claude Code prompts using several methods:
- **Drag and drop** into the Claude Code window
- **Copy and paste** (Ctrl+V on Windows/Linux, Cmd+V on Mac)
- **File path references** (e.g., "Analyze this image: /path/to/image.png")

Common use cases for images include:
- Analyzing error screenshots or stack traces
- Reviewing UI/design mockups
- Examining diagrams or database schemas
- Getting code suggestions from visual mockups

### What Else Works
Beyond images, Claude Code can work with:
- **Text files** (code, markdown, logs, etc.)
- **PDFs** (readable via the Read tool)
- **File paths** to any file in your codebase (Claude reads the text/source contents)

## No Video Analysis or Frame Extraction

Claude Code has **no capabilities for**:
- Processing video files directly
- Extracting frames from videos
- Analyzing video content
- Working with video metadata

## Workarounds for Video Content

If you need to work with videos, you have these options:
1. **Convert to images**: Extract frames manually and provide them as images
2. **Describe the video**: Paste a text transcript or description of what's in the video
3. **Use the Claude API**: If you need AI video analysis, the Claude API with vision capabilities would be needed, but video file processing would still require frame extraction via another tool

The focus of Claude Code is on code development, file manipulation, and text-based analysis—not media processing or video analysis.

---

