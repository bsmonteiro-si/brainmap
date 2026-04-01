---
name: ui-fix
description: Structured workflow for CSS and visual changes that enforces read-before-write and visual verification. Use when fixing UI bugs, restyling components, or adjusting subtle visual properties.
argument: Description of the visual issue or styling goal
---

# UI Fix Skill

You are making a visual/CSS change. Follow this workflow strictly — do NOT write CSS until Step 3.

## Step 1: Identify the Target

1. Find the exact element that needs to change — read the component source to confirm the DOM structure and class names
2. If the user mentioned a component name (e.g., "canvas panel header"), grep for it and verify you're looking at the right element — do NOT assume based on the name alone
3. Note the element's parent chain (at least 2 levels up) — specificity conflicts come from ancestors

## Step 2: Read Existing Styles

1. Read `App.css` (or relevant CSS file) and find all rules that currently apply to the target element
2. Check for:
   - **Specificity conflicts**: are there more specific selectors that would override your change? (e.g., `.react-flow .some-class` beats `.some-class`)
   - **`!important` rules**: any existing `!important` on the same property?
   - **Stale styles**: leftover rules from previous states (shape-switching, theme toggling) that might interfere
   - **CSS variables**: is the property set via a `var(--...)` that changes between themes?
3. If the change involves React Flow or CodeMirror elements, check the library's internal styles too — they often have high specificity

## Step 3: Plan and State Expectations

Before writing any CSS, state:

- **What you will change**: exact selector, property, value
- **Why this selector is specific enough**: which existing rules it needs to beat and how
- **Expected visual result**: what should be visible. For subtle properties, state the minimum threshold:
  - `box-shadow`: opacity below 0.15 is invisible on dark backgrounds; start at 0.25+
  - `opacity`: below 0.3 is barely perceptible on most backgrounds
  - `border`: 1px borders below 0.2 opacity are invisible; use at least 0.3
  - `text-shadow` / `filter: drop-shadow`: test at 2x the value you think is right, then dial back
  - `backdrop-filter`: `blur()` below 4px is imperceptible
  - `gradient`: stops less than 5% apart create no visible transition

Present this to the user. **Wait for confirmation before writing CSS.** If the user adjusts the plan, adapt before proceeding.

## Step 4: Implement

1. Write the CSS change
2. Read back the rule you just wrote and the surrounding rules to confirm no specificity conflict
3. Check both light and dark theme if the property is theme-dependent (search for the CSS variable in both `:root` and `[data-theme="dark"]` or equivalent)
4. If you have MCP access to the running app (tauri-mcp or isolated instance), take a screenshot to verify the change is visible

## Step 5: Verify Completeness

1. Check if the same element appears in other contexts (e.g., canvas panel vs. main editor, selected vs. unselected state) — does the fix apply everywhere it should?
2. Check for stale styles that should be removed — if you're replacing an approach (e.g., switching from `opacity` to `box-shadow`), remove the old rule
3. Run `npx vitest run` if there are CSS-related tests (snapshot tests, computed style assertions)

## Rules

- Never write CSS without reading existing styles on the target first (Step 2)
- Never use `!important` unless there's an existing `!important` on the same property that you need to override — document why
- For subtle visual properties, always start at or above the minimum visible threshold — don't assume small values are visible
- If the user says a change is invisible or too subtle, double the value as a starting point rather than making incremental 10% increases
- If you styled the wrong element, stop — go back to Step 1 and re-identify the target from the component source
- Check the Platform Gotchas Index for relevant constraints (React Flow high specificity, counter-zoom, CodeMirror .cm-line restriction)
