# 2026-03-09 — Subagent Transcript: Explore

**Date:** 2026-03-09 18:04:01
**Agent:** Explore
**Agent ID:** a96bc111992404af9
**Parent Session:** 3447398a-4083-473c-b489-02979ab6173d

---

## User

Explore the BrainMap codebase to identify remaining gaps and Phase 4 work. Thoroughness: medium.

1. **MCP resources**: Check if `brainmap://nodes/{path}`, `brainmap://graph`, and `brainmap://config` MCP resources are implemented. Look in `crates/mcp/src/` for any resources.rs or resource handling in server.rs.

2. **YAML output format**: The Phase 2 spec mentions `--format yaml`. Check if it's implemented in `crates/cli/src/main.rs` (the OutputFormat enum) and `crates/cli/src/output.rs`.

3. **Phase 3 exit criteria gaps**: Check if there's any MCP config file for Claude Code integration (e.g., a `.mcp.json` or similar). Also check if there are any latency/performance tests for MCP tools.

4. **Phase 4 features from docs/05-desktop-app.md**: These are mostly desktop features. Check if there are any Phase 4 items that apply to CLI/core/MCP rather than just the desktop app.

5. **docs/03-cli-spec.md**: Read this to check if all specified CLI commands are implemented. Compare against what exists in `crates/cli/src/commands/`.

6. **docs/04-mcp-spec.md**: Read this to check if all specified MCP tools/resources are implemented. Compare against `crates/mcp/src/tools/`.

Report: What specific deliverables are missing or incomplete from Phases 2, 3, and 4 that don't depend on the desktop app?

---

## Assistant

I'll explore the BrainMap codebase to identify Phase 2, 3, and 4 gaps. Let me start by checking the directory structure and then examining the specifications and implementations.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.md\" | grep -E \"(spec|phase)\" | head -20"}`

---

## Assistant

Good. Let me check what crates exist and what's implemented:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/crates/"}`

---

## Assistant

Interesting - there's a `crates/mcp` and `crates/app`. Let me check the specs and implementation status:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/03-cli-spec.md"}`

---

## Assistant

Now let me check the MCP spec:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/04-mcp-spec.md"}`

---

## Assistant

Now let me check what's actually implemented in the crates:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src -type f -name \"*.rs\" | sort"}`

---

## Assistant

Good. Let me check the MCP crate structure:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src -type f -name \"*.rs\" | sort"}`

---

## Assistant

Let me check if resources are implemented in the MCP server:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"resource\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/ 2>/dev/null | head -20"}`

---

## Assistant

Let me check the MCP server.rs file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/server.rs"}`

---

## Assistant

No resources are implemented. Let me check the main.rs to see what output formats are supported:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/main.rs"}`

---

## Assistant

Now let me check the docs to see what other phases were planned. Let me look at the phase definitions:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap/docs -type f -name \"*.md\" | sort"}`

---

## Assistant

Let me check the roadmap:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/docs/07-roadmap.md"}`

---

## Assistant

Now let me check which tools are actually listed in the MCP tools module:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/mod.rs"}`

---

## Assistant

I can see that `config_set`, `federation_list`, `federation_add`, `federation_remove`, `batch`, and `node_move` are missing from the tools list. Let me check if they exist elsewhere or if they're just missing from the tools list:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"node_move\\|config_set\\|federation\\|batch\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/ 2>/dev/null | head -30"}`

---

## Assistant

Let me check the CLI to see what commands have been implemented there:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"pub fn execute\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/*.rs 2>/dev/null | head -40"}`

---

## Assistant

Let me check what's in node.rs to see if node move is implemented:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"Move\\|Delete\\|Update\\|Create\\|List\\|Read\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/node.rs | head -30"}`

---

## Assistant

Good. Now let me check if YAML output format is implemented. Let me look at output.rs more closely:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/output.rs","limit":100}`

---

## Assistant

No YAML support. Let me check if there are any configuration files for MCP integration (like a `.mcp.json` or Claude Code setup):

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -name \"*.json\" -o -name \".mcp*\" -o -name \"*mcp*\" 2>/dev/null | grep -v node_modules | head -20"}`

---

## Assistant

Let me check what CLI commands are missing by comparing against the spec. Let me look for any missing commands:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls /Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/"}`

---

## Assistant

Now let me check if config set is implemented in the config command:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/config.rs"}`

---

## Assistant

Good. Now let me check federation commands:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/federation.rs","limit":60}`

---

## Assistant

Good. Federation is implemented. Now let me check if there's an MCP config anywhere or any integration with Claude Code. Let me check for documentation about Phase 3 integration:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f \\( -name \".mcp.json\" -o -name \"mcp.json\" -o -name \"*mcp-config*\" \\) 2>/dev/null"}`

---

## Assistant

No MCP config files. Let me check the serve command to see how the MCP server is set up:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/serve.rs"}`

---

## Assistant

Now let me look for the missing MCP tools. Let me check if config_set is implemented in the workspace tools:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/workspace.rs","limit":80}`

