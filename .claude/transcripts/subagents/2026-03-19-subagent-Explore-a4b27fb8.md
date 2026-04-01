# 2026-03-19 — Subagent Transcript: Explore

**Date:** 2026-03-19 20:34:40
**Agent:** Explore
**Agent ID:** a4b27fb8acf4d1a85
**Parent Session:** b1d9eca6-8bb3-4c0b-8673-2c48c1a7ec0b

---

## User

Research how Excalidraw can be embedded in a React/TypeScript application. Look for:

1. Search the web for "@excalidraw/excalidraw" npm package - what's the API for embedding?
2. What file format does Excalidraw use? (.excalidraw files are JSON)
3. How does Obsidian's Excalidraw plugin work? (obsidian-excalidraw-plugin) - what file format does it use?
4. What are the key React components exported by @excalidraw/excalidraw?
5. Can Excalidraw work in a Tauri v2 webview?
6. What's the bundle size impact?

Also search the current project for any existing mentions of excalidraw or drawing-related features:
- Search for "excalidraw" in any files
- Search for "drawing" or "canvas" or "whiteboard" in docs/

Focus on practical integration details.

---

## Assistant

I'll research Excalidraw integration for React/TypeScript applications and check the current project for any existing drawing-related features.

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"@excalidraw/excalidraw npm package React integration API 2026"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Excalidraw file format .excalidraw JSON structure"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"obsidian-excalidraw-plugin file format integration"}`

---

## Assistant

### Tool Calls

- **WebSearch**: `{"query":"Excalidraw bundle size impact production"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"excalidraw","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas|whiteboard|drawing","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs"}`

---

## Assistant

Now let me check those specific files and search for more context around drawing/canvas features:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/CHANGELOG.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"draw|canvas|visual|diagram|widget","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs","output_mode":"files_with_matches"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/*.md"}`

---

## Assistant

Let me check the CM preview widget guide and the roadmap to understand drawing/canvas context better:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/07-roadmap.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/extension-guides/add-cm-preview-widget.md"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"sketch|draw|shape|diagram|excalidraw","path":"/Users/bsmonteiro/Desktop/Personal/brainmap","type":"ts"}`

---

## Assistant

Let me search for mermaid integration details to understand the existing preview widget pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmMermaidDecorations.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find crates/app -name \"package.json\" -type f | head -1 | xargs grep -A 30 '\"dependencies\"' | head -50"}`

---

## Assistant

Let me get the package.json content properly:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json","limit":80}`

---

## Assistant

Perfect! Now I have all the information needed. Let me compile a comprehensive research report on Excalidraw integration for the BrainMap project.

## Excalidraw Integration Research Report

Based on my research, here's what I found regarding embedding Excalidraw in a React/TypeScript application:

### 1. **@excalidraw/excalidraw NPM Package API**

The `@excalidraw/excalidraw` package provides two complementary integration approaches:

- **Declarative API**: `ExcalidrawProps` passed as React component props for configuration
- **Imperative API**: `ExcalidrawImperativeAPI` via a callback ref for programmatic control

**Key Integration Pattern**:
```typescript
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

<Excalidraw 
  excalidrawAPI={(api) => { /* access imperative methods */ }}
  onChange={(elements, appState, files) => { /* handle changes */ }}
/>
```

**Critical Requirements**:
- React and ReactDOM must be installed separately (peer dependencies, not bundled)
- CSS must be imported from `@excalidraw/excalidraw/index.css`
- Container must have non-zero width/height
- Full TypeScript type definitions available at `dist/types/excalidraw/index.d.ts`

**Key Methods Available**:
- Scene updates via `ExcalidrawImperativeAPI`
- Change subscriptions via `onChange` callback (receives elements, appState, files)
- Event-based scene manipulation

### 2. **File Format: .excalidraw Files**

The `.excalidraw` format is JSON with the following structure:

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "...",
  "elements": [...],      // Canvas elements (rectangles, lines, text, etc.)
  "appState": {...},      // Editor configuration (gridSize, viewBackgroundColor, etc.)
  "files": {...}          // Image data (fileId -> {mimeType, dataURL, ...})
}
```

