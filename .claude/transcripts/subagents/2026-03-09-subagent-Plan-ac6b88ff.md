# 2026-03-09 — Subagent Transcript: Plan

**Date:** 2026-03-09 17:01:22
**Agent:** Plan
**Agent ID:** ac6b88ff3b9d49c1c
**Parent Session:** c9c4641d-d216-4fbf-8038-1866df90267f

---

## User

Design a detailed implementation plan for BrainMap Phase 1b: CLI Smoke Commands.

## Context

BrainMap is a Rust workspace with:
- `crates/core` — Core library (parser, graph, index, workspace, config, model, error)
- `crates/cli` — CLI (currently only `init` command)
- `seed/` — 34-note test dataset

The user wants "AI first" design — meaning JSON output is the primary interface, structures should be machine-parseable, and the code should be optimized for AI agent consumption.

## What exists in core already

**Ready (read operations):**
- `Workspace::open(path)` — loads all notes, builds graph and index
- `Workspace::validate()` → `Vec<ValidationIssue>`
- `Workspace::stats()` → `WorkspaceStats`
- `Graph::neighbors(path, depth, direction, rel_filter)` → `Subgraph`
- `Graph::shortest_path(source, target, max_depth)` → `Option<Vec<Edge>>`
- `Graph::subgraph(center, depth, rel_filter)` → `Subgraph`
- `Graph::orphan_nodes()` → `Vec<RelativePath>`
- `Graph::get_node(path)` → `Option<&NodeData>`
- `Graph::all_nodes()` → iterator
- `Index::search(query, filters)` → `Vec<SearchResult>`
- `Index::backlinks(path)` → `Vec<(String, String)>`
- `parser::parse_note()`, `parser::serialize_note()`, `parser::parse_file()`

**Missing (write operations needed for CRUD):**
- No `Workspace::create_note()` — need to generate frontmatter, write file, add to graph+index
- No `Workspace::update_note()` — need to modify frontmatter/body, rewrite file, update graph+index
- No `Workspace::delete_note()` — need to remove file, clean up graph+index
- No `Workspace::create_link()` — need to add link to source note's frontmatter, rewrite, update graph+index
- No `Workspace::delete_link()` — need to remove link from frontmatter, rewrite, update graph+index

**Current CLI structure (crates/cli/src/main.rs):**
- Uses clap with `#[derive(Parser)]`
- Global options: `--workspace`, `--format` (text/json), `--quiet`
- Single `Commands` enum with only `Init` variant
- Manually constructed JSON strings (not serde)

**Current CLI dependencies (crates/cli/Cargo.toml):**
- brainmap-core (path)
- clap with derive feature

## Phase 1b scope (from docs/03-cli-spec.md)

Commands to implement:
1. `node create` — create note with type, title, tags, body
2. `node read` — read note by path
3. `node update` — modify frontmatter fields
4. `node delete` — remove note
5. `node list` — list all notes with filters
6. `search` — full-text search with filters
7. `link create` — add typed relationship
8. `link list` — list links for a note
9. `neighbors` — graph neighborhood

Output formats: `--format json` (primary, AI-first) and `--format text` (human-readable)

## Design requirements

1. **AI-first**: JSON is the primary output format. Use a consistent response envelope:
   ```json
   {"success": true, "data": {...}}
   {"success": false, "error": {"code": "FILE_NOT_FOUND", "message": "..."}}
   ```

2. **Serde throughout**: All output types must derive Serialize. No manual JSON strings.

3. **Modular CLI**: Split commands into separate modules (commands/node.rs, commands/link.rs, etc.)

4. **Core library changes**: Add write operations to workspace.rs as the orchestration layer. Keep parser, graph, index as implementation details.

5. **Consistent patterns**: Every command follows the same pattern: parse args → open workspace → call core → format output.

## What I need from you

Design the implementation with:
1. Exact file structure and module layout
2. Core library additions needed (new methods on Workspace, with signatures)
3. CLI command structure (clap subcommands)
4. Output formatting approach (response envelope, Serialize derives)
5. Implementation order (what to build first)
6. Error handling strategy
7. Testing approach (integration tests against seed dataset)

Keep the design minimal and focused — only what's needed for Phase 1b.

---

## Assistant



I'll start by thoroughly exploring the existing codebase to understand the current architecture, patterns, and conventions before designing the plan.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/","description":"List top-level project structure"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -type f -name '*.rs' | sort","description":"List all Rust source files"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates -name 'Cargo.toml' | sort","description":"List all Cargo.toml files"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

