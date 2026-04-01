# 2026-03-10 — Subagent Transcript: general-purpose

**Date:** 2026-03-10 15:25:57
**Agent:** general-purpose
**Agent ID:** a98708662cb81b8c7
**Parent Session:** a8921ebf-3950-4995-ac82-e6379de698cd

---

## User

You are reviewing a TypeScript/React + CSS change for BrainMap (a knowledge graph desktop app). Review the changed files below and write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/files-view-polish-review-1.md`.

## Code Reviewer Criteria

You are reviewing frontend (TypeScript/React/CSS) code for BrainMap. Your job is to find real defects, not style nits.

### What to Review

1. **Correctness** — Logic bugs, missed conditions, broken interactions
2. **TypeScript quality** — Proper types, no unsafe `any`, no unnecessary casts
3. **React quality** — Correct hook usage, no stale closures, key prop correctness
4. **CSS quality** — Missing fallbacks, broken layout, specificity conflicts
5. **Accessibility** — aria attributes used correctly, focus management
6. **No regressions** — Does the change break anything that was working before?

### Output Format

Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

If there are no issues, say so briefly.

Do NOT report missing comments, style preferences that don't affect correctness.

---

## Changed Files

### `crates/app/src/components/Layout/FileTreePanel.tsx` (full content after change):

```tsx
import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import type { NodeDto } from "../../api/types";

interface TreeNode {
  name: string;
  fullPath: string;
  title: string;
  isFolder: boolean;
  children: TreeNode[];
  note_type?: string;
}

function buildTree(nodes: Map<string, NodeDto>): TreeNode[] {
  const folderMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  function getOrCreateFolder(parts: string[], depth: number): TreeNode {
    const fullPath = parts.slice(0, depth + 1).join("/");
    if (!folderMap.has(fullPath)) {
      const node: TreeNode = {
        name: parts[depth],
        fullPath,
        title: parts[depth],
        isFolder: true,
        children: [],
      };
      folderMap.set(fullPath, node);
      if (depth === 0) {
        roots.push(node);
      } else {
        const parentPath = parts.slice(0, depth).join("/");
        folderMap.get(parentPath)!.children.push(node);
      }
    }
    return folderMap.get(fullPath)!;
  }

  for (const [path, nodeData] of nodes) {
    const parts = path.replace(/\.md$/, "").split("/");

    if (parts.length === 1) {
      roots.push({
        name: parts[0],
        fullPath: path,
        title: nodeData.title,
        isFolder: false,
        children: [],
        note_type: nodeData.note_type,
      });
    } else {
      for (let i = 0; i < parts.length - 1; i++) {
        getOrCreateFolder(parts, i);
      }
      const parentPath = parts.slice(0, parts.length - 1).join("/");
      folderMap.get(parentPath)!.children.push({
        name: parts[parts.length - 1],
        fullPath: path,
        title: nodeData.title,
        isFolder: false,
        children: [],
        note_type: nodeData.note_type,
      });
    }
  }

  function sortChildren(items: TreeNode[]): TreeNode[] {
    return [...items]
      .sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({ ...n, children: sortChildren(n.children) }));
  }

  return sortChildren(roots);
}

function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  return nodes.flatMap((n) => {
    if (!n.isFolder) {
      return n.title.toLowerCase().includes(q) ? [n] : [];
    }
    const filteredChildren = filterTree(n.children, q);
    return filteredChildren.length > 0 ? [{ ...n, children: filteredChildren }] : [];
  });
}

const MENU_WIDTH = 180;

interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNode;
}

function ContextMenu({
  state,
  onClose,
}: {
  state: ContextMenuState;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [clampedPos, setClampedPos] = useState({ x: state.x, y: state.y });

  useLayoutEffect(() => {
    const menuHeight = menuRef.current?.offsetHeight ?? 60;
    setClampedPos({
      x: Math.min(state.x, window.innerWidth - MENU_WIDTH - 8),
      y: Math.min(state.y, window.innerHeight - menuHeight - 8),
    });
  }, [state.x, state.y]);

  const { x, y } = clampedPos;

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleFocusInGraph = () => {
    onClose();
    useUIStore
      .getState()
      .setGraphFocus(state.node.fullPath, state.node.isFolder ? "folder" : "note");
  };

  return (
    <div ref={menuRef} className="context-menu" style={{ left: x, top: y }}>
      <div className="context-menu-item" onClick={handleFocusInGraph}>
        Focus in Graph
      </div>
    </div>
  );
}

function FileTreeNode({
  node,
  depth,
  onContextMenu,
}: {
  node: TreeNode;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
}) {
  const selectedNodePath = useGraphStore((s) => s.selectedNodePath);
  const treeExpandedFolders = useUIStore((s) => s.treeExpandedFolders);
  const toggleFolder = useUIStore((s) => s.toggleFolder);

  if (node.isFolder) {
    const isExpanded = treeExpandedFolders.has(node.fullPath);
    return (
      <div>
        <div
          className="tree-item tree-folder"
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={() => toggleFolder(node.fullPath)}
          onContextMenu={(e) => onContextMenu(e, node)}
        >
          <span className={`tree-chevron${isExpanded ? " tree-chevron--open" : ""}`} aria-hidden="true" />
          {node.name}
        </div>
        {isExpanded &&
          node.children.map((c) => (
            <FileTreeNode key={c.fullPath} node={c} depth={depth + 1} onContextMenu={onContextMenu} />
          ))}
      </div>
    );
  }

  const isActive = selectedNodePath === node.fullPath;
  return (
    <div
      className={`tree-item tree-file ${isActive ? "active" : ""}`}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
      onClick={() => {
        useGraphStore.getState().selectNode(node.fullPath);
        useEditorStore.getState().openNote(node.fullPath);
      }}
      onContextMenu={(e) => onContextMenu(e, node)}
    >
      <span className={`tree-type-dot${node.note_type ? ` dot-${node.note_type}` : ""}`} aria-hidden="true" />
      {node.title}
    </div>
  );
}

export function FileTreePanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const [filter, setFilter] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const tree = useMemo(() => buildTree(nodes), [nodes]);

  useEffect(() => {
    setFilter("");
  }, [nodes]);

  const filtered = filter.trim() ? filterTree(tree, filter.toLowerCase()) : tree;

  const handleContextMenu = (e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  return (
    <div className="file-tree-panel">
      <div className="file-tree-search">
        <span className="file-tree-search-icon" aria-hidden="true">⌕</span>
        <input
          className="file-tree-search-input"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="file-tree-content">
        {filtered.map((n) => (
          <FileTreeNode key={n.fullPath} node={n} depth={0} onContextMenu={handleContextMenu} />
        ))}
      </div>
      {contextMenu && (
        <ContextMenu state={contextMenu} onClose={() => setContextMenu(null)} />
      )}
    </div>
  );
}
```

### CSS changes in `crates/app/src/App.css` (replaced section):

```css
/* ── Left Panel Tabs ──────────────────────────────────────────── */
.left-panel-tabs {
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  padding: 0 4px;
  gap: 2px;
}
.left-panel-tab {
  padding: 5px 10px;
  font-size: var(--ui-font-xs);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-align: center;
  background: none;
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  color: var(--text-muted);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.12s;
}
.left-panel-tab:hover {
  color: var(--text-primary);
}
.left-panel-tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent);
}

