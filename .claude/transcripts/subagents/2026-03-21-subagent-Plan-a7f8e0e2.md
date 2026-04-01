# 2026-03-21 — Subagent Transcript: Plan

**Date:** 2026-03-21 11:02:03
**Agent:** Plan
**Agent ID:** a7f8e0e263dd69d6e
**Parent Session:** 063d3e55-26ea-48b3-a391-4c0c01e3f170

---

## User

Design an implementation plan for two canvas editor improvements in a Tauri+React app using @xyflow/react (React Flow).

## Context

The canvas editor renders `.canvas` files (JSON Canvas format) using React Flow. Key files:
- `crates/app/src/components/Editor/CanvasEditor.tsx` - main editor
- `crates/app/src/components/Editor/canvasNodes.tsx` - custom node/edge components
- `crates/app/src/components/Editor/canvasTranslation.ts` - JSON Canvas ↔ React Flow conversion
- `crates/app/src/stores/uiStore.ts` - settings store (Zustand + localStorage)
- `crates/app/src/components/Settings/SettingsModal.tsx` - settings UI
- `crates/app/src/App.css` - all CSS

## Task 1: Larger arrow tips with configurable size

Currently arrows use React Flow's default `MarkerType.ArrowClosed` with no size customization:
```tsx
// In CanvasEditor.tsx
defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
// and on connect:
{ ...connection, markerEnd: { type: MarkerType.ArrowClosed }, data: { isNew: true } }
```

React Flow's marker objects support `width`, `height`, and `color` properties. So we can do:
```tsx
markerEnd: { type: MarkerType.ArrowClosed, width: 25, height: 25 }
```

The default React Flow arrow is about 12.5px. The user wants bigger arrows. Need a `canvasArrowSize` setting (range slider) in Settings modal. The CanvasEditor should read this setting and apply it to `defaultEdgeOptions` and `onConnect`.

Also need to apply it to existing edges loaded from file via `canvasToFlow`.

## Task 2: Card background colors (separate from border color)

Currently the color picker sets `data.color` which is applied to:
- File nodes: `borderLeftColor` only
- Text nodes: `borderColor` only
- Link nodes: `borderColor` only
- Group nodes: `backgroundColor` (already works)

The user wants a SEPARATE option to set the background color of cards, in addition to the existing border color option. This needs:
1. A new `data.bgColor` field on nodes
2. A second color picker or swatch option in the node toolbar
3. The background color applied to all card types (file, text, link)
4. Persisted in the JSON Canvas format (custom extension field, e.g., `bgColor`)

For the JSON Canvas format, since `bgColor` is not standard, we can store it as an extension field. The `color` field already exists in the spec for border color. We should use a custom field like `bgColor` in the JSON.

## Existing settings pattern

Settings follow this pattern in uiStore.ts:
1. Add to `PersistedPrefs` interface (optional field)
2. Add to `UIState` interface (required field with type)
3. Initialize from stored prefs with default fallback
4. Add setter that calls `set()` + `savePrefs()`

Canvas settings already exist: `canvasTheme`, `canvasShowDots`, `canvasDotOpacity`.

Settings modal has sections: General, Layout, Editor, Formatting, Graph. Canvas settings are in General > Appearance subsection.

## Requirements

1. Arrow tip size: configurable via slider in Settings, default should be noticeably bigger than current (e.g., 25px vs 12.5px default)
2. Card background color: separate color picker in the node toolbar, stored as `bgColor` in data, applied as CSS `backgroundColor` with low opacity or as-is

Please design a detailed implementation plan covering all files that need changes.

---

## Assistant



I'll explore the codebase to understand the current implementation before designing the plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts"}`

---

## Assistant

Now let me check the uiStore and SettingsModal for the existing canvas settings pattern.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx"}`

---

## Assistant

Now let me check the uiStore for the canvas settings pattern.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvasTheme|canvasShowDots|canvasDotOpacity|canvasArrow","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"PersistedPrefs","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content","-C":3}`

---

## Assistant

Now let me check the CSS for the existing canvas node styles to understand the background color application.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-file-node|canvas-text-node|canvas-link-node|canvas-group-node","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3,"head_limit`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-text-node|canvas-link-node","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":5,"head_limit":40}`