---

## Assistant

Let me see the rest of the file:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/workspace.rs","offset":80}`

---

## Assistant

Now let me check if node_move is implemented in MCP:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"node_move\\|move\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/tools/node.rs"}`

---

## Assistant

No node_move in MCP. Let me check if batch operations exist:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -r \"batch\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/src/"}`

---

## Assistant

No batch operations. Now let me look for performance tests or latency tests:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"find /Users/bsmonteiro/Desktop/Personal/brainmap -type f -name \"*.rs\" -path \"*/tests/*\" | head -20"}`

---

## Assistant

Good. Let me check the performance tests:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/tests/performance.rs"}`

---

## Assistant

Good - there's one performance test. Now let me check the MCP tool tests to see if there are latency tests:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/tests/tool_tests.rs","limit":100}`

---

## Assistant

Let me continue reading the MCP tests:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"wc -l /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/tests/tool_tests.rs"}`

---

## Assistant

Let me check for latency/performance tests in that file:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"grep -n \"latency\\|performance\\|bench\\|time\\|duration\\|500\\|ms\" /Users/bsmonteiro/Desktop/Personal/brainmap/crates/mcp/tests/tool_tests.rs"}`

---

## Assistant

No latency tests. Let me now check the recent reviews to understand what Phase 2/3 work has been done or attempted:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -la /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/"}`

---

## Assistant

Let me see what review files exist:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"ls -lah /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/ && echo \"---\" && ls -lah /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/plans/"}`

---

## Assistant

Let me check the Phase 2/3 CLI/MCP review to see what was identified as missing:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase2-3-cli-mcp-review-1.md"}`

---

## Assistant

Excellent! Now let me check the other review files to get a complete picture:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase2-3-core-review-1.md"}`

---

## Assistant

Now let me check the fixes review:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/phase2-3-fixes-review-pass-2.md"}`

---

## Assistant

Let me also check the quality fixes review:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/.claude/reviews/code/quality-fixes-review-1.md"}`

---

## Assistant

Perfect. Now I have a comprehensive picture. Let me compile my findings into a clear report. Let me also check if there's any documentation about what was actually completed:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat /Users/bsmonteiro/Desktop/Personal/brainmap/.claude/agents/plan-reviewer.md | head -50"}`

---

## Assistant

Now let me compile a comprehensive report. Let me create a summary document with all findings:

Based on my thorough exploration of the BrainMap codebase, here's a comprehensive report of remaining gaps and incomplete work for Phases 2, 3, and 4:

## **Incomplete Phase 2 (Full CLI) Deliverables**

### 1. **YAML Output Format Not Implemented**
- **Spec reference**: Phase 2 roadmap specifies `--format yaml` as a deliverable
- **Current state**: Only `text` and `json` formats implemented in `OutputFormat` enum (`crates/cli/src/main.rs` lines 30-34)
- **Gap**: No YAML formatting logic in `crates/cli/src/output.rs`
- **Severity**: Medium (specified in Phase 2 exit criteria)

---

## **Incomplete Phase 3 (MCP Server) Deliverables**

### 2. **MCP Resources Not Implemented**
- **Spec requirement** (04-mcp-spec.md lines 915-923):
  - `brainmap://nodes/{path}` — note content
  - `brainmap://graph` — full graph JSON
  - `brainmap://config` — workspace config
- **Current state**: MCP server (`crates/mcp/src/server.rs`) implements only tools, no resource handlers
- **Missing code**: No resource listing or reading via MCP protocol
- **Severity**: High (explicit Phase 3 exit criterion)

### 3. **Missing MCP Tools**
The following tools from the spec are **not** in the tool dispatch table (`crates/mcp/src/server.rs` lines 72-95 and `tools/mod.rs` lines 69-175):

| Tool | Spec Location | Status |
|------|---------------|--------|
| `brainmap_node_move` | 04-mcp-spec.md lines 243-274 | ❌ Missing |
| `brainmap_config_set` | 04-mcp-spec.md lines 722-747 | ❌ Missing |
| `brainmap_federation_list` | 04-mcp-spec.md lines 753-776 | ❌ Missing |
| `brainmap_federation_add` | 04-mcp-spec.md lines 778-804 | ❌ Missing |
| `brainmap_federation_remove` | 04-mcp-spec.md lines 806-829 | ❌ Missing |
| `brainmap_batch` | 04-mcp-spec.md lines 835-911 | ❌ Missing |

**Note**: `node_move` is implemented in CLI (`crates/cli/src/commands/node.rs` lines 66-72, 288-337) but not exposed via MCP.

### 4. **MCP Field Parity Issues** (from code review)
- `brainmap_node_create` and `brainmap_node_update` don't support `source` field parameter
- `brainmap_search` doesn't support `tag` filter (only `type` and `status`)
- These are documented in the spec but missing from the tool handlers

