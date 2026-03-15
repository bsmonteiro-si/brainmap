# Zustand for Frontend State Management
**Date:** 2026-03-15 | **Status:** accepted

## Context
The desktop app (Tauri + React) needs client-side state management for graph topology, editor state, tabs, undo history, UI preferences, and multi-segment workspace switching. The state layer must support snapshot/restore for segment switching, be easy to test without React rendering, and integrate cleanly with React hooks.

## Decision
Use Zustand for all frontend stores (`graphStore`, `editorStore`, `tabStore`, `undoStore`, `uiStore`, `workspaceStore`, `segmentStore`). Each store is a standalone module with `create()` from Zustand, exposing both hook-based React access and imperative `getState()`/`setState()` for non-React contexts.

## Alternatives Considered
- **Redux / Redux Toolkit:** Heavier boilerplate (actions, reducers, selectors, middleware). The action/reducer pattern adds indirection that makes stores harder to read. Redux DevTools are nice but not essential for this project's scale. The snapshot/restore pattern for multi-segment support would require custom middleware.
- **Jotai:** Atom-based model fragments state across many small atoms, making it harder to snapshot entire store slices for segment switching. The `SegmentSnapshot` pattern (capture all workspace-scoped state as a single object) maps naturally to Zustand's `getState()` but would require collecting dozens of atoms in Jotai.
- **Valtio:** Proxy-based reactivity is elegant but can cause subtle bugs with object identity checks. Snapshot semantics (`snapshot()`) conflict with Valtio's own snapshot concept, creating confusion. Less ecosystem adoption than Zustand.
- **React Context + useReducer:** No external library needed, but lacks `getState()` for imperative access (needed by auto-save hooks, segment cache, undo store). Would require provider nesting for 7+ stores. Testing requires rendering React components.

## Consequences
- Stores are independently testable via `getState()`/`setState()` without mounting React components (used extensively in 500+ Vitest tests).
- The `segmentStateCache.ts` snapshot/restore pattern works by reading/writing entire store states, which Zustand makes trivial.
- Each store is a single file with actions defined inline — no action creators, no reducers, no selectors boilerplate.
- Trade-off: no built-in devtools (Redux DevTools integration exists but is not used), so debugging state changes relies on logging.