Now let me check the remaining files and the CLI spec.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/config.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/seed_dataset.rs"}`

---

## Assistant

Now let me check if there is a CLI spec doc and look at a seed note for reference.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"docs/**/*","path":"/Users/bsmonteiro/Desktop/Personal/brainmap"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/ | head -10","description":"List seed directory contents"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/03-cli-spec.md"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/ | head -5","description":"List sample seed concepts"}`

---

## Assistant

Let me check one seed note and the CLAUDE.md for the project.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/seed/Concepts/Causal Inference.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/CLAUDE.md"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/Cargo.toml"}`

---

## Assistant

I now have a thorough understanding of the entire codebase. Here is the implementation plan.

---

## Phase 1b Implementation Plan: CLI Smoke Commands

### 1. File Structure and Module Layout

**New files to create:**

```
crates/cli/src/
  main.rs              (modify: slim down, delegate to modules)
  output.rs            (NEW: response envelope, formatting)
  commands/
    mod.rs             (NEW: re-exports)
    node.rs            (NEW: node create/read/update/delete/list)
    link.rs            (NEW: link create/list)
    search.rs          (NEW: search command)
    graph.rs           (NEW: neighbors command)
    init.rs            (NEW: extract init from main.rs)

crates/core/src/
  workspace.rs         (modify: add write operations)
  error.rs             (modify: add new error variants)
  model.rs             (modify: add Serialize to Edge, NodeData, Note)

crates/cli/tests/
  cli_integration.rs   (NEW: integration tests running the binary against seed/)
```

### 2. Core Library Additions

#### 2a. Add `Serialize` derives to types that lack them

The following types currently lack `Serialize` and need it for JSON output:

- `Edge` at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` line 154: add `Serialize, Deserialize`
- `NodeData` at line 169: add `Serialize, Deserialize`
- `Note` at line 139: add `Serialize` (it has `InlineLink` which also needs `Serialize`)
- `InlineLink` at line 110: add `Serialize`
- `SearchResult` at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/index.rs` line 12: add `Serialize`
- `Subgraph` at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs` line 14: add `Serialize`
- `ValidationIssue` and `Severity` at `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` lines 23-34: add `Serialize`
- `WorkspaceStats` at line 36: add `Serialize`
- `Direction` at model.rs line 163: add `Serialize, Deserialize`

#### 2b. New error variants in `error.rs`

The existing `BrainMapError` enum already covers most cases from the CLI spec error table. Two additions:

```rust
#[error("node already exists: {0}")]
DuplicatePath(String),          // already exists

#[error("search query must not be empty")]
EmptySearch,                    // new

#[error("depth must be between 1 and {max}")]
InvalidDepth { max: usize },   // new
```

`DuplicatePath` already exists. `EmptySearch` and `InvalidDepth` are new.

#### 2c. New methods on `Workspace`

All write operations go through `Workspace` as the orchestration layer (per CLAUDE.md convention). These are the method signatures to add to the `impl Workspace` block in `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs`:

```rust
pub fn create_note(
    &mut self,
    rel_path: &str,
    title: Option<&str>,
    note_type: &str,
    tags: Vec<String>,
    status: Option<Status>,
    source: Option<String>,
    summary: Option<String>,
    extra: HashMap<String, serde_yaml::Value>,
    body: String,
) -> Result<RelativePath>
```

Logic: check path does not already exist in `self.notes` (return `DuplicatePath`), generate `NoteId`, today's date for created/modified, build `Frontmatter` + `Note`, call `parser::serialize_note`, write file to `self.root.join(rel_path)` (creating parent dirs), insert into `self.notes`, add node to `self.graph`, index via `self.index.add_note`. Return the `RelativePath`.

```rust
pub fn read_note(&self, rel_path: &str) -> Result<&Note>
```

Logic: look up in `self.notes`, return `FileNotFound` if missing.

```rust
pub fn update_note(
    &mut self,
    rel_path: &str,
    title: Option<String>,
    note_type: Option<String>,
    tags: Option<Vec<String>>,
    status: Option<Option<Status>>,
    source: Option<Option<String>>,
    summary: Option<Option<String>>,
    extra: Option<HashMap<String, serde_yaml::Value>>,
    body: Option<String>,
) -> Result<()>
```

Logic: look up note (or `FileNotFound`), apply each `Some` field to the frontmatter, update `modified` to today, serialize and rewrite file, update graph node data, call `self.index.update_note`.

```rust
pub fn delete_note(&mut self, rel_path: &str, force: bool) -> Result<Vec<(String, String)>>
```

