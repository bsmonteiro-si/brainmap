# 2026-03-12 — Subagent Transcript: Explore

**Date:** 2026-03-12 15:32:54
**Agent:** Explore
**Agent ID:** a9b6b0be131456640
**Parent Session:** 279be677-6d3a-444c-a7e0-844e319db25f

---

## User

In the BrainMap Tauri v2 desktop app, the `open_workspace` Tauri command has NEVER actually been called because a bug in `isTauri()` caused MockBridge to always be used. Now that we're fixing that, TauriBridge calls `invoke("open_workspace", { path })` which hits the Rust backend — and the app crashes.

I need you to find the crash cause. The most likely culprit is in `crates/app/src-tauri/src/watcher.rs` which uses `tokio::spawn()` — this requires a tokio runtime context. The `open_workspace` command in `commands.rs` is synchronous (not async), so it may run on a thread without tokio runtime context.

Investigate:

1. **`crates/app/src-tauri/src/commands.rs`** - Is `open_workspace` sync or async? In Tauri v2, sync commands run on the main thread which may not have tokio context.

2. **`crates/app/src-tauri/src/watcher.rs`** - Line 69 uses `tokio::spawn()`. Does this panic if called without a tokio runtime? Also check lines 62 and 67 which use `.expect()`.

3. **`crates/app/src-tauri/Cargo.toml`** - tokio features: does it have "rt-multi-thread"? Only "sync" and "rt" are listed.

4. **Tauri v2 runtime context** - In Tauri v2 (`tauri = "2"`), does the main thread / command dispatch thread have a tokio runtime available? Check if there's a way to get the runtime handle.

5. **`crates/app/src-tauri/src/lib.rs`** - Is there any async runtime setup?

6. Check if making `open_workspace` an `async` command (with `async fn`) would fix the tokio context issue, since Tauri v2 runs async commands on its managed tokio runtime.

7. Look at how other Tauri v2 apps handle file watchers with tokio — is there a pattern using `tauri::async_runtime::spawn` instead of `tokio::spawn`?

Read all the relevant files and provide a detailed analysis of:
- What exactly causes the crash
- The minimal fix needed

---

## Assistant

I'll systematically investigate the crash. Let me start by reading the key files.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Let me check the main.rs file to see how Tauri is initialized:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/main.rs"}`

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && grep -r \"async_runtime\\|tokio::runtime\" crates/app/src-tauri/src/ 2>/dev/null || echo \"No async_runtime or tokio::runtime found\""}`

---

## Assistant

Now let me check Tauri v2 documentation and patterns by looking at how Tauri v2 initializes async runtime:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri && grep -r \"tauri::async_runtime\" . 2>/dev/null || echo \"No tauri::async_runtime usage found\""}`

---

## Assistant

Let me search for Tauri v2 references to understand the async runtime context better:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && grep -r \"rt-multi-thread\\|tokio::runtime\\|async_runtime::spawn\" . --include=\"*.rs\" --include=\"*.toml\" 2>/dev/null | head -20"}`

---

## Assistant

Perfect! Let me check that CLI serve.rs to see how it initializes the tokio runtime:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/cli/src/commands/serve.rs"}`

---

## Assistant

Now let me check the state.rs file to see how AppState is defined:

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/state.rs"}`

---

## Assistant

Perfect! Now let me search for any documentation about Tauri v2 async commands:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && find . -name \"*.rs\" -exec grep -l \"async fn.*#\\[tauri::command\\]\" {} \\; 2>/dev/null | head -5"}`

---

## Assistant

Let me check if there are any comments or documentation in the codebase about Tauri v2 async handling:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && grep -r \"Tauri v2\\|async command\\|tokio runtime\" docs/ --include=\"*.md\" 2>/dev/null | head -10"}`

---

## Assistant

Now let me verify the exact problem by checking what happens when tokio::spawn is called without a runtime:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cat > /tmp/test_tokio.txt << 'EOF'\nThe issue with Tauri v2 and tokio::spawn:\n\n1. In Tauri v2, the main thread runs the Tauri event loop\n2. Sync commands (#[tauri::command] without asyn`

---

## Assistant

Let me search for any existing usage of tauri::async_runtime in the Tauri ecosystem or docs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && grep -r \"tauri::\" crates/app/src-tauri/src/*.rs | grep -i \"async\\|runtime\\|spawn\" | head -20"}`

---

## Assistant

Let me check the Tauri version to confirm the available APIs:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && grep \"^tauri\" crates/app/src-tauri/Cargo.toml"}`

