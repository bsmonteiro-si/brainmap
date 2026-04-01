# 2026-03-14 — Subagent Transcript: general-purpose

**Date:** 2026-03-14 12:31:24
**Agent:** general-purpose
**Agent ID:** aebb7c0ecf07af33b
**Parent Session:** 612d32b5-8e7e-4b03-98f1-0728d66ab190

---

## User

You are reviewing TypeScript code for BrainMap, a knowledge graph desktop app (Tauri + React + CodeMirror). Review the following changed files for defects.

## Review Criteria (adapted from code-reviewer.md):

### 1. Correctness
- Are there logic bugs? Off-by-one errors? Missed conditions?
- Does error handling cover all failure modes?
- Are DOM operations safe? Memory leaks from event listeners?

### 2. Function Design
- Is each function doing one thing?
- Are names descriptive?

### 3. Test Coverage
- Is every new public function tested?
- Are error paths tested?

### 4. Performance
- Are there unnecessary allocations or DOM operations?
- Are event listeners properly cleaned up?

## Output Format
Write your review as a list of findings. For each finding:
- **File**: path and line range
- **Severity**: one of [bug, should-fix, suggestion]
- **Finding**: what the problem is
- **Fix**: what to do instead

## Files to review:

### NEW FILE: crates/app/src/components/Editor/cmCopyReference.ts

```typescript
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

/**
 * CodeMirror extension that adds a "Copy File Reference" item to a custom
 * right-click context menu when text is selected. Copies an absolute path
 * with line numbers, e.g. `/path/to/note.md:12-18`.
 */
export function copyReferenceMenu(absolutePath: string): Extension {
  let menuEl: HTMLDivElement | null = null;

  function removeMenu() {
    if (menuEl) {
      menuEl.remove();
      menuEl = null;
    }
  }

  function buildReference(view: EditorView): string {
    const sel = view.state.selection.main;
    const startLine = view.state.doc.lineAt(sel.from).number;
    const endLine = view.state.doc.lineAt(sel.to).number;
    if (startLine === endLine) {
      return `${absolutePath}:${startLine}`;
    }
    return `${absolutePath}:${startLine}-${endLine}`;
  }

  function showMenu(view: EditorView, x: number, y: number) {
    removeMenu();

    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    const item = document.createElement("div");
    item.className = "context-menu-item";
    item.textContent = "Copy File Reference";
    item.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ref = buildReference(view);
      navigator.clipboard.writeText(ref);
      removeMenu();
    });

    menu.appendChild(item);
    document.body.appendChild(menu);
    menuEl = menu;

    // Clamp to viewport
    requestAnimationFrame(() => {
      if (!menuEl) return;
      const rect = menuEl.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuEl.style.left = `${window.innerWidth - rect.width - 4}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuEl.style.top = `${window.innerHeight - rect.height - 4}px`;
      }
    });

    // Dismiss handlers
    const dismiss = () => {
      removeMenu();
      document.removeEventListener("mousedown", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
      view.scrollDOM.removeEventListener("scroll", dismiss);
    };

    const onOutsideClick = (e: MouseEvent) => {
      if (menuEl && !menuEl.contains(e.target as Node)) {
        dismiss();
      }
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };

    // Delay to avoid the current contextmenu event from immediately dismissing
    requestAnimationFrame(() => {
      document.addEventListener("mousedown", onOutsideClick);
      document.addEventListener("keydown", onEscape);
      view.scrollDOM.addEventListener("scroll", dismiss, { once: true });
    });
  }

  return EditorView.domEventHandlers({
    contextmenu(event: MouseEvent, view: EditorView) {
      const sel = view.state.selection.main;
      if (sel.from === sel.to) {
        // No selection — let the default context menu through
        removeMenu();
        return false;
      }

      event.preventDefault();
      showMenu(view, event.clientX, event.clientY);
      return true;
    },
  });
}
```

### MODIFIED FILE: crates/app/src/components/Editor/MarkdownEditor.tsx (relevant diff)

Added imports:
```typescript
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { copyReferenceMenu } from "./cmCopyReference";
```

Added state:
```typescript
const wsRoot = useWorkspaceStore((s) => s.info?.root);
```

Added to extensions array:
```typescript
...(wsRoot ? [copyReferenceMenu(wsRoot.replace(/\/$/, "") + "/" + notePath)] : []),
```

Added wsRoot to effect deps:
```typescript
}, [notePath, effectiveTheme, uiZoom, editorFontFamily, editorFontSize, readOnly, wsRoot]);
```

Write your findings to `.claude/reviews/code/copy-file-reference-review-1.md`.

---

## Assistant



Let me review the code thoroughly.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmCopyReference.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/MarkdownEditor.tsx"}`

---

## Assistant

Now let me check for existing tests and similar patterns.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/cmCopyReference.test.ts"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/components/Editor/*.test.*"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/cmLinkNavigation.ts"}`

---

## Assistant

Now I have enough context. Let me write the review.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ 2>/dev/null || echo \"dir does not exist\"","description":"Check if reviews directory exists"}`

---

## Assistant

### Tool Calls

- **Write**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/copy-file-reference-review-1.md","content":"# Code Review: Copy File Reference (cmCopyReference.ts + MarkdownEditor.tsx i`

---

## Assistant

Review written to `/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/copy-file-reference-review-1.md`.

**Summary of findings (6 total):**

1. **bug** -- Leaked event listeners on EditorView destroy: When the CM view is torn down (note switch, theme change), if the context menu is open, the `mousedown`/`keydown` listeners on `document` are never removed. Fix: use a `ViewPlugin` with a `destroy()` hook, or track the `dismiss` function and call it from the `useEffect` cleanup.

2. **should-fix** -- `navigator.clipboard.writeText()` promise is not caught. A `.catch(console.warn)` at minimum would surface failures.

3. **suggestion** -- `absolutePath` closure is safe today due to correct `useEffect` deps, but worth a comment for future maintainers.

4. **suggestion** -- Selection at line boundary edge case: selecting to the start of line N includes line N in the reference. Minor UX quirk, matches common editor behavior.

5. **should-fix** -- No unit tests. Every other `cm*.ts` file has a `.test.ts` companion. `buildReference` is a pure function that should be exported and tested.

6. **suggestion** -- Dismiss listeners from a previous menu invocation leak when `removeMenu()` is called directly (e.g., right-click with no selection after a menu was shown). Fix: store the `dismiss` function alongside `menuEl`.

---

