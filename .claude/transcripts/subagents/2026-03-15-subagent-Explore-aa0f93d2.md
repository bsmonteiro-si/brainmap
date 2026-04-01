# 2026-03-15 — Subagent Transcript: Explore

**Date:** 2026-03-15 19:31:52
**Agent:** Explore
**Agent ID:** aa0f93d274e626b67
**Parent Session:** f488f53d-046e-4418-a25e-51aa975625a4

---

## User

Explore three areas for writing "How to Add X" extension guide checklists:

**Area 1: Note type + Edge type extension points**
- Find where note types are defined (enum or constants) in Rust core — read the exact file and line numbers
- Find where edge types are defined — exact file and line numbers
- Find where frontend icons/colors for note types are mapped (fileTreeIcons.tsx, graphIcons.ts, or similar)
- Find where graph node colors are defined (getNodeColor or similar function)
- Find the parser that reads note_type from frontmatter

**Area 2: CLI command + MCP tool + Tauri command extension points**
- Read `crates/cli/src/cli.rs` or main.rs — how are commands registered (clap derive or builder)?
- Read `crates/mcp/src/server.rs` — the dispatch match block and tool listing
- Read `crates/app/src-tauri/src/commands.rs` first 50 lines and `main.rs` or `lib.rs` — how are Tauri commands registered?
- Read `crates/app/src/api/bridge.ts` or `tauri.ts` — how does the frontend call Tauri commands?

**Area 3: Error handling patterns**
- Read `crates/core/src/error.rs` fully — all BrainMapError variants and error_code() mappings
- Find 2-3 examples of how errors are handled in workspace.rs (search for `BrainMapError::` usage)
- Check if there are any existing error handling docs

For all of these, I need exact file paths and line numbers for the checklist format.

---

## Assistant

I'll systematically explore these three areas and provide exact file paths and line numbers for your extension guide checklists.

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/core/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/cli/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/mcp/src/**/*.rs"}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src-tauri/src/**/*.rs"}`

---

## Assistant

Now let me read the core files for all three areas:

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

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs","limit":80}`

---

## Assistant

Let me continue reading more files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","limit":80}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/**/{fileTreeIcons,graphIcons,graphStyles}.{ts,tsx}"}`

---

## Assistant

Now let me read the frontend icon/color files and workspace.rs for error examples:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts","limit":100}`

---

## Assistant

Now let me read the workspace.rs file to find error examples:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"BrainMapError::\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs | head -30"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs","offset":1,"limit":150}`

---

## Assistant

Let me continue exploring the graph.rs for edge type constants and read more of the CLI/MCP files:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub enum\\|const.*TYPE\\|\\\"contains\\\"\\|\\\"part-of\\\"\\|\\\"causes\\\"\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs | head -50"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"rel.*=\\|type.*rel\\|edge_type\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs | head -40"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/mod.rs"}`

---

## Assistant

Now let me check the graph.rs file and the Tauri bridge to understand the frontend API:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/graph.rs","offset":1,"limit":200}`

---

## Assistant

### Tool Calls

- **Glob**: `{"pattern":"crates/app/src/api/*.{ts,tsx}"}`

---

## Assistant

Now let me read the Tauri API files:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts","limit":150}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","limit":80}`

---

## Assistant

Let me check the MCP tools registration and node.rs to understand the pattern:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/node.rs","limit":100}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/lib.rs"}`

---

## Assistant

Perfect! Now let me look at the docs to understand if there are any existing extension docs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/docs/"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"edge.*type\\|rel.*type\" /Users/bsmonteiro/Desktop/Personal/brainmap/docs/ | head -10"}`

---

## Assistant

Let me check the data model doc to see what edge types are listed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -A 50 \"edge type\" /Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md | head -80"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/mod.rs"}`

---

## Assistant

Perfect! Now I have all the information I need. Let me compile the comprehensive report with exact file paths and line numbers for the three extension guide areas.

## Exploration Complete: Extension Guide Checklist Research

I've thoroughly explored all three areas of the BrainMap codebase and identified the exact extension points with precise file paths and line numbers. Here's your comprehensive reference guide:

---

## Area 1: Note Type + Edge Type Extension Points

### 1.1 Note Types Definition

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs`
- **Lines 132–150**: `Frontmatter` struct with `note_type: String` field (line 136)
- **Notes:** Note types are stored as strings in frontmatter, NOT as a hardcoded enum. The system auto-registers new types on first use with a warning (see workspace.rs line 120–126)

**Frontmatter reference:**
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Frontmatter {
    pub id: NoteId,
    pub title: String,
    #[serde(rename = "type")]
    pub note_type: String,  // <-- Line 136: Note type is a String, not enum
    // ... other fields
}
```

### 1.2 Edge Types Definition

**No hardcoded enum exists.** Edge types are defined as strings and stored in the `TypedLink.rel` field.

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs`
- **Lines 115–122**: `TypedLink` struct with `rel: String` field (line 119)

**Documented edge types in spec:**
**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/docs/02-data-model.md`
- 15 documented types: contains, part-of, causes, supports, contradicts, extends, depends-on, exemplifies, precedes, leads-to, evolved-from, related-to, authored-by, sourced-from, mentioned-in
- Auto-registration on first use (similar to note types)