Logic: look up note (or `FileNotFound`), check incoming links via `self.index.backlinks`. If non-empty and `!force`, return error (or the caller can handle the prompt). Remove file from disk, remove from `self.notes`, `self.graph.remove_node`, `self.index.remove_note`. Return the list of former incoming links for display.

```rust
pub fn create_link(
    &mut self,
    source_path: &str,
    target_path: &str,
    rel: &str,
    annotation: Option<String>,
) -> Result<()>
```

Logic: verify both source and target exist in `self.notes` (or `BrokenLinkTarget`). Check no duplicate link already exists (or `DuplicateLink`). Add `TypedLink` to source note's `frontmatter.links`, serialize and rewrite file, add edge to graph, update index.

```rust
pub fn list_links(
    &self,
    rel_path: &str,
    direction: &Direction,
    rel_filter: Option<&str>,
) -> Result<Vec<&Edge>>
```

Logic: delegate to graph edges_for (need to make `edges_for` public or expose via a wrapper). Filter by rel if provided.

```rust
pub fn list_nodes(
    &self,
    type_filter: Option<&str>,
    tag_filter: Option<&str>,
    status_filter: Option<&str>,
    limit: usize,
    offset: usize,
) -> (Vec<&Note>, usize)
```

Logic: iterate `self.notes.values()`, apply filters, return paginated slice + total count.

Note: `Graph::edges_for` is currently private. Either make it `pub(crate)` or add a public `links_for` method on `Graph` that wraps it. The cleaner approach is adding a public method on `Workspace` that delegates, keeping Graph's internals hidden.

### 3. CLI Command Structure (clap)

#### 3a. Top-level `Commands` enum in `main.rs`

```rust
#[derive(Subcommand)]
enum Commands {
    Init { path: Option<PathBuf> },

    #[command(subcommand)]
    Node(NodeCommands),

    #[command(subcommand)]
    Link(LinkCommands),

    Search {
        query: String,
        #[arg(long)]
        r#type: Option<String>,
        #[arg(long)]
        tag: Option<String>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long, default_value = "20")]
        limit: usize,
    },

    Neighbors {
        path: String,
        #[arg(long, default_value = "1")]
        depth: usize,
        #[arg(long, alias = "rel")]
        relationship: Option<String>,
        #[arg(long, default_value = "both")]
        direction: DirectionArg,
    },
}
```

#### 3b. `NodeCommands` in `commands/node.rs`

```rust
#[derive(Subcommand)]
pub enum NodeCommands {
    Create {
        path: String,
        #[arg(long)]
        title: Option<String>,
        #[arg(long, default_value = "concept")]
        r#type: String,
        #[arg(long, value_delimiter = ',')]
        tags: Option<Vec<String>>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long)]
        source: Option<String>,
        #[arg(long)]
        summary: Option<String>,
        #[arg(long)]
        content: Option<String>,
        #[arg(long = "field", value_parser = parse_key_value)]
        fields: Vec<(String, String)>,
    },
    Read { path: String },
    Update {
        path: String,
        #[arg(long)]
        title: Option<String>,
        #[arg(long)]
        r#type: Option<String>,
        #[arg(long, value_delimiter = ',')]
        tags: Option<Vec<String>>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long)]
        source: Option<String>,
        #[arg(long)]
        summary: Option<String>,
        #[arg(long)]
        content: Option<String>,
        #[arg(long = "field", value_parser = parse_key_value)]
        fields: Vec<(String, String)>,
    },
    Delete {
        path: String,
        #[arg(long)]
        force: bool,
        #[arg(long)]
        dry_run: bool,
    },
    List {
        #[arg(long)]
        r#type: Option<String>,
        #[arg(long)]
        tag: Option<String>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long, default_value = "50")]
        limit: usize,
        #[arg(long, default_value = "0")]
        offset: usize,
    },
}
```

#### 3c. `LinkCommands` in `commands/link.rs`

```rust
#[derive(Subcommand)]
pub enum LinkCommands {
    Create {
        source: String,
        target: String,
        #[arg(long, alias = "rel")]
        relationship: String,
        #[arg(long)]
        annotation: Option<String>,
    },
    List {
        path: String,
        #[arg(long, default_value = "both")]
        direction: DirectionArg,
        #[arg(long, alias = "rel")]
        relationship: Option<String>,
    },
}
```

#### 3d. `DirectionArg` helper

