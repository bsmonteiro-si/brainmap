# 2026-03-22 — Subagent Transcript: Explore

**Date:** 2026-03-22 15:27:28
**Agent:** Explore
**Agent ID:** a799cbbd6e288bf57
**Parent Session:** 163bffdb-bb69-4d3a-bb71-66eaa1757692

---

## User

I need to understand the full sticky note CSS and how settings control it. Read these files thoroughly:

1. `crates/app/src/App.css` - Read lines 5310-5410 to see ALL sticky note CSS (the shape, ::before stripe, ::after fold, pin, tape, curl, lines, etc.)
2. `crates/app/src/components/Editor/CanvasEditor.tsx` - Read lines 130-180 to see how CSS variables are set from store values
3. `crates/app/src/components/Editor/canvasNodes.tsx` - Search for "sticky" to see how data attributes are passed (data-sticky-pin, data-sticky-tape, data-sticky-lines, data-sticky-curl, data-sticky-stripe)
4. `crates/app/src/components/Settings/SettingsModal.tsx` - Read lines 1020-1160 to see the sticky settings UI controls
5. `crates/app/src/stores/uiStore.ts` - Search for "Sticky" to see the store types, defaults, and setters

I need the EXACT current CSS for each sticky feature (shadow, stripe, curl, fold, pin, tape, lines) with line numbers, and the exact store defaults.

---

## Assistant

I'll read these files thoroughly to understand the sticky note CSS system and how settings control it.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5310,"limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/CanvasEditor.tsx","offset":130,"limit":50}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Settings/SettingsModal.tsx","offset":1020,"limit":140}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts"}`

---

## Assistant

Now let me search for the sticky settings in the store:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"canvasSticky|Sticky.*:","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/uiStore.ts","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","offset":1,"limit":100}`

---

## Assistant

Now let me search for where sticky data attributes are set in canvasNodes.tsx:

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"data-sticky","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","context":5}`

---

## Assistant