---

## Assistant

Now let me also check the `Paintbrush` or similar icons available from lucide-react, and look at how `canvasNodes.tsx` already imports icons.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvas-node-toolbar-color|canvas-color-picker|canvas-color-swatch","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","output_mode":"content","-C":3}`

---

## Assistant

I now have a thorough understanding of the codebase. Here is the implementation plan.

---

## Implementation Plan: Canvas Arrow Size Setting and Card Background Colors

### Task 1: Configurable Arrow Tip Size

**Goal:** Add a `canvasArrowSize` setting (range slider) that controls the width/height of `MarkerType.ArrowClosed` markers on canvas edges.

#### Step 1a: Add to `uiStore.ts`

In `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`:

1. Add `canvasArrowSize?: number` to the `PersistedPrefs` interface (around line 198, alongside `canvasDotOpacity`).
2. Add `canvasArrowSize: number` to the `UIState` interface (around line 322, alongside the other canvas fields).
3. Add `setCanvasArrowSize: (size: number) => void` to `UIState`.
4. Initialize in the store creation (around line 522): `canvasArrowSize: storedPrefs.canvasArrowSize ?? 25,` (default 25px, double the React Flow default of ~12.5).
5. Add setter (around line 677):
   ```ts
   setCanvasArrowSize: (canvasArrowSize: number) => {
     set({ canvasArrowSize });
     savePrefs({ canvasArrowSize });
   },
   ```
6. Export the type if needed (it is just a number, so no new type export necessary).

#### Step 1b: Add Settings UI in `SettingsModal.tsx`

In `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`:

1. Add `useUIStore` selectors for `canvasArrowSize` and `setCanvasArrowSize` at the top of `SettingsModal` (around line 70, with other canvas selectors).
2. Add a new row after the "Dot intensity" row (after line 280), inside the Appearance section:
   ```tsx
   <div className="settings-row">
     <span className="settings-label">Arrow size</span>
     <div className="settings-control">
       <div className="settings-size-row">
         <input type="range" min={10} max={50} step={5} value={canvasArrowSize}
           onChange={(e) => setCanvasArrowSize(Number(e.target.value))} />
         <span className="settings-size-value">{canvasArrowSize}px</span>
       </div>
     </div>
   </div>
   ```
   This sits logically with the other canvas settings. No conditional visibility needed -- arrows are always present on canvas edges.

#### Step 1c: Apply in `CanvasEditor.tsx`

In `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx`:

1. Subscribe to the setting (around line 100):
   ```ts
   const canvasArrowSize = useUIStore((s) => s.canvasArrowSize);
   ```
2. Build the marker object once with `useMemo`:
   ```ts
   const arrowMarker = useMemo(
     () => ({ type: MarkerType.ArrowClosed, width: canvasArrowSize, height: canvasArrowSize }),
     [canvasArrowSize],
   );
   ```
3. Update `defaultEdgeOptions` (line 491):
   ```tsx
   defaultEdgeOptions={{ markerEnd: arrowMarker }}
   ```
4. Update `onConnect` (line 259): replace the inline `{ type: MarkerType.ArrowClosed }` with `arrowMarker`.
5. **Existing edges loaded from file:** The `canvasToFlow` function in `canvasTranslation.ts` also creates markers (line 129). Two approaches:
   - **Option A (recommended):** After `canvasToFlow` returns edges, map over them to apply the arrow size. This keeps `canvasTranslation.ts` pure (no dependency on the store). Add a post-processing step right after `canvasToFlow` returns (around line 131):
     ```ts
     const rfEdges = rawEdges.map((e) => ({
       ...e,
       markerEnd: e.markerEnd ? { ...(e.markerEnd as object), width: canvasArrowSize, height: canvasArrowSize } : e.markerEnd,
       markerStart: e.markerStart ? { ...(e.markerStart as object), width: canvasArrowSize, height: canvasArrowSize } : e.markerStart,
     }));
     ```
   - This must reference `canvasArrowSize` which is available from the store. Since the load happens in a `useEffect`, read it via `useUIStore.getState().canvasArrowSize` at load time.