### 1.3 Frontend Icon Mappings for Note Types

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/Layout/fileTreeIcons.tsx`
- **Lines 35–47**: `NOTE_TYPE_ICONS` Record mapping note types to Lucide React icon components
- **Line 49**: `FALLBACK_ICON` for unknown types
- **Lines 148–150**: `getIconForType(noteType: string)` function with fallback pattern

**Key types mapped:**
```typescript
concept: Lightbulb,
"book-note": BookOpen,
question: HelpCircle,
reference: FileText,
index: List,
argument: MessageSquare,
evidence: FlaskConical,
experiment: TestTube,
person: User,
project: FolderKanban,
folder: Folder,
```

### 1.4 Graph Node Colors (getNodeColor)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphStyles.ts`
- **Lines 1–19**: `NOTE_TYPE_COLORS` Record with hex colors keyed by note type
- **Lines 17–19**: `getNodeColor(noteType: string)` function with fallback color `#95a5a6`

**Color palette:**
```typescript
concept: "#4a9eff",
"book-note": "#f39c12",
question: "#9b59b6",
reference: "#7f8c8d",
index: "#1abc9c",
argument: "#e74c3c",
evidence: "#27ae60",
experiment: "#e67e22",
person: "#e91e63",
project: "#00bcd4",
folder: "#8e8e93",
```

### 1.5 Graph Node Icon SVG Generation

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/components/GraphView/graphIcons.ts`
- **Lines 6–113**: `NOTE_TYPE_ICON_PATHS` Record with SVG element definitions for each type
- **Lines 134–150**: `buildSvgDataUri()` function that creates color-parameterized SVG data URIs
- **Lines 143–150**: `getNodeIconSvg(noteType: string, color: string)` with caching

### 1.6 Parser: Reading note_type from Frontmatter

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/parser.rs`
- **Lines 9–28**: `parse_note()` function deserializes YAML frontmatter to `Frontmatter` struct
- **Line 11**: Uses `serde_yaml::from_str()` which automatically reads the `type` field into `note_type` (due to `#[serde(rename = "type")]` in model.rs line 135)

---

## Area 2: CLI Command + MCP Tool + Tauri Command Extension Points

### 2.1 CLI Command Registration (clap Derive)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs`
- **Lines 15–29**: `Cli` struct with clap derive attributes
- **Lines 55–184**: `Commands` enum (Subcommand derive) — all commands listed here
- **Examples:**
  - Line 57–61: `Init` command
  - Line 63–64: `Node` subcommand group
  - Line 66–67: `Link` subcommand group
  - Line 69–78: `Search` command

**Command modules location:**
- **File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/mod.rs` (lines 1–16)
- Each module defines a `Commands` enum (e.g., `NodeCommands`, `LinkCommands`, `FederationCommands`)
- Pattern: Command → handler function → core library call

### 2.2 MCP Tool Dispatch (manual match block)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs`
- **Lines 77–116**: `dispatch_tool()` method with exhaustive match on tool names
- **Lines 83–107**: Individual tool dispatch cases (node_get, node_list, node_create, etc.)
- **Lines 108–115**: `_ =>` fallback with warning for unknown tools

**Tool registration pattern:**
```rust
match name {
    "node_get" => tools::node::node_get(&self.workspace, arguments),
    "node_list" => tools::node::node_list(&self.workspace, arguments),
    // ... 24 total tools
    _ => { warn!(...); /* error result */ }
}
```

**Tool definition location:**
- **File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/mod.rs` (lines 70–214)
- **Function:** `all_tools()` returns `Vec<Tool>` with all tool schemas
- Each tool defined via `make_tool()` helper (lines 52–68)

### 2.3 Tauri Command Registration

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`
- **Lines 21–53**: `tauri::Builder` with `generate_handler!` macro
- **Lines 25–52**: List of all commands in macro invocation
- Example commands: open_workspace, create_node, update_node, delete_node, create_link, delete_link, etc.

**Command implementations location:**
- **File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`
- **Pattern:** Each command decorated with `#[tauri::command]` macro
- **Example (lines 24–71):** `open_workspace` command with error handling

**Handler orchestration:**
- **File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`
- Commands delegate to handler functions which call workspace methods

### 2.4 Frontend API Bridge (TypeScript)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/tauri.ts`
- **Lines 19–150**: `TauriBridge` class implementing `BrainMapAPI` interface
- **Pattern:** Each method calls `invoke<T>()` with command name and params
- Examples:
  - Lines 20–22: `openWorkspace()`
  - Lines 48–60: `createNote()`
  - Lines 80–82: `createLink()`

**API Interface definition:**
- **File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts`
- Defines `BrainMapAPI` interface all implementations must satisfy
- Includes DTO types (NoteDetail, EdgeDto, GraphTopology, etc.)

**Bridge abstraction:**
- **File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/bridge.ts` (lines 1–25)
- `getAPI()` function returns either TauriBridge (production) or MockBridge (dev/test)

