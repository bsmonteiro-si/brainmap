# 2026-03-09 — Subagent Transcript: Plan

**Date:** 2026-03-09 17:41:19
**Agent:** Plan
**Agent ID:** acd566283d7edd341
**Parent Session:** ba732d96-401a-4b82-b69a-43c622866e5c

---

## User

You are designing the Tauri API mock layer for BrainMap's desktop app to enable browser-based UI development and testing.

## Problem

BrainMap is building a Tauri v2 desktop app (React + TypeScript frontend). During development, the UI needs to run in a regular Chrome browser (via Vite dev server on localhost) so that an AI assistant can interact with it using browser automation tools. But Tauri's `invoke()` API and event system won't work outside the Tauri runtime.

## Requirements

1. When running in Tauri (`window.__TAURI__` exists): use real Tauri invoke/events
2. When running in browser (`window.__TAURI__` is undefined): use mock layer with test data
3. The mock layer should return realistic data from the seed dataset (34 notes about "The Book of Why")
4. The mock should support all operations the frontend needs: workspace open, node CRUD, search, graph queries, link operations
5. File watcher events should be simulatable in mock mode
6. The abstraction should be thin — no heavy mock framework

## Seed Dataset Info

The seed dataset has 34 notes in these directories:
- Concepts/ (causal inference, counterfactual reasoning, etc.)
- People/ (Judea Pearl, etc.)
- Evidence/ 
- Experiments/
- Questions/
- Arguments/
- Projects/
- The Book of Why/ (chapter notes)

Note types: concept, book-note, question, reference, index, argument, evidence, experiment, person, project
Edge types: contains, causes, supports, contradicts, extends, depends-on, exemplifies, related-to, authored-by, sourced-from, etc.

## Core API Methods to Mock

From `workspace.rs`:
- `open(path)` → workspace metadata
- `create_note(...)` → path
- `read_note(path)` → Note (frontmatter + body)
- `update_note(path, ...)` → void
- `delete_note(path, force)` → void
- `move_note(old, new)` → affected paths
- `create_link(source, target, rel, annotation)` → void
- `delete_link(source, target, rel)` → void
- `list_nodes(type?, tag?, status?)` → Vec<Note>
- `list_links(path, direction, rel?)` → Vec<Edge>
- `search(query, filters)` → Vec<SearchResult>
- `find_path(source, target, max_depth?)` → Vec<Edge>
- `get_subgraph(center, depth, rel_filter?)` → Subgraph
- `stats()` → WorkspaceStats
- `validate()` → Vec<ValidationIssue>
- `reindex()` → void

Plus the graph topology (nodes with positions, edges with types) for initial load.

## Design Questions to Address

1. Where does the mock layer live in the project structure?
2. How is the mock data structured (static JSON? generated at build time from seed?)
3. How does the frontend code call the abstraction (service layer pattern?)
4. How are Tauri events mocked (EventEmitter pattern?)
5. How do mutations work in mock mode (in-memory state? or read-only?)
6. Should the mock support simulating delays to test loading states?
7. How do we handle type sharing between mock and real implementations?

Provide a concrete architecture with file structure, key interfaces, and implementation approach.

---

## Assistant



I'll explore the existing codebase to understand the current architecture, data model, and seed dataset before designing the mock layer.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

Now let me look at the seed dataset and existing tauri plugin structure.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/","description":"List seed dataset directories"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/ 2>/dev/null || echo \"empty or missing\"","description":"Check tauri plugin crate structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/seed -name \"*.md\" | head -40","description":"List all seed markdown files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs"}`

---

## Assistant

Let me look at a few seed files and the existing tauri plugin stub to understand the full picture.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causal Inference.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/src/","description":"List tauri plugin source files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/tauri-plugin/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/export.rs"}`

---

## Assistant

Now let me look at a couple more seed files to understand the data diversity, and check the docs for any desktop app specs.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/docs/","description":"List docs directory"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/output.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/05-desktop-app.md"}`

---

## Assistant

Now let me check the architecture doc for the Tauri IPC details.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md"}`