6. **Live reactivity for existing edges when the setting changes:** Add a `useEffect` that watches `canvasArrowSize` and re-maps all edges:
   ```ts
   useEffect(() => {
     setEdges((eds) =>
       eds.map((e) => ({
         ...e,
         markerEnd: e.markerEnd
           ? { ...(typeof e.markerEnd === 'object' ? e.markerEnd : {}), type: MarkerType.ArrowClosed, width: canvasArrowSize, height: canvasArrowSize }
           : e.markerEnd,
         markerStart: e.markerStart
           ? { ...(typeof e.markerStart === 'object' ? e.markerStart : {}), type: MarkerType.ArrowClosed, width: canvasArrowSize, height: canvasArrowSize }
           : e.markerStart,
       })),
     );
   }, [canvasArrowSize, setEdges]);
   ```
   This ensures that changing the setting in the Settings modal immediately updates all visible arrows without reloading the file. Note: this should NOT trigger `scheduleSave` since arrow size is a display preference, not canvas data. The `width`/`height` on markers are not serialized by `flowToCanvas` (it only looks at the marker type), so this is safe.

#### Notes on serialization
The `flowToCanvas` function (line 205-211) only checks whether a marker exists and its type to determine `toEnd`/`fromEnd`. It does not serialize `width`/`height`. This is correct -- arrow size is a global display preference, not per-edge data.

---

### Task 2: Card Background Colors

**Goal:** Add a separate `bgColor` field for node background color, distinct from the existing `color` (border color). Store as a custom extension field in JSON Canvas.

#### Step 2a: Update JSON Canvas types in `canvasTranslation.ts`

In `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts`:

1. Add `bgColor?: string` to `JsonCanvasNodeBase` (line 13, after `color`). This is a custom extension field not in the official JSON Canvas spec, but the format is extensible.
2. In `canvasToFlow` (line 85): add `if (cn.bgColor) data.bgColor = cn.bgColor;` alongside the existing `if (cn.color) data.color = cn.color;`.
3. In `flowToCanvas` (line 170): add `if (data.bgColor) base.bgColor = String(data.bgColor);` alongside `if (data.color) base.color = String(data.color);`. Since `bgColor` is not on the typed `JsonCanvasNodeBase`, also add it to the type definition so TypeScript is happy. Actually we already added it in step 1, so this cast will work.

#### Step 2b: Add background color picker to `CanvasNodeToolbar` in `canvasNodes.tsx`

In `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx`:

1. Import `Paintbrush` (or `PaintBucket`) from `lucide-react` (line 7). `Paintbrush` is available in lucide-react.
2. Add a second toggle state `showBgColors` in `CanvasNodeToolbar` (line 43).
3. Add a `handleBgColor` function analogous to `handleColor` but setting `data.bgColor`:
   ```ts
   const handleBgColor = (bgColor: string) => {
     setNodes((nds) =>
       nds.map((n) =>
         n.id === id ? { ...n, data: { ...n.data, bgColor } } : n,
       ),
     );
     setShowBgColors(false);
   };
   ```
4. Add `handleClearBgColor` that removes the `bgColor` key from data.
5. In the toolbar JSX (after the existing color picker button block, around line 108), add a second button+picker for background color:
   ```tsx
   <div className="canvas-node-toolbar-color-wrapper">
     <button
       className="canvas-node-toolbar-btn"
       title="Background color"
       onClick={() => setShowBgColors(!showBgColors)}
     >
       <Paintbrush size={16} />
     </button>
     {showBgColors && (
       <div className="canvas-color-picker">
         {CANVAS_COLORS.map((c) => (
           <button key={c.id} className="canvas-color-swatch"
             style={{ backgroundColor: c.color }} title={c.label}
             onClick={() => handleBgColor(c.color)} />
         ))}
         <button className="canvas-color-swatch canvas-color-swatch--clear"
           title="Clear background" onClick={handleClearBgColor}>×</button>
       </div>
     )}
   </div>
   ```

#### Step 2c: Apply `bgColor` to node rendering in `canvasNodes.tsx`

