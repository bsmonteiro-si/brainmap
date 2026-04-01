# 2026-03-18 — Subagent Transcript: Explore

**Date:** 2026-03-18 19:49:55
**Agent:** Explore
**Agent ID:** adef9b26b6c12cdea
**Parent Session:** 5e2d1daa-ae5d-4ab0-928b-7769d5294d64

---

## User

I need to understand how the Settings modal works and how UI preferences are stored, to add new mermaid diagram size settings. Look at:

1. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx` - the full settings modal UI
2. `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - how preferences are stored (look for the preferences interface, default values, and how settings like font size are persisted)

I need to know:
- What settings currently exist
- How number/range settings are rendered (input type, labels, etc.)
- How new settings get added to the store and persisted
- The pattern for adding a new setting (property name, default value, setter)

---

## Assistant

I'll examine both files to understand the Settings modal and UI preferences architecture.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Perfect! I have a comprehensive view of both the Settings modal and UI preferences system. Let me create a detailed report of how the system works:

## Settings Modal & UI Preferences Architecture

### Current Settings in the Modal

The Settings modal is organized into 6 main sections:

1. **Appearance** (theme, panel themes)
2. **Panel Layout** (files/graph/search split sizes as ranges)
3. **Files Panel** (auto-reveal checkbox)
4. **Editor Font** (family, size range, line numbers, citation styles, line wrapping, spell check, indent size)
5. **Interface Font** (family, size range)
6. **Graph Nodes** (overall size, label size, label padding, edge labels with ranges)
7. **Graph Tooltip** (overall size, type pill, links, summary, tags with ranges)

### Number/Range Settings Pattern

All numeric/range settings use a consistent pattern in the modal:

```tsx
<div className="settings-row">
  <span className="settings-label">Label text</span>
  <div className="settings-control">
    <div className="settings-size-row">
      <input
        type="range"
        min={minValue}
        max={maxValue}
        step={stepValue}
        value={currentValue}
        onChange={(e) => setSetter(Number(e.target.value))}
      />
      <span className="settings-size-value">{currentValue}px</span>
    </div>
  </div>
</div>
```

Examples of ranges currently used:
- Panel sizes: `min={10} max={90} step={5}`
- Font sizes: `min={10} max={28} step={1}` (editor), `min={10} max={20} step={1}` (UI)
- Node overall: `min={8} max={40} step={1}`
- Edge labels: `min={4} max={16} step={1}`

### How Settings Get Added to the Store

#### 1. Add to `PersistedPrefs` interface (line 128-157)
```typescript
interface PersistedPrefs {
  // Add your property here with optional type
  mermaidDiagramMaxWidth?: number;
  mermaidDiagramMaxHeight?: number;
}
```

#### 2. Add default constant (near top with other defaults, lines 80-88)
```typescript
export const DEFAULT_MERMAID_MAX_WIDTH = 800;
export const DEFAULT_MERMAID_MAX_HEIGHT = 600;
```

#### 3. Add to `UIState` interface (lines 175-313)
```typescript
interface UIState {
  // Add state properties
  mermaidDiagramMaxWidth: number;
  mermaidDiagramMaxHeight: number;
  
  // Add setter functions
  setMermaidDiagramMaxWidth: (v: number) => void;
  setMermaidDiagramMaxHeight: (v: number) => void;
}
```

#### 4. Initialize in store creation (lines 411-473)
```typescript
export const useUIStore = create<UIState>((set, get) => ({
  // Load from localStorage or use default
  mermaidDiagramMaxWidth: storedPrefs.mermaidDiagramMaxWidth ?? DEFAULT_MERMAID_MAX_WIDTH,
  mermaidDiagramMaxHeight: storedPrefs.mermaidDiagramMaxHeight ?? DEFAULT_MERMAID_MAX_HEIGHT,
}));
```

#### 5. Implement setter functions (example from lines 697-705)
```typescript
setMermaidDiagramMaxWidth: (v: number) => {
  set({ mermaidDiagramMaxWidth: v });
  savePrefs({ mermaidDiagramMaxWidth: v });
},

setMermaidDiagramMaxHeight: (v: number) => {
  set({ mermaidDiagramMaxHeight: v });
  savePrefs({ mermaidDiagramMaxHeight: v });
},
```

#### 6. Add to SettingsModal.tsx component
```typescript
// Line ~48: Import selectors
const mermaidDiagramMaxWidth = useUIStore((s) => s.mermaidDiagramMaxWidth);
const mermaidDiagramMaxHeight = useUIStore((s) => s.mermaidDiagramMaxHeight);
const setMermaidDiagramMaxWidth = useUIStore((s) => s.setMermaidDiagramMaxWidth);
const setMermaidDiagramMaxHeight = useUIStore((s) => s.setMermaidDiagramMaxHeight);

// Then render in a new settings section with range inputs
```

### Persistence Mechanism

The `savePrefs()` function (line 370-374) handles persistence:

```typescript
function savePrefs(prefs: PersistedPrefs) {
  const existing = loadStoredPrefs();
  localStorage.setItem("brainmap:uiPrefs", JSON.stringify({ ...existing, ...prefs }));
}
```

It merges new preferences with existing ones to avoid losing other settings. The `loadStoredPrefs()` function (line 362-368) retrieves from `localStorage.getItem("brainmap:uiPrefs")`.

### Key Design Patterns

1. **Paired state + setter in UIState interface** - Each preference has a getter and setter
2. **Lazy loading from localStorage** - Done once at module init, then cached in store
3. **Merge on save** - `savePrefs` merges with existing to prevent data loss
4. **Scaling patterns** - Some setters apply mathematical scaling (e.g., `setTooltipFontSize` scales related sizes proportionally)
5. **Reset functions** - Grouped preferences can be reset together (e.g., `resetNodePrefs`, `resetTooltipPrefs`)

### For Mermaid Diagram Sizes

You would need to:
1. Add `mermaidDiagramMaxWidth` and `mermaidDiagramMaxHeight` (or similar) to all 4 places above
2. Create a new `settings-section` in SettingsModal.tsx with appropriate range sliders
3. Consider reasonable min/max values (e.g., min={400} max={1600} for width, min={300} max={1200} for height)
4. Optionally add a `resetMermaidPrefs()` function if you want grouped resets
5. Update the "Reset fonts to defaults" button logic or create a separate reset button

File paths:
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`

---