---

## Assistant

Now I have a thorough understanding of the codebase. Let me check one more seed file to see the full breadth of data shapes.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/People/Judea Pearl.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/The Book of Why/The Book of Why.md"}`

---

## Assistant

I now have a complete picture. Let me present the architecture.

---

## Tauri API Mock Layer -- Architecture Plan

### 1. Problem Statement

The BrainMap desktop app uses Tauri v2 (Rust backend + React frontend). During development, the UI must run in a plain Chrome browser via `localhost:5173` (Vite dev server) so that an AI assistant can interact with it through browser automation. Tauri's `invoke()` and event system are unavailable outside the Tauri webview, so a mock layer must stand in.

### 2. Where the Mock Layer Lives

All mock layer code lives inside the frontend source tree, colocated with the real Tauri bridge code. No separate npm package, no build-time code generation. The directory structure within the planned `app/src/` frontend:

```
app/src/
  api/
    types.ts              # Shared TypeScript interfaces (generated from Rust via ts-rs/specta)
    bridge.ts             # Runtime detection + unified API export
    tauri.ts              # Real Tauri invoke/event wrappers
    mock/
      index.ts            # Mock backend class implementing the same interface
      state.ts            # In-memory mutable state (notes map, edges list)
      data/
        notes.json        # Seed dataset pre-extracted as JSON (34 notes)
        edges.json        # All edges (explicit + implicit) pre-extracted
        graph.json        # Full graph topology with pre-computed positions
      delay.ts            # Configurable delay simulator
      events.ts           # Mock event emitter (file watcher simulation)
```

### 3. How Mock Data Is Structured

The mock data is **static JSON files** generated once by running the Rust core against the seed dataset and serializing the output. This avoids any build-time Rust dependency for frontend developers.

Generation approach (a one-time CLI command, not part of the build):

```bash
cargo run -p brainmap-cli -- export-mock-data /path/to/seed /path/to/app/src/api/mock/data/
```

This command would:
1. Open the seed workspace
2. Serialize all notes (frontmatter + body) to `notes.json`
3. Serialize all edges to `edges.json`
4. Serialize the full graph topology (with positions from `fdg` layout) to `graph.json`

The JSON shape mirrors the Rust structs exactly, since both the real Tauri bridge and the mock will use the same TypeScript types.

**`notes.json` structure** (array, keyed by path):
```typescript
{
  "Concepts/Causal Inference.md": {
    path: "Concepts/Causal Inference.md",
    frontmatter: {
      id: "a0000001-...",
      title: "Causal Inference",
      note_type: "concept",
      tags: ["causality", "inference", "methodology", "foundations"],
      status: "review",
      created: "2026-01-18",
      modified: "2026-03-05",
      source: "The Book of Why, Introduction + Ch1",
      summary: "The science of drawing conclusions about causal relationships...",
      links: [
        { target: "./Do-Calculus.md", rel: "contains" },
        // ...
      ],
      extra: { domain: "causal-ml", maturity: "foundational", aliases: [...] }
    },
    body: "# Causal Inference\n\nCausal inference is the science of..."
  },
  // ... 33 more notes
}
```

**`edges.json` structure** (flat array):
```typescript
[
  { source: "Concepts/Causal Inference.md", target: "Concepts/Do-Calculus.md", rel: "contains", kind: "Explicit" },
  { source: "The Book of Why/The Book of Why.md", target: "The Book of Why/Ch1 - .../Ch1 - ....md", rel: "contains", kind: "Implicit" },
  // ...
]
```

**`graph.json` structure** (for initial graph render):
```typescript
{
  nodes: [
    { path: "Concepts/Causal Inference.md", title: "Causal Inference", note_type: "concept", x: 120.5, y: -34.2 },
    // ...
  ],
  edges: [
    { source: "Concepts/Causal Inference.md", target: "Concepts/Do-Calculus.md", rel: "contains", kind: "Explicit" },
    // ...
  ]
}
```

