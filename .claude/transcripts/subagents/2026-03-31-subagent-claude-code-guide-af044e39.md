# 2026-03-31 — Subagent Transcript: claude-code-guide

**Date:** 2026-03-31 18:28:39
**Agent:** claude-code-guide
**Agent ID:** af044e39c079e700e
**Parent Session:** 56acfd52-83e2-41c2-966c-d320c101fc16

---

## User

Can Claude Code receive and process GIFs or video files? What image/media formats does it support? I need specifics on:
1. What image formats can be read/viewed
2. Can it process animated GIFs (seeing animation frames)?
3. Can it process video files (MP4, MOV, etc.)?
4. Any limitations on media input

---

## Assistant

I'll check the Claude Code documentation to get you specific details on supported media formats and capabilities.

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/claude_code_docs_map.md","prompt":"What image and media formats are supported? What about GIFs, videos, and animated content?"}`

---

## Assistant

Now let me fetch the comprehensive documentation on image and media support:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://code.claude.com/docs/en/common-workflows.md","prompt":"What image formats can Claude Code process? Can it handle GIFs, videos, or animated content? What are the limitations?"}`

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://platform.claude.com/llms.txt","prompt":"What image formats does Claude API support? Can it process GIFs, videos, or animated content? What are the media format limitations?"}`

---

## Assistant

Let me get the detailed vision and media support documentation from the Claude API:

---

## Assistant

### Tool Calls

- **WebFetch**: `{"url":"https://platform.claude.com/docs/en/build-with-claude/vision.md","prompt":"What image formats are supported? Can Claude process GIFs, videos, or animated content? What are the limitations?"}`

---

## Assistant

Based on the official Claude Code and Claude API documentation, here's what you need to know about media format support:

## Image Formats Supported

Claude (both Claude Code and the Claude API) supports these image formats:
- **JPEG** (`image/jpeg`)
- **PNG** (`image/png`)
- **GIF** (`image/gif`)
- **WebP** (`image/webp`)

## Animated GIFs

**GIF support is limited.** While GIF is listed as a supported format, Claude processes static images. When you provide an animated GIF, Claude analyzes it as a single image—it does **not** process or see individual animation frames. You'll get analysis of what's shown in the GIF file, but not the sequence of animations.

## Video Files

**Video files are NOT supported.** Claude cannot process MP4, MOV, AVI, MKV, WebM, OGV, or any other video formats through the API or Claude Code. Video is outside the scope of Claude's multimodal capabilities.

Note: Your BrainMap project includes video support via the custom file-type editor pattern (documented in your project), but that's a UI viewer, not Claude analysis.

## Key Limitations

| Aspect | Details |
|--------|---------|
| **Image size** | Max 5 MB per image (API), 10 MB (claude.ai); images over 8000x8000 px rejected |
| **Quantity** | Up to 600 images per request (100 for 200k-token models); 20 limit on claude.ai |
| **Resolution scaling** | Images over 1568 px on long edge are auto-downsampled; very small images (< 200 px) may degrade quality |
| **Metadata** | Claude ignores all EXIF and image metadata |
| **Generation/editing** | Claude cannot generate, edit, or manipulate images—analysis only |

## Usage in Claude Code

In Claude Code CLI, you can:
1. Drag and drop images into the window
2. Paste images with Ctrl+V (not Cmd+V)
3. Reference image paths directly in prompts

The documentation specifically mentions working with images for use cases like analyzing UI screenshots, design mockups, diagrams, and debugging visual problems.

If you need animated content analysis, you'd need to either extract key frames from the video/GIF separately or use a tool that explicitly supports video processing.

---

