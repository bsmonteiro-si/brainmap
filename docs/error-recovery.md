# BrainMap Error Recovery Guide

AI-first reference for handling `BrainMapError` codes. When an operation returns an error, look up the code below for diagnosis and recovery steps.

All errors flow through the response envelope pattern:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

In the MCP server, errors become `CallToolResult` with `is_error: true`. In the Tauri desktop app, errors cross the IPC boundary as `Result<T, String>` via `.map_err(|e| e.to_string())`.

---

## FILE_NOT_FOUND

**Rust variant:** `BrainMapError::FileNotFound(String)`

**Cause:** The requested note path does not exist in the workspace graph. Returned by read, update, delete, link, move, and graph traversal operations when a referenced path is not a known node.

**Data:** The `String` field contains the relative path that was not found (e.g., `"causality/rcts.md"`).

**AI action:**
1. List available nodes with `node_list` (MCP) or `get_topology` (Tauri) to find the correct path.
2. Check for typos, wrong file extension, or incorrect directory prefix.
3. If the path looks like a folder, check whether it exists as a folder node (virtual nodes have no backing `.md` file but are valid graph nodes).
4. If the note was recently created or moved, the graph may be stale — call `reindex` or reload the workspace.
5. If the intent was to create the note, use `node_create` / `create_node` instead.

**Example:** Calling `node_get` with path `"causality/rct.md"` when the actual file is `"causality/rcts.md"`. Fix: query `node_list` with a search filter, then retry with the correct path.

---

## DUPLICATE_PATH

**Rust variant:** `BrainMapError::DuplicatePath(String)`

**Cause:** Attempting to create a note or move/rename a note to a path that already exists in the workspace.

**Data:** The `String` field contains the conflicting path.

**AI action:**
1. The target path already has a note. Do not retry the same create/move.
2. If creating: choose a different filename, or read the existing note to check if it already has the desired content.
3. If moving/renaming: verify the destination is free. Use `node_list` to check.
4. If the duplicate is unexpected (e.g., after a failed partial move), investigate whether the source note still exists and whether the target note has the correct content.

**Example:** Calling `node_create` with path `"concepts/causation.md"` when that file already exists. Fix: read the existing note with `node_get` to decide whether to update it instead, or pick a different path like `"concepts/causation-v2.md"`.

---

## INVALID_YAML

**Rust variant:** `BrainMapError::InvalidYaml(String)`

**Cause:** The YAML frontmatter in a `.md` file failed to parse. This can happen during workspace open, note creation, or note update when the frontmatter block is malformed.

**Data:** The `String` field contains a description of the parse failure (e.g., missing required field, wrong type, invalid YAML syntax).

**AI action:**
1. Read the raw file content to inspect the frontmatter block (between `---` delimiters).
2. Common issues: missing `title` field, incorrect indentation, tabs instead of spaces, unquoted special characters (`:`, `#`, `@`), unclosed strings, invalid `type` value.
3. Validate that `links` entries have both `target` and `rel` fields with correct types.
4. If updating a note, compare your input YAML against the data model spec (`docs/02-data-model.md`): required fields are `title` and `type`; `type` must be one of the 11 valid note types.
5. Fix the YAML and retry the operation.

**Example:** A note with frontmatter `tags: concept, rct` (missing list brackets). Fix: change to `tags: [concept, rct]` or use YAML list syntax.

---

## BROKEN_LINK_TARGET

**Rust variant:** `BrainMapError::BrokenLinkTarget { from: String, to: String }`

**Cause:** Attempting to create a link where the target path does not exist as a node in the graph.

**Data:**
- `from` — the source note path
- `to` — the non-existent target path

**AI action:**
1. Verify the target path exists: use `node_list` or `node_get` to check.
2. If the target is a folder, ensure it has been registered as a virtual folder node (folders must exist in the directory structure).
3. If the target note should exist but does not, create it first with `node_create`, then retry the link.
4. Check for path typos — the target must be a workspace-relative path (e.g., `"causality/rcts.md"`, not an absolute path or URL).