### 4. The Service Layer (bridge.ts)

The frontend never calls `invoke()` directly. It calls a service interface. Runtime detection picks the implementation.

**`app/src/api/types.ts`** -- shared types:

```typescript
// These would be auto-generated from Rust via ts-rs, but defined manually for mock parity.

export interface Note {
  path: string;
  frontmatter: Frontmatter;
  body: string;
  inline_links: InlineLink[];
}

export interface Frontmatter {
  id: string;
  title: string;
  note_type: string;
  tags: string[];
  status: string | null;
  created: string;
  modified: string;
  source: string | null;
  summary: string | null;
  links: TypedLink[];
  extra: Record<string, unknown>;
}

export interface TypedLink {
  target: string;
  rel: string;
  annotation?: string;
}

export interface Edge {
  source: string;
  target: string;
  rel: string;
  kind: "Explicit" | "Implicit" | "Inline";
}

export interface NodeData {
  path: string;
  title: string;
  note_type: string;
}

export interface Subgraph {
  nodes: NodeData[];
  edges: Edge[];
}

export interface GraphTopology extends Subgraph {
  nodes: (NodeData & { x: number; y: number })[];
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

export interface WorkspaceStats {
  node_count: number;
  edge_count: number;
  nodes_by_type: Record<string, number>;
  edges_by_rel: Record<string, number>;
  edges_by_kind: Record<string, number>;
  orphan_count: number;
}

export interface ValidationIssue {
  severity: "Error" | "Warning";
  message: string;
  path: string | null;
}

export type WorkspaceEvent =
  | { type: "node-created"; path: string; node: NodeData }
  | { type: "node-updated"; path: string; node: NodeData }
  | { type: "node-deleted"; path: string }
  | { type: "edge-created"; edge: Edge }
  | { type: "edge-deleted"; edge: Edge }
  | { type: "reindexed" };
```

**`app/src/api/bridge.ts`** -- the API contract:

```typescript
export interface BrainMapAPI {
  // Workspace
  openWorkspace(path: string): Promise<{ name: string; root: string }>;
  getStats(): Promise<WorkspaceStats>;
  validate(): Promise<ValidationIssue[]>;
  reindex(): Promise<void>;

  // Graph topology (for initial load)
  getGraphTopology(): Promise<GraphTopology>;

  // Node CRUD
  createNote(path: string, title: string, noteType: string, opts?: CreateNoteOpts): Promise<string>;
  readNote(path: string): Promise<Note>;
  updateNote(path: string, updates: UpdateNoteOpts): Promise<void>;
  deleteNote(path: string, force?: boolean): Promise<void>;
  listNodes(filters?: { type?: string; tag?: string; status?: string }): Promise<Note[]>;

  // Link CRUD
  createLink(source: string, target: string, rel: string, annotation?: string): Promise<void>;
  deleteLink(source: string, target: string, rel: string): Promise<void>;
  listLinks(path: string, direction: "Outgoing" | "Incoming" | "Both", rel?: string): Promise<Edge[]>;

  // Search
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>;

  // Graph queries
  getSubgraph(center: string, depth: number, relFilter?: string): Promise<Subgraph>;
  findPath(source: string, target: string, maxDepth?: number): Promise<Edge[] | null>;

  // Events
  onEvent(callback: (event: WorkspaceEvent) => void): () => void;  // returns unsubscribe fn
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

let api: BrainMapAPI;

export function getAPI(): BrainMapAPI {
  if (!api) {
    if (isTauri()) {
      // Lazy import to avoid loading Tauri code in browser
      const { TauriBridge } = require("./tauri");
      api = new TauriBridge();
    } else {
      const { MockBridge } = require("./mock");
      api = new MockBridge();
    }
  }
  return api;
}
```

### 5. The Real Tauri Implementation (tauri.ts)

Thin wrapper around Tauri's `invoke()`:

