# How to Add a CLI Command

## Checklist

### 1. Create the command module

- [ ] Create new file — `crates/cli/src/commands/<name>.rs`. Implement a public `execute()` function that takes the necessary arguments plus `workspace_path: &Path` and `format: &OutputFormat`, returning `brainmap_core::Result<()>`.
- [ ] Register module — `crates/cli/src/commands/mod.rs` (line ~1). Add `pub mod <name>;` to the module list.

### 2. Add the CLI subcommand variant

- [ ] Add variant to `Commands` enum — `crates/cli/src/main.rs` (line ~56, `enum Commands`). Add a new variant with `#[command(about = "...")]` attribute and any `#[arg(...)]` fields.

### 3. Wire up dispatch

- [ ] Add match arm — `crates/cli/src/main.rs` (line ~212, `match cli.command`). Add a `Commands::YourCommand { ... } => commands::<name>::execute(...)` arm.

### 4. Implement the command logic

- [ ] In `execute()`, open the workspace with `Workspace::open(workspace_path)?`.
- [ ] Call the appropriate core API method(s) on the workspace.
- [ ] Handle all three output formats in a `match format` block: `OutputFormat::Json` (use `output::print_json`), `OutputFormat::Yaml` (use `output::print_yaml`), `OutputFormat::Text` (use `println!`).
- [ ] Define a `#[derive(Serialize)]` output struct for JSON/YAML output.

### 5. Tests

- [ ] Add integration test — `crates/cli/tests/` directory. Use `assert_cmd` with a temp copy of `seed/` to test the command end-to-end.

## Example

Follow the pattern of the `search` command:
- Module: `crates/cli/src/commands/search.rs` — complete implementation with `execute()`, serializable output struct, format handling
- Registration: `crates/cli/src/commands/mod.rs` line ~10 (`pub mod search;`)
- Enum variant: `crates/cli/src/main.rs` line ~69 (`Search { ... }`)
- Dispatch: `crates/cli/src/main.rs` line ~216 (`Commands::Search { ... } => commands::search::execute(...)`)
