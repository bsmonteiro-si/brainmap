# How to Add a Tauri Command

## Checklist

### Backend (Rust)

#### 1. Define DTOs (if needed)

- [ ] Add request/response structs — `crates/app/src-tauri/src/dto.rs`. Define `#[derive(Deserialize)]` for input params and `#[derive(Serialize)]` for output DTOs. Follow existing naming: `<Name>Params` for inputs, `<Name>Dto` for outputs.

#### 2. Implement the handler

- [ ] Add handler function — `crates/app/src-tauri/src/handlers.rs` (line ~50 onwards). The function should take `&Workspace` (read) or `&mut Workspace` (write) and return `Result<T, String>`. Pattern: `pub fn handle_<name>(ws: &Workspace, ...) -> Result<T, String>`.

#### 3. Create the Tauri command wrapper

- [ ] Add `#[tauri::command]` function — `crates/app/src-tauri/src/commands.rs`. The wrapper should:
  - Accept `state: State<'_, AppState>` for workspace access
  - Accept `app: tauri::AppHandle` if it needs to emit events
  - Use `state.with_active(|ws| ...)` for read-only operations
  - Use `state.with_slot_mut(&root, |slot| ...)` for write operations (call `state.resolve_root(None)?` first)
  - For write operations: call `state.register_expected_write(&root, abs_path)` before mutation to suppress file watcher re-processing
  - For mutations: call `emit_topology_event(...)` after the mutation if graph topology changed

#### 4. Register in Tauri builder

- [ ] Add to `generate_handler!` — `crates/app/src-tauri/src/lib.rs` (line ~25). Add `commands::your_command` to the macro invocation.

### Frontend (TypeScript)

#### 5. Add TypeScript types

- [ ] Add TS interface — `crates/app/src/api/types.ts` (line ~111, `BrainMapAPI` interface). Add the method signature to the interface.
- [ ] Add any new DTO interfaces at the top of the same file if the command returns new data shapes.

#### 6. Implement TauriBridge

- [ ] Add method — `crates/app/src/api/tauri.ts` (in `TauriBridge` class). Call `invoke<ReturnType>("command_name", { params })`. The Tauri command name uses snake_case.

#### 7. Implement MockBridge

- [ ] Add mock method — `crates/app/src/api/mock/index.ts` (in `MockBridge` class). Return realistic mock data for development/testing without the Tauri backend.

#### 8. Call from stores or components

- [ ] Use via bridge — `const api = await getAPI(); const result = await api.yourMethod(...)`. Import `getAPI` from `../api/bridge`.

### Tests

- [ ] Rust handler test — Test the handler function directly with a temp workspace.
- [ ] Vitest test — Test the component or store that calls the new API method using the MockBridge.

## Example

Follow the pattern of the `get_stats` command (simple read-only):
- DTO: `crates/app/src-tauri/src/dto.rs` — `StatsDto`
- Handler: `crates/app/src-tauri/src/handlers.rs` — `handle_get_stats()`
- Command: `crates/app/src-tauri/src/commands.rs` line ~431 — `pub fn get_stats(...)`
- Registration: `crates/app/src-tauri/src/lib.rs` line ~43 — `commands::get_stats`
- TS types: `crates/app/src/api/types.ts` line ~91 — `StatsDto` interface, line ~147 — `getStats()` in `BrainMapAPI`
- TauriBridge: `crates/app/src/api/tauri.ts` line ~104 — `async getStats()`
- MockBridge: `crates/app/src/api/mock/index.ts` — `async getStats()`

For a write command that emits events, follow the pattern of `create_node`:
- Command: `crates/app/src-tauri/src/commands.rs` line ~125 — registers expected writes, performs mutation, emits topology event