**Serialization**:
- `serializeAsJSON(context)` function with `"local"` context for file saves (all data) or `"database"` for backend (filtered)
- `parseJSON` for deserialization
- File size optimization: minified files reduce 31.4kb → 17.1kb and larger files from 612kb → 296kb

### 3. **Obsidian's Excalidraw Plugin Integration**

The plugin uses a hybrid approach with two primary formats:

- **.excalidraw.md** (Preferred): Markdown file with Excalidraw drawing data in structured format, enabling full Obsidian knowledge integration
- **.excalidraw** (Compatibility): Pure JSON format (limited functionality in compatibility mode)
- **Standard .md files**: Can also contain Excalidraw content for compatibility with Logseq

**Key Features**:
- Markdown frontmatter + compressed JSON
- Seamless embedding into markdown documents
- Linking between drawings and notes
- Integration with Obsidian's Command Palette, File Explorer, Ribbon Button

### 4. **React Components Exported**

Primary exports from `@excalidraw/excalidraw`:

- `Excalidraw` — Main component
- `ExcalidrawAPI` — Type for imperative API
- Utility functions for serialization/deserialization
- Theme configuration options

The package includes utilities for:
- JSON import/export
- Image file handling
- Scene state management
- Theme and appearance configuration

### 5. **Tauri v2 Webview Compatibility**

**Yes, Excalidraw works in Tauri v2 webviews**:

- Excalidraw is a standard React component with no native dependencies
- Works in both Chromium (webview2 on Windows) and WebKit (on macOS/Linux)
- No special configuration needed beyond standard React setup
- The webview's DOM, CSS, and JavaScript APIs are all supported
- **BrainMap's tech stack is fully compatible**: React 18, TypeScript, Vite, Tauri v2

### 6. **Bundle Size Impact**

**Significant consideration**:

- **Main bundle**: ~2.3 MB (gzipped: significantly smaller but still substantial)
- **Exceeds PWA precache limits**: Default 2 MB workbox limit (relevant if caching becomes a concern)
- **Optimization strategy**: Use dynamic import (`import("@excalidraw/excalidraw")`) to lazy-load only when needed
- **Tree-shaking limitations**: Current UMD build doesn't support tree shaking; ESM build is in development

**Recommendation**: Lazy-load via dynamic import to keep initial bundle small.

---

### Current BrainMap Project Status

**No existing Excalidraw or drawing features found** in the codebase:

- Zero mentions of "excalidraw" in any files
- "Canvas" mentions are related to Cytoscape graph rendering, not drawing surfaces
- The existing preview widget pattern (Mermaid diagrams) provides the architectural foundation for adding Excalidraw

### Integration Path for BrainMap

If integrating Excalidraw, the project has an **ideal foundation**:

1. **Existing preview widget pattern** (`cmMermaidDecorations.ts`):
   - Cursor-aware rendering (raw markdown when cursor inside, rendered SVG/widget when outside)
   - Lazy loading + dynamic imports for large libraries
   - Cache management + error handling
   - StateField + EditorView extension architecture

2. **Potential note type**: Could add `"drawing"` note type with frontmatter fields

3. **File storage options**:
   - `.excalidraw.md` format (like Obsidian) — markdown with embedded JSON
   - Raw `.excalidraw` JSON files with metadata in frontmatter
   - Inline fenced code blocks with `excalidraw` language tag for inline drawing blocks

4. **React component registration** in MarkdownEditor.tsx (alongside existing mermaid, KaTeX decorations)

5. **Package.json**: Would add `@excalidraw/excalidraw` to existing dependencies (currently: mermaid, katex, cytoscape, etc.)

---

### Sources

- [@excalidraw/excalidraw - npm](https://www.npmjs.com/package/@excalidraw/excalidraw)
- [Integration | Excalidraw developer docs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/integration)
- [Installation | Excalidraw developer docs](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/installation)
- [Component Props and Imperative API](https://deepwiki.com/excalidraw/excalidraw/10.2-component-props-and-api)
- [JSON Schema | Excalidraw developer docs](https://docs.excalidraw.com/docs/codebase/json-schema)
- [GitHub - zsviczian/obsidian-excalidraw-plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin)
- [Bundlephobia - @excalidraw/excalidraw](https://bundlephobia.com/package/@excalidraw/excalidraw)

---

