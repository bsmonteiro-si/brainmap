# Obsidian File Explorer Context Menu Research

## 1. Right-Click Options for FILES in Obsidian's File Explorer

The following is the default context menu when right-clicking a **file** (note) in Obsidian's file explorer, compiled from official docs, forum discussions, changelogs, and bug reports:

| Menu Item | Notes |
|---|---|
| **Open in new tab** | Opens the file in a new tab |
| **Open to the right** | Opens the file in a split pane to the right |
| **Open in new window** | Opens the file in a pop-out window |
| **--- separator ---** | |
| **Set as bookmark** | Adds the file to the Bookmarks core plugin (replaced the older "Star" feature) |
| **--- separator ---** | |
| **Make a copy** | Duplicates the file (called "Duplicate" for folders) |
| **Rename** | Inline rename; Obsidian auto-updates all internal links |
| **Delete** | Moves to system trash, Obsidian .trash, or permanently deletes (configurable in Settings > Files & Links) |
| **--- separator ---** | |
| **Move file to...** | Opens a search modal to pick a destination folder |
| **--- separator ---** | |
| **Open in default app** | Opens the file with the OS default application (requires the "Open in default app" core plugin to be enabled) |
| **Show in system explorer** | Reveals the file in Finder (macOS) / File Explorer (Windows) / file manager (Linux). Also requires "Open in default app" core plugin |
| **Reveal file in navigation** | Scrolls the file explorer sidebar to highlight this file |
| **--- separator ---** | |
| **Copy Obsidian URL** | Copies an `obsidian://` protocol URI to clipboard for cross-app linking |

**Notes:**
- Some items like "Open in default app" and "Show in system explorer" only appear if the **"Open in default app"** core plugin is enabled in Settings > Core Plugins.
- Community plugins can add additional items to this menu via the `file-menu` workspace event.
- The old "Star" option was renamed to "Set as bookmark" when the Bookmarks plugin replaced the Stars plugin (around v1.2).

## 2. Right-Click Options for FOLDERS in Obsidian's File Explorer

When right-clicking a **folder**, the context menu is different:

| Menu Item | Notes |
|---|---|
| **New note** | Creates a new note inside this folder (inline name entry) |
| **New folder** | Creates a subfolder inside this folder |
| **--- separator ---** | |
| **Set as bookmark** | Bookmarks the folder |
| **--- separator ---** | |
| **Duplicate** | Duplicates the entire folder and its contents |
| **Rename** | Inline rename of the folder |
| **Delete** | Deletes the folder and all contents |
| **--- separator ---** | |
| **Move folder to...** | Opens search modal to pick a new parent folder |
| **--- separator ---** | |
| **Show in system explorer** | Reveals folder in Finder/File Explorer (requires "Open in default app" core plugin) |
| **Reveal file in navigation** | Scrolls to and highlights the folder in the sidebar |
| **--- separator ---** | |
| **Copy Obsidian URL** | Copies `obsidian://` URI for the folder |

**Key differences from file menu:** Folders show "New note" and "New folder" at the top; they do NOT have "Open in new tab" / "Open to the right" / "Open in new window" (since folders cannot be "opened" as tabs). "Make a copy" is labeled "Duplicate" for folders.

## 3. Notable File Management Features

### File Explorer Toolbar (top of the sidebar panel)
- **New note** button (pen/pencil icon) -- creates a note in the vault root
- **New folder** button (folder+ icon) -- creates a folder in the vault root
- **Sort order** dropdown -- options:
  - File name (A to Z)
  - File name (Z to A)
  - Modified time (new to old)
  - Modified time (old to new)
  - Created time (new to old)
  - Created time (old to new)
- **Collapse all** button -- collapses all expanded folders
- **Auto-reveal active file** toggle -- when enabled, the file explorer auto-scrolls to highlight the currently active note

### Drag and Drop
- Drag files between folders to move them
- Drag a file into an open note to create a link to it (creates `[[wikilink]]`)
- Drag files from outside Obsidian into the vault to import them (goes to attachments folder)
- **Alt/Opt + click** to select multiple files, then drag to move them together

### Multi-select (added in later versions)
- Alt/Opt + click adds files to selection
- Right-clicking a multi-selection shows context menu applicable to all selected items (move, delete)

### Bookmarks (formerly Stars)
- The **Bookmarks** core plugin (replaced "Starred" plugin) lets users bookmark notes, folders, searches, headings, and blocks
- Bookmarked items appear in a dedicated "Bookmarks" sidebar panel
- Bookmarks can be organized into bookmark groups (folders within the bookmarks panel)
- Right-click a bookmark to reorder, rename the bookmark, or remove it

### File Recovery
- The **File recovery** core plugin takes periodic snapshots of notes
- Accessible from the Command Palette: "File recovery: Show snapshots"
- Configurable snapshot interval and retention period

### Delete Behavior (configurable in Settings > Files & Links)
1. **System trash** (default) -- recoverable from OS trash
2. **Obsidian trash** -- moves to `.trash/` folder in vault
3. **Permanently delete** -- no recovery

### Other Notable Features
- **Excluded files**: Settings > Files & Links lets you set patterns to exclude files from the file explorer
- **Attachment folder**: Configurable default location for pasted/dropped attachments
- **Detect all file extensions**: Toggle to show non-markdown files in the explorer
- **Default location for new notes**: Vault root, same folder as current file, or a specified folder
- **Properties/metadata**: While not in the file explorer per se, right-clicking in the Properties section of a note shows property-specific context menu items

### What Obsidian Does NOT Have Natively (common plugin territory)
- Pinning specific files to the top of the explorer
- Custom sort order (drag-and-drop reordering) -- available via "Custom Sort" plugin
- File coloring/icons -- available via "Color Folders and Files" or "Iconize" plugins
- File previews/thumbnails in the explorer -- available via "Notebook Navigator" plugin
- Tag-based file browsing in the explorer -- available via plugins
- Filtering/hiding specific files -- available via "File Explorer++" plugin

## Sources

- [Obsidian Help: File Explorer](https://help.obsidian.md/plugins/file-explorer)
- [Obsidian Help: Manage Notes](https://github.com/obsidianmd/obsidian-help/blob/master/en/Files%20and%20folders/Manage%20notes.md)
- [Obsidian Forum: Context Menu Items Missing](https://forum.obsidian.md/t/context-menu-items-right-click-on-file-are-inconsistently-missing-from-command-palette-hotkey-and-three-dot-menu/56894)
- [Obsidian Forum: Hotkey to Open Context Menu](https://forum.obsidian.md/t/hotkey-to-open-context-menu-in-file-explorer/39171)
- [Obsidian Forum: Show in System Explorer Tutorial](https://forum.obsidian.md/t/show-in-system-explorer-not-showing-in-right-click-menu-tutorial/30726)
- [Obsidian Developer Docs: Context Menus](https://docs.obsidian.md/Plugins/User+interface/Context+menus)
- [Obsidian Changelog](https://obsidian.md/changelog/)