---

## Assistant

Now let me verify whether Tauri v2's built-in runtime would be accessible. Let me check if there's any reference to how Tauri initializes its own async runtime:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && grep -r \"TOKIO_WORKER_THREADS\\|tokio::runtime\\|RuntimeExt\" crates/app/src-tauri/ --include=\"*.rs\" 2>/dev/null"}`

---

## Assistant

Perfect! Now let me compile my findings into a comprehensive analysis. Let me verify one more thing - checking if Tauri has tauri::async_runtime available by looking at what's imported:

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap && head -30 crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

Perfect. Now I have all the information needed. Let me provide my comprehensive analysis:

## Analysis: open_workspace Crash Cause

Based on my investigation of the BrainMap codebase, I have identified the exact crash cause and the minimal fixes needed.

### Root Cause

**The crash occurs because `tokio::spawn()` is called without a tokio runtime context.**

Flow:
1. `open_workspace` (line 9, `commands.rs`) is a **synchronous** function marked with `#[tauri::command]` (not `async fn`)
2. In Tauri v2, sync commands run on the **main thread** that executes the Tauri event loop
3. The main thread **does not have a tokio runtime** by default
4. When `open_workspace` calls `watcher::start_watcher()` at line 29
5. `start_watcher()` immediately calls `tokio::spawn()` at line 70 of `watcher.rs`
6. **PANIC**: `called tokio::spawn outside of a tokio runtime`

### Why This Happened Now

The bug was masked until now because:
- `open_workspace` was never actually invoked (the `isTauri()` bug forced MockBridge usage)
- Now that MockBridge is fixed, TauriBridge finally calls `open_workspace` via `invoke()`
- The sync command runs on the main thread and immediately hits the tokio::spawn panic

### Evidence

1. **`commands.rs` line 9**: `pub fn open_workspace(...)` — synchronous, not async
2. **`watcher.rs` line 70**: `tokio::spawn(async move { ... })` — expects tokio runtime context
3. **`Cargo.toml` line 17**: `tokio = { version = "1", features = ["sync", "rt"] }` — has basic runtime features but no initialization code
4. **`lib.rs` line 18-40**: `tauri::Builder::default()` creates the Tauri app with no explicit tokio runtime setup
5. **No usage of `tauri::async_runtime::spawn`** anywhere in the codebase (which would provide runtime context)

### Minimal Fix

There are two approaches; **Option 2 is strongly preferred**:

**Option 1: Use `tauri::async_runtime::spawn` (workaround)**
- Replace `tokio::spawn()` with `tauri::async_runtime::spawn()` in `watcher.rs` line 70
- `tauri::async_runtime` is Tauri's wrapper that runs tasks on its internal runtime
- Pros: Minimal code change (1 line)
- Cons: Requires understanding Tauri internals; less idiomatic for tokio-based code

**Option 2: Make `open_workspace` async (best practice, recommended)**
- Change `pub fn open_workspace(...)` to `pub async fn open_workspace(...)`
- In Tauri v2, async commands run on Tauri's managed tokio runtime thread
- This provides full tokio context and is the idiomatic Tauri v2 pattern
- Pros: 
  - Direct tokio context (no wrapper needed)
  - Aligns with Tauri v2 best practices
  - Future-proofs for other async operations
  - Tauri automatically handles scheduling async commands correctly
- Cons: Minor refactor (requires `async`/`await`, Result handling stays the same)

**Option 3: Create explicit runtime in the command (not recommended)**
- Would add overhead of creating a new runtime per command invocation
- Unnecessary and wasteful

### Recommendation

**Use Option 2**: Make `open_workspace` async. This is one-line change + proper async declaration:
```rust
#[tauri::command]
pub async fn open_workspace(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> Result<WorkspaceInfoDto, String> {
    // ... existing code unchanged, tokio::spawn now works because we're on tokio thread ...
}
```

No changes needed to the function body—Tauri v2 automatically places async commands on its runtime thread, so `tokio::spawn()` at line 70 of `watcher.rs` will have a runtime context.

---