```typescript
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export class TauriBridge implements BrainMapAPI {
  async openWorkspace(path: string) {
    return invoke<{ name: string; root: string }>("open_workspace", { path });
  }
  async readNote(path: string) {
    return invoke<Note>("get_node", { path });
  }
  // ... each method is a one-liner invoke() call

  onEvent(callback: (event: WorkspaceEvent) => void): () => void {
    const unlisten = listen<WorkspaceEvent>("brainmap://workspace-event", (e) => {
      callback(e.payload);
    });
    return () => { unlisten.then(fn => fn()); };
  }
}
```

### 6. The Mock Implementation (mock/index.ts + mock/state.ts)

**`mock/state.ts`** -- mutable in-memory state:

```typescript
// Loads JSON at import time, then provides a mutable copy
import notesData from "./data/notes.json";
import edgesData from "./data/edges.json";
import graphData from "./data/graph.json";

export class MockState {
  notes: Map<string, Note>;
  edges: Edge[];
  positions: Map<string, { x: number; y: number }>;

  constructor() {
    // Deep clone so mutations don't affect the imported module
    this.notes = new Map(Object.entries(structuredClone(notesData)));
    this.edges = structuredClone(edgesData);
    this.positions = new Map(
      graphData.nodes.map(n => [n.path, { x: n.x, y: n.y }])
    );
  }

  reset() {
    // Re-clone from original data -- useful for tests
    this.notes = new Map(Object.entries(structuredClone(notesData)));
    this.edges = structuredClone(edgesData);
  }
}
```

**`mock/index.ts`** -- implements `BrainMapAPI` against `MockState`:

Mutations are fully functional (in-memory). When you call `createNote`, the note is added to the map, a new edge is not, etc. This supports full UI development including create/delete flows.

Key behaviors:
- `openWorkspace()` returns `{ name: "The Book of Why", root: "/mock/seed" }`
- `readNote(path)` looks up from `state.notes`
- `listNodes(filters)` filters the notes map by type/tag/status
- `search(query)` does a simple case-insensitive substring match on title, body, tags, and summary -- no FTS5 needed for mock
- `getSubgraph(center, depth)` does a BFS on `state.edges` -- reimplements the graph traversal in ~30 lines of TypeScript
- `createNote(...)` adds to `state.notes`, emits a `node-created` event
- `deleteNote(path)` removes from `state.notes` and `state.edges`, emits `node-deleted`
- `createLink(...)` adds to `state.edges` and to the source note's `frontmatter.links`, emits `edge-created`

### 7. Mock Event System (mock/events.ts)

Simple `EventTarget` or callback list pattern:

```typescript
type Listener = (event: WorkspaceEvent) => void;

class MockEventBus {
  private listeners: Set<Listener> = new Set();

  subscribe(callback: Listener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(event: WorkspaceEvent) {
    this.listeners.forEach(cb => cb(event));
  }

  // Simulate file watcher: external file change after N ms
  simulateFileChange(path: string, delayMs = 2000) {
    setTimeout(() => {
      const note = state.notes.get(path);
      if (note) {
        this.emit({ type: "node-updated", path, node: { path, title: note.frontmatter.title, note_type: note.frontmatter.note_type } });
      }
    }, delayMs);
  }
}
```

The `MockBridge.onEvent()` method delegates to this bus. All mock mutation methods (create, update, delete) emit through it.

### 8. Configurable Delays (mock/delay.ts)