**Example:** Calling `link_create` with `from: "index.md"`, `to: "people/fisher.md"` when `people/fisher.md` does not exist. Fix: create the target note first, then create the link.

---

## DUPLICATE_LINK

**Rust variant:** `BrainMapError::DuplicateLink { from: String, to: String, rel: String }`

**Cause:** A link with the same source, target, and relationship type already exists in the source note's frontmatter.

**Data:**
- `from` — source note path
- `to` — target note path
- `rel` — the edge/relationship type (e.g., `"causes"`, `"supports"`)

**AI action:**
1. The link already exists — no action needed if the intent was to ensure the link exists.
2. If you want a different relationship type between the same two notes, use a different `rel` value (multiple links between the same pair are allowed if `rel` differs).
3. If you want to change the relationship type, delete the existing link first with `link_delete`, then create the new one.

**Example:** Calling `link_create` with `from: "rcts.md"`, `to: "causation.md"`, `rel: "supports"` when that exact link already exists. Fix: skip the operation or use a different `rel`.

---

## LINK_NOT_FOUND

**Rust variant:** `BrainMapError::LinkNotFound { from: String, to: String, rel: String }`

**Cause:** Attempting to delete a link that does not exist in the source note's frontmatter `links` array.

**Data:**
- `from` — source note path
- `to` — target note path
- `rel` — the relationship type

**AI action:**
1. Verify the link exists by reading the source note (`node_get`) and inspecting its `links` field.
2. Check that all three fields (`from`, `to`, `rel`) match exactly — link lookup is an exact triple match.
3. The target path in `links` may be relative to the source note's directory. Ensure you are using the same path format stored in the frontmatter.
4. If the link was already deleted (idempotency), treat this as a no-op.

**Example:** Calling `link_delete` with `rel: "related-to"` when the actual stored relationship is `"related_to"` (underscore vs hyphen). Fix: read the note to find the exact `rel` value.

---

## HAS_BACKLINKS

**Rust variant:** `BrainMapError::HasBacklinks { path: String, backlinks: Vec<(String, String)> }`

**Cause:** Attempting to delete a note that has incoming links from other notes, without using the force flag.

**Data:**
- `path` — the note being deleted
- `backlinks` — list of `(source_path, rel_type)` tuples representing incoming links

**AI action:**
1. Inspect the `backlinks` list to understand which notes reference this one and why.
2. Options:
   a. **Force delete:** Retry with `force: true` — this deletes the note and removes the link entries from all source notes' frontmatter automatically.
   b. **Clean up first:** Delete each incoming link individually with `link_delete`, then delete the note normally.
   c. **Abort:** If the backlinks indicate the note is important to the knowledge graph, reconsider deletion.
3. In the desktop app, the `ConfirmDeleteDialog` shows the backlink list and offers a force-delete option.

**Example:** Deleting `"causality/rcts.md"` fails because `"index.md"` links to it via `"related-to"`. Fix: either call `delete_node` with `force: true`, or first call `link_delete` on the incoming link, then retry.

---

## INVALID_ARGUMENT

**Rust variant:** `BrainMapError::InvalidArgument(String)`

**Cause:** A function parameter failed validation. This is a catch-all for bad input that does not fit a more specific error variant.

**Data:** The `String` field describes what was wrong (e.g., `"path must end with .md"`, `"unknown note type: foo"`).

**AI action:**
1. Read the error message carefully — it describes the specific validation failure.
2. Common causes:
   - Path does not end with `.md` for note operations
   - Invalid note type (must be one of: concept, book-note, question, reference, index, argument, evidence, experiment, person, project)
   - Invalid edge type (must be one of the 15 defined types)
   - Empty or whitespace-only required field
   - Path traversal attempt (e.g., `"../outside.md"`)
3. Consult `docs/02-data-model.md` for valid field values.
4. Fix the input and retry.

