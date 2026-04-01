# Move Tab Bar to Top of App (IntelliJ-style)

## Context

The tab bar currently sits inside `EditorPanel`, spanning only the editor column width. The user wants it moved to the very top of the app content area, spanning the full width above the icon sidebar and panels — matching IntelliJ's layout where tabs stretch across the entire window width. The tabs should also be slightly larger for better readability.

## Current Layout

```
.app (flex column)
├── .app-layout-root (flex row)
│   ├── IconSidebar (40px)
│   └── Group (resizable panels)
│       ├── Panel (content: files/graph/search)
│       ├── Separator
│       └── Panel (editor)
│           └── EditorPanel
│               ├── TabBar ← currently here
│               └── .editor-panel (hero, body, etc.)
├── StatusBar
```

## Target Layout

```
.app (flex column)
├── TabBar ← moved here, full width
├── .app-layout-root (flex row)
│   ├── IconSidebar (40px)
│   └── Group (resizable panels)
│       ├── Panel (content)
│       ├── Separator
│       └── Panel (editor)
│           └── EditorPanel (no more TabBar inside)
├── StatusBar
```

## Changes

### 1. `AppLayout.tsx` — Add TabBar at top level

Import `TabBar` and render it **above** `.app-layout-root`:

```tsx
import { TabBar } from "../Editor/TabBar";

return (
  <>
    <TabBar />
    <div className="app-layout-root">
      <IconSidebar />
      <Group ...>
        ...
      </Group>
    </div>
    <StatusBar />
  </>
);
```

### 2. `EditorPanel.tsx` — Remove all 6 `<TabBar />` instances

Remove the `import { TabBar }` and all 6 `<TabBar />` renders (lines 67, 80, 100, 168, 233, 247).

### 3. `App.css` — Increase tab bar height and adjust styling

Current tab bar is 30px with `var(--ui-font-xs)` text. IntelliJ uses ~36-38px tabs with slightly larger text.

Changes to `.tab-bar`:
- `min-height: 36px; max-height: 36px;` (was 30px)

Changes to `.tab-item`:
- `padding: 6px 10px 6px 10px;` (was `4px 6px 4px 8px`)
- `font-size: 12px;` (was `var(--ui-font-xs)`)
- `max-width: 200px;` (was 180px — more room on full-width bar)

Changes to `.tab-new-btn`:
- `width: 32px; height: 32px;` (was 28px)

## Critical Files

| File | Change |
|------|--------|
| `crates/app/src/components/Layout/AppLayout.tsx` | Import + render `<TabBar />` above `.app-layout-root` |
| `crates/app/src/components/Editor/EditorPanel.tsx` | Remove all 6 `<TabBar />` instances and the import |
| `crates/app/src/App.css` | Increase tab height from 30px to 36px, adjust padding/sizing |

## Verification

1. Run `npx tsc --noEmit` — no errors in changed files
2. Run `npx vitest run` — all tests pass
3. Visual check: tabs span full width at top, above sidebar and panels
4. Tab functionality: click to switch, close, dirty indicators, middle-click close, new tab button all still work
5. Resizable panels still work correctly below the tab bar
