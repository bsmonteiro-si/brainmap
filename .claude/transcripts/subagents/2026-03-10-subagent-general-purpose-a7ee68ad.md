# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 12:46:41
**Agent:** general-purpose
**Agent ID:** a7ee68adb13cf48fb
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

You are reviewing a TypeScript change for BrainMap, a knowledge graph tool. Review the changed files below.

## Review Criteria (code-reviewer agent)

Find real defects, not style nits. Focus on:
1. **Correctness** - Logic bugs, off-by-one, missed conditions
2. **Edge cases** - Empty sets, duplicate paths, self-referencing edges, notes that are neighbors of each other via multiple edge types
3. **Function Design** - Single responsibility, clear naming
4. **Test Coverage** - Are all new behaviors tested? Are error paths covered?

Severity: [bug, should-fix, suggestion]

For each finding:
- **File**: path and line range
- **Severity**
- **Finding**: what's wrong
- **Fix**: what to do

Skip files with no issues. If solid, say so briefly.

---

## Change: Folder focus now expands to 1-hop neighbors

### `graphFocusFilter.ts` (full file after change)

```ts
import type { NodeDto, EdgeDto } from "../../api/types";

export interface FocusFilterResult {
  filteredNodes: NodeDto[];
  filteredEdges: EdgeDto[];
  /** Path of the focal node when focusing a single note; null for folder focus. */
  focalPath: string | null;
}

/**
 * Derive the subgraph to display when a focus is active.
 *
 * note focus  — shows the focal note + all directly connected neighbors + edges between them.
 * folder focus — shows all notes in the folder + their direct neighbors (1-hop) and all
 *               edges between any visible pair.
 */
export function filterGraphByFocus(
  nodes: Map<string, NodeDto>,
  edges: EdgeDto[],
  focusPath: string,
  focusKind: "note" | "folder"
): FocusFilterResult {
  if (focusKind === "note") {
    const connectedEdges = edges.filter(
      (e) => e.source === focusPath || e.target === focusPath
    );
    const neighborPaths = new Set(connectedEdges.flatMap((e) => [e.source, e.target]));
    // Always include the focal node itself, even if it has no edges.
    neighborPaths.add(focusPath);
    return {
      filteredNodes: [...nodes.values()].filter((n) => neighborPaths.has(n.path)),
      filteredEdges: connectedEdges,
      focalPath: focusPath,
    };
  } else {
    // folder focus: include all notes in the folder + their direct neighbors
    const prefix = focusPath + "/";
    const folderNodes = [...nodes.values()].filter((n) => n.path.startsWith(prefix));
    const folderPaths = new Set(folderNodes.map((n) => n.path));

    // Find all edges connected to any folder note (inbound OR outbound)
    const connectedEdges = edges.filter(
      (e) => folderPaths.has(e.source) || folderPaths.has(e.target)
    );

    // Expand visible set to include neighbor nodes
    const visiblePaths = new Set(folderPaths);
    for (const e of connectedEdges) {
      visiblePaths.add(e.source);
      visiblePaths.add(e.target);
    }

    return {
      filteredNodes: [...nodes.values()].filter((n) => visiblePaths.has(n.path)),
      filteredEdges: edges.filter(
        (e) => visiblePaths.has(e.source) && visiblePaths.has(e.target)
      ),
      focalPath: null,
    };
  }
}
```

### `graphFocusFilter.test.ts` (full file after change)

