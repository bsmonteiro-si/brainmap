# Plan: Editor Line Numbers (IntelliJ-style gutter)

## Context

The user wants line numbers in the CodeMirror editor, similar to IntelliJ's line tracking gutter. The feature should be hidden by default, toggleable via a button in the editor area, and have a persistent default setting in the Settings modal.

## Files to modify

1. **`crates/app/src/stores/uiStore.ts`** — Add `showLineNumbers` state + `toggleLineNumbers` action + `editorLineNumbers` persisted pref
2. **`crates/app/src/components/Editor/MarkdownEditor.tsx`** — Conditionally add `lineNumbers()` extension
3. **`crates/app/src/components/Editor/EditorPanel.tsx`** — Add toggle button near the view mode toggle (Edit/Preview/Raw)
4. **`crates/app/src/components/Settings/SettingsModal.tsx`** — Add "Show line numbers by default" checkbox in Editor section
5. **`crates/app/src/styles/` (CSS)** — Minor gutter styling if needed

## Implementation

### Step 1: uiStore — state + persistence

In `PersistedPrefs` interface, add:
```typescript
editorLineNumbers?: boolean;  // default: false (hidden)
```

In `UIState` interface, add:
```typescript
showLineNumbers: boolean;
toggleLineNumbers: () => void;
setEditorLineNumbersDefault: (v: boolean) => void;
```

Initial value: `storedPrefs.editorLineNumbers ?? false`

`toggleLineNumbers` toggles `showLineNumbers` (session state, not persisted — the persisted pref only controls the initial default).

`setEditorLineNumbersDefault` persists the default to `PersistedPrefs` via `savePrefs()` AND updates current `showLineNumbers` to match.

### Step 2: MarkdownEditor — add lineNumbers extension

- Import `lineNumbers` from `@codemirror/view`
- Subscribe to `showLineNumbers` from `useUIStore`
- Add `showLineNumbers` to the `useEffect` dependency array (triggers editor recreation)
- Conditionally push `lineNumbers()` into the extensions array when `showLineNumbers` is true

### Step 3: EditorPanel — toggle button

Add a line-numbers toggle button in the `editor-hero-top` div, next to the focus mode button. Use a `#` or line-number icon. The button should:
- Call `toggleLineNumbers()` from uiStore
- Show active/inactive styling based on `showLineNumbers`
- Have a tooltip "Toggle line numbers"

### Step 4: SettingsModal — default setting

Add a checkbox row in the "Editor Font" section (or a new "Editor" section):
```
Line numbers    [checkbox] Show by default
```

This calls `setEditorLineNumbersDefault(checked)` which persists the preference.

### Step 5: CSS styling (if needed)

The CodeMirror `lineNumbers()` extension comes with built-in gutter styling. May need minor tweaks to match the app's dark/light theme (gutter background color, number color). Check after implementation.

## Verification

1. Open a note in edit mode — line numbers should be hidden by default
2. Click the toggle button — line numbers appear in the gutter
3. Toggle off — line numbers disappear
4. Go to Settings, check "Show line numbers by default" — line numbers appear
5. Close and reopen the app — line numbers should be visible (persisted default)
6. Uncheck the setting — line numbers hide and default resets
7. Run `npx vitest run` — all existing tests pass