Perfect! Now let me get the complete sticky CSS section and check if there are any additional features I missed:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/App.css","offset":5310,"limit":110}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"stickyPin|stickyTape|stickyLines|stickyCurl|stickyStripe","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Editor/canvasNodes.tsx","output_mode":"content","con`

---

## Assistant

Perfect! Now I have all the information. Let me compile a comprehensive report with the exact CSS and store defaults:

## Complete Sticky Note CSS & Settings System

I've thoroughly reviewed all the sticky note CSS and how settings control it. Here's the exact current implementation:

### **CSS Variables and Main Shape (lines 5311-5320 in App.css)**

```css
.canvas-text-node[data-shape="sticky"] {
  border: none;
  background: var(--sticky-color, #fef3c7);
  border-radius: 2px;
  box-shadow:
    2px 2px var(--sticky-shadow, 6px) rgba(0, 0, 0, 0.15),
    inset 0 calc(-8px * var(--sticky-curl, 1)) 12px -8px rgba(0, 0, 0, 0.06);
  transform: rotate(calc(-1 * var(--sticky-rotation, 1.5deg)));
  position: relative;
}
```

**Features controlled by CSS variables:**
- `--sticky-color`: Background color (default: #fef3c7)
- `--sticky-shadow`: Outer shadow blur (default: 6px)
- `--sticky-curl`: Multiplier for inset shadow curl effect (1 or 0)
- `--sticky-rotation`: Rotation in degrees (default: 1.5deg)

---

### **1. Top Adhesive Stripe (lines 5323-5334)**

```css
.canvas-text-node[data-shape="sticky"]::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: calc(6px * var(--sticky-stripe, 1));
  background: rgba(0, 0, 0, 0.04);
  border-radius: 2px 2px 0 0;
  pointer-events: none;
  z-index: 1;
}
```

**Store default:** `canvasStickyStripe: true` (line 629 in uiStore.ts)
**Control:** Checkbox "Top stripe" / "Adhesive stripe" (line 1136-1144 in SettingsModal.tsx)
**Height:** `6px * 1` when enabled, or `6px * 0 = 0px` when disabled

---

### **2. Bottom-Right Corner Fold (lines 5343-5354)**

```css
.canvas-text-node[data-shape="sticky"]::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: var(--sticky-fold, 20px);
  height: var(--sticky-fold, 20px);
  background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.08) 50%);
  border-radius: 0 0 2px 0;
  pointer-events: none;
  z-index: 1;
}
```

**Store default:** `canvasStickyFoldSize: 20` (line 624 in uiStore.ts)
**Control:** Range slider 0-40px step 2 (lines 1076-1089 in SettingsModal.tsx)
**Size:** Customizable via `--sticky-fold` variable

---

### **3. Ruled Lines (lines 5363-5374)**

```css
.canvas-text-node[data-shape="sticky"][data-sticky-lines="true"] .canvas-text-node-body {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 23px,
    rgba(0, 0, 0, 0.06) 23px,
    rgba(0, 0, 0, 0.06) 24px
  );
  background-size: 100% 24px;
  background-position: 0 0;
  background-repeat: repeat;
}
```

**Store default:** `canvasStickyLines: false` (line 627 in uiStore.ts)
**Data attribute:** `data-sticky-lines="true"` (set in canvasNodes.tsx line 517)
**Control:** Checkbox "Paper lines" / "Show ruled lines" (lines 1114-1122 in SettingsModal.tsx)
**Line spacing:** 24px per line (23px transparent + 1px line)

---

### **4. Tape Strip (lines 5377-5389)**

```css
.canvas-text-node[data-shape="sticky"][data-sticky-tape="true"] .canvas-text-node-body::before {
  content: "";
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%) rotate(2deg);
  width: 60px;
  height: 20px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.15);
  z-index: 3;
  pointer-events: none;
}
```

**Store default:** `canvasStickyTape: false` (line 626 in uiStore.ts)
**Data attribute:** `data-sticky-tape="true"` (set in canvasNodes.tsx line 516)
**Control:** Checkbox "Tape strip" / "Show tape" (lines 1103-1111 in SettingsModal.tsx)
**Appearance:** 60×20px rectangle, semi-transparent white, slight 2deg rotation

---

### **5. Pushpin (lines 5392-5405)**

```css
.canvas-text-node[data-shape="sticky"][data-sticky-pin="true"] .canvas-text-node-body::after {
  content: "";
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #f75a5a, #c0392b);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);
  z-index: 3;
  pointer-events: none;
}
```

**Store default:** `canvasStickyPin: false` (line 625 in uiStore.ts)
**Data attribute:** `data-sticky-pin="true"` (set in canvasNodes.tsx line 515)
**Control:** Checkbox "Sticky pin" / "Show pushpin" (lines 1092-1100 in SettingsModal.tsx)
**Appearance:** 14×14px red circle with radial gradient, positioned 16px above top center

---

### **CSS Variables Set from Store (CanvasEditor.tsx lines 162-174)**

```typescript
const shapeVars = {
  "--sticky-rotation": `${canvasStickyRotation}deg`,
  "--sticky-color": canvasStickyColor,
  "--sticky-shadow": `${canvasStickyShadow}px`,
  "--sticky-fold": `${canvasStickyFoldSize}px`,
  "--sticky-curl": canvasStickyCurl ? "1" : "0",
  "--sticky-stripe": canvasStickyStripe ? "1" : "0",
  // ... other variables
};
```

---

### **Store Defaults Summary (uiStore.ts lines 621-629)**

| Property | Type | Default | Control |
|----------|------|---------|---------|
| `canvasStickyRotation` | number | 1.5 | Range 0–5° step 0.5 |
| `canvasStickyColor` | string | "#fef3c7" | Color swatches (5 preset colors) |
| `canvasStickyShadow` | number | 6 | Range 0–20px step 1 |
| `canvasStickyFoldSize` | number | 20 | Range 0–40px step 2 |
| `canvasStickyPin` | boolean | false | Checkbox |
| `canvasStickyTape` | boolean | false | Checkbox |
| `canvasStickyLines` | boolean | false | Checkbox |
| `canvasStickyCurl` | boolean | true | Checkbox |
| `canvasStickyStripe` | boolean | true | Checkbox |

---

### **Color Presets Available (SettingsModal.tsx lines 1041-1046)**

- `#fef3c7` – Yellow (default)
- `#fce4ec` – Pink
- `#e3f2fd` – Blue
- `#e8f5e9` – Green
- `#fff3e0` – Orange

---

### **Key Implementation Details**

1. **Data attributes only for boolean toggles** (canvasNodes.tsx lines 514-518):
   - Only `data-sticky-pin`, `data-sticky-tape`, and `data-sticky-lines` use data attributes
   - These conditionally enable/disable CSS rules
   - Curl and stripe use CSS variable multipliers (1 or 0) instead

2. **Text nodes over sticky body**:
   - Pin and tape use `.canvas-text-node-body::before/::after` pseudo-elements
   - Lines use `.canvas-text-node-body` background-image
   - Both styled with `overflow: visible` and `position: relative` (line 5358-5360)

3. **z-index layering**:
   - Stripe/fold: z-index 1
   - Pin/tape: z-index 3

4. **All features are persisted** to `brainmap:uiPrefs` localStorage via `savePrefs()` in uiStore setter functions (lines 830-864)

---