```ts
import { describe, it, expect } from "vitest";
import { filterGraphByFocus } from "./graphFocusFilter";
import type { NodeDto, EdgeDto } from "../../api/types";

function makeNode(path: string): NodeDto {
  return { path, title: path, note_type: "concept" };
}

function makeEdge(source: string, target: string, rel = "related-to"): EdgeDto {
  return { source, target, rel, kind: "Explicit" };
}

const nodeA = makeNode("a.md");
const nodeB = makeNode("b.md");
const nodeC = makeNode("c.md");
const nodeF1 = makeNode("Folder/x.md");
const nodeF2 = makeNode("Folder/y.md");
const nodeOut = makeNode("Other/z.md");

const edgeAB = makeEdge("a.md", "b.md");
const edgeBC = makeEdge("b.md", "c.md");
const edgeF12 = makeEdge("Folder/x.md", "Folder/y.md");
const edgeCrossFolder = makeEdge("Folder/x.md", "Other/z.md");

function makeMap(...nodes: NodeDto[]): Map<string, NodeDto> {
  return new Map(nodes.map((n) => [n.path, n]));
}

describe("filterGraphByFocus — note", () => {
  it("returns the focal node and direct neighbors", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB, nodeC),
      [edgeAB, edgeBC],
      "a.md",
      "note"
    );
    expect(result.focalPath).toBe("a.md");
    expect(result.filteredNodes.map((n) => n.path).sort()).toEqual(["a.md", "b.md"]);
    expect(result.filteredEdges).toHaveLength(1);
    expect(result.filteredEdges[0]).toBe(edgeAB);
  });

  it("includes the focal node even when it has no edges", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB),
      [],
      "a.md",
      "note"
    );
    expect(result.filteredNodes).toHaveLength(1);
    expect(result.filteredNodes[0].path).toBe("a.md");
    expect(result.filteredEdges).toHaveLength(0);
    expect(result.focalPath).toBe("a.md");
  });

  it("returns empty nodes and edges when focal path does not exist in map", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB),
      [edgeAB],
      "nonexistent.md",
      "note"
    );
    expect(result.focalPath).toBe("nonexistent.md");
    expect(result.filteredNodes).toHaveLength(0);
    expect(result.filteredEdges).toHaveLength(0);
  });

  it("includes edges where focal node is the target", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB, nodeC),
      [edgeAB, edgeBC],
      "b.md",
      "note"
    );
    expect(result.filteredNodes.map((n) => n.path).sort()).toEqual(["a.md", "b.md", "c.md"]);
    expect(result.filteredEdges).toHaveLength(2);
  });
});

describe("filterGraphByFocus — folder", () => {
  it("returns folder notes, their neighbors, and all edges between them", () => {
    const result = filterGraphByFocus(
      makeMap(nodeF1, nodeF2, nodeOut),
      [edgeF12, edgeCrossFolder],
      "Folder",
      "folder"
    );
    expect(result.focalPath).toBeNull();
    expect(result.filteredNodes.map((n) => n.path).sort()).toEqual([
      "Folder/x.md",
      "Folder/y.md",
      "Other/z.md",
    ]);
    expect(result.filteredEdges).toHaveLength(2);
  });

  it("includes edges between two neighbors if both are visible", () => {
    const nodeOut2 = makeNode("Other/w.md");
    const edgeF2Out2 = makeEdge("Folder/y.md", "Other/w.md");
    const edgeOutOut2 = makeEdge("Other/z.md", "Other/w.md");
    const result = filterGraphByFocus(
      makeMap(nodeF1, nodeF2, nodeOut, nodeOut2),
      [edgeF12, edgeCrossFolder, edgeF2Out2, edgeOutOut2],
      "Folder",
      "folder"
    );
    expect(result.filteredNodes).toHaveLength(4);
    expect(result.filteredEdges).toHaveLength(4);
  });

  it("returns empty arrays for an empty folder", () => {
    const result = filterGraphByFocus(
      makeMap(nodeA, nodeB),
      [edgeAB],
      "EmptyFolder",
      "folder"
    );
    expect(result.filteredNodes).toHaveLength(0);
    expect(result.filteredEdges).toHaveLength(0);
  });

  it("does not match a file whose path starts with the folder name but no slash", () => {
    const folderMd = makeNode("Folder.md");
    const result = filterGraphByFocus(
      makeMap(nodeF1, folderMd),
      [],
      "Folder",
      "folder"
    );
    expect(result.filteredNodes.map((n) => n.path)).toEqual(["Folder/x.md"]);
  });
});
```

Write your review to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/folder-focus-expansion-review-1.md`

---

## Assistant

I'll review the TypeScript change for the folder focus expansion feature.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"Ensure review`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/folder-focus-expansion-review-1.md","content":"# Code Review: Folder Focus Expansion\n\n**Change**: `graphFocusFilter.ts``

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/folder-focus-expansion-review-1.md`.

---

**Summary of findings:**

**Bug (1)**

- `graphFocusFilter.ts`, folder branch: `filteredEdges` is re-derived from the full `edges` array rather than from the already-computed `connectedEdges`. In the common case the results are identical, but if the `edges` array contains ghost edges (endpoints not present in the `nodes` Map), two neighbor nodes could both land in `visiblePaths` via separate folder-note paths, causing those ghost edges to appear in `filteredEdges` while neither ghost node appears in `filteredNodes`. The fix is one line: filter `connectedEdges` instead of `edges` for the final `filteredEdges` result.

**Should-fix (2)**

- No test covers a self-referencing edge (self-loop) on a folder note. This is the simplest way to trigger the ghost-edge inconsistency described above and should be a test case.
- The test "includes edges between two neighbors if both are visible" asserts `filteredEdges` length 4, which silently encodes that inter-neighbor edges are intentionally included. The test should carry an inline comment making this design choice explicit so future readers don't remove the behavior thinking it's a bug.

**Suggestions (3)**

- JSDoc on the note branch says "edges between them" but means "edges incident to the focal note" — minor clarity fix.
- No guard against a trailing slash on `focusPath`; a double-slash prefix silently matches nothing.
- No test for multiple edges between the same pair of notes (different `rel` values), a realistic scenario given 15 edge types.

---

