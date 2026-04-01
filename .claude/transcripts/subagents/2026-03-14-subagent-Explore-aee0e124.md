# 2026-03-14 — Subagent Transcript: Explore

**Date:** 2026-03-14 12:02:56
**Agent:** Explore
**Agent ID:** aee0e124966df5fa8
**Parent Session:** b0628a66-649e-4349-8f3f-68ebe391e247

---

## User

Explore the BrainMap core library's Workspace struct and how it manages state. I need to understand:

1. The `Workspace` struct in `crates/core/src/workspace.rs` - what state it holds, how it's initialized
2. How the graph and search index are built and maintained
3. Whether multiple Workspace instances can coexist (any global state, singletons, file locks?)
4. The `AppState` struct in `crates/app/src-tauri/` and how it wraps Workspace
5. How Tauri commands access the workspace (with_workspace pattern)
6. File watcher setup and how it's tied to a workspace

Be thorough - look at the actual struct definitions, initialization code, and any global/static state.

---

## Assistant

I'll thoroughly explore the BrainMap core library's Workspace struct and related state management. Let me start with a systematic search.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.rs\" | grep -E \"(workspace|app_state|state)\" | head -20"}`

---

## Assistant

Let me read the key files to understand the Workspace struct and state management:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

Let me read the full workspace.rs file from the saved location:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/.claude/projects/-Users-bsmonteiro-Desktop-Personal-brainmap/b0628a66-649e-4349-8f3f-68ebe391e247/tool-results/toolu_01PKCgAQqiCHhsCuLRGpoNEo.txt"}`

---

## Assistant

Let me read specific sections of workspace.rs with offset:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":1,"limit":100}`

---

## Assistant

Now let me continue reading the workspace.rs file to see the full implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":100,"limit":200}`

---

## Assistant

Let me continue reading the workspace methods:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":300,"limit":250}`

---

## Assistant

Let me continue and also check for any statics or global state:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":750,"limit":200}`

---

## Assistant

Now let me check the AppState in the Tauri app:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

Now let me check the lib.rs in the Tauri app to see how AppState is initialized and used:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Now let me check the commands.rs to see the pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":1,"limit":100}`

---

## Assistant

Now let me check the watcher implementation:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

Now let me check the Index struct to understand the search index:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -name \"*.rs\" | grep -E \"index|search\" | head -10"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs","offset":1,"limit":150}`

---

## Assistant

Let me check the Graph struct:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src -name \"*.rs\" | grep graph"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","offset":1,"limit":150}`

---

## Assistant

Now let me check if there are any global statics or singletons by searching for static declarations:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"static \" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src --include=\"*.rs\" | grep -v \"^.*:.*//.*static\" | head -20"}`

---

## Assistant

Let me check if there are file locks or SQLite lock mechanisms:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"lock\\|Lock\\|LOCK\\|mutex\\|Mutex\\|flock\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src --include=\"*.rs\" | head -20"}`

---

## Assistant

Let me check the MCP server to see how it manages workspace state:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs","offset":1,"limit":150}`

---

## Assistant

Let me also check the CLI to see how it initializes workspace:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

Let me check one more example CLI command to see how workspace is used:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs","offset":1,"limit":100}`

---

## Assistant

Let me check the execute function:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs","offset":100,"limit":100}`

---

## Assistant

Perfect! Now I have a comprehensive understanding. Let me create a detailed response based on all the code I've read.

## Summary: BrainMap Workspace State Management

I've thoroughly explored the BrainMap core library, the Tauri desktop app, and the MCP server. Here's what I found:

### 1. **Workspace Struct** (`crates/core/src/workspace.rs`)

The `Workspace` struct holds all state for a knowledge graph:

```rust
pub struct Workspace {
    pub root: PathBuf,
    pub config: WorkspaceConfig,
    pub graph: Graph,
    pub index: Index,
    pub notes: HashMap<RelativePath, Note>,
}
```

**State components:**
- `root`: The workspace directory path
- `config`: Workspace configuration loaded from `.brainmap/config.yaml`
- `graph`: In-memory graph with nodes and edges (see below)
- `index`: SQLite FTS5 search index at `.brainmap/index.db`
- `notes`: HashMap of all notes in memory, keyed by relative path

**Initialization:**
- `Workspace::open(path)` — finds workspace root by walking up directory tree looking for `.brainmap/` dir, then calls `load_from_root()`
- `Workspace::open_or_init(path)` — opens at exact path or initializes if needed
- `Workspace::init(path)` — creates `.brainmap/` dir, writes config, opens SQLite index
- `load_from_root()` — scans all `.md` files, parses them into notes, rebuilds graph and search index

### 2. **Graph and Index Build Process**

**Graph structure** (`crates/core/src/graph.rs`):
```rust
pub struct Graph {
    nodes: HashMap<RelativePath, NodeData>,
    outgoing: HashMap<RelativePath, Vec<Edge>>,  // source -> edges
    incoming: HashMap<RelativePath, Vec<Edge>>,  // target -> edges
}
```

**Build order in `load_from_root()`:**
1. Scan all `.md` files recursively with `walkdir`
2. Parse each file with `parser::parse_file()` into `Note` objects
3. Add all parsed notes to `notes` HashMap
4. Create graph nodes from note metadata
5. Process explicit links from frontmatter `links` field → add edges to graph
6. Process inline links detected during parsing → add `mentioned-in` edges
7. Call `compute_folder_hierarchy()` to generate virtual folder nodes and `contains` edges
8. Index everything: rebuild SQLite FTS5 with all notes + edges