```rust
#[derive(Clone, clap::ValueEnum)]
pub enum DirectionArg {
    In,
    Out,
    Both,
}

impl From<&DirectionArg> for Direction {
    fn from(d: &DirectionArg) -> Self {
        match d {
            DirectionArg::In => Direction::Incoming,
            DirectionArg::Out => Direction::Outgoing,
            DirectionArg::Both => Direction::Both,
        }
    }
}
```

### 4. Output Formatting Approach

#### 4a. Response envelope in `output.rs`

```rust
#[derive(Serialize)]
pub struct Response<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<ErrorPayload>,
}

#[derive(Serialize)]
pub struct ErrorPayload {
    pub code: String,
    pub message: String,
}
```

Two key functions:

```rust
pub fn print_success<T: Serialize + TextDisplay>(
    data: &T, 
    format: &OutputFormat, 
    quiet: bool
)

pub fn print_error(err: &BrainMapError, format: &OutputFormat)
```

For JSON: serialize the `Response` envelope via `serde_json::to_string_pretty`. For text: call a `TextDisplay` trait method on the data.

#### 4b. `TextDisplay` trait

```rust
pub trait TextDisplay {
    fn display_text(&self, f: &mut impl std::io::Write) -> std::io::Result<()>;
}
```

Each output struct implements `TextDisplay` for human-readable formatting.

#### 4c. Error code mapping

Add a method on `BrainMapError`:

```rust
pub fn error_code(&self) -> &str {
    match self {
        BrainMapError::FileNotFound(_) => "FILE_NOT_FOUND",
        BrainMapError::DuplicatePath(_) => "DUPLICATE_PATH",
        BrainMapError::InvalidYaml(_) => "INVALID_YAML",
        BrainMapError::BrokenLinkTarget { .. } => "BROKEN_LINK_TARGET",
        BrainMapError::DuplicateLink { .. } => "DUPLICATE_LINK",
        BrainMapError::LinkNotFound { .. } => "LINK_NOT_FOUND",
        BrainMapError::EmptySearch => "EMPTY_SEARCH",
        BrainMapError::InvalidDepth { .. } => "INVALID_DEPTH",
        BrainMapError::WorkspaceExists(_) => "WORKSPACE_EXISTS",
        BrainMapError::InvalidWorkspace(_) => "INVALID_WORKSPACE",
        BrainMapError::IndexCorrupt(_) => "INDEX_CORRUPT",
        _ => "INTERNAL_ERROR",
    }
}
```

#### 4d. Per-command output structs (all in the respective command modules)

Each command handler returns a typed result struct that derives `Serialize` and implements `TextDisplay`:

- `NodeCreated { path: String }`
- `NodeRead { path, frontmatter, body, backlinks }` (re-uses existing `Frontmatter` with Serialize)
- `NodeUpdated { path: String, changes: Vec<FieldChange> }`
- `NodeDeleted { path: String, broken_links: Vec<BacklinkInfo> }`
- `NodeList { nodes: Vec<NodeSummary>, total: usize, limit: usize, offset: usize }`
- `SearchResults { results: Vec<SearchHit>, total: usize }`
- `LinkCreated { source, target, relationship }`
- `LinkList { links: Vec<LinkInfo>, total: usize }`
- `NeighborResult { nodes: Vec<NodeSummary>, edges: Vec<EdgeInfo>, center: String }`

### 5. Implementation Order

Build in this sequence -- each step is independently testable:

**Step 1: Plumbing (output.rs + Serialize derives)**
- Create `crates/cli/src/output.rs` with the `Response` envelope, `TextDisplay` trait, `print_success`, `print_error`
- Add `Serialize` to all core types that need it (model.rs, graph.rs, index.rs, workspace.rs)
- Add `error_code()` to `BrainMapError`
- Add `serde` and `serde_json` to cli's Cargo.toml

**Step 2: Refactor main.rs + init command**
- Create `crates/cli/src/commands/mod.rs` and `commands/init.rs`
- Extract init logic from main.rs into `commands::init::execute`
- Convert init to use the response envelope pattern
- Verify existing behavior still works

**Step 3: Read-only CLI commands (no core write methods needed)**
- `node read` -- uses `Workspace::open` + lookup in `workspace.notes`
- `node list` -- add `Workspace::list_nodes` (pure filter on existing `notes` HashMap)
- `search` -- uses existing `Index::search`
- `link list` -- needs `Graph::edges_for` exposed; add a thin public wrapper
- `neighbors` -- uses existing `Graph::neighbors`

**Step 4: Core write operations**
- Add `create_note`, `update_note`, `delete_note`, `create_link` to `Workspace`
- Add `EmptySearch` and `InvalidDepth` to `BrainMapError`
- Unit tests for each write operation (use `tempfile` like existing tests)