```typescript
const MOCK_DELAYS: Record<string, number> = {
  openWorkspace: 800,   // Simulate workspace loading
  search: 150,          // Simulate index query
  readNote: 50,         // Fast
  createNote: 200,      // Write + reindex
  getGraphTopology: 400, // Large payload
  default: 30,
};

export function mockDelay(operation: string): Promise<void> {
  const ms = MOCK_DELAYS[operation] ?? MOCK_DELAYS.default;
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

Each mock method calls `await mockDelay("readNote")` before returning, so the UI can be tested with loading spinners and skeleton placeholders.

### 9. Design Decisions Summary

| Question | Decision | Rationale |
|----------|----------|-----------|
| Where does mock live? | `app/src/api/mock/` | Colocated with real bridge; tree-shaken in production build |
| Mock data format? | Static JSON, generated once from seed via CLI | No build-time Rust dependency; deterministic; editable |
| Frontend API pattern? | Interface + runtime detection | One import path (`getAPI()`); no `if/else` scattered through components |
| Tauri events mocked? | Callback-based `MockEventBus` | Same `onEvent()` contract; supports file watcher simulation |
| Mutations in mock? | Full in-memory state | Enables testing create/delete/update flows end-to-end in browser |
| Delays? | Configurable per-operation | Tests loading states without real I/O |
| Type sharing? | Single `types.ts` file | Auto-generated from Rust in real builds; manually maintained for mock parity |
| Mock search? | Substring match | Good enough for UI dev; no need to reimplement FTS5 in JS |
| Graph traversal in mock? | Simple BFS in TypeScript | ~30 lines; `getSubgraph` and `findPath` work correctly |

### 10. Implementation Sequence

**Step 1: Types and interface** -- Create `types.ts` and `bridge.ts` with the `BrainMapAPI` interface. No implementation yet.

**Step 2: Mock data generation** -- Add an `export-mock-data` subcommand to `brainmap-cli` that opens the seed workspace and writes three JSON files. This is a thin wrapper around the existing `Workspace::open()` + serialization.

**Step 3: Mock state and event bus** -- Implement `mock/state.ts` (loads JSON, provides mutable map), `mock/events.ts` (callback list), and `mock/delay.ts`.

**Step 4: Mock bridge** -- Implement `mock/index.ts` with all `BrainMapAPI` methods against `MockState`. Graph traversal (BFS for `getSubgraph`, `findPath`) is the most code-intensive part but straightforward.

**Step 5: Real Tauri bridge stub** -- Implement `tauri.ts` as thin `invoke()` wrappers. This can be a skeleton initially, filled in when the Tauri plugin commands are built.

**Step 6: Integration** -- Wire `bridge.ts` into the Zustand stores (`graphStore.ts`, `workspaceStore.ts`) so all data flows through the API layer.

### 11. Potential Challenges

**Path resolution in mock**: The seed dataset uses relative paths in links (`"../Concepts/Do-Calculus.md"`). The JSON export must resolve these to absolute-relative paths (e.g., `"Concepts/Do-Calculus.md"`) since the mock has no filesystem directory context. The existing `RelativePath::resolve_relative()` already handles this during `Workspace::open()`, so the edges in the serialized graph will already have resolved paths.

**Mock search fidelity**: Substring matching will not produce the same ranking as FTS5. This is acceptable for UI development. If fidelity matters, a lightweight JS search library like Fuse.js (~6KB) could be added, but it is not necessary for the initial implementation.

**JSON file size**: 34 notes with full body text will produce a `notes.json` of roughly 50-80KB. This is trivially small and fine to bundle.

**Tree-shaking the mock in production**: The dynamic `require()` in `bridge.ts` should be replaced with dynamic `import()` so that bundlers can split the mock code into a separate chunk that is never loaded in Tauri builds. Alternatively, use a Vite define/env variable (`VITE_MOCK_API=true`) to statically switch at build time.

---

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` - The complete API surface to mirror in TypeScript; every mock method maps to a method here
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` - All Rust types (Note, Edge, Frontmatter, etc.) that must be replicated as TypeScript interfaces in types.ts
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs` - Graph traversal logic (BFS neighbors, shortest_path, subgraph) to reimplement in ~30 lines of TypeScript for the mock
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/export.rs` - Existing JSON serialization patterns for graph data; the mock data generator can reuse/extend this
- `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/06-architecture.md` - Defines the Tauri IPC strategy, event model, and command surface area that the bridge interface must match

---

