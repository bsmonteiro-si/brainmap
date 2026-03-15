# How to Add a Zustand Store

## Checklist

### 1. Create the store file

- [ ] Create new file — `crates/app/src/stores/<name>Store.ts`. Define an interface for the state shape and export the store using `create` from `zustand`:
  ```typescript
  import { create } from "zustand";

  interface YourState {
    // data fields
    someData: string | null;
    isLoading: boolean;
    // actions
    loadData: () => Promise<void>;
    reset: () => void;
  }

  export const useYourStore = create<YourState>((set, get) => ({
    someData: null,
    isLoading: false,
    loadData: async () => { /* ... */ },
    reset: () => { set({ someData: null, isLoading: false }); },
  }));
  ```

### 2. Follow store conventions

- [ ] Include a `reset()` action — Every workspace-scoped store must have a `reset()` that restores initial state. Called on workspace close.
- [ ] Separate transient flags — Fields like `isLoading`, `savingInProgress`, `_navigating` are transient and must NOT be captured in snapshots (see step 4).
- [ ] Use `getAPI()` for backend calls — `import { getAPI } from "../api/bridge"` to get the `BrainMapAPI` instance.
- [ ] Use the logger — `import { log } from "../utils/logger"` for structured logging: `log.info("stores::yourStore", "action description", { key: value })`.

### 3. Wire up workspace lifecycle

- [ ] Call `reset()` on workspace close — `crates/app/src/stores/workspaceStore.ts`. Find the `closeWorkspace` or `closeSegment` action and add `useYourStore.getState().reset()`.

### 4. Add to segment snapshots (if workspace-scoped)

If the store holds per-workspace data that must survive segment switching:

- [ ] Add fields to `SegmentSnapshot` — `crates/app/src/stores/segmentStateCache.ts` (line ~29, `SegmentSnapshot` interface). Add your store's data fields.
- [ ] Capture in `captureSnapshot()` — Same file, find the `captureSnapshot` function. Read from `useYourStore.getState()` and include in the snapshot object.
- [ ] Restore in `restoreSnapshot()` — Same file, find the `restoreSnapshot` function. Call `useYourStore.setState(...)` with the snapshot fields.
- [ ] Reset transient flags — In `restoreSnapshot()`, always set transient flags (`isLoading`, etc.) to `false`, never capture their snapshot values.

### 5. Handle workspace events (if needed)

- [ ] Subscribe to events — If the store needs to react to backend events (file changes, topology changes), add a listener in `crates/app/src/App.tsx` where the `onEvent` callback is set up, or subscribe in the store itself.

### 6. Persist to localStorage (if needed)

- [ ] For UI preferences that should survive page reloads, use the pattern from `uiStore.ts`: read from `localStorage.getItem("brainmap:<key>")` during store initialization and write via `localStorage.setItem(...)` in actions.

### 7. Tests

- [ ] Create test file — `crates/app/src/stores/<name>Store.test.ts`. Test actions, state transitions, and reset behavior. Use `beforeEach(() => useYourStore.setState(...))` for setup.
- [ ] Vitest config — Tests auto-discovered by `vitest.config.ts` in `crates/app/`. The `test-setup.ts` polyfills `window.matchMedia`.

## Example

Follow the pattern of `navigationStore.ts` for a simple workspace-scoped store:
- Store: `crates/app/src/stores/navigationStore.ts` — clean pattern with state interface, `create()`, actions, and `reset()`
- Snapshot fields: `crates/app/src/stores/segmentStateCache.ts` line ~55 — `history` and `cursor` captured/restored
- Tests: `crates/app/src/stores/navigationStore.test.ts`

For a store with localStorage persistence, follow `uiStore.ts`:
- Store: `crates/app/src/stores/uiStore.ts` — reads `brainmap:uiPrefs` from localStorage on init, writes on change