**Step 5: Write CLI commands**
- `node create` -- calls `Workspace::create_note`
- `node update` -- calls `Workspace::update_note`
- `node delete` -- calls `Workspace::delete_note` (with `--force` / `--dry-run` logic in CLI layer)
- `link create` -- calls `Workspace::create_link`

**Step 6: Integration tests**
- CLI integration tests that spawn the binary against a temp copy of `seed/`

### 6. Error Handling Strategy

The pattern is: every command handler function returns `Result<T, BrainMapError>`. The main dispatch in `main.rs` catches the result and calls either `print_success` or `print_error`.

```rust
fn main() {
    let cli = Cli::parse();
    let result = run(cli);
    // exit code handled here
}

fn run(cli: Cli) -> std::process::ExitCode {
    let result = match cli.command {
        Commands::Node(cmd) => commands::node::execute(cmd, &workspace_path, &cli.format),
        // ...
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            output::print_error(&e, &cli.format);
            ExitCode::FAILURE
        }
    }
}
```

For `node delete` without `--force`, the CLI layer (not core) handles the interactive prompt. In JSON mode, return the backlinks as data and let the caller decide. This is the AI-first approach: no interactive prompts in JSON mode. Instead, return a response like `{"success": false, "error": {"code": "HAS_BACKLINKS", "data": [...]}}` so the agent can re-issue with `--force`.

Alternatively (and simpler): `delete` with no `--force` in JSON mode always behaves as `--dry-run`, returning what would happen. The agent then re-calls with `--force`. This avoids a new error code.

### 7. Testing Approach

**Unit tests (inside core modules):**
- Each new `Workspace` method gets tests using `tempfile::TempDir` + hand-written note files
- Pattern: create temp workspace, init, write seed notes, call method, assert state

**Integration tests (`crates/core/tests/`):**
- Extend `seed_dataset.rs` or add a new file `write_operations.rs` that tests create/update/delete against a temp copy of the seed

**CLI integration tests (`crates/cli/tests/cli_integration.rs`):**
- Use `assert_cmd` crate (add to dev-dependencies) to test the binary
- Each test: copy seed to temp dir, run brainmap command, parse JSON output, assert structure
- Test matrix:
  - `node create` then `node read` round-trip
  - `node list --type concept` returns only concepts
  - `node update` changes title, verify with `node read`
  - `node delete --force` removes, verify with `node list`
  - `search "causality"` returns results
  - `link create` then `link list` round-trip
  - `neighbors` returns expected subgraph
  - Error cases: duplicate create, read missing, delete missing, empty search

**Add to `crates/cli/Cargo.toml`:**
```toml
[dev-dependencies]
assert_cmd = "2"
predicates = "3"
tempfile = "3"
serde_json = "1"
```

### 8. Dependency Changes

**`crates/cli/Cargo.toml` additions:**
```toml
[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
chrono = "0.4"   # for today's date in create
```

`serde_json` is already a dep of `brainmap-core` but the CLI needs it directly for serializing output.

### 9. Key Design Decisions

- **No interactive prompts in JSON mode.** `node delete` without `--force` in JSON mode returns the backlinks as data with an error, so the AI agent can decide. In text mode, a prompt via stdin is acceptable for Phase 1b but not required -- just requiring `--force` is simpler.

- **`--dry-run` on delete** is a CLI concern, not a core concern. The CLI handler checks the flag and either calls `Workspace::delete_note` or just fetches backlinks and returns them.

- **`parse_key_value`** helper for `--field key=value` splits on the first `=` and returns `(String, String)`. The String value gets converted to `serde_yaml::Value::String` when passed to core.

- **Workspace is `&mut self` for writes.** This means the main dispatch opens workspace as mutable for write commands and immutable for read commands. In practice, `let mut ws = Workspace::open(...)` for all commands is fine since there is no concurrency concern.

- **Short aliases** (`ls`, `new`, `s` from the spec) are deferred -- they can be added trivially later via clap aliases and are not needed for Phase 1b smoke testing.

### Critical Files for Implementation

- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs` - Add all write operations (create_note, update_note, delete_note, create_link, list_nodes, list_links)
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs` - Refactor to modular command dispatch with response envelope
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs` - Add Serialize to Edge, NodeData, Note, InlineLink, Direction
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs` - Add EmptySearch, InvalidDepth variants and error_code() method
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs` - Make edges_for public (or add public wrapper), add Serialize to Subgraph

---

