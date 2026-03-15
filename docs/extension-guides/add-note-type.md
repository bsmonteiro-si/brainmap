# How to Add a Note Type

## Checklist

### Backend (Rust)

- [ ] Register in default config — `crates/core/src/config.rs` (line ~84, `default_note_types()` function). Add the new type string to the `vec![]`.
- [ ] Update config test assertion — `crates/core/src/config.rs` (line ~136, `test_default_config`). Bump the `note_types.len()` count.
- [ ] If validation exists, update it — `crates/core/src/workspace.rs`. The core does not hard-validate note types against the config list during parsing, but `WorkspaceConfig::register_note_type()` at `crates/core/src/config.rs` (line ~34) can be used to add types at runtime.

### CLI

- [ ] No changes needed — the CLI accepts any `--type` string. The new type will be included in `node_create` and `node list --type` filtering automatically once registered in config.

### MCP Server

- [ ] No changes needed — the MCP `node_create` tool accepts any `type` string. Optionally update the tool description in `crates/mcp/src/tools/mod.rs` (line ~88) to mention the new type in the description text.

### Desktop App — Graph Visualization

- [ ] Add color — `crates/app/src/components/GraphView/graphStyles.ts` (line ~3, `NOTE_TYPE_COLORS` record). Add `"your-type": "#hexcolor"`.
- [ ] Add shape — `crates/app/src/components/GraphView/graphStyles.ts` (line ~22, `NOTE_TYPE_SHAPES` record). Add `"your-type": "ellipse"`.
- [ ] Add graph icon SVG paths — `crates/app/src/components/GraphView/graphIcons.ts` (line ~6, `NOTE_TYPE_ICON_PATHS` record). Add a new entry with SVG path data extracted from the corresponding Lucide icon (viewBox 0 0 24 24, stroke-based).

### Desktop App — File Tree

- [ ] Add file tree icon — `crates/app/src/components/Layout/fileTreeIcons.tsx` (line ~35, `NOTE_TYPE_ICONS` record). Import the Lucide React icon component at the top, then map `"your-type": YourIcon`.

### Desktop App — Editor

- [ ] Add to type selector dropdown — `crates/app/src/components/Editor/CreateNoteDialog.tsx`. Find the `<select>` for note type and add the new type as an `<option>`.
- [ ] If the type has special frontmatter fields, consider adding them to the `extra` fields editor in `crates/app/src/components/Editor/EditorPanel.tsx`.

### Desktop App — Links Editor

- [ ] No changes needed — the LinksEditor shows types from the graph data. Folder suffix logic in `crates/app/src/components/Editor/LinksEditor.tsx` (line ~42) only applies to `folder` type.

### Tests

- [ ] Add seed note — Create a sample `.md` file in `seed/` with the new type in its YAML frontmatter to verify end-to-end parsing.
- [ ] Verify graph rendering — After adding colors/icons, check that the graph legend (`crates/app/src/components/GraphView/GraphView.tsx`) auto-includes the new type from `NOTE_TYPE_COLORS`.

## Example

Follow the pattern of the `project` note type:
- Config: `crates/core/src/config.rs` line ~95 (`"project"` in `default_note_types`)
- Color: `crates/app/src/components/GraphView/graphStyles.ts` line ~14 (`project: "#00bcd4"`)
- File tree icon: `crates/app/src/components/Layout/fileTreeIcons.tsx` line ~45 (`project: FolderKanban`)
- Graph icon: `crates/app/src/components/GraphView/graphIcons.ts` line ~92 (`project:` FolderKanban SVG paths)
