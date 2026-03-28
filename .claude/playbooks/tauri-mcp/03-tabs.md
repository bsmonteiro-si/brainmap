# Tab Bar

## DOM Structure

- Tab bar: `.tab-bar`
- Tab item: `.tab-item` (active: `.tab-item--active`)
- Tab title: `.tab-title` (span)
- Close button: `.tab-close` (button, text `×`)
- New tab button: `.tab-new-btn` (button, text `+`)

## Switch to a Tab

```js
mcp__tauri-mcp__execute_js(code=`
var tabs = document.querySelectorAll('.tab-item');
for (var i = 0; i < tabs.length; i++) {
  var title = tabs[i].querySelector('.tab-title');
  if (title && title.textContent.trim() === 'CLAUDE.md') { tabs[i].click(); return 'Switched to CLAUDE.md'; }
}
return 'Tab not found';
`)
```

## Close a Tab

```js
mcp__tauri-mcp__execute_js(code=`
var tabs = document.querySelectorAll('.tab-item');
for (var i = 0; i < tabs.length; i++) {
  var title = tabs[i].querySelector('.tab-title');
  if (title && title.textContent.trim() === 'CLAUDE.md') {
    var closeBtn = tabs[i].querySelector('.tab-close');
    if (closeBtn) { closeBtn.click(); return 'Closed CLAUDE.md'; }
  }
}
return 'Tab not found';
`)
```

Note: closing a dirty untitled tab triggers an unsaved changes dialog. See `06-dialogs.md`.

## Open New Tab

```js
mcp__tauri-mcp__execute_js(code=`
var btn = document.querySelector('.tab-new-btn');
if (btn) { btn.click(); return 'New tab opened'; }
return 'Not found';
`)
```

## List All Open Tabs

```js
mcp__tauri-mcp__execute_js(code=`
var tabs = document.querySelectorAll('.tab-item');
return JSON.stringify(Array.from(tabs).map(function(t) {
  var title = t.querySelector('.tab-title');
  return {
    name: title ? title.textContent.trim() : '',
    active: t.className.indexOf('tab-item--active') >= 0
  };
}));
`)
```
