# Editor

## DOM Structure

- Editor toolbar: `.editor-toolbar`
- Toolbar buttons: `.editor-toolbar-btn` (with title attribute)
- View mode buttons: `.editor-view-btn` (active: `.editor-view-btn--active`)
- CodeMirror content: `.cm-content`
- Editor area: `.cm-editor`

## Toolbar Buttons

All buttons are `.editor-toolbar-btn`. Click by title:

| Title | Button text |
|-------|------------|
| `Bold (Cmd+B)` | B |
| `Italic (Cmd+I)` | I |
| `Strikethrough (Cmd+Shift+X)` | S |
| `Inline Code (Cmd+E)` | <> |
| `Heading 1 (Cmd+Shift+1)` | H1 |
| `Heading 2 (Cmd+Shift+2)` | H2 |
| `Heading 3 (Cmd+Shift+3)` | H3 |
| `Bulleted List` | — |
| `Numbered List` | 1. |
| `Blockquote` | ❝ |
| `Link (Cmd+K)` | 🔗 |
| `Horizontal Rule` | ― |
| `Insert Table` | ☷ |
| `Insert Callout` | ☰ |

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('.editor-toolbar-btn');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].title.startsWith('Bold')) { btns[i].click(); return 'Clicked Bold'; }
}
return 'Not found';
`)
```

## Switch View Mode (Edit / Preview / Raw)

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('.editor-view-btn');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].textContent.trim() === 'Preview') { btns[i].click(); return 'Switched to Preview'; }
}
return 'Not found';
`)
```

## Read Editor Content

```js
mcp__tauri-mcp__execute_js(code=`
var cmEl = document.querySelector('.cm-content');
if (cmEl) return cmEl.textContent.substring(0, 2000);
return 'No CodeMirror editor open';
`)
```

## Keyboard Shortcuts

Dispatch on `document`. These are global shortcuts handled in `App.tsx` (NOT CodeMirror keymaps — see limitations below):

```js
// Save (Cmd+S)
mcp__tauri-mcp__execute_js(code=`
document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }));
return 'Dispatched Cmd+S';
`)

// New note (Cmd+N)
mcp__tauri-mcp__execute_js(code=`
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', metaKey: true, bubbles: true }));
return 'Dispatched Cmd+N';
`)

// Command palette (Cmd+P)
mcp__tauri-mcp__execute_js(code=`
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', metaKey: true, bubbles: true }));
return 'Dispatched Cmd+P';
`)

// Toggle left panel (Cmd+B) — only works when cursor is NOT in CodeMirror
mcp__tauri-mcp__execute_js(code=`
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', metaKey: true, bubbles: true }));
return 'Dispatched Cmd+B';
`)

// Close active tab (Cmd+W)
mcp__tauri-mcp__execute_js(code=`
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', metaKey: true, bubbles: true }));
return 'Dispatched Cmd+W';
`)

// Escape — close dialogs, modals, fullscreen
mcp__tauri-mcp__execute_js(code=`
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
return 'Dispatched Escape';
`)
```

## Synthetic KeyboardEvent Limitations

CodeMirror 6 ignores synthetic `KeyboardEvent` dispatched via `dispatchEvent()` — it uses its own internal input handling that only processes real browser keystrokes. You **cannot** test CM undo/redo, formatting shortcuts, or any CM keymap via `execute_js`.

To verify CM behavior via MCP:
- Use `type_text` to input text, then read `.cm-content.textContent` to verify
- Use store actions (`useEditorStore`) for operations like save
- Assert DOM state (content, classes) rather than triggering key-based commands

For keyboard shortcuts handled in `App.tsx` (Cmd+S, Cmd+N, etc.), dispatching on `document` works fine — those use standard `addEventListener`, not CM keymaps.
