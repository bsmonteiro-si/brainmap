# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 19:06:46
**Agent:** Explore
**Agent ID:** a8f9fcd74778b2135
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

Explore this codebase for code-level AI-first patterns:

1. Check the Rust code structure: read crates/core/src/lib.rs, crates/core/src/workspace.rs (first ~200 lines), crates/core/src/error.rs
2. Check the TypeScript patterns: read crates/app/src/api/bridge.ts or similar API layer files, check store patterns (read one store file like graphStore.ts first ~100 lines)
3. Check how the CLI commands are structured (read one command file)
4. Check how MCP tools are structured (read the server dispatch or one tool file)
5. Look at the dto.rs layer
6. Check for any inline documentation patterns, naming conventions, module organization

Focus on: naming clarity, self-documenting code, separation of concerns, how easy it would be for an AI to understand and modify this code.

---

## Assistant

I'll explore the codebase systematically to understand the AI-first patterns and code structure. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","limit":200}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs"}`

---

## Assistant

Now let me check the TypeScript API layer and store patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/stores/*.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphStore.ts","limit":100}`

---

## Assistant

Let me check CLI command structure and MCP tool structure:

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/commands/*.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/get.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/mcp/src/tools/*.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/path.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/node.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs","limit":100}`

---

## Assistant

Now let me check the DTO layer and any inline documentation patterns:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"^/// |^//! ","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src","type":"rust","head_limit":50}`

---

## Assistant

Let me look at a few more key areas to get a complete picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts","limit":120}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs","limit":80}`

---

## Assistant

Perfect! Now let me examine one more key pattern - the module organization and how things are documented:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/editorStore.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"README*\" -o -name \"*.md\" | grep -E \"(README|docs)\" | head -20"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/README.md","limit":100}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs -type f -name \"*.md\" | head -10"}`

---

## Assistant

Now I have enough information to provide a comprehensive analysis. Let me compile my findings:

## Code-Level AI-First Patterns Analysis

Based on my comprehensive exploration of the BrainMap codebase, here are the key AI-first patterns and design decisions that make this project highly amenable to AI understanding and modification:

### 1. **Clear Separation of Concerns**

**Rust Architecture:**
- `/crates/core/src/` — Pure domain logic (no I/O side effects)
- `/crates/cli/src/` — CLI command handlers (thin wrappers around core)
- `/crates/mcp/src/` — MCP server protocol adapter
- `/crates/app/src-tauri/` — Desktop app backend (Tauri commands + DTOs)

**TypeScript Architecture:**
- `stores/` — State management (Zustand, single responsibility per store)
- `api/` — Bridge pattern for environment abstraction (Tauri vs. Mock)
- `components/` — UI components (feature-organized folders)
- `utils/` — Pure utilities and helpers

**Why AI-friendly:** Each layer has a single responsibility. An AI can quickly understand what lives where and modify in isolation.

### 2. **Explicit Error Handling via Enums**

**File:** `/crates/core/src/error.rs`

```rust
#[derive(Debug, Error)]
pub enum BrainMapError {
    #[error("file not found: {0}")]
    FileNotFound(String),
    #[error("broken link target: {from} -> {to}")]
    BrokenLinkTarget { from: String, to: String },
    // ... 15 variants total
}

impl BrainMapError {
    pub fn error_code(&self) -> &str {
        match self {
            BrainMapError::FileNotFound(_) => "FILE_NOT_FOUND",
            // ...
        }
    }
}
```

**Why AI-friendly:** No silent failures. Every error is a concrete variant with structured data. AI can reason about error paths exhaustively via pattern matching.

### 3. **Type-Driven API Design**

**TypeScript:**
- All request/response types explicitly defined in `crates/app/src/api/types.ts`
- Hand-written comments noting sync with Rust DTOs: `// TypeScript interfaces matching the Rust DTOs in src-tauri/src/dto.rs`
- Branded discriminated unions for events:

```typescript
export type WorkspaceEvent =
  | { type: "node-created"; path: string; node: NodeDto; workspace_root?: string }
  | { type: "node-updated"; path: string; node: NodeDto; workspace_root?: string }
  | { type: "topology-changed"; added_nodes: NodeDto[]; ... }
  | { type: "files-changed"; added_files: string[]; ... };
```

**Why AI-friendly:** The type system acts as a machine-readable API contract. AI can verify invariants without reading prose documentation.

### 4. **Bridge Pattern for Testability**

**File:** `/crates/app/src/api/bridge.ts`

```typescript
export async function getAPI(): Promise<BrainMapAPI> {
  if (isTauri()) {
    const { TauriBridge } = await import("./api/tauri");
    cachedApi = new TauriBridge();
  } else {
    const { MockBridge } = await import("./api/mock/index");
    cachedApi = new MockBridge();
  }
  return cachedApi;
}
```

**Why AI-friendly:** The app can run with in-memory seed data (MockBridge) or against real Tauri backend. AI can test logic without environment setup.

### 5. **Zustand Stores with Pure State + Actions**

**File:** `/crates/app/src/stores/graphStore.ts` (first 100 lines)

```typescript
interface GraphState {
  nodes: Map<string, NodeDto>;
  edges: EdgeDto[];
  isLoading: boolean;

  loadTopology: () => Promise<void>;
  applyEvent: (event: WorkspaceEvent) => void;
  reset: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  nodes: new Map(),
  edges: [],
  
  // Actions
  loadTopology: async () => {
    set({ isLoading: true });
    try {
      const api = await getAPI();
      const [topology, workspaceFiles] = await Promise.all([...]);
      set({ nodes, edges: topology.edges, workspaceFiles, isLoading: false });
    } catch (e) {
      log.error("stores::graph", "failed to load topology", { error: String(e) });
      set({ isLoading: false });
    }
  },
})));
```

**Why AI-friendly:** 
- State is colocated with operations that mutate it
- Async operations follow a consistent pattern (set loading, try-catch, set result)
- Clear logging via `log.error("namespace", "message", { context })`

### 6. **CLI Command Structure: Function-Per-Command**

**File:** `/crates/cli/src/commands/path.rs`

```rust
pub fn execute(
    source: &str,
    target: &str,
    max_depth: Option<usize>,
    workspace_path: &Path,
    format: &OutputFormat,
) -> Result<()> {
    let ws = Workspace::open(workspace_path)?;
    let result = ws.find_path(source, target, max_depth)?;

    match result {
        Some(edges) => {
            let hops: Vec<PathHop> = edges.iter().map(|e| PathHop { ... }).collect();
            match format {
                OutputFormat::Json => output::print_json(&PathOutput { ... }),
                OutputFormat::Yaml => output::print_yaml(&PathOutput { ... }),
                OutputFormat::Text => println!("Path found..."),
            }
        }
        None => { /* handle not found */ }
    }
}
```

**Why AI-friendly:**
- One top-level function per command
- Single responsibility: call workspace method, format output
- Output abstraction hides serialization details
- Pattern matching ensures all paths covered

### 7. **MCP Tool Dispatch: Manual Routing with Consistent Signatures**

**File:** `/crates/mcp/src/server.rs` (lines 77-100)

```rust
pub fn dispatch_tool(
    &self,
    name: &str,
    arguments: &Option<serde_json::Map<String, serde_json::Value>>,
) -> CallToolResult {
    info!(tool = name, "MCP tool called");
    match name {
        "node_get" => tools::node::node_get(&self.workspace, arguments),
        "node_list" => tools::node::node_list(&self.workspace, arguments),
        // ... 22 more tools
    }
}
```

Each tool function signature is consistent:
```rust
pub fn node_get(workspace: &Arc<Mutex<Workspace>>, arguments: &JsonArgs) -> CallToolResult {
    let path = match arg_str(arguments, "path") {
        Some(p) => p,
        None => return BrainMapError::InvalidArgument("path argument required".into()).into(),
    };
    // ... operation
}
```

**Why AI-friendly:**
- Manual dispatch makes it explicit which tools exist (no macros to hide them)
- All tools use helper functions (`arg_str`, `arg_usize`) for consistent argument parsing
- Response envelope pattern standardizes success/error: `{ success: bool, data?: T, error?: { code, message } }`

### 8. **DTO Layer Bridges Rust ↔ TypeScript**

**File:** `/crates/app/src-tauri/src/dto.rs`

```rust
// ── Request DTOs ───────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateNoteParams {
    pub path: String,
    pub title: String,
    pub note_type: String,
    #[serde(default)]
    pub tags: Vec<String>,
    // ...
}

