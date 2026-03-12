# Spec Gap Analysis

Status snapshot as of Phase 1c completion (Steps 1–10 done, Step 11 pending).

---

## Phase 1c Remaining Work

### Step 11: File Watcher — NOT YET IMPLEMENTED

Core incremental API (`reload_file`, `add_file`, `remove_file`, `GraphDiff`) is done in `crates/core/src/workspace.rs`. Frontend `graphStore.applyEvent` is ready. Missing:

**`crates/app/src-tauri/src/watcher.rs`** (new file):
- `notify` crate watching workspace root recursively with 2s debounce
- OS callback → send `(PathBuf, EventKind)` tdouble checko `mpsc::channel` (never hold Workspace mutex in callback)
- Tokio task: receive → `state.consume_expected_write(path)` → if self-change skip → else call `workspace.reload_file/add_file/remove_file` → emit `app_handle.emit("brainmap://workspace-event", diff)`
- Start watcher in `lib.rs` after `open_workspace` succeeds

### Step 12: Polish — Partially Missing

Done: light/dark theming, empty states, loading states.

Still missing:
- Keyboard shortcuts: Cmd+N (create note), Cmd+F (focus search)
- Layout persistence: FlexLayout model → `.brainmap/ui-state.json`
- Graph position persistence: dragged node positions → `.brainmap/ui-state.json`

### Missing Tests

- **Vitest**: `crates/app/__tests__/` does not exist — stores, mock bridge, API bridge tests not written
- **Rust handler tests**: `crates/app/src-tauri/tests/` does not exist — handler integration tests not written

---

## CLI Gaps (`docs/03-cli-spec.md`) — ~82% coverage

### Missing Aliases (low effort)

| Missing | Should alias |
|---------|-------------|
| `node ls` | `node list` |
| `node new` | `node create` |
| `search s` | `search` |

### Missing Global Flag

- `--quiet` / `-q` — suppress all output except errors

### Missing Per-Command Flags

| Command | Missing Flag | Notes |
|---------|-------------|-------|
| `node create` | `--template <type>` | Pre-fill frontmatter from type template |
| `node create` | `--open` | Open in `$EDITOR` after create |
| `node update` | `--content-file <path>` | Read body from file instead of stdin |
| `search` | `--limit <n>` | Max results (currently hardcoded 50 in core) |
| `search` | `--content-only` | Restrict FTS to body only |
| `search` | `--meta-only` | Restrict FTS to frontmatter only |
| `serve` | `--port <n>` | N/A — MCP is stdio, not HTTP |
| `serve` | `--mcp-only` | N/A — no watcher in CLI serve |
| `serve` | `--no-watch` | N/A — no watcher in CLI serve |

**Effort**: Aliases + `--quiet` are trivial (1–2h). `--template`, `--open`, `--content-file` are moderate (half day). `search --limit/--content-only/--meta-only` require core API changes.

---

## MCP Gaps (`docs/04-mcp-spec.md`) — 21/21 tools, 3/3 resources, with deviations

| Tool | Deviation | Severity |
|------|-----------|----------|
| `node_update` | Missing `clear_fields: string[]` to explicitly null optional fields | Should-fix |
| `link_list` | Returns flat `EdgeDto[]`; spec says `{ incoming: EdgeDto[], outgoing: EdgeDto[] }` when direction is "Both" | Breaking |
| `search` | Missing `offset` + `limit` pagination params | Low priority |
| `reindex` | Returns `{}`; spec says `{ nodes_indexed: u32, duration_ms: u64 }` | Low effort |
| `federation_list` | Missing `reachable: bool` + `node_count: u32` per entry | Low effort |
| `config_set` | Only supports `name` key; spec allows arbitrary config key/value pairs | Low priority |

**Critical**: `link_list` response shape change is the only breaking deviation — AI agents expecting `{ incoming, outgoing }` will break.

---

## Desktop App Gaps (`docs/05-desktop-app.md`) — ~50% coverage

### Implemented

- Graph view: Cytoscape + cose layout, node coloring by type, edge labels, click/double-click/drag/zoom/pan
- Editor: CodeMirror 6 + frontmatter form, Cmd+S save, dirty tracking, external change conflict banner
- Search: debounced, type filter, snippet display, click-to-navigate
- Inspector: read-only metadata + link list with clickable targets
- Command palette: Cmd+P, note title fuzzy search
- Status bar, workspace picker, light/dark theme

### Not Implemented

| Feature | Priority | Notes |
|---------|----------|-------|
| Node creation dialog | High | Right-click → New Note, Cmd+N, Command Palette "Create Note" |
| Graph context menus | Medium | Right-click: create/delete/expand node |
| Hover tooltip | Medium | Title + type + tags on node hover |
| Layout persistence | Medium | FlexLayout + node positions → `.brainmap/ui-state.json` |
| Focus mode | Medium | Expand neighbors on double-click, Escape to collapse, breadcrumb trail |
| Export from UI | Low | DOT/JSON/CSV from command palette or menu |
| Inspector editing | Low | Link create/delete from inspector |
| Visual configuration | Low | Configurable color palette per type |
| Multi-select | Low | Phase 4 |
| Drag-to-create-link | Low | Edit mode only, Phase 4 |
| Minimap | Low | Phase 4 |
| Tab system | Deferred | Spec describes multi-tab; v1 uses single editor (intentional) |

---

## Recommended Priority Order

1. **File Watcher (Step 11)** — completes Phase 1c exit criteria; `crates/app/src-tauri` only
2. **Node creation dialog + Cmd+N** — highest-value gap for real use; `crates/app/src` only
3. **MCP `link_list` response shape** — only breaking spec deviation; `crates/mcp` only
4. **MCP `node_update` clear_fields** — needed for null-out operations; `crates/mcp` only
5. **CLI aliases + `--quiet`** — trivial, closes spec; `crates/cli` only
6. **Layout persistence (Step 12)** — UX improvement, not blocking
7. **Tests (Vitest + Rust handlers)** — needed for confidence, not blocking daily use
8. **Search pagination** — needed for large workspaces; requires core API changes
9. **Graph context menus, focus mode, multi-select** — Phase 4 polish scope

---

## Worktree Strategy

These workstreams are fully independent:

| Branch | Scope | Crates touched |
|--------|-------|----------------|
| `feat/file-watcher` | Step 11: watcher.rs + lib.rs | `crates/app/src-tauri` only |
| `feat/node-create-ui` | Node creation dialog, Cmd+N | `crates/app/src` only |
| `fix/mcp-deviations` | link_list shape, node_update clear_fields, reindex output | `crates/mcp` only |
| `fix/cli-aliases` | ls/new/s aliases, --quiet | `crates/cli` only |
| `feat/tests` | Vitest + Rust handler tests | `crates/app` only |

**Merge order**: `feat/file-watcher`, `fix/mcp-deviations`, `fix/cli-aliases` are independent. `feat/node-create-ui` merges after `feat/file-watcher` (benefits from watcher for live feedback). `feat/tests` merges last.

**Conflict risk**: Low — each branch touches a different crate. Only `feat/file-watcher` touches `lib.rs`; `feat/node-create-ui` touches frontend stores. No overlap.
