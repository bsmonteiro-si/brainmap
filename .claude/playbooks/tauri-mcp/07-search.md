# Search Panel

## DOM Structure

- Panel: `.search-panel`
- Search input: `input` inside `.search-panel` (placeholder `Search notes...`)
- Type filter: `select` inside `.search-panel` (options: `All Types`, `concept`, `book-note`, `question`, `reference`, ...)
- Results: `.search-result` items

Note: the file tree also has a filter input (`.file-tree-search-input`, placeholder `Filter...`). Make sure to target the correct one.

## Open Search Panel

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('.icon-sidebar-btn');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].title === 'Search') { btns[i].click(); return 'Opened Search'; }
}
return 'Not found';
`)
```

## Type a Search Query

```js
mcp__tauri-mcp__execute_js(code=`
function setNativeValue(el, value) {
  var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
var panel = document.querySelector('.search-panel');
if (!panel) return 'No search panel';
var input = panel.querySelector('input');
if (!input) return 'No input';
setNativeValue(input, 'Internet');
return 'Searched for: Internet';
`)
```

## Filter by Type

```js
mcp__tauri-mcp__execute_js(code=`
var panel = document.querySelector('.search-panel');
if (!panel) return 'No search panel';
var select = panel.querySelector('select');
if (!select) return 'No type filter';
select.value = 'concept';
select.dispatchEvent(new Event('change', { bubbles: true }));
return 'Filtered by: concept';
`)
```

## Click a Search Result

```js
mcp__tauri-mcp__execute_js(code=`
var results = document.querySelectorAll('[class*="search-result"]');
if (results.length === 0) return 'No results';
results[0].click();
return 'Clicked: ' + results[0].textContent.trim().substring(0, 40);
`)
```

## Clear Search

```js
mcp__tauri-mcp__execute_js(code=`
function setNativeValue(el, value) {
  var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
var panel = document.querySelector('.search-panel');
if (!panel) return 'No search panel';
var input = panel.querySelector('input');
if (!input) return 'No input';
setNativeValue(input, '');
return 'Cleared search';
`)
```
