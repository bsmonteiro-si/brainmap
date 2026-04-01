# 2026-03-21 — Subagent Transcript: Explore

**Date:** 2026-03-21 10:58:13
**Agent:** Explore
**Agent ID:** a5dbe094d36e9c849
**Parent Session:** 063d3e55-26ea-48b3-a391-4c0c01e3f170

---

## User

Explore the Settings modal and UI store to understand:

1. How settings are structured and persisted (uiStore.ts)
2. The Settings modal layout and how new settings are added (SettingsModal.tsx)
3. Any existing canvas-related settings

Key files:
- crates/app/src/stores/uiStore.ts
- crates/app/src/components/Settings/SettingsModal.tsx

Read these files fully to understand the patterns for adding new settings.

---

## Assistant

I'll explore the Settings modal and UI store to understand how settings are structured, persisted, and added. Let me read the key files.

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

Now let me read the uiStore.ts file in sections to understand the structure:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":1,"limit":200}`

---

## Assistant

Let me continue reading the uiStore file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":200,"limit":300}`

---

## Assistant

Let me continue reading to see the store implementation and how settings are added:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":500,"limit":300}`

---

## Assistant

Let me continue reading the rest of the store:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","offset":800,"limit":300}`

---

## Assistant

Perfect! Now I have a complete understanding of the settings structure. Let me create a comprehensive summary report.

## Settings Modal and UI Store - Complete Exploration Report

I've thoroughly analyzed the Settings modal and UI store to understand how settings are structured, persisted, and added. Here are my findings:

### 1. **Settings Structure & Organization**

**File**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`

The Settings modal is organized into **5 main sections** (defined in `SECTIONS` array at the top):
- **General**: Theme, fonts, appearance
- **Layout**: Panel layout, files panel options
- **Editor**: Editor font, line wrapping, indent, text styling
- **Formatting**: Citations (source/example/math/attention), bullets, arrows, mermaid
- **Graph**: Graph nodes sizing, graph tooltip sizing

Each section:
- Has a dedicated `render<Section>()` function (e.g., `renderGeneral()`, `renderEditor()`)
- Is rendered conditionally based on `activeSection` state
- Uses sidebar navigation to switch between sections

### 2. **How Settings Are Persisted (uiStore.ts)**

**Storage Mechanism**:
- Settings stored in browser `localStorage` at key `brainmap:uiPrefs`
- All preferences merge with existing ones via `savePrefs()` function (lines 471-475):
  ```typescript
  const existing = loadStoredPrefs();
  localStorage.setItem("brainmap:uiPrefs", JSON.stringify({ ...existing, ...prefs }));
  ```
- Panel sizes stored separately at `brainmap:panelSizes`
- Custom file ordering stored per-segment at `brainmap:fileOrder:{segmentPath}`
- Home notes stored per-workspace at `homeNotes` inside uiPrefs

**Interface**: `PersistedPrefs` (lines 184-228) defines all persistable preferences with optional fields

### 3. **State Management Pattern**

The uiStore uses **Zustand** with a three-part pattern for each setting:

**Step 1 - Type Definition** (in `PersistedPrefs` interface):
```typescript
canvasTheme?: "light" | "dark";
canvasShowDots?: boolean;
canvasDotOpacity?: number;
```

**Step 2 - Initial State** (in store creation, lines 512-590):
```typescript
canvasTheme: storedPrefs.canvasTheme ?? "dark",
canvasShowDots: storedPrefs.canvasShowDots ?? true,
canvasDotOpacity: storedPrefs.canvasDotOpacity ?? 50,
```

**Step 3 - Setter Function** (in store methods):
```typescript
setCanvasTheme: (canvasTheme: "light" | "dark") => {
  set({ canvasTheme });
  savePrefs({ canvasTheme });
},
```

### 4. **Existing Canvas Settings**

Canvas-related settings already in place (lines 319-321 of uiStore, and lines 240-251 of SettingsModal):
- **canvasTheme**: Toggle between "light" or "dark"
- **canvasShowDots**: Boolean toggle to show background dots
- **canvasDotOpacity**: Range 0-100 for dot opacity

These are already hooked up in the **General > Appearance** section of Settings modal.

### 5. **Pattern for Adding New Settings**

To add a new setting (e.g., `canvasGridSize`), follow this 5-step pattern:

1. **Add to `PersistedPrefs` interface** (lines 184-228):
   ```typescript
   canvasGridSize?: number;
   ```

2. **Add type constant** (if needed) at top of file with other types:
   ```typescript
   export const DEFAULT_CANVAS_GRID_SIZE = 20;
   ```

3. **Add to `UIState` interface** (lines 246-323):
   ```typescript
   canvasGridSize: number;
   ```

4. **Initialize in store** (lines 512-590):
   ```typescript
   canvasGridSize: storedPrefs.canvasGridSize ?? DEFAULT_CANVAS_GRID_SIZE,
   ```

5. **Add setter in store** (lines 336-414):
   ```typescript
   setCanvasGridSize: (canvasGridSize: number) => {
     set({ canvasGridSize });
     savePrefs({ canvasGridSize });
   },
   ```

6. **Add UI control in SettingsModal.tsx**:
   - Import the setter: `const setCanvasGridSize = useUIStore((s) => s.setCanvasGridSize);`
   - Import the state: `const canvasGridSize = useUIStore((s) => s.canvasGridSize);`
   - Add control in appropriate `render<Section>()` function with change handler calling the setter

### 6. **Key Patterns & Conventions**

- **Simple toggles**: Use `checkbox` with `e.target.checked`
- **Ranges**: Use `<input type="range">` with min/max/step attributes, display value via `<span className="settings-size-value">`
- **Selects**: Use `<select>` with `<option>` elements, optionally grouped with `<optgroup>`
- **Reset buttons**: Many sections have "Reset X to defaults" buttons calling functions like `resetFontPrefs()`, `resetNodePrefs()`, `resetTooltipPrefs()`
- **Scaling/proportional sizing**: Some setters (like `setNodeOverallSize()`, `setTooltipFontSize()`) scale related values together proportionally (lines 887-895, 917-924)
- **Settings control structure**:
  ```typescript
  <div className="settings-row">
    <span className="settings-label">Label</span>
    <div className="settings-control">
      {/* control element */}
    </div>
  </div>
  ```

### 7. **Files & Exact Paths**

- **UI Store Definition**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts`
- **Settings Modal Component**: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx`
- **CSS**: Applied via class names (e.g., `.settings-row`, `.settings-control`, `.settings-label`, `.settings-checkbox-label`, `.settings-size-row`)

This completes your exploration of the settings system. The architecture is clean and follows a consistent pattern, making it straightforward to add new canvas (or any other) settings.

---