**Example:** Calling `node_create` with `type: "blog-post"` which is not a valid note type. Fix: use a valid type like `"reference"` or `"concept"`.

---

## INVALID_WORKSPACE

**Rust variant:** `BrainMapError::InvalidWorkspace(String)`

**Cause:** The path provided for `Workspace::open` does not contain a valid BrainMap workspace (missing `.brainmap/` directory or `config.toml`).

**Data:** The `String` field contains the path or a description of what is invalid.

**AI action:**
1. Verify the path points to a directory that has been initialized with `brainmap init`.
2. Check that `.brainmap/config.toml` exists in the directory.
3. If the workspace has never been initialized, run `init` first.
4. If the config file is corrupted, check `.brainmap/config.toml` for valid TOML syntax.
5. The desktop app uses `open_or_init` which auto-initializes, so this error primarily affects CLI and MCP usage.

**Example:** Running `brainmap --workspace /tmp/empty-dir status` on a directory without `.brainmap/`. Fix: run `brainmap init /tmp/empty-dir` first.

---

## WORKSPACE_EXISTS

**Rust variant:** `BrainMapError::WorkspaceExists(String)`

**Cause:** Attempting to initialize (`init`) a workspace at a path that already has a `.brainmap/` directory.

**Data:** The `String` field contains the workspace path.

**AI action:**
1. The workspace is already initialized — use `open` instead of `init`.
2. If you want to re-initialize (reset config), manually remove the `.brainmap/` directory first (destructive — loses search index and config).
3. In most cases this is a logic error in the calling code — the workspace already exists and can be opened directly.

**Example:** Calling `brainmap init ./my-notes` when `./my-notes/.brainmap/` already exists. Fix: use `brainmap --workspace ./my-notes status` to work with the existing workspace.

---

## INDEX_CORRUPT

**Rust variant:** `BrainMapError::IndexCorrupt(String)`

**Cause:** The SQLite FTS5 search index is in an inconsistent state — schema mismatch, missing tables, or integrity check failure.

**Data:** The `String` field describes the corruption detected.

**AI action:**
1. Run `reindex` to rebuild the search index from scratch. This is safe — the index is derived from the `.md` source files.
2. If `reindex` also fails, delete the index file at `.brainmap/index.db` and reopen the workspace (it will be recreated).
3. Check for disk space issues or filesystem permission problems.
4. This error should be rare in normal operation — if it recurs, investigate whether concurrent writers are corrupting the database.

**Example:** After a crash, `search` returns `INDEX_CORRUPT` with message `"FTS5 table missing"`. Fix: call `reindex` to rebuild.

---

## CONFIG_ERROR

**Rust variant:** `BrainMapError::ConfigError(String)`

**Cause:** The workspace configuration file (`.brainmap/config.toml`) could not be read, parsed, or contains invalid values.

**Data:** The `String` field describes the configuration problem.

**AI action:**
1. Read `.brainmap/config.toml` to inspect the current configuration.
2. Check for valid TOML syntax (common issues: unquoted strings with special chars, missing quotes around values with spaces).
3. If the config is badly corrupted, delete it and re-run `init` to generate a fresh default config (this will reset the workspace name and settings).
4. The `config_set` tool/command can be used to fix individual config values programmatically.

**Example:** Config file has `name = My Notes` (missing quotes). Fix: change to `name = "My Notes"`.

---

## IO_ERROR

**Rust variant:** `BrainMapError::Io(std::io::Error)` (transparent, via `#[from]`)

**Cause:** A filesystem operation failed — file read/write, directory creation, path resolution, etc. This wraps the standard Rust `std::io::Error`.

**Data:** The wrapped `std::io::Error` includes the OS error kind and message (e.g., `"Permission denied"`, `"No such file or directory"`, `"Disk full"`).

