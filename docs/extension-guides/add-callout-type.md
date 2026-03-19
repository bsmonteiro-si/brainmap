# How to Add a Block Callout Type

Adding a callout type registers a new `[!type] Title { ... }` block with colored border, icon header, fold support, and slash command autocomplete.

If you also want an inline citation (`[!type content]`), follow this guide first, then follow `add-inline-command.md`.

## Checklist

### 1. Type Registry

- [ ] `crates/app/src/components/Editor/calloutTypes.ts` — Import the Lucide icon and add an entry to `CALLOUT_TYPES`:
  ```ts
  yourtype: { color: "#hexcolor", label: "Your Type", Icon: YourIcon },
  ```
  This is the single source of truth for color, label, and icon. Block decorations, preview rendering, and slash command coloring all read from here.

### 2. Block Callout Icon (CodeMirror)

- [ ] `crates/app/src/components/Editor/cmCalloutDecorations.ts` — Add SVG paths to `CALLOUT_ICON_PATHS`. Extract `d` attributes from the Lucide icon source (viewBox 0 0 24 24, stroke-based):
  ```ts
  yourtype: [
    ["path", { d: "..." }],
    // ...
  ],
  ```

### 3. Slash Command Icon

- [ ] `crates/app/src/components/Editor/cmSlashCommands.ts`:
  - Add SVG icon paths to `ICON_PATHS` (e.g. `"your-icon": [...]`).
  - Add mapping in `CALLOUT_ICON_MAP`: `yourtype: "your-icon"`.

  The block callout slash command (`/yourtype`) is auto-generated from `CALLOUT_TYPE_ENTRIES` — no manual command entry needed.

### 4. Tests

- [ ] `crates/app/src/components/Editor/cmSlashCommands.test.ts` — The auto-generated callout count is derived from `CALLOUT_TYPE_ENTRIES.length`, so the test passes automatically. Verify with `npx vitest run`.

### 5. Documentation

- [ ] `docs/CHANGELOG.md` — Add an entry describing the new callout type.

## Verification

1. `npx vitest run` — all tests pass
2. Type `/yourtype` in the editor — autocomplete shows the callout command with colored icon
3. Write `[!yourtype] Title { ... }` — block renders with colored border, icon header, fold support
4. Preview panel — blockquote renders with callout styling
5. `./scripts/check.sh` before committing

## Notes

- Block callouts use brace syntax (`{ ... }`) which is preprocessed into blockquotes by `calloutPreprocess.ts`. No changes needed there — it accepts any `[!type]` slug.
- Unknown callout types get fallback gray styling, so the block works even before you add the icon — but it won't have color or a proper icon until registered.
- The `CALLOUT_TYPES` registry also drives the MarkdownPreview blockquote component — no separate preview work needed.
