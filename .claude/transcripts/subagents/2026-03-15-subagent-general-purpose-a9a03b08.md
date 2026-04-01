# 2026-03-15 — Subagent Transcript: general-purpose

**Date:** 2026-03-15 19:30:55
**Agent:** general-purpose
**Agent ID:** a9a03b08b1c834974
**Parent Session:** cdef1f9f-8f4a-455f-b39c-cdd015da051b

---

## User

Implement the Rust backend changes for the PDF viewer feature in BrainMap. Make the following changes:

## 1. Add PdfMetaDto to dto.rs

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs`

Add after the PlainFileDto section (after line 292):

```rust
// ── PDF DTOs ─────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct PdfMetaDto {
    pub path: String,
    pub absolute_path: String,
    pub size_bytes: u64,
}
```

## 2. Add handler in handlers.rs

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`

Add a new handler `handle_resolve_pdf_path` after the `handle_read_plain_file` function (after line 388). The function should:
- Take `ws: &Workspace` and `path: &str`
- Call `validate_relative_path(&ws.root, path)` to validate
- Check the file exists
- Check extension is `.pdf` (case-insensitive)
- Get file metadata for size
- Reject files > 50MB (50 * 1024 * 1024 bytes)
- Return `PdfMetaDto { path, absolute_path, size_bytes }`

Use `use crate::dto::PdfMetaDto;` (it's already imported via `use crate::dto::*;` in commands.rs — but handlers.rs may need its own import). Check the existing imports in handlers.rs.

```rust
/// Resolve a PDF file path and return metadata for asset protocol loading.
/// Does NOT read file content — the frontend loads via Tauri's asset:// URL.
pub fn handle_resolve_pdf_path(ws: &Workspace, path: &str) -> Result<PdfMetaDto, String> {
    let abs = validate_relative_path(&ws.root, path)?;
    if !abs.exists() {
        return Err(format!("File not found: {}", path));
    }
    let ext = abs.extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());
    if ext.as_deref() != Some("pdf") {
        return Err(format!("Not a PDF file: {}", path));
    }
    let meta = std::fs::metadata(&abs)
        .map_err(|e| format!("Failed to read file metadata: {}", e))?;
    let size = meta.len();
    const MAX_PDF_SIZE: u64 = 50 * 1024 * 1024; // 50 MB
    if size > MAX_PDF_SIZE {
        return Err(format!(
            "PDF file too large ({:.1} MB). Maximum supported size is 50 MB.",
            size as f64 / (1024.0 * 1024.0)
        ));
    }
    Ok(PdfMetaDto {
        path: path.to_string(),
        absolute_path: abs.to_string_lossy().to_string(),
        size_bytes: size,
    })
}
```

Make sure `PdfMetaDto` is imported in handlers.rs. Check the existing import at the top — it likely uses `use crate::dto::*;` or specific imports. Add `PdfMetaDto` to whatever import pattern is used.

## 3. Add command in commands.rs

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`

Add the Tauri command, following the same pattern as `read_plain_file`:

```rust
#[tauri::command]
pub fn resolve_pdf_path(state: State<'_, AppState>, path: String) -> Result<PdfMetaDto, String> {
    state.with_active(|ws| handlers::handle_resolve_pdf_path(ws, &path))
}
```

Add it after the `read_plain_file` command.

## 4. Register in lib.rs

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`

Add `commands::resolve_pdf_path,` to the `generate_handler![]` list, after `commands::read_plain_file,`.

## 5. Update tauri.conf.json

File: `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json`

Add asset protocol scope to the security section. Change:
```json
"security": {
  "csp": null
}
```
to:
```json
"security": {
  "csp": null,
  "assetProtocol": {
    "enable": true,
    "scope": {
      "allow": ["**/*"],
      "deny": []
    }
  }
}
```

This allows the frontend to load files via `convertFileSrc()`.

Read each file before editing. Make the edits using the Edit tool.

---

## Assistant



I'll read all the files that need to be modified first.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","offset":280,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","offset":370,"limit":40}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":1,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json"}`

---

## Assistant

Now let me find the `read_plain_file` command in commands.rs to know the exact location.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"fn read_plain_file","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","output_mode":"content","-A":5}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"^use ","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","output_mode":"content"}`

---

## Assistant

Good, handlers.rs already uses `use crate::dto::*;` so `PdfMetaDto` will be automatically available. Now I'll make all the edits.

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs","old_string":"// ── Plain File DTOs ───────────────────────────────────────────────\n\n#[`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs","old_string":"/// Create a new plain (non-BrainMap) file on disk.","new_string":"///`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","old_string":"pub fn read_plain_file(state: State<'_, AppState>, path: String) -> Re`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs","old_string":"            commands::read_plain_file,\n            commands::write_plain_f`

---

## Assistant

### Tool Calls

- **Edit**: `{"replace_all":false,"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json","old_string":"    \"security\": {\n      \"csp\": null\n    }","new_string":"    \"s`

---

## Assistant

All five edits are done. Let me verify the Rust code compiles.

---

## Assistant

### Tool Calls

- **Bash**: `{"command":"cd /Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri && export PATH=\"$HOME/.cargo/bin:$PATH\" && cargo check 2>&1","description":"Check Tauri crate compiles","timeout":1200`

---

## Assistant

All changes compile successfully. Here is a summary of what was done:

1. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs`** -- Added `PdfMetaDto` struct with `path`, `absolute_path`, and `size_bytes` fields, placed after `PlainFileDto`.

2. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/handlers.rs`** -- Added `handle_resolve_pdf_path` handler that validates the path, checks the file exists, verifies `.pdf` extension (case-insensitive), enforces 50 MB size limit, and returns `PdfMetaDto`. No import changes needed since handlers.rs already uses `use crate::dto::*;`.

3. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs`** -- Added `resolve_pdf_path` Tauri command after `read_plain_file`, following the same `state.with_active()` pattern.

4. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/lib.rs`** -- Registered `commands::resolve_pdf_path` in the `generate_handler![]` macro.

5. **`/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/tauri.conf.json`** -- Added `assetProtocol` configuration with `enable: true` and `scope.allow: ["**/*"]` to the security section, enabling frontend file loading via `convertFileSrc()`.

---

