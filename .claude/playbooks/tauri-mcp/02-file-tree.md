# File Tree

## DOM Structure

- Tree items: `.tree-item` (div with `role="button"`, `data-tree-path` attribute)
- Folders: `.tree-item.tree-folder`
- Labels: `.tree-item-label` (span inside `.tree-item`)
- Folder badge: `.tree-folder-count`
- Chevron: `.tree-chevron-icon` (svg)
- Toolbar: `.file-tree-toolbar`
- Toolbar buttons: `.file-tree-toolbar-btn`

## Expand / Collapse Folder

Click the `.tree-item` to toggle. Works for both expand and collapse.

```js
mcp__tauri-mcp__execute_js(code=`
var items = document.querySelectorAll('.tree-item-label');
for (var i = 0; i < items.length; i++) {
  if (items[i].textContent.trim().startsWith('Aula 1')) {
    items[i].closest('.tree-item').click();
    return 'Toggled: ' + items[i].textContent.trim();
  }
}
return 'Not found';
`)
```

## Open a File

Same pattern — clicking a non-folder `.tree-item` opens it in the editor.

```js
mcp__tauri-mcp__execute_js(code=`
var items = document.querySelectorAll('.tree-item-label');
for (var i = 0; i < items.length; i++) {
  if (items[i].textContent.trim() === 'Aula 1.canvas') {
    items[i].closest('.tree-item').click();
    return 'Opened: ' + items[i].textContent.trim();
  }
}
return 'Not found';
`)
```

## Open a File Inside a Collapsed Folder

Two separate `execute_js` calls — the folder must expand and render children before the file is clickable.

1. Call expand pattern (above)
2. Call open pattern (above) in a second `execute_js`

If step 2 returns "Not found", the folder hasn't rendered yet. Take a screenshot and retry.

## Find by Path

Use `data-tree-path` for precise targeting:

```js
mcp__tauri-mcp__execute_js(code=`
var el = document.querySelector('[data-tree-path="Aula 1/Aula 1.canvas"]');
if (el) { el.click(); return 'Opened by path'; }
return 'Not found';
`)
```

## List All Visible Items

```js
mcp__tauri-mcp__execute_js(code=`
var items = document.querySelectorAll('.tree-item-label');
return JSON.stringify(Array.from(items).map(function(el) {
  var row = el.closest('.tree-item');
  return {
    name: el.textContent.trim(),
    path: row ? row.getAttribute('data-tree-path') : null,
    isFolder: row ? row.classList.contains('tree-folder') : false
  };
}));
`)
```

## Toolbar Buttons

Buttons are `.file-tree-toolbar-btn` with titles:

| Title | Action |
|-------|--------|
| `New Note (⌘N)` | Open create note dialog |
| `New Folder` | Open create folder dialog |
| `Collapse All` | Collapse all expanded folders |
| `Select Opened File` | Scroll to and highlight active file |

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('.file-tree-toolbar-btn');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].title.startsWith('New Note')) { btns[i].click(); return 'Clicked New Note'; }
}
return 'Not found';
`)
```

## Right-Click Context Menu

Dispatch `contextmenu` on the `.tree-item`:

```js
mcp__tauri-mcp__execute_js(code=`
var items = document.querySelectorAll('.tree-item-label');
for (var i = 0; i < items.length; i++) {
  if (items[i].textContent.trim() === 'CLAUDE.md') {
    var row = items[i].closest('.tree-item');
    var rect = row.getBoundingClientRect();
    row.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true, clientX: rect.left + 50, clientY: rect.top + 8, button: 2
    }));
    return 'Context menu opened';
  }
}
return 'Not found';
`)
```

**File context menu items** (`.context-menu-item`):

| Item | Note |
|------|------|
| `New Note at Root` | |
| `Convert to Note` | Plain files only |
| `Rename` | |
| `Move to...` | |
| `Show in Finder` | |
| `Open in Default App` | |
| `Copy Relative Path` | |
| `Copy Absolute Path` | |
| `Delete` | Has class `context-menu-item--danger` |

**Folder context menu** adds: `New Note Here`, `New Drawing Here`, `New Canvas Here`, `New Folder Here`, `Import Files Here`, `Focus in Graph`.

To click a menu item or dismiss, see `08-helpers.md`.
