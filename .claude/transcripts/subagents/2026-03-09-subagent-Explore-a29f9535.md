# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 20:37:57
**Agent:** Explore
**Agent ID:** a29f95352cec36e18
**Parent Session:** 029c53be-32f6-4b33-aded-6ee2be0b034b

---

## User

Read and return the full contents of these files in the BrainMap project at /Users/bsmonteiro/Desktop/Personal/brainmap:

1. crates/app/src/components/GraphView/GraphView.tsx
2. crates/app/src/components/GraphView/graphStyles.ts
3. crates/app/src/components/GraphView/GraphToolbar.tsx
4. crates/app/src/components/Layout/AppLayout.tsx
5. crates/app/src/components/Editor/EditorPanel.tsx
6. crates/app/src/stores/uiStore.ts
7. crates/app/src/App.tsx
8. crates/app/src/App.css
9. crates/app/package.json
10. crates/app/src/api/types.ts (if it exists)
11. crates/app/src/stores/graphStore.ts
12. crates/app/src/stores/editorStore.ts

Return the full content of every file found.

---

## Assistant

I'll read all the requested files from the BrainMap project's React app. Let me start by gathering them.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphToolbar.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/EditorPanel.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/package.json"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts"}`

---

## Assistant

Here are the full contents of all requested files:

## 1. crates/app/src/components/GraphView/GraphView.tsx

```typescript
import { useRef, useEffect } from "react";
import cytoscape, { type Core } from "cytoscape";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { graphStylesheet, getNodeColor } from "./graphStyles";
import { GraphToolbar } from "./GraphToolbar";

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { nodes, edges, selectedNodePath, isLoading } = useGraphStore();
  const selectNodeRef = useRef(useGraphStore.getState().selectNode);
  const expandNodeRef = useRef(useGraphStore.getState().expandNode);

  // Keep refs up-to-date
  useEffect(() => {
    selectNodeRef.current = useGraphStore.getState().selectNode;
    expandNodeRef.current = useGraphStore.getState().expandNode;
  });

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: graphStylesheet,
      layout: { name: "preset" },
      minZoom: 0.1,
      maxZoom: 5,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    // Click node → select
    cy.on("tap", "node", (evt) => {
      const nodePath = evt.target.id();
      selectNodeRef.current(nodePath);
      useEditorStore.getState().openNote(nodePath);
    });

    // Double-click node → expand neighbors
    cy.on("dbltap", "node", (evt) => {
      const nodePath = evt.target.id();
      expandNodeRef.current(nodePath);
    });

    // Click background → deselect
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        selectNodeRef.current(null);
      }
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Sync graph data to Cytoscape
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Build elements
    const cyNodes = Array.from(nodes.values()).map((n) => ({
      data: {
        id: n.path,
        label: n.title,
        color: getNodeColor(n.note_type),
        noteType: n.note_type,
      },
    }));

    const cyEdges = edges.map((e) => ({
      data: {
        id: `${e.source}|${e.target}|${e.rel}`,
        source: e.source,
        target: e.target,
        label: e.rel,
        kind: e.kind,
      },
    }));

    // Only add edges whose source and target nodes exist
    const nodeIds = new Set(cyNodes.map((n) => n.data.id));
    const validEdges = cyEdges.filter(
      (e) => nodeIds.has(e.data.source) && nodeIds.has(e.data.target)
    );

    cy.elements().remove();
    cy.add([...cyNodes, ...validEdges]);

    // Run cose layout
    if (cyNodes.length > 0) {
      cy.layout({
        name: "cose",
        animate: false,
        randomize: false,
        fit: true,
        padding: 40,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 100,
        edgeElasticity: () => 100,
        gravity: 0.25,
        numIter: 200,
        nodeDimensionsIncludeLabels: true,
      } as cytoscape.CoseLayoutOptions).run();
    }
  }, [nodes, edges]);

  // Highlight selected node
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass("highlighted");
    cy.$("node:selected").unselect();

    if (selectedNodePath) {
      const node = cy.getElementById(selectedNodePath);
      if (node.length > 0) {
        node.select();
        node.connectedEdges().addClass("highlighted");
        node.neighborhood("node").addClass("highlighted");
      }
    }
  }, [selectedNodePath]);

  const debugInfo = `isLoading=${isLoading} nodes=${nodes.size} edges=${edges.length}`;

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <GraphToolbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          Loading graph...
        </div>
      </div>
    );
  }

  if (nodes.size === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <GraphToolbar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
          No nodes to display. Create your first note.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <GraphToolbar />
      {/* DEBUG — remove once graph renders correctly */}
      <div style={{ padding: "4px 8px", fontSize: 11, background: "#ff0", color: "#000", flexShrink: 0 }}>
        DEBUG: {debugInfo} | container ref: {containerRef.current ? `${containerRef.current.offsetWidth}×${containerRef.current.offsetHeight}` : "null"}
      </div>
      <div ref={containerRef} className="graph-container" style={{ border: "2px solid red" }} />
    </div>
  );
}
```

## 2. crates/app/src/components/GraphView/graphStyles.ts

```typescript
// Color palette for the 10 note types
export const NOTE_TYPE_COLORS: Record<string, string> = {
  concept: "#4a9eff",
  "book-note": "#9b59b6",
  question: "#e67e22",
  reference: "#1abc9c",
  index: "#34495e",
  argument: "#e74c3c",
  evidence: "#27ae60",
  experiment: "#f39c12",
  person: "#2980b9",
  project: "#8e44ad",
};

