# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 12:48:37
**Agent:** general-purpose
**Agent ID:** a67cebd2585646881
**Parent Session:** 72b750a5-bf77-4d9c-9323-707b5b14b58d

---

## User

Second-pass code review for BrainMap's graphFocusFilter. The first pass found a bug and two should-fix items which were fixed. Confirm the fixes are correct and no new issues were introduced.

## First pass findings that were fixed:
1. Bug: `filteredEdges` was derived from full `edges` array, risking ghost-edge inconsistency → FIXED by computing `filteredNodes` first, building `filteredNodePaths` from it, then filtering `edges` against `filteredNodePaths`
2. Should-fix: Missing self-loop test → FIXED by adding the test
3. Should-fix: Inter-neighbor edge test needed a comment explaining the intentional behavior → FIXED

## Updated files

### `graphFocusFilter.ts` (folder branch only, after fix)

```ts
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

    // Derive filteredNodes from the Map so ghost paths (in visiblePaths but absent from
    // the nodes Map) are never included. Then derive filteredEdges from filteredNodes to
    // keep both sets consistent.
    const filteredNodes = [...nodes.values()].filter((n) => visiblePaths.has(n.path));
    const filteredNodePaths = new Set(filteredNodes.map((n) => n.path));
    return {
      filteredNodes,
      filteredEdges: edges.filter(
        (e) => filteredNodePaths.has(e.source) && filteredNodePaths.has(e.target)
      ),
      focalPath: null,
    };
  }
```

### New/modified tests in `graphFocusFilter.test.ts`

```ts
  it("includes edges between two neighbors if both are visible", () => {
    const nodeOut2 = makeNode("Other/w.md");
    const edgeF2Out2 = makeEdge("Folder/y.md", "Other/w.md");
    // edgeOutOut2 connects two non-folder neighbors — intentionally included because
    // both endpoints are visible (each was pulled in by a separate folder-note edge).
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

  it("handles a self-loop on a folder note without duplicating nodes", () => {
    const selfLoop = makeEdge("Folder/x.md", "Folder/x.md");
    const result = filterGraphByFocus(
      makeMap(nodeF1, nodeF2),
      [edgeF12, selfLoop],
      "Folder",
      "folder"
    );
    expect(result.filteredNodes).toHaveLength(2);
    expect(result.filteredEdges).toHaveLength(2);
  });
```

Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/folder-focus-expansion-review-1-pass-2.md`. Only report bug or should-fix severity findings. If clean, say so.

---

## Assistant

I'll review the fixes carefully by examining the actual implementation files.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"**/graphFocusFilter*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphFocusFilter.test.ts"}`

---

## Assistant

Now I have the full picture. Let me verify the logic carefully against each fix and check for any new issues introduced.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"directory does not exist\"","description":"Check if reviews/code directory exists"}`

---

## Assistant

Now I have everything I need to do a thorough second-pass review. Let me trace through each fix and the code carefully.

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/folder-focus-expansion-review-1-pass-2.md","content":"# Code Review — folder-focus-expansion pass 2\n\nReviewer: Claude (`

---

## Assistant

Second pass is clean. Here is what was verified:

**Fix 1 (Bug — ghost edges):** Correct. The implementation now builds `filteredNodes` from the `nodes` Map first, derives `filteredNodePaths` from that (not from the raw `visiblePaths` string set), and then filters `edges` using a conjunction (`&&`) requiring both endpoints to be in `filteredNodePaths`. This eliminates any possibility of an edge referencing a node absent from the Map.

**Fix 2 (Should-fix — self-loop test):** Correct. The self-loop adds the same path to `visiblePaths` twice, but `Set` deduplicates it, so node count stays 2. Both endpoints of the self-loop are present in `filteredNodePaths`, so the `&&` filter passes it through, giving edge count 2. Expected values in the test match.

**Fix 3 (Should-fix — inter-neighbor edge comment):** Correct. The comment accurately explains that `edgeOutOut2` appears because both `Other/z.md` and `Other/w.md` were each independently pulled into `visiblePaths` by distinct folder-note edges, making both endpoints present in `filteredNodePaths`.

The note-focus branch was also inspected — no changes were made to it and it has no ghost-edge exposure.

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/folder-focus-expansion-review-1-pass-2.md`.

---

