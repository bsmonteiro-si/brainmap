# How to Add an Inline Citation Command

Adding an inline command creates a `[!type content]` citation that renders inline within paragraphs, with cursor-aware CodeMirror decorations, 4 toggleable display styles, a `/type` slash command, and preview rendering.

**Prerequisite:** The callout type must already exist in `CALLOUT_TYPES` (see `add-callout-type.md`). The inline command reuses the same type slug and color.

## Which callout types have inline commands?

Not all do. Inline commands make sense for citations and annotations that appear mid-sentence (e.g. source, example, math, attention). Block-only callouts like `ai-answer`, `question`, `key-insight`, and `definition` don't have inline variants.

Current inline types: `source`, `example`, `math`, `attention`.

## Checklist

### 1. Remark Plugin (Preview Rendering)

- [ ] `crates/app/src/components/Editor/remarkInlineSource.ts` — Add `"yourtype"` to the `INLINE_TYPES` array. This auto-updates the regex and generates `<span class="inline-yourtype">` HTML in preview.

### 2. CodeMirror Decorations (Editor)

- [ ] `crates/app/src/components/Editor/cmMarkdownDecorations.ts`:
  - Update `INLINE_CITATION_RE` regex to include `yourtype` in the alternation group.
  - Add 3 mark decorations:
    ```ts
    const yourtypeTagMark = Decoration.mark({ class: "cm-yourtype-tag" });
    const yourtypeContentMark = Decoration.mark({ class: "cm-yourtype-content" });
    const yourtypeBracketMark = Decoration.mark({ class: "cm-yourtype-bracket" });
    ```
  - Add an entry to the `CITATION_MARKS` lookup map.
  - Update the **Link skip-range guard** (~line 392) — add `&& !linkText.startsWith("[!yourtype")` to prevent citations inside Link syntax-tree nodes from being skipped.

### 3. Style Setting (Zustand Store)

- [ ] `crates/app/src/stores/uiStore.ts`:
  - Add type and options:
    ```ts
    export type YourTypeStyle = "underline" | "pill" | "icon" | "quotes";
    export const YOURTYPE_STYLE_OPTIONS: { value: YourTypeStyle; label: string }[] = [
      { value: "underline", label: "Underline + label" },
      { value: "pill", label: "Pill badge" },
      { value: "icon", label: "Your icon" },
      { value: "quotes", label: "Quotation marks" },
    ];
    ```
  - Add `yourtypeStyle?: YourTypeStyle` to `PersistedPrefs` interface.
  - Add `yourtypeStyle: YourTypeStyle` to the store state interface.
  - Set default `"pill"` in the store initializer.
  - Add `setYourTypeStyle` action (interface + implementation), mirroring `setSourceStyle`.

### 4. Apply Style Attribute (App Root)

- [ ] `crates/app/src/App.tsx` — Read from store and apply on `<html>`:
  ```ts
  const yourtypeStyle = useUIStore((s) => s.yourtypeStyle);
  // ...
  useEffect(() => {
    document.documentElement.setAttribute("data-yourtype-style", yourtypeStyle);
  }, [yourtypeStyle]);
  ```

### 5. Settings UI

- [ ] `crates/app/src/components/Settings/SettingsModal.tsx`:
  - Import `YOURTYPE_STYLE_OPTIONS` and `YourTypeStyle` type.
  - Add store selectors for `yourtypeStyle` and `setYourTypeStyle`.
  - Add a settings row with a `<select>` dropdown, mirroring the Source/Example rows.

### 6. CSS Styles

- [ ] `crates/app/src/App.css` — Add two blocks:

  **Editor inline styles** (4 variants scoped by `[data-yourtype-style]` on `<html>`):
  - `underline`: label text via `::after` + underline on content
  - `pill`: rounded badge label + plain content
  - `icon`: emoji/symbol via `::after` + italic content
  - `quotes`: quotation marks via `::before`/`::after` + superscript abbreviation

  Each variant needs rules for `.cm-yourtype-tag`, `.cm-yourtype-content`, `.cm-yourtype-bracket`. Copy an existing type's block (e.g. source or attention) and replace the color and label text.

  **Preview inline styles** (for MarkdownPreview):
  ```css
  .inline-yourtype {
    background: color-mix(in srgb, #hexcolor 8%, transparent);
    border-bottom: 1.5px solid #hexcolor;
    font-style: italic;
    color: var(--text-secondary);
  }
  .inline-yourtype-tag {
    color: #hexcolor;
    font-size: 0.8em;
    font-weight: 600;
    font-style: normal;
    margin-right: 4px;
    text-transform: uppercase;
    opacity: 0.7;
  }
  ```

### 7. Slash Command

- [ ] `crates/app/src/components/Editor/cmSlashCommands.ts`:
  - Add `"yourtype"` to `INLINE_COMMAND_TYPES` set. This renames the auto-generated block callout command from `/yourtype` to `/yourtype-callout`, freeing `/yourtype` for the inline command.
  - Add inline command entry in the BrainMap section of `SLASH_COMMANDS`:
    ```ts
    {
      keyword: "yourtype",
      label: "Inline YourType",
      detail: "...",
      section: "BrainMap",
      icon: "your-icon",
      apply: (v, from, to) =>
        replaceWith(v, from, to, '[!yourtype ]', '[!yourtype '.length),
    },
    ```

### 8. Tests

- [ ] `crates/app/src/components/Editor/remarkInlineSource.test.ts` — Add a `hasInlineYourType` helper and a `describe` block with at minimum:
  - Basic transform (tag + content present)
  - Mixed with other inline types in one paragraph
  - Empty content rejection (`[!yourtype ]`)
  - No match without space (`[!yourtypetext]`)
  - Code block skip (fenced + inline)
  - Heading support
  - List item support
- [ ] `crates/app/src/components/Editor/cmSlashCommands.test.ts` — Bump `STATIC_COMMAND_COUNT` by 1.
- [ ] Run `npx vitest run` to verify all tests pass.

### 9. Documentation

- [ ] `docs/CHANGELOG.md` — Add an entry for the inline command.

## Verification

1. `npx vitest run` — all tests pass
2. Type `/yourtype` — autocomplete shows "Inline YourType"; `/yourtype-callout` shows block variant
3. Write `[!yourtype content]` inline — cursor-aware decoration with selected style
4. Move cursor into/out of citation — raw syntax when inside, styled when outside
5. Settings > YourType citations — switch between 4 styles, all render correctly
6. Preview panel — inline citation renders with styled span
7. `./scripts/check.sh` before committing