**Index structure** (`.brainmap/index.db`):
- `notes_fts` — FTS5 virtual table (path, title, type, tags, content, summary)
- `notes_meta` — metadata table (path, id, type, status, created, modified, file_mtime)
- `edges` — edge catalog (source, target, rel, implicit flag) for backlink queries

### 3. **Multiple Workspace Instances**

**No global state or singletons.** Multiple Workspace instances CAN coexist:
- Each is completely independent
- No static/global `Workspace` variables in core
- No file locks — SQLite uses WAL mode with 5s busy timeout for concurrent access

**However, in each consuming interface (CLI, MCP, Tauri), only ONE workspace is active at a time:**

**CLI** — Opens a fresh `Workspace` per command invocation:
```rust
// commands/node.rs: execute() — each command starts here
let mut ws = Workspace::open(workspace_path)?;
```

**MCP server** — Single workspace per server instance, wrapped in Arc<Mutex<>>:
```rust
pub struct BrainMapMcp {
    workspace: Arc<Mutex<Workspace>>,
}
```

**Tauri app** — Single workspace per session, managed in AppState:
```rust
pub struct AppState {
    pub workspace: Arc<Mutex<Option<Workspace>>>,
    pub expected_writes: Arc<Mutex<HashSet<PathBuf>>>,
    pub watcher: Arc<Mutex<Option<notify_debouncer_mini::Debouncer<...>>>>,
}
```

### 4. **AppState Struct** (Tauri: `crates/app/src-tauri/src/state.rs`)

```rust
pub struct AppState {
    pub workspace: Arc<Mutex<Option<Workspace>>>,
    pub expected_writes: Arc<Mutex<HashSet<PathBuf>>>,
    pub watcher: Arc<Mutex<Option<notify_debouncer_mini::Debouncer<...>>>>,
}
```

**Design:**
- Uses `Option<Workspace>` because app starts with no workspace open
- Wrapped in `Arc<Mutex<>>` for thread-safe sharing across Tauri commands and file watcher task
- `expected_writes` tracks paths the app wrote to avoid reprocessing self-triggered file changes
- `watcher` holds the live file debouncer — replaced when opening a new workspace

**Initialization** (`lib.rs`):
```rust
tauri::Builder::default()
    .manage(AppState::new())  // Registered as singleton with Tauri
    .invoke_handler(...)
    .run(...)
```

### 5. **Tauri Command Access Pattern** (`with_workspace` pattern)

Commands access workspace through helper methods in AppState:

```rust
pub fn with_workspace<F, T>(&self, f: F) -> Result<T, String>
where F: FnOnce(&Workspace) -> Result<T, String>
{
    let guard = self.lock_workspace()?;
    let ws = guard.as_ref().ok_or("No workspace open")?;
    f(ws)
}

pub fn with_workspace_mut<F, T>(&self, f: F) -> Result<T, String>
where F: FnOnce(&mut Workspace) -> Result<T, String>
{
    let mut guard = self.lock_workspace()?;
    let ws = guard.as_mut().ok_or("No workspace open")?;
    f(ws)
}
```

**Example command** (`commands.rs`):
```rust
#[tauri::command]
pub fn create_node(state: State<'_, AppState>, params: CreateNoteParams) -> Result<String, String> {
    let abs_path = state.with_workspace(|ws| Ok(ws.root.join(&params.path)))?;
    state.register_expected_write(abs_path);
    state.with_workspace_mut(|ws| handlers::handle_create_note(ws, params))
}
```

Pattern:
1. Get read access to calculate absolute path
2. Register path as expected write
3. Get mutable access and execute operation
4. Workspace is automatically unlocked when closure exits

### 6. **File Watcher Setup** (`crates/app/src-tauri/src/watcher.rs`)

**Initialization in `open_workspace` command:**
```rust
// Stop old watcher before replacing workspace
if let Ok(mut w) = state.watcher.lock() {
    *w = None;  // drops old debouncer, stops watching
}

// Install new workspace
{
    let mut guard = state.lock_workspace()?;
    *guard = Some(workspace);
}

// Start new watcher for this workspace
let debouncer = watcher::start_watcher(app, &root);
if let Ok(mut w) = state.watcher.lock() {
    *w = Some(debouncer);
}
```

**Watcher behavior:**
- Uses `notify_debouncer_mini` with 2s debounce duration
- Watches workspace root recursively for `.md` file changes
- Spawns tokio task to process events via channel
- On file change, checks if it's an expected self-write using `consume_expected_write()`
- If not expected:
  - If exists + known: calls `ws.reload_file()`
  - If exists + new: calls `ws.add_file()`
  - If deleted: calls `ws.remove_file()`
- Each operation returns `GraphDiff` (added/removed nodes and edges)
- Emits `brainmap://workspace-event` to frontend with diff payload

**Key point:** The watcher holds a strong reference to `AppState` via `app_handle`, so it can access the live `Workspace` and apply incremental updates.

### Key Findings

1. **No global state** — all state is passed explicitly or wrapped in Arc<Mutex>
2. **Single active workspace per interface** — enforced by design, not locks
3. **Concurrency via Arc<Mutex>** — poisoning recovery with `unwrap_or_else(|p| p.into_inner())`
4. **SQLite WAL mode** — enables concurrent reads, serializes writes with 5s busy timeout
5. **Incremental updates** — `reload_file()`, `add_file()`, `remove_file()` return `GraphDiff` for efficient UI sync
6. **File watcher coordination** — `expected_writes` set prevents infinite loops from app-initiated changes
7. **Workspace lifecycle** — Created once per interface invocation (CLI), or opened once per session (Tauri/MCP)

---