// ── Response DTOs ──────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct GraphTopologyDto {
    pub nodes: Vec<NodeDto>,
    pub edges: Vec<EdgeDto>,
}

#[derive(Debug, Clone, Serialize)]
pub struct NodeDto {
    pub path: String,
    pub title: String,
    pub note_type: String,
}

impl From<&NodeData> for NodeDto {
    fn from(nd: &NodeData) -> Self {
        Self {
            path: nd.path.as_str().to_string(),
            title: nd.title.clone(),
            note_type: nd.note_type.clone(),
        }
    }
}
```

**Why AI-friendly:**
- Clear comment section dividers (`// ── Request DTOs ───`)
- Explicit `From` impl for type conversions (not magic serialization)
- All fields documented implicitly by struct field names

### 9. **Model Types: Newtype Pattern + Inline Methods**

**File:** `/crates/core/src/model.rs`

```rust
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct NoteId(pub Uuid);

impl NoteId {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RelativePath(String);

impl RelativePath {
    pub fn new(path: &str) -> Self {
        Self(normalize_path(path))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }

    pub fn resolve_relative(&self, target: &str) -> RelativePath {
        let base_dir = Path::new(&self.0)
            .parent()
            .unwrap_or(Path::new(""));
        let resolved = base_dir.join(target);
        RelativePath::new(&resolved.to_string_lossy())
    }
}
```

