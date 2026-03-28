# Basics: Screenshot, App Status, Sidebar, View State

## Verify App Is Running

```
mcp__tauri-mcp__query_page(mode="app_info")
```

Expected: `{ app: { name: "BrainMap", version: "..." }, windows: [...] }`

## Take Screenshot

```
mcp__tauri-mcp__take_screenshot(inline=true, max_width=1920)
```

Use `inline=true` to get the image directly. The screenshot captures the window buffer — the app does NOT need to be in the foreground.

## Navigate Sidebar

Left sidebar buttons: class `icon-sidebar-btn`. Navigate by `title` attribute.

| Title | Action |
|-------|--------|
| `Files` | Show file tree panel |
| `Graph` | Show knowledge graph |
| `Search` | Show search panel |
| `Canvas` | Show canvas panel |
| `Settings (⌘,)` | Open settings modal |
| `Close segment` | Return to segment picker |

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('.icon-sidebar-btn');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].title === 'Files') { btns[i].click(); return 'clicked Files'; }
}
return 'not found';
`)
```

## Check Which View/Tab Is Active

```js
mcp__tauri-mcp__execute_js(code=`
var activeTab = document.querySelector('.icon-sidebar-btn.active');
var openTab = document.querySelector('.tab-item--active .tab-title');
return JSON.stringify({
  sidebarActive: activeTab ? activeTab.title : 'none',
  openTab: openTab ? openTab.textContent.trim() : 'none'
});
`)
```

## Dump All Interactive Elements (Discovery)

Use this when you're in an unfamiliar view state:

```js
mcp__tauri-mcp__execute_js(code=`
var result = {};
result.sidebar = Array.from(document.querySelectorAll('.icon-sidebar-btn')).map(function(b) {
  return { title: b.title, active: b.className.indexOf('active') >= 0 };
});
result.tabs = Array.from(document.querySelectorAll('.tab-item')).map(function(t) {
  var title = t.querySelector('.tab-title');
  return { name: title ? title.textContent.trim() : '', active: t.className.indexOf('active') >= 0 };
});
result.contextMenuOpen = document.querySelectorAll('.context-menu-item').length > 0;
result.hasEditor = !!document.querySelector('.cm-content');
result.hasCanvas = !!document.querySelector('.react-flow');
result.hasDialog = Array.from(document.querySelectorAll('button')).some(function(b) { return b.textContent.trim() === 'Cancel'; });
result.treeVisible = !!document.querySelector('.file-tree-toolbar');
result.searchVisible = !!document.querySelector('.search-panel');
return JSON.stringify(result, null, 2);
`)
```