---

## Area 3: Error Handling Patterns

### 3.1 BrainMapError Definition

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/error.rs`
- **Lines 5–55**: Complete `BrainMapError` enum with all variants:
  - FileNotFound (line 7–8)
  - DuplicatePath (line 10–11)
  - InvalidYaml (line 13–14)
  - BrokenLinkTarget (line 16–17)
  - DuplicateLink (line 19–24)
  - LinkNotFound (line 26–27)
  - InvalidArgument (line 29–30)
  - HasBacklinks (line 32–33)
  - InvalidWorkspace (line 35–36)
  - WorkspaceExists (line 38–39)
  - IndexCorrupt (line 41–42)
  - ConfigError (line 44–45)
  - Plus transparent variants for IO, YAML, SQLite errors (lines 47–54)

- **Lines 57–77**: `error_code()` method — maps each variant to a string error code
  - Returns: "FILE_NOT_FOUND", "DUPLICATE_PATH", "INVALID_YAML", etc.
  - Used by API responses and logging

### 3.2 Error Usage Examples in workspace.rs

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/workspace.rs`

**Example 1: FileNotFound (line 388)**
```rust
.ok_or_else(|| BrainMapError::FileNotFound(rel_path.to_string()))
```

**Example 2: WorkspaceExists (lines 65–68)**
```rust
return Err(BrainMapError::WorkspaceExists(
    path.display().to_string(),
));
```

**Example 3: InvalidArgument (lines 97–100)**
```rust
return Err(BrainMapError::InvalidArgument(format!(
    "expected a directory, got a file: {}",
    path.display()
)));
```

**Example 4: HasBacklinks (lines 467–474)** — carries context data
```rust
return Err(BrainMapError::HasBacklinks {
    path: rel_path.to_string(),
    backlinks: vec![(source_path.to_string(), rel.clone())],
});
```

**Example 5: DuplicateLink (lines 521–527)**
```rust
return Err(BrainMapError::DuplicateLink {
    from: source_path.to_string(),
    to: target_path.to_string(),
    rel: rel.clone(),
});
```

### 3.3 Error Response Pattern (MCP/Tauri)

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs`
- **Lines 61–75**: `err_result()` helper — wraps BrainMapError in response envelope:
  ```json
  {
    "success": false,
    "error": {
      "code": "ERROR_CODE_STRING",  // from error_code() method
      "message": "human readable message"
    }
  }
  ```

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/node.rs`
- **Lines 12–26**: Error handling pattern in tool functions:
  ```rust
  let path = match arg_str(arguments, "path") {
      Some(p) => p,
      None => return BrainMapMcp::err_result(&BrainMapError::InvalidArgument(...)),
  };
  let ws = match BrainMapMcp::lock_workspace(workspace) {
      Ok(guard) => guard,
      Err(err_result) => return err_result,
  };
  match ws.read_note(&path) {
      Ok(note) => BrainMapMcp::ok_json(note),
      Err(e) => BrainMapMcp::err_result(&e),
  }
  ```

### 3.4 CLI Error Handling

**File:** `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/output.rs`
- Converts BrainMapError to human-readable CLI output
- Uses error_code() for structured logging

---

## Summary Table: Extension Checklist Reference

| **Extension Point** | **File Path** | **Lines** | **Key Elements** |
|---|---|---|---|
| **Note Type Icons** | `fileTreeIcons.tsx` | 35–47 | `NOTE_TYPE_ICONS` Record + `getIconForType()` |
| **Note Type Colors** | `graphStyles.ts` | 1–19 | `NOTE_TYPE_COLORS` Record + `getNodeColor()` |
| **Graph Icons (SVG)** | `graphIcons.ts` | 6–113 | `NOTE_TYPE_ICON_PATHS` + `getNodeIconSvg()` |
| **Frontmatter Parser** | `parser.rs` | 9–28 | `parse_note()` reads `note_type` via serde |
| **CLI Commands** | `main.rs` | 55–184 | `Commands` enum (clap Subcommand) |
| **CLI Command Modules** | `commands/mod.rs` | 1–16 | Module list; each has `Commands` enum + `execute()` |
| **MCP Tool Dispatch** | `server.rs` | 77–116 | `dispatch_tool()` match block (24 tools) |
| **MCP Tool Schemas** | `tools/mod.rs` | 70–214 | `all_tools()` Vec; each tool via `make_tool()` |
| **Tauri Commands** | `lib.rs` | 21–53 | `generate_handler!` macro invocation list |
| **Tauri Implementations** | `commands.rs` | all | `#[tauri::command]` decorated functions |
| **Frontend API** | `tauri.ts` | 19–150 | `TauriBridge` class + method signatures |
| **Error Enum** | `error.rs` | 5–55 | `BrainMapError` variants + `error_code()` |
| **Error Response** | `server.rs` | 61–75 | `err_result()` helper wraps errors |
| **Error Usage** | `workspace.rs` | (multiple) | Return patterns via `.ok_or_else()` / `match` |

All files use exact line numbers for direct reference when writing extension guides.

---