**Why AI-friendly:**
- Newtype pattern (e.g., `NoteId(Uuid)`) prevents mixing NoteIds with Uuids
- Inline methods (`as_str()`, `resolve_relative()`) show how to work with the type
- No getters/setters ceremony — direct field access with `pub`

### 10. **Graph Structure: Dual-Index Pattern**

**File:** `/crates/core/src/graph.rs`

```rust
pub struct Graph {
    nodes: HashMap<RelativePath, NodeData>,
    outgoing: HashMap<RelativePath, Vec<Edge>>,  // source → edges
    incoming: HashMap<RelativePath, Vec<Edge>>,  // target ← edges
}

impl Graph {
    pub fn neighbors(&self, path: &RelativePath, depth: usize, direction: &Direction, rel_filter: Option<&[String]>) -> Subgraph {
        // Can traverse both directions efficiently
    }

    pub fn all_nodes(&self) -> impl Iterator<Item = (&RelativePath, &NodeData)> {
        self.nodes.iter()
    }
}
```

**Why AI-friendly:**
- Dual-index (outgoing + incoming) makes both directions equally efficient
- Iterator-based interface (`all_nodes()`) is composable
- No hidden traversal costs; the data structure is transparent

### 11. **Structured Logging Pattern**

**Rust:**
```rust
use tracing::{debug, info, warn};

info!(path = %path.display(), "workspace initialized");
warn!(count = parse_errors.len(), "parse errors during workspace load");
debug!(path = %path, depth = depth, "computing neighbors");
```

**TypeScript:**
```typescript
import { log } from "../utils/logger";

log.info("stores::graph", "loading topology");
log.info("stores::graph", "topology loaded", { nodes: topology.nodes.length, edges: topology.edges.length });
log.error("stores::graph", "failed to load topology", { error: String(e) });
```

**Why AI-friendly:**
- Namespace-first logging (e.g., `"stores::graph"`) helps AI filter logs
- Structured fields (e.g., `{ nodes: X, edges: Y }`) are machine-readable
- Consistent log levels (info=normal flow, warn=unexpected, error=failure)

### 12. **Documentation in Code**

**File:** `/crates/app/src/api/types.ts` (line 1-2)

```typescript
// TypeScript interfaces matching the Rust DTOs in src-tauri/src/dto.rs.
// Hand-written for reliability — kept in sync manually.
```

**File:** `/crates/core/src/workspace.rs` (lines 93-94)

```rust
/// Open a workspace rooted exactly at `path`, initializing if needed.
/// Unlike `open()`, this does NOT walk up the directory tree.
pub fn open_or_init(path: &Path) -> Result<Self> {
```

**Why AI-friendly:**
- Critical sync points are called out explicitly (TypeScript↔Rust DTO sync)
- Doc comments (triple-slash) distinguish public APIs from implementation
- Differentiating comments (e.g., "Unlike `open()`...") clarify edge cases

### 13. **Test Structure**

From `CLAUDE.md`:
- **Unit tests** live inline in modules (`#[cfg(test)] mod tests`)
- **Integration tests** live in `crates/core/tests/`
- Tests use consistent naming: `test_<action>_<scenario>`
- 124 Rust tests + 429+ Vitest unit tests with good coverage

**Why AI-friendly:**
- Tests are examples of correct usage
- Inline tests stay close to code being tested
- Test names read like documentation

### 14. **Mandatory Code Review Loop**

From `CLAUDE.md`:
```
## Mandatory Feedback Loops

### Planning Feedback Loop
1. Write plan to `.claude/reviews/plans/<descriptive-name>.md`
2. Read `.claude/agents/plan-reviewer.md` for review criteria
3. Spawn review agents to check architecture, edge cases, testing
4. Incorporate blocker/should-fix findings

### Code Review Feedback Loop
1. Read `.claude/agents/code-reviewer.md` for criteria
2. Spawn review agents on changed files
3. Fix bugs/should-fix findings
4. Re-review until clean
```

**Why AI-friendly:**
- Documentation consistency is enforced
- Review agents check for architectural issues before coding
- Agents are specialized (plan-reviewer vs. code-reviewer)

### Summary: Key AI-First Principles

| Principle | Implementation | Benefit |
|-----------|---|---|
| **Type Safety** | Rust enums, TypeScript branded unions | AI can't miss cases |
| **Explicit Errors** | `Result<T, BrainMapError>`, structured errors | No silent failures |
| **Single Responsibility** | One function per CLI command, one tool per MCP function | AI understands scope |
| **Consistency** | Zustand patterns, logging patterns, naming conventions | AI learns patterns and replicates |
| **Testability** | Bridge pattern, inline tests, seed data | AI can verify changes |
| **Documentation** | Comment sync points, doc comments on public APIs | AI knows what matters |
| **Manual Dispatch** | Explicit tool routing (no macros) | AI can find what exists |
| **Dual-Index Data** | Graph with `outgoing` + `incoming` maps | AI understands performance |

This codebase is **exceptionally well-suited for AI modification** because it prioritizes explicitness over magic, structure over convention, and tests over trust.

---