export function getNodeColor(noteType: string): string {
  return NOTE_TYPE_COLORS[noteType] ?? "#95a5a6";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphStylesheet: any[] = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "background-color": "data(color)",
      "text-valign": "bottom",
      "text-halign": "center",
      "font-size": "10px",
      color: "#666",
      width: 24,
      height: 24,
      "text-margin-y": 4,
      "text-max-width": "80px",
      "text-wrap": "ellipsis",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-width": 3,
      "border-color": "#ff6b6b",
      width: 30,
      height: 30,
    },
  },
  {
    selector: "node.highlighted",
    style: {
      "border-width": 2,
      "border-color": "#ff6b6b",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "#ccc",
      "target-arrow-color": "#ccc",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      label: "data(label)",
      "font-size": "8px",
      color: "#999",
      "text-rotation": "autorotate",
      "text-margin-y": -8,
    },
  },
  {
    selector: "edge.highlighted",
    style: {
      "line-color": "#ff6b6b",
      "target-arrow-color": "#ff6b6b",
      width: 2.5,
    },
  },
  {
    selector: "edge[kind = 'Implicit']",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [4, 4],
    },
  },
  {
    selector: "edge[kind = 'Inline']",
    style: {
      "line-style": "dotted",
    },
  },
];
```

## 3. crates/app/src/components/GraphView/GraphToolbar.tsx

```typescript
import { useUIStore } from "../../stores/uiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

