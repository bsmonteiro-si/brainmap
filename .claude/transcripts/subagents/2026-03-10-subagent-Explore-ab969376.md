# 2026-03-10 — Subagent Transcript: Explore

**Date:** 2026-03-10 12:41:29
**Agent:** Explore
**Agent ID:** ab969376169947814
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

Explore the Focus in Graph feature in the BrainMap desktop app (crates/app/). I need to understand:

1. How `graphFocusPath` and `graphFocusKind` are used in `uiStore.ts`
2. The `graphFocusFilter.ts` utility — find it and read it in full
3. How `GraphView.tsx` applies the focus filter (what nodes/edges are shown when focus is active)
4. How the focus is triggered from the Files tree (right-click context menu)
5. What `graphStore.ts` looks like — what data is in `nodes` and `edges`

Specifically: When a folder is focused, does it currently show only notes IN the folder, or notes + their neighbors? I need to understand exactly what subset of nodes is shown.

Read all relevant files in full and report the exact logic used to compute the visible node set when focus is active.

---

## Assistant

I'll help you explore the Focus in Graph feature. Let me start by mapping the codebase structure and reading the relevant files.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app -type f -name \"*.ts\" -o -name \"*.tsx\" | grep -E \"(Store|store|Graph|graph)\" | head -20"}`

---

## Assistant

Now let me read the key files to understand the Focus feature:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx"}`

---

## Assistant

Now let me look at how the focus is triggered from the Files tree:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"*.tsx\" | xargs grep -l \"setGraphFocus\\|contextMenu\\|right-click\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx"}`

---

## Assistant

Now let me check the test file for `graphFocusFilter.ts` to see more examples:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.test.ts"}`

---

## Assistant

Perfect! Now let me check the API types to understand the NodeDto and EdgeDto structures:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src -type f -name \"types.ts\" -o -name \"*.ts\" | xargs grep -l \"NodeDto\\|EdgeDto\" | head -5"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api -type f -name \"*.ts\""}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Perfect! Now I have all the information needed. Let me compile a comprehensive report of my findings.

## Summary: Focus in Graph Feature - Complete Analysis

I've thoroughly explored the Focus in Graph feature in the BrainMap desktop app. Here's the exact logic and how it works:

### 1. **`graphFocusPath` and `graphFocusKind` in `uiStore.ts`**

Located at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`, lines 29-30:

```typescript
graphFocusPath: string | null;
graphFocusKind: "note" | "folder" | null;
```

Two actions manage these:
- **`setGraphFocus(path: string, kind: "note" | "folder")`** (line 134): Sets both fields and atomically sets `treeOpen: false` to hide the Files tab when focus is activated.
- **`clearGraphFocus()`** (line 135): Resets both to null.

### 2. **`graphFocusFilter.ts` Utility - Full Logic**

Located at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts`, this is the core filtering logic:

**For note focus:**
- Shows the focal note + all directly connected neighbors (1-hop distance only)
- Returns edges between these nodes
- Always includes the focal node even if it has zero edges
- Uses `focalPath` to mark which note is the focus

**For folder focus:**
- Shows all notes whose path **starts with `focusPath + "/"`** (note the slash requirement)
- Only includes **intra-folder edges** (both endpoints inside the folder)
- Cross-folder edges are explicitly excluded by design
- Sets `focalPath: null` (no single focal node for folders)

The test file confirms edge cases:
- A file named `"Folder.md"` is NOT included when focusing `"Folder"` because the prefix check requires the slash (`"Folder/"`)
- Empty folders return empty node/edge arrays

### 3. **How `GraphView.tsx` Applies the Focus Filter**

Located at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/GraphView.tsx`, lines 91-96:

```typescript
const { filteredNodes, filteredEdges, focalPath } = useMemo(() => {
  if (!graphFocusPath || !graphFocusKind) {
    return { filteredNodes: [...nodes.values()], filteredEdges: edges, focalPath: null };
  }
  return filterGraphByFocus(nodes, edges, graphFocusPath, graphFocusKind);
}, [graphFocusPath, graphFocusKind, nodes, edges]);
```

Then at lines 204-249:
- `filteredNodes` are converted to Cytoscape node elements
- `filteredEdges` are filtered again to remove edges with hidden edge types (lines 225-230)
- All edges with endpoints not in the visible node set are also filtered out (lines 224-230)
- If `focalPath` is set (note focus only), that node gets the CSS class `"graph-focus-node"` for visual distinction (lines 241-243)

### 4. **Focus Triggered from Files Tree**

Located at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/FileTreePanel.tsx`, lines 137-142:

```typescript
const handleFocusInGraph = () => {
  onClose(); // dismiss menu first
  useUIStore
    .getState()
    .setGraphFocus(state.node.fullPath, state.node.isFolder ? "folder" : "note");
};
```

A context menu appears on right-click with a single option: **"Focus in Graph"**. It determines whether the clicked item is a folder or file (via `state.node.isFolder`) and calls `setGraphFocus` with the appropriate kind.

### 5. **`graphStore.ts` Data Structures**

Located at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts`:

**`nodes`** (lines 20, Map<string, NodeDto>):
- Key: `path` (e.g., `"folder/note.md"`)
- Value: `{ path, title, note_type }`

**`edges`** (line 21, EdgeDto[]):
- Array of `{ source, target, rel, kind }`
- Source and target are node paths
- `rel` is the relationship type (e.g., `"related-to"`, `"contains"`)
- `kind` is `"Explicit"`, `"Implicit"`, or `"Inline"`

---

## **Critical Answer: Folder Focus Behavior**

**When a folder is focused, it shows ONLY notes IN the folder — NOT neighbors.**

The exact behavior:
- **Folder focus**: Shows all notes matching the path prefix `focusPath + "/"` and only intra-folder edges
- **Note focus**: Shows the focal note + all 1-hop neighbors + edges between them (this is different from folder focus)

For example:
- Focusing folder `"Concepts"` shows all notes like `"Concepts/foo.md"`, `"Concepts/bar.md"`, etc., plus edges between them
- If `"Concepts/foo.md"` has an edge to `"Other/baz.md"` (outside the folder), that edge is hidden
- If you instead focused the note `"Concepts/foo.md"` itself, it would show `"Concepts/foo.md"` + all its neighbors in any folder, plus edges connecting them

This is enforced in the filter logic at lines 36-48 of `graphFocusFilter.ts`:

```typescript
const prefix = focusPath + "/";
const folderNodes = [...nodes.values()].filter((n) => n.path.startsWith(prefix));
const folderPaths = new Set(folderNodes.map((n) => n.path));
return {
  filteredNodes: folderNodes,
  filteredEdges: edges.filter(
    (e) => folderPaths.has(e.source) && folderPaths.has(e.target)
  ),
  focalPath: null,
};
```

---