/* ── File Tree ────────────────────────────────────────────────── */
.file-tree-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
}
.file-tree-search {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-primary);
}
.file-tree-search-icon {
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
}
.file-tree-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: var(--ui-font-sm);
  color: var(--text-primary);
  padding: 0;
}
.file-tree-search-input::placeholder {
  color: var(--text-muted);
}
.file-tree-content {
  flex: 1;
  overflow: auto;
  padding: 4px 0;
}
.tree-item {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding-right: 8px;
  font-size: var(--ui-font-sm);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
  border-left: 2px solid transparent;
  position: relative;
  user-select: none;
}
.tree-item:hover {
  background: var(--bg-secondary);
}
.tree-item.active {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-left-color: var(--accent);
  color: var(--text-primary);
}
.tree-folder {
  color: var(--text-secondary);
  font-weight: 500;
}
.tree-chevron {
  display: inline-block;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  position: relative;
}
.tree-chevron::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid var(--text-muted);
  position: absolute;
  top: 50%;
  left: 2px;
  transform: translateY(-50%);
  transition: transform 0.15s ease;
}
.tree-chevron--open::before {
  transform: translateY(-50%) rotate(90deg);
}
.tree-type-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--text-muted);
}
.dot-concept        { background: #4a9eff; }
.dot-book-note      { background: #f39c12; }
.dot-question       { background: #9b59b6; }
.dot-reference      { background: #7f8c8d; }
.dot-index          { background: #1abc9c; }
.dot-argument       { background: #e74c3c; }
.dot-evidence       { background: #27ae60; }
.dot-experiment     { background: #e67e22; }
.dot-person         { background: #e91e63; }
.dot-project        { background: #00bcd4; }
```

Write your findings to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/files-view-polish-review-1.md`.

---

## Assistant

I'll review the changed files and write my findings to the specified location.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || mkdir -p /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/","description":"Check or crea`

---

## Assistant

Now let me look at the existing codebase for context before writing the review:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/**/*.tsx"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/*.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/AppLayout.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

Now I have enough context to write a thorough review. Let me write the findings:

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/files-view-polish-review-1.md","content":"# Code Review: Files View Polish\n\n**Date**: 2026-03-10\n**Files reviewed**:\n`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/files-view-polish-review-1.md`.

Here is a summary of the findings:

**Bugs**

1. Non-null assertions (`!`) in `buildTree`'s `getOrCreateFolder` — if the Map invariant breaks the code throws with no useful error. Replace with defensive checks.

**Should-fix**

2. The `useEffect` that resets `filter` runs on every incremental graph update (any note save), not just workspace switches. This silently clears the user's search query mid-use.

3. `onClose` passed to `ContextMenu`'s `useEffect` is a new arrow function on every render, causing the mousedown/keydown listeners to be torn down and re-attached on every render while the menu is open. Wrap in `useCallback`.

4. `ContextMenu` is rendered as a child of `.file-tree-panel` which has `overflow: hidden`. Use a React portal (`createPortal` into `document.body`) to guarantee the menu is never clipped.

5. Tree items are plain `<div>` elements with no `role`, `tabIndex`, or keyboard handlers. They are unreachable by keyboard and cannot be activated with Enter/Space.

6. `text-overflow: ellipsis` on `.tree-item` does not work because `.tree-item` is `display: flex`. The ellipsis must be applied to an inner text-bearing element (a `<span>` with `min-width: 0`), not the flex container.

**Suggestions**

7. `color-mix(in srgb, ...)` for the active item background has no fallback and may not render on older WebKit (relevant for Tauri on older macOS).

8. `useLayoutEffect` reading `offsetHeight` may get 0 if layout is not yet complete; the `?? 60` fallback is acceptable but fragile.

---

