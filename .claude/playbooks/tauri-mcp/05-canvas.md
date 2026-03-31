# Canvas (React Flow)

## DOM Structure

- Canvas container: `.react-flow`
- Viewport (transform target): `.react-flow__viewport`
- Renderer (has d3-zoom `__zoom`): `.react-flow__renderer`
- Pane (background, receives pan/click): `.react-flow__pane`
- Nodes: `.react-flow__node` with `data-id` attribute
- Node type class: `.react-flow__node-canvasText`, `.react-flow__node-canvasFile`, etc.
- Node content wrapper: `.canvas-text-node`
- Node body (text display): `.canvas-text-node-body`
- Node edit textarea (appears on double-click): `textarea.canvas-text-node-edit`
- Edges: `.react-flow__edge`
- Controls panel: `.react-flow__controls`
- Custom toolbar: `.canvas-toolbar`

## Pan the Viewport

Modify the d3-zoom object on `.react-flow__renderer` and update the viewport CSS transform.

**DO NOT use synthetic PointerEvent or WheelEvent — React Flow ignores them.**

```js
mcp__tauri-mcp__execute_js(code=`
var renderer = document.querySelector('.react-flow__renderer');
var vp = document.querySelector('.react-flow__viewport');
if (!renderer || !renderer.__zoom) return 'No canvas open';
var z = renderer.__zoom;
z.x += 200;
z.y += 100;
vp.style.transform = 'translate(' + z.x + 'px, ' + z.y + 'px) scale(' + z.k + ')';
return 'Panned to x:' + z.x + ' y:' + z.y;
`)
```

## Zoom In / Out

```js
mcp__tauri-mcp__execute_js(code=`
var renderer = document.querySelector('.react-flow__renderer');
var vp = document.querySelector('.react-flow__viewport');
if (!renderer || !renderer.__zoom) return 'No canvas open';
var z = renderer.__zoom;
z.k = 1.5;
vp.style.transform = 'translate(' + z.x + 'px, ' + z.y + 'px) scale(' + z.k + ')';
return 'Zoomed to ' + z.k + 'x';
`)
```

## Fit View

```js
mcp__tauri-mcp__execute_js(code=`
var btn = document.querySelector('.react-flow__controls-fitview');
if (btn) { btn.click(); return 'Fit view'; }
return 'Not found';
`)
```

## Reset Zoom to 100%

The zoom percentage display is `.canvas-toolbar-zoom`. Clicking it resets to 100%.

```js
mcp__tauri-mcp__execute_js(code=`
var btn = document.querySelector('.canvas-toolbar-zoom');
if (btn) { btn.click(); return 'Reset to 100%'; }
return 'Not found';
`)
```

## Get Viewport State

```js
mcp__tauri-mcp__execute_js(code=`
var renderer = document.querySelector('.react-flow__renderer');
if (!renderer || !renderer.__zoom) return 'No canvas open';
var z = renderer.__zoom;
return JSON.stringify({ x: z.x, y: z.y, zoom: z.k });
`)
```

## Zoom Controls (Buttons)

```js
// Zoom in
mcp__tauri-mcp__execute_js(code=`
document.querySelector('.react-flow__controls-zoomin').click();
return 'Zoomed in';
`)

// Zoom out
mcp__tauri-mcp__execute_js(code=`
document.querySelector('.react-flow__controls-zoomout').click();
return 'Zoomed out';
`)
```

## List All Nodes

```js
mcp__tauri-mcp__execute_js(code=`
var nodes = document.querySelectorAll('.react-flow__node');
return JSON.stringify(Array.from(nodes).map(function(n) {
  return {
    id: n.getAttribute('data-id'),
    type: (n.className.match(/react-flow__node-(\\w+)/) || [])[1],
    text: n.textContent.trim().substring(0, 80)
  };
}));
`)
```

## Click a Node by Text

```js
mcp__tauri-mcp__execute_js(code=`
var nodes = document.querySelectorAll('.react-flow__node');
for (var i = 0; i < nodes.length; i++) {
  if (nodes[i].textContent.trim().includes('CDNs globais')) {
    nodes[i].click();
    return 'Clicked: ' + nodes[i].textContent.trim().substring(0, 60);
  }
}
return 'Not found';
`)
```

## Canvas Toolbar

Buttons are in `.canvas-toolbar`, identified by `title`:

| Title | Action |
|-------|--------|
| `Pan mode (H)` | Switch to pan mode |
| `Select mode (V)` | Switch to select mode |
| `Add text card` | Add new text card |
| `Choose shape` | Open shape picker |
| `Add note reference` | Add note reference node |
| `Add link` | Add link node |
| `Add group` | Add group node |
| `Create new note` | Create new note |
| `File browser` | Toggle file browser |
| `Keyboard shortcuts (?)` | Show shortcuts overlay |
| `Fullscreen` | Toggle fullscreen |

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('.canvas-toolbar button');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].title === 'Add text card') { btns[i].click(); return 'Clicked Add text card'; }
}
return 'Not found';
`)
```

## Context Menu: Canvas Background

```js
mcp__tauri-mcp__execute_js(code=`
var pane = document.querySelector('.react-flow__pane');
if (!pane) return 'No canvas';
var rect = pane.getBoundingClientRect();
pane.dispatchEvent(new MouseEvent('contextmenu', {
  bubbles: true, clientX: rect.left + 400, clientY: rect.top + 200, button: 2
}));
return 'Background context menu opened';
`)
```

Items: Add Text Card, Add Summary Card, Add Question Card, Add Transition Card, Add Shaped Card..., Add Note Reference, Add Link, Add Group, Create New Note.

## Context Menu: Node

```js
mcp__tauri-mcp__execute_js(code=`
var nodes = document.querySelectorAll('.react-flow__node');
for (var i = 0; i < nodes.length; i++) {
  if (nodes[i].textContent.trim().includes('TARGET_TEXT')) {
    var rect = nodes[i].getBoundingClientRect();
    nodes[i].dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true, clientX: rect.left + 20, clientY: rect.top + 20, button: 2
    }));
    return 'Node context menu opened';
  }
}
return 'Not found';
`)
```

Items: Duplicate, Change Card Kind..., Convert to Note, Delete.

## Edit Node Text

Three-step process:
1. Double-click the `.canvas-text-node-body` to enter edit mode (a `textarea.canvas-text-node-edit` appears)
2. Use the `type_text` MCP tool to type into the textarea
3. Click the pane to commit the edit

**NEVER directly modify `.textContent` or `.innerHTML` on React-managed elements — it crashes the app.**

```js
// Step 1: Double-click to enter edit mode
mcp__tauri-mcp__execute_js(code=`
var nodes = document.querySelectorAll('.react-flow__node');
for (var i = 0; i < nodes.length; i++) {
  if (nodes[i].textContent.trim().includes('TARGET_TEXT')) {
    var body = nodes[i].querySelector('.canvas-text-node-body');
    body.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    return 'Edit mode for: ' + nodes[i].textContent.trim().substring(0, 40);
  }
}
return 'Not found';
`)

// Step 2: Type text (uses native input injection — safe for React)
mcp__tauri-mcp__type_text(
  selector_type="class",
  selector_value="canvas-text-node-edit",
  text="Claude is awesome"
)

// Step 3: Click pane to commit
mcp__tauri-mcp__execute_js(code=`
document.querySelector('.react-flow__pane').click();
return 'Committed';
`)
```

Note: the new card starts off-screen at the canvas center. Use "Fit View" after adding to see it, or get its position via the node query pattern before editing.

## Delete a Node

Two-step: open node context menu, then click Delete. See `08-helpers.md` for clicking context menu items.

## Synthetic Keyboard Events

When dispatching keyboard events on the canvas (e.g., Cmd+Z for undo), `e.target` must be inside the canvas container for scoped handlers to fire. Synthetic events set `e.target` to whatever element you call `dispatchEvent()` on — NOT `document.activeElement`.

**Two-step pattern** — focus first, then dispatch on the focused element:

```js
// Step 1: Focus the canvas container
mcp__tauri-mcp__execute_js(code=`
var c = document.querySelector('.canvas-container');
if (c) c.focus();
return 'focused';
`)

// Step 2: Dispatch on the active element (separate call so focus has settled)
mcp__tauri-mcp__execute_js(code=`
var el = document.activeElement || document;
el.dispatchEvent(new KeyboardEvent('keydown', {
  key: 'z', metaKey: true, bubbles: true, cancelable: true
}));
return 'dispatched Cmd+Z on ' + el.tagName;
`)
```

**Why two calls?** `.focus()` and `dispatchEvent()` in the same `execute_js` call doesn't give the browser time to update `document.activeElement`. The second call sees the settled focus state.

**Wrong**: `document.dispatchEvent(...)` — sets `e.target = document`, which is outside the canvas container, so scoped handlers won't fire.