export function GraphToolbar() {
  const graphMode = useUIStore((s) => s.graphMode);
  const toggleGraphMode = useUIStore((s) => s.toggleGraphMode);
  const noteTypes = useWorkspaceStore((s) => s.noteTypes);

  return (
    <div className="graph-toolbar">
      <button
        className={graphMode === "navigate" ? "active" : ""}
        onClick={() => graphMode !== "navigate" && toggleGraphMode()}
      >
        Navigate
      </button>
      <button
        className={graphMode === "edit" ? "active" : ""}
        onClick={() => graphMode !== "edit" && toggleGraphMode()}
      >
        Edit
      </button>
      <span style={{ flex: 1 }} />
      <select
        defaultValue="all"
        onChange={(e) => {
          console.log("Filter by type:", e.target.value);
        }}
      >
        <option value="all">All Types</option>
        {noteTypes.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## 4. crates/app/src/components/Layout/AppLayout.tsx

```typescript
import { GraphView } from "../GraphView/GraphView";
import { EditorPanel } from "../Editor/EditorPanel";
import { SearchPanel } from "../Search/SearchPanel";
import { StatusBar } from "../StatusBar/StatusBar";

export function AppLayout() {
  return (
    <>
      <div className="app-layout">
        <div className="panel" style={{ flex: "0 0 60%" }}>
          <div className="panel-header">Graph</div>
          <div className="panel-content">
            <GraphView />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: "0 0 40%" }}>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-header">
              Editor
            </div>
            <div className="panel-content">
              <EditorPanel />
            </div>
          </div>
          <div className="panel" style={{ flex: "0 0 200px", borderTop: "1px solid var(--border-color)" }}>
            <div className="panel-header">Search</div>
            <div className="panel-content">
              <SearchPanel />
            </div>
          </div>
        </div>
      </div>
      <StatusBar />
    </>
  );
}
```

## 5. crates/app/src/components/Editor/EditorPanel.tsx

```typescript
import { useEditorStore } from "../../stores/editorStore";
import { MarkdownEditor } from "./MarkdownEditor";
import { FrontmatterForm } from "./FrontmatterForm";

export function EditorPanel() {
  const activeNote = useEditorStore((s) => s.activeNote);
  const isLoading = useEditorStore((s) => s.isLoading);
  const conflictState = useEditorStore((s) => s.conflictState);
  const resolveConflict = useEditorStore((s) => s.resolveConflict);

  if (isLoading) {
    return <div className="editor-placeholder">Loading note...</div>;
  }

  if (!activeNote) {
    return (
      <div className="editor-placeholder">
        Select a node in the graph or search results to view its content.
      </div>
    );
  }

  return (
    <div className="editor-panel">
      {conflictState === "external-change" && (
        <div className="conflict-banner">
          <span>File changed externally.</span>
          <button onClick={() => resolveConflict("keep-mine")}>Keep Mine</button>
          <button onClick={() => resolveConflict("accept-theirs")}>Accept Theirs</button>
        </div>
      )}
      <FrontmatterForm note={activeNote} />
      <div className="editor-body">
        <MarkdownEditor
          notePath={activeNote.path}
          content={activeNote.body}
          onChange={(body) => useEditorStore.getState().updateContent(body)}
        />
      </div>
    </div>
  );
}
```

## 6. crates/app/src/stores/uiStore.ts

```typescript
import { create } from "zustand";

type Theme = "light" | "dark" | "system";
type GraphMode = "navigate" | "edit";

interface UIState {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  graphMode: GraphMode;
  commandPaletteOpen: boolean;
  createNoteDialogOpen: boolean;

  setTheme: (theme: Theme) => void;
  toggleGraphMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCreateNoteDialog: () => void;
  closeCreateNoteDialog: () => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "system",
  effectiveTheme: getSystemTheme(),
  graphMode: "navigate",
  commandPaletteOpen: false,
  createNoteDialogOpen: false,

  setTheme: (theme: Theme) => {
    set({ theme, effectiveTheme: resolveTheme(theme) });
  },

  toggleGraphMode: () => {
    set((state) => ({
      graphMode: state.graphMode === "navigate" ? "edit" : "navigate",
    }));
  },

  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  openCreateNoteDialog: () => set({ createNoteDialogOpen: true }),
  closeCreateNoteDialog: () => set({ createNoteDialogOpen: false }),
}));
```

## 7. crates/app/src/App.tsx

```typescript
import { useEffect, useCallback } from "react";
import { useWorkspaceStore } from "./stores/workspaceStore";
import { useGraphStore } from "./stores/graphStore";
import { useEditorStore } from "./stores/editorStore";
import { useUIStore } from "./stores/uiStore";
import { getAPI } from "./api/bridge";
import { WorkspacePicker } from "./components/Layout/WorkspacePicker";
import { AppLayout } from "./components/Layout/AppLayout";
import { CommandPalette } from "./components/CommandPalette/CommandPalette";
import { CreateNoteDialog } from "./components/Editor/CreateNoteDialog";

import "./App.css";

function App() {
  const info = useWorkspaceStore((s) => s.info);
  const loadTopology = useGraphStore((s) => s.loadTopology);
  const applyEvent = useGraphStore((s) => s.applyEvent);
  const commandPaletteOpen = useUIStore((s) => s.commandPaletteOpen);
  const createNoteDialogOpen = useUIStore((s) => s.createNoteDialogOpen);
  const effectiveTheme = useUIStore((s) => s.effectiveTheme);

  // Subscribe to workspace events for live updates
  useEffect(() => {
    if (!info) return;

    let unsubscribe: (() => void) | undefined;
    getAPI().then((api) => {
      unsubscribe = api.onEvent((event) => {
        applyEvent(event);
        // If the event affects the currently open note in the editor
        if (
          (event.type === "node-updated" || event.type === "topology-changed") &&
          "path" in event
        ) {
          const editorState = useEditorStore.getState();
          if (editorState.activeNote?.path === event.path) {
            editorState.markExternalChange();
          }
        }
      });
    });

    return () => unsubscribe?.();
  }, [info, applyEvent]);

  // Load graph topology after workspace opens
  useEffect(() => {
    if (info) {
      loadTopology();
    }
  }, [info, loadTopology]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "p") {
        e.preventDefault();
        useUIStore.getState().openCommandPalette();
      }
      if (isMod && e.key === "n") {
        e.preventDefault();
        useUIStore.getState().openCreateNoteDialog();
      }
      if (isMod && e.key === "s") {
        e.preventDefault();
        useEditorStore.getState().saveNote();
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  if (!info) {
    return <WorkspacePicker />;
  }

  return (
    <div className="app">
      <AppLayout />
      {commandPaletteOpen && <CommandPalette />}
      {createNoteDialogOpen && <CreateNoteDialog />}
    </div>
  );
}

export default App;
```

## 8. crates/app/src/App.css

```css
/* ── Theme variables ─────────────────────────────────────────── */
:root,
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e8e8e8;
  --text-primary: #1a1a1a;
  --text-secondary: #555555;
  --text-muted: #888888;
  --border-color: #ddd;
  --accent: #4a9eff;
  --accent-hover: #3a8eef;
  --danger: #e74c3c;
  --success: #27ae60;
  --warning: #f39c12;
}

[data-theme="dark"] {
  --bg-primary: #1e1e1e;
  --bg-secondary: #252525;
  --bg-tertiary: #333333;
  --text-primary: #e0e0e0;
  --text-secondary: #aaaaaa;
  --text-muted: #666666;
  --border-color: #444;
  --accent: #4a9eff;
  --accent-hover: #5aaeFF;
  --danger: #e74c3c;
  --success: #27ae60;
  --warning: #f39c12;
}

/* ── Base ────────────────────────────────────────────────────── */
body {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* ── Layout ──────────────────────────────────────────────────── */
.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--border-color);
}

.panel:last-child {
  border-right: none;
}

.panel-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.panel-content {
  flex: 1;
  overflow: auto;
}

/* ── Status Bar ──────────────────────────────────────────────── */
.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.status-bar .separator {
  color: var(--border-color);
}

/* ── Graph View ──────────────────────────────────────────────── */
.graph-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}

.graph-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.graph-toolbar button {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.graph-toolbar button:hover {
  background: var(--bg-tertiary);
}

.graph-toolbar button.active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.graph-toolbar select {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* ── Editor ──────────────────────────────────────────────────── */
.editor-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 14px;
}

.frontmatter-form {
  padding: 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.frontmatter-form label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.frontmatter-form label span {
  min-width: 60px;
  font-weight: 600;
}

.frontmatter-form input,
.frontmatter-form select {
  flex: 1;
  padding: 4px 8px;
  font-size: 13px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.editor-body {
  flex: 1;
  overflow: auto;
}

.editor-body .cm-editor {
  height: 100%;
}

.conflict-banner {
  padding: 8px 12px;
  background: var(--warning);
  color: #1a1a1a;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.conflict-banner button {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 4px;
  background: rgba(255,255,255,0.3);
  cursor: pointer;
}

.dirty-indicator {
  color: var(--warning);
  font-size: 10px;
  margin-left: 4px;
}

/* ── Search ──────────────────────────────────────────────────── */
.search-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-input-bar {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.search-input-bar input {
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-filters {
  display: flex;
  gap: 6px;
}

.search-filters select {
  flex: 1;
  padding: 4px 6px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-results {
  flex: 1;
  overflow: auto;
}

.search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
}

.search-result-item:hover {
  background: var(--bg-secondary);
}

.search-result-item .title {
  font-size: 14px;
  font-weight: 500;
}

.search-result-item .meta {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.search-result-item .snippet {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  line-height: 1.4;
}

.type-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  border-radius: 3px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  margin-right: 6px;
}

/* ── Inspector ───────────────────────────────────────────────── */
.inspector-panel {
  padding: 12px;
  font-size: 13px;
}

.inspector-panel .field {
  margin-bottom: 10px;
}

.inspector-panel .field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.inspector-panel .field-value {
  color: var(--text-primary);
}

.inspector-panel .links-section {
  margin-top: 16px;
}

.inspector-panel .link-item {
  padding: 4px 0;
  font-size: 12px;
  cursor: pointer;
  color: var(--accent);
}

.inspector-panel .link-item:hover {
  text-decoration: underline;
}

.inspector-panel .link-rel {
  color: var(--text-muted);
  font-size: 11px;
  margin-right: 4px;
}

/* ── Command Palette ─────────────────────────────────────────── */
.command-palette-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  padding-top: 20vh;
  z-index: 100;
}

.command-palette {
  width: 500px;
  max-height: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}

.command-palette input {
  width: 100%;
  padding: 12px 16px;
  font-size: 15px;
  border: none;
  border-bottom: 1px solid var(--border-color);
  border-radius: 8px 8px 0 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

.command-palette .results {
  flex: 1;
  overflow: auto;
}

.command-palette .result-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.command-palette .result-item:hover,
.command-palette .result-item.selected {
  background: var(--bg-secondary);
}

.command-palette .result-icon {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Workspace Picker ────────────────────────────────────────── */
.workspace-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}

.workspace-picker h1 {
  font-size: 28px;
  font-weight: 300;
}

.workspace-picker .picker-form {
  display: flex;
  gap: 8px;
}

.workspace-picker input {
  padding: 8px 14px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  width: 300px;
}

.workspace-picker button {
  padding: 8px 18px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  background: var(--accent);
  color: white;
  cursor: pointer;
}

.workspace-picker button:hover {
  background: var(--accent-hover);
}

.workspace-picker .error {
  color: var(--danger);
  font-size: 14px;
}

.workspace-picker .loading {
  color: var(--text-muted);
  font-size: 14px;
}
```

## 9. crates/app/package.json

```json
{
  "name": "brainmap-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 1420",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "tauri": "tauri"
  },
  "dependencies": {
    "@codemirror/commands": "^6.10.2",
    "@codemirror/lang-markdown": "^6.3.1",
    "@codemirror/language": "^6.10.6",
    "@codemirror/state": "^6.5.2",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@codemirror/view": "^6.36.5",
    "@tauri-apps/api": "^2.2.0",
    "@tauri-apps/plugin-dialog": "^2.2.0",
    "@tauri-apps/plugin-shell": "^2.2.0",
    "cytoscape": "^3.31.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.2.7",
    "@types/cytoscape": "^3.21.9",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.1.0",
    "vitest": "^3.0.5"
  }
}
```

## 10. crates/app/src/api/types.ts

```typescript
// TypeScript interfaces matching the Rust DTOs in src-tauri/src/dto.rs.
// Hand-written for reliability — kept in sync manually.

export interface WorkspaceInfo {
  name: string;
  root: string;
  node_count: number;
  edge_count: number;
}

export interface NodeDto {
  path: string;
  title: string;
  note_type: string;
}

export interface EdgeDto {
  source: string;
  target: string;
  rel: string;
  kind: "Explicit" | "Implicit" | "Inline";
}

export interface GraphTopology {
  nodes: NodeDto[];
  edges: EdgeDto[];
}

export interface TypedLinkDto {
  target: string;
  rel: string;
  annotation?: string;
}

export interface NoteDetail {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  created: string;
  modified: string;
  source: string | null;
  summary: string | null;
  links: TypedLinkDto[];
  extra: Record<string, unknown>;
  body: string;
}

export interface NodeSummary {
  path: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  summary: string | null;
}

export interface SearchResult {
  path: string;
  title: string;
  note_type: string;
  snippet: string;
  rank: number;
}

export interface SearchFilters {
  note_type?: string;
  tag?: string;
  status?: string;
}

export interface Subgraph {
  nodes: NodeDto[];
  edges: EdgeDto[];
}

export interface StatsDto {
  node_count: number;
  edge_count: number;
  nodes_by_type: Record<string, number>;
  edges_by_rel: Record<string, number>;
  edges_by_kind: Record<string, number>;
  orphan_count: number;
}

export type WorkspaceEvent =
  | { type: "node-created"; path: string; node: NodeDto }
  | { type: "node-updated"; path: string; node: NodeDto }
  | { type: "node-deleted"; path: string }
  | { type: "edge-created"; edge: EdgeDto }
  | { type: "edge-deleted"; edge: EdgeDto }
  | { type: "topology-changed"; added_nodes: NodeDto[]; removed_nodes: string[]; added_edges: EdgeDto[]; removed_edges: EdgeDto[] };

// ── API Interface ──────────────────────────────────────────────────

export interface BrainMapAPI {
  openWorkspace(path: string): Promise<WorkspaceInfo>;
  getGraphTopology(): Promise<GraphTopology>;
  readNote(path: string): Promise<NoteDetail>;
  listNodes(filters?: { note_type?: string; tag?: string; status?: string }): Promise<NodeSummary[]>;
  createNote(params: {
    path: string;
    title: string;
    note_type: string;
    tags?: string[];
    status?: string;
    source?: string;
    summary?: string;
    extra?: Record<string, unknown>;
    body?: string;
  }): Promise<string>;
  updateNote(params: {
    path: string;
    title?: string;
    note_type?: string;
    tags?: string[];
    status?: string;
    source?: string;
    summary?: string;
    extra?: Record<string, unknown>;
    body?: string;
  }): Promise<void>;
  deleteNote(path: string, force?: boolean): Promise<void>;
  createLink(source: string, target: string, rel: string, annotation?: string): Promise<void>;
  deleteLink(source: string, target: string, rel: string): Promise<void>;
  listLinks(path: string, direction: "Outgoing" | "Incoming" | "Both", relFilter?: string): Promise<EdgeDto[]>;
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
  getNeighbors(path: string, depth: number, direction?: string, relFilter?: string): Promise<Subgraph>;
  getStats(): Promise<StatsDto>;
  onEvent(callback: (event: WorkspaceEvent) => void): () => void;
}
```

## 11. crates/app/src/stores/graphStore.ts

```typescript
import { create } from "zustand";
import type { EdgeDto, NodeDto, WorkspaceEvent } from "../api/types";
import { getAPI } from "../api/bridge";

interface GraphState {
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  selectedNodePath: string | null;
  expandedNodes: Set<string>;
  isLoading: boolean;

  loadTopology: () => Promise<void>;
  selectNode: (path: string | null) => void;
  expandNode: (path: string) => Promise<void>;
  applyEvent: (event: WorkspaceEvent) => void;
  createNote: (path: string, title: string, note_type: string) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: new Map(),
  edges: [],
  selectedNodePath: null,
  expandedNodes: new Set(),
  isLoading: false,

  loadTopology: async () => {
    set({ isLoading: true });
    try {
      const api = await getAPI();
      const topology = await api.getGraphTopology();
      const nodes = new Map<string, NodeDto>();
      for (const n of topology.nodes) {
        nodes.set(n.path, n);
      }
      set({ nodes, edges: topology.edges, isLoading: false });
    } catch (e) {
      console.error("Failed to load topology:", e);
      set({ isLoading: false });
    }
  },

  selectNode: (path: string | null) => {
    set({ selectedNodePath: path });
  },

  expandNode: async (path: string) => {
    const { expandedNodes, nodes, edges } = get();
    if (expandedNodes.has(path)) return;

    try {
      const api = await getAPI();
      const subgraph = await api.getNeighbors(path, 1);

      const newNodes = new Map(nodes);
      for (const n of subgraph.nodes) {
        if (!newNodes.has(n.path)) {
          newNodes.set(n.path, n);
        }
      }

      const existingEdgeKeys = new Set(
        edges.map((e) => `${e.source}|${e.target}|${e.rel}`)
      );
      const newEdges = [...edges];
      for (const e of subgraph.edges) {
        const key = `${e.source}|${e.target}|${e.rel}`;
        if (!existingEdgeKeys.has(key)) {
          newEdges.push(e);
        }
      }

      const newExpanded = new Set(expandedNodes);
      newExpanded.add(path);

      set({ nodes: newNodes, edges: newEdges, expandedNodes: newExpanded });
    } catch (e) {
      console.error("Failed to expand node:", e);
    }
  },

  createNote: (path: string, title: string, note_type: string) => {
    const { nodes } = get();
    const node: NodeDto = { path, title, note_type };
    const newNodes = new Map(nodes);
    newNodes.set(path, node);
    set({ nodes: newNodes, selectedNodePath: path });
  },

  applyEvent: (event: WorkspaceEvent) => {
    const { nodes, edges } = get();

    switch (event.type) {
      case "node-created": {
        const newNodes = new Map(nodes);
        newNodes.set(event.path, event.node);
        set({ nodes: newNodes });
        break;
      }
      case "node-updated": {
        const newNodes = new Map(nodes);
        newNodes.set(event.path, event.node);
        set({ nodes: newNodes });
        break;
      }
      case "node-deleted": {
        const newNodes = new Map(nodes);
        newNodes.delete(event.path);
        const newEdges = edges.filter(
          (e) => e.source !== event.path && e.target !== event.path
        );
        set({ nodes: newNodes, edges: newEdges });
        break;
      }
      case "edge-created": {
        set({ edges: [...edges, event.edge] });
        break;
      }
      case "edge-deleted": {
        const newEdges = edges.filter(
          (e) =>
            !(
              e.source === event.edge.source &&
              e.target === event.edge.target &&
              e.rel === event.edge.rel
            )
        );
        set({ edges: newEdges });
        break;
      }
      case "topology-changed": {
        const newNodes = new Map(nodes);
        for (const path of event.removed_nodes) {
          newNodes.delete(path);
        }
        for (const n of event.added_nodes) {
          newNodes.set(n.path, n);
        }

        const removedKeys = new Set(
          event.removed_edges.map((e) => `${e.source}|${e.target}|${e.rel}`)
        );
        let newEdges = edges.filter(
          (e) => !removedKeys.has(`${e.source}|${e.target}|${e.rel}`)
        );
        newEdges = [...newEdges, ...event.added_edges];

        set({ nodes: newNodes, edges: newEdges });
        break;
      }
    }
  },
}));
```

## 12. crates/app/src/stores/editorStore.ts

```typescript
import { create } from "zustand";
import type { NoteDetail } from "../api/types";
import { getAPI } from "../api/bridge";

interface EditorState {
  activeNote: NoteDetail | null;
  isLoading: boolean;
  isDirty: boolean;
  conflictState: "none" | "external-change";
  editedBody: string | null;

  openNote: (path: string) => Promise<void>;
  updateContent: (body: string) => void;
  saveNote: () => Promise<void>;
  markExternalChange: () => void;
  resolveConflict: (action: "keep-mine" | "accept-theirs") => Promise<void>;
  clear: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  activeNote: null,
  isLoading: false,
  isDirty: false,
  conflictState: "none",
  editedBody: null,

  openNote: async (path: string) => {
    const { activeNote, isDirty } = get();
    if (activeNote?.path === path) return;

    if (isDirty) {
      // Discard unsaved changes when switching notes in v1
      console.warn("Discarding unsaved changes for", activeNote?.path);
    }

    set({ isLoading: true, isDirty: false, conflictState: "none", editedBody: null });
    try {
      const api = await getAPI();
      const note = await api.readNote(path);
      set({ activeNote: note, isLoading: false });
    } catch (e) {
      console.error("Failed to open note:", e);
      set({ isLoading: false });
    }
  },

  updateContent: (body: string) => {
    set({ editedBody: body, isDirty: true });
  },

  saveNote: async () => {
    const { activeNote, editedBody, isDirty } = get();
    if (!activeNote || !isDirty || editedBody === null) return;

    try {
      const api = await getAPI();
      await api.updateNote({ path: activeNote.path, body: editedBody });
      set({
        activeNote: { ...activeNote, body: editedBody },
        isDirty: false,
        editedBody: null,
        conflictState: "none",
      });
    } catch (e) {
      console.error("Failed to save note:", e);
    }
  },

  markExternalChange: async () => {
    const { isDirty, activeNote } = get();
    if (isDirty) {
      set({ conflictState: "external-change" });
    } else if (activeNote) {
      // Auto-reload: bypass openNote's early-return check
      try {
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note, conflictState: "none" });
      } catch (e) {
        console.error("Failed to reload note:", e);
      }
    }
  },

  resolveConflict: async (action: "keep-mine" | "accept-theirs") => {
    if (action === "accept-theirs") {
      const { activeNote } = get();
      if (activeNote) {
        set({ isDirty: false, editedBody: null, conflictState: "none" });
        const api = await getAPI();
        const note = await api.readNote(activeNote.path);
        set({ activeNote: note });
      }
    } else {
      // keep-mine: dismiss the banner, keep editing
      set({ conflictState: "none" });
    }
  },

  clear: () => {
    set({ activeNote: null, isLoading: false, isDirty: false, conflictState: "none", editedBody: null });
  },
}));
```

All 12 files have been successfully read and returned above.

---

