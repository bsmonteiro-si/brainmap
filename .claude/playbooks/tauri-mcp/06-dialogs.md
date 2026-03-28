# Dialogs

## Finding a Dialog

Dialogs don't have unique container classes. Find them by locating the Cancel/Create buttons and walking up:

```js
mcp__tauri-mcp__execute_js(code=`
var container = null;
var allBtns = document.querySelectorAll('button');
for (var i = 0; i < allBtns.length; i++) {
  if (allBtns[i].textContent.trim() === 'Cancel') {
    container = allBtns[i].parentElement;
    while (container && !container.querySelector('input')) container = container.parentElement;
    break;
  }
}
return container ? 'Dialog found' : 'No dialog open';
`)
```

## Fill React Controlled Inputs

React controlled inputs require `setNativeValue` (see `08-helpers.md`). Regular `.value =` won't trigger React state updates.

### Create Note Dialog

Fields in order:
- `input[0]` — Path (placeholder `Concepts/My-Note`)
- `input[1]` — Title (placeholder `My Note`)
- `select` — Type (values: `concept`, `book-note`, `question`, `reference`, etc.)
- `input[2]` — Tags (placeholder `causality, statistics`)
- `textarea` — Body (placeholder `Initial note content...`)

Also has Note/File toggle buttons at the top.

```js
mcp__tauri-mcp__execute_js(code=`
function setNativeValue(el, value) {
  var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
  var setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

var container = null;
var allBtns = document.querySelectorAll('button');
for (var i = 0; i < allBtns.length; i++) {
  if (allBtns[i].textContent.trim() === 'Cancel') {
    container = allBtns[i].parentElement;
    while (container && !container.querySelector('input')) container = container.parentElement;
    break;
  }
}
if (!container) return 'No dialog found';

var inputs = container.querySelectorAll('input[type="text"]');
var textarea = container.querySelector('textarea');
var select = container.querySelector('select');

if (inputs[0]) setNativeValue(inputs[0], 'TestFolder/my-note');
if (inputs[1]) setNativeValue(inputs[1], 'My Test Note');
if (inputs[2]) setNativeValue(inputs[2], 'tag1, tag2');
if (textarea) setNativeValue(textarea, 'Body content here.');
if (select) { select.value = 'concept'; select.dispatchEvent(new Event('change', { bubbles: true })); }

return 'Dialog filled';
`)
```

## Submit Dialog

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].textContent.trim() === 'Create') { btns[i].click(); return 'Submitted'; }
}
return 'Create button not found';
`)
```

## Cancel Dialog

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].textContent.trim() === 'Cancel') { btns[i].click(); return 'Cancelled'; }
}
return 'Cancel not found';
`)
```

## Confirm Delete Dialog

The delete confirmation has a `Delete` button with danger styling.

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
  var txt = btns[i].textContent.trim();
  if (txt === 'Delete' && btns[i].className.indexOf('danger') >= 0) {
    btns[i].click(); return 'Confirmed delete';
  }
}
return 'Delete button not found';
`)
```

## Unsaved Changes Dialog

Appears when closing an untitled tab with content. Buttons: `Save As`, `Discard`, `Cancel`.

```js
// Discard unsaved changes
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].textContent.trim() === 'Discard') { btns[i].click(); return 'Discarded'; }
}
return 'Discard not found';
`)
```