**AI action:**
1. Read the error message to determine the OS-level cause.
2. Common causes and fixes:
   - **Permission denied:** Check file/directory permissions. On macOS, ensure the app has filesystem access.
   - **No such file or directory:** The workspace root or a parent directory was deleted/moved while the workspace was open. Close and reopen.
   - **Disk full:** Free disk space and retry.
   - **File locked:** Another process has the file open exclusively. Close other editors/programs.
3. If the error occurs during note save, check that the target directory exists (parent directories should be created automatically, but may fail on permission issues).
4. For Tauri desktop app, check `~/.brainmap/logs/` for the full error trace.

**Example:** Saving a note fails with `IO_ERROR: Permission denied (os error 13)` because the file is read-only. Fix: check and fix file permissions with `chmod`.

---

## YAML_ERROR

**Rust variant:** `BrainMapError::Yaml(serde_yaml::Error)` (transparent, via `#[from]`)

**Cause:** Low-level YAML serialization or deserialization failed. This is distinct from `INVALID_YAML` — this error comes from `serde_yaml` itself (structural parse failures), while `INVALID_YAML` is a higher-level validation error from BrainMap's own checks.

**Data:** The wrapped `serde_yaml::Error` includes line/column position and a description of the YAML syntax error.

**AI action:**
1. The error message includes line and column numbers — use them to locate the exact problem in the frontmatter.
2. Common causes: invalid UTF-8, binary content in YAML block, deeply nested structures that exceed parser limits, duplicate keys.
3. Read the raw file and check the YAML block between the `---` delimiters.
4. If the file was machine-generated, validate the YAML separately before writing.
5. Fix the syntax error and retry. If the file is unsalvageable, recreate it with valid frontmatter.

**Example:** A note with frontmatter containing a tab character at line 3, column 5 causes `YAML_ERROR: found a tab character where an indentation space is expected at line 3 column 5`. Fix: replace the tab with spaces.

---

## SQLITE_ERROR

**Rust variant:** `BrainMapError::Sqlite(rusqlite::Error)` (transparent, via `#[from]`)

**Cause:** A SQLite operation on the search index failed. This wraps `rusqlite::Error` and can indicate database corruption, locking issues, or query failures.

**Data:** The wrapped `rusqlite::Error` includes the SQLite error code and message.

**AI action:**
1. Common causes and fixes:
   - **Database is locked:** Another process has the index open. The database uses WAL mode with a 5-second busy timeout, so transient locks should self-resolve. Retry after a brief wait.
   - **Database disk image is malformed:** The index file is corrupted. Delete `.brainmap/index.db` and reopen the workspace to rebuild.
   - **Table not found / schema mismatch:** The index was created by a different version. Run `reindex` or delete and recreate.
2. The search index is always rebuildable from the `.md` source files — deleting it is safe.
3. If errors persist after rebuilding, check disk health and available space.
4. For the desktop app, the single-writer model (per-slot mutex) prevents concurrent access from the app itself, so lock errors typically indicate external processes accessing the database.

**Example:** Search fails with `SQLITE_ERROR: database disk image is malformed`. Fix: delete `.brainmap/index.db`, close and reopen the workspace.

---

## Error Handling Patterns by Interface

### MCP Server
Errors are wrapped in the response envelope via `BrainMapMcp::err_result()`:
```json
{"success": false, "error": {"code": "FILE_NOT_FOUND", "message": "file not found: notes/missing.md"}}
```
The `is_error` flag on `CallToolResult` is set to `true`. AI agents should parse the `error.code` field to determine the recovery action.

### CLI
Errors are serialized as JSON to stdout with the same envelope. The process exit code is non-zero. Parse `error.code` from the JSON output.

### Tauri Desktop App
Errors cross the IPC boundary as `Result<T, String>` — the error code is embedded in the string message (e.g., `"file not found: notes/missing.md"`). The frontend does not currently receive structured error codes; it receives the `Display` output of the error. To determine the error type, match on the message prefix (e.g., starts with `"file not found:"` maps to `FILE_NOT_FOUND`).