### 5. **No MCP Claude Code Integration Setup**
- **Phase 3 exit criteria** (07-roadmap.md line 157): "Add BrainMap as an MCP server in Claude Code config"
- **Missing**: No `.mcp.json` or MCP configuration file for Claude Code integration
- **Current state**: MCP server works via stdio (implements `ServerHandler` trait) but has no packaging/config for external integration

### 6. **Missing Latency/Performance Tests for MCP**
- **Phase 3 exit criterion** (07-roadmap.md line 161): "Latency criterion: all MCP tools respond in under 500ms for a 500-node workspace"
- **Current state**: 
  - `crates/core/tests/performance.rs` has one test: 500-node load under 2 seconds ✅
  - `crates/mcp/tests/tool_tests.rs` has functional tests but **no latency/timing tests**
- **Gap**: No performance benchmarking for individual MCP tools

---

## **Critical Bugs from Code Reviews (Blocking Implementation)**

These were identified in `.claude/reviews/code/` and must be fixed before Phase 3 is complete:

### From `phase2-3-core-review-1.md`:

1. **`move_note` loses edges** (bug severity):
   - Line 634 in `crates/core/src/workspace.rs`: edges are queried **after** the node is removed
   - `remove_node()` deletes all edges, so subsequent queries return empty
   - **Impact**: Moving a note silently loses all outgoing relationships
   
2. **`move_note` doesn't sync index** (bug severity):
   - Edges are updated in the in-memory graph but not synced to SQLite
   - Backlink queries and searches return stale data
   - **Impact**: Graph and index become inconsistent

3. **DOT export missing path escaping** (should-fix):
   - Paths with `"` or `\` produce malformed DOT output
   - Affects `brainmap export --format dot`

4. **GraphML namespace URL wrong** (should-fix):
   - Should be `http://graphml.graphdrawing.org/xmlns` not `.graphstruct.org`
   - Affects `brainmap export --format graphml`

### From `phase2-3-cli-mcp-review-1.md`:

5. **MCP Mutex poisoning** (bug severity):
   - All tool handlers use `.lock().unwrap()`
   - Any panic while holding the lock poisons the mutex permanently
   - Server becomes non-functional until restart
   - Partial fix exists in server.rs but is incomplete (see pass-2 review)

6. **`validate` command doesn't exit with error code** (should-fix):
   - Returns `Ok(())` even when validation errors found
   - Breaks CI/scripting use cases
   - Fixed per `phase2-3-fixes-review-pass-2.md`

---

## **Phase 4 (Polish & Advanced Features) — No Core/CLI/MCP Work Identified**

Phase 4 deliverables from `07-roadmap.md` lines 165-181 are **all UI/desktop-specific**:
- Graph view polish (hover, animations, label rendering)
- Multiple graph layouts
- Rich editor features
- Graph filters UI
- Focus mode
- Git integration
- Federated workspaces (partially — cross-workspace link/merge is listed but federation config is already in Phase 2/3)
- Export to image
- Theming
- Keyboard shortcuts

**No Phase 4 work outside the desktop app (`crates/app/`) applies to CLI/core/MCP.**

---

## **Summary of Deliverable Status**

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| 2 | YAML output format | ❌ Missing | Specified in exit criteria |
| 3 | MCP resources | ❌ Missing | Spec lines 915-923 |
| 3 | 6 missing MCP tools | ❌ Missing | `node_move`, `config_set`, 4x federation |
| 3 | MCP tool field parity | ⚠️ Partial | `source`, `tag` filter missing |
| 3 | Claude Code integration | ❌ Missing | No `.mcp.json` config |
| 3 | MCP latency tests | ❌ Missing | No <500ms benchmarks |
| 2/3 | Critical bug fixes | ⚠️ Partial | `move_note` edge loss not fixed, mutex poisoning partially fixed |

---

## **Immediate Priorities (to complete Phase 2 & 3)**

**Must-fix bugs** (from code reviews, blocking correctness):
1. `move_note` edge collection (query before remove)
2. `move_note` index sync (sync rewired edges to SQLite)
3. MCP mutex poisoning recovery

**Phase 3 deliverables** (not yet started):
1. Add YAML format output
2. Implement 3x MCP resource types (`brainmap://nodes/{path}`, `brainmap://graph`, `brainmap://config`)
3. Add 6 missing MCP tools (node_move, config_set, federation_*)
4. Add `source` and `tag` fields to existing MCP tools
5. Add MCP latency tests (500-node benchmark)
6. Create `.mcp.json` configuration for Claude Code

**Nice-to-have** (minor):
- DOT escaping fix (export command)
- GraphML namespace correction
- `edges_for` self-loop deduplication
- Test mutex poisoning fix across seed tests

Files most affected (for reference):
- `crates/core/src/workspace.rs` (move_note, delete_link)
- `crates/mcp/src/server.rs` (resource handlers, tool dispatch)
- `crates/mcp/src/tools/mod.rs` (tool schemas)
- `crates/cli/src/output.rs` (YAML format)

---