1. **CanvasFileNode** (line 130-178): 
   - Add `bgColor` to the destructured data: `const d = data as { file?: string; subpath?: string; color?: string; bgColor?: string };`
   - Apply it as inline `backgroundColor` on the root div:
     ```tsx
     style={{ borderLeftColor: borderColor, ...(d.bgColor ? { backgroundColor: d.bgColor + '22' } : {}) }}
     ```
     The `+ '22'` appends a hex alpha (~13% opacity) to make backgrounds subtle. Alternatively, use the color as-is if the user prefers full saturation. I recommend applying it at a low opacity for readability. The approach of appending hex alpha works when the color is a 6-digit hex (which it always is, from `CANVAS_COLORS`).

2. **CanvasTextNode** (line 184-198):
   - Add `bgColor` to destructured data: `const d = data as { text?: string; color?: string; bgColor?: string };`
   - Apply:
     ```tsx
     style={{ ...(borderColor ? { borderColor } : {}), ...(d.bgColor ? { backgroundColor: d.bgColor + '22' } : {}) }}
     ```

3. **CanvasLinkNode** (line 202-222):
   - Add `bgColor`: `const d = data as { url?: string; color?: string; bgColor?: string };`
   - Apply:
     ```tsx
     style={{ ...(d.color ? { borderColor: d.color } : {}), ...(d.bgColor ? { backgroundColor: d.bgColor + '22' } : {}) }}
     ```

4. **CanvasGroupNode** (line 227-241): Group already uses `color` for background. For consistency, `bgColor` can override the group background while `color` remains the label/border color. But the current behavior where `color` IS the background for groups is fine and should be preserved. No change needed for groups -- the existing color picker already serves as background color for groups.

#### Step 2d: Ensure mutual exclusion of color pickers

When the user opens the background color picker, the border color picker should close (and vice versa). In `CanvasNodeToolbar`, when `setShowColors(true)` is called, also call `setShowBgColors(false)`, and vice versa.

---

### Files Changed Summary

| File | Changes |
|------|---------|
| `crates/app/src/stores/uiStore.ts` | Add `canvasArrowSize` to `PersistedPrefs`, `UIState`, initializer, and setter |
| `crates/app/src/components/Settings/SettingsModal.tsx` | Add arrow size slider in Appearance section |
| `crates/app/src/components/Editor/CanvasEditor.tsx` | Read `canvasArrowSize`, build `arrowMarker` memo, apply to `defaultEdgeOptions`/`onConnect`, post-process loaded edges, add reactivity effect |
| `crates/app/src/components/Editor/canvasNodes.tsx` | Add `Paintbrush` import, `bgColor` picker in toolbar, apply `bgColor` to file/text/link nodes |
| `crates/app/src/components/Editor/canvasTranslation.ts` | Add `bgColor` to `JsonCanvasNodeBase`, serialize/deserialize in `canvasToFlow`/`flowToCanvas` |
| `crates/app/src/App.css` | No CSS changes needed -- existing `.canvas-color-picker` styles are reused; `backgroundColor` is applied inline |

### Edge Cases and Considerations

1. **Arrow size is display-only, not persisted per-edge:** The `flowToCanvas` serializer does not write marker dimensions, which is correct. Arrow size is a global UI preference.
2. **bgColor hex alpha trick:** Appending `'22'` to a 6-digit hex color creates an 8-digit hex with ~13% opacity. All `CANVAS_COLORS` are 7-char strings (`#rrggbb`), so this is safe. If a user somehow has a different format (e.g., from manual JSON editing), the worst case is a slightly wrong color, not a crash.
3. **Backward compatibility:** Canvas files without `bgColor` load fine (the field is optional). Canvas files with `bgColor` written by this app will have the extra field ignored by other JSON Canvas readers (the spec allows extension fields).
4. **No save triggered by arrow size changes:** The `useEffect` for arrow size reactivity should not call `scheduleSave` because arrow dimensions are not part of the canvas data model.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts` - Add canvasArrowSize setting (PersistedPrefs + UIState + setter)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx` - Consume arrow size setting, apply to markers and defaultEdgeOptions
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx` - Add bgColor picker to toolbar, apply bgColor to node rendering
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasTranslation.ts` - Add bgColor to JSON Canvas types and serialization
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx` - Add arrow size slider to General > Appearance section

---

