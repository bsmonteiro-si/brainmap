# Helpers

## setNativeValue — Fill React Controlled Inputs

React controlled inputs ignore direct `.value` assignment. Use the native property descriptor:

```js
function setNativeValue(el, value) {
  var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
  var setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}
```

Include this function at the top of any `execute_js` call that needs to fill inputs.

## Click a Context Menu Item

Context menu items are all `.context-menu-item`. Click by text:

```js
mcp__tauri-mcp__execute_js(code=`
var items = document.querySelectorAll('.context-menu-item');
for (var i = 0; i < items.length; i++) {
  if (items[i].textContent.trim() === 'Rename') { items[i].click(); return 'Clicked Rename'; }
}
return 'Not found';
`)
```

## Dismiss Context Menu

```js
mcp__tauri-mcp__execute_js(code=`
document.body.click();
return 'Dismissed';
`)
```

## Dismiss Any Dialog / Modal

```js
mcp__tauri-mcp__execute_js(code=`
document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
return 'Escape pressed';
`)
```

## Click a Button by Exact Text

Generic pattern for any button:

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].textContent.trim() === 'BUTTON_TEXT') { btns[i].click(); return 'Clicked'; }
}
return 'Not found';
`)
```

## Click a Button by Title

```js
mcp__tauri-mcp__execute_js(code=`
var btns = document.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].title === 'BUTTON_TITLE') { btns[i].click(); return 'Clicked'; }
}
return 'Not found';
`)
```

## Wait for Element to Appear

When an action triggers async rendering (folder expand, dialog open), the target element may not exist immediately. Use a polling pattern across separate `execute_js` calls:

1. Execute the action
2. In the next `execute_js` call, check if the element exists
3. If not found, take a screenshot and retry once more

Do NOT use `setTimeout` inside `execute_js` — the return value won't include the delayed result. Always split into separate calls.

## type_text MCP Tool — Safe Text Input

For typing into textareas, inputs, or contenteditable elements, prefer the `type_text` MCP tool over DOM manipulation. It uses native input injection that works with React.

```
mcp__tauri-mcp__type_text(
  selector_type="class",
  selector_value="canvas-text-node-edit",
  text="Hello world"
)
```

Load it first: `ToolSearch(query="select:mcp__tauri-mcp__type_text")`

Modes:
- By selector: `selector_type` + `selector_value` + `text`
- Into focused element: just `text`
- Multiple fields: `fields` array

## DANGER: Never Modify React DOM Directly

**NEVER set `.textContent`, `.innerHTML`, or `.innerText` on React-managed elements.** This desynchronizes React's virtual DOM and crashes the app (blank screen, React unmounts).

Safe alternatives:
- Use `type_text` MCP tool for text input
- Use `setNativeValue` for form inputs (see above)
- Use `element.click()` or `element.dispatchEvent(new MouseEvent(...))` for interactions
- Use store actions via `execute_js` if you know the Zustand store API

## Verification Pattern

After every action:

1. Check the `execute_js` return value for success/failure
2. Take a screenshot: `take_screenshot(inline=true, max_width=1920)`
3. If failed, use the "Dump All Interactive Elements" pattern from `01-basics.md` to debug
