# Single Core Library Consumed by All Interfaces
**Date:** 2026-03-15 | **Status:** accepted

## Context
BrainMap has three consumer interfaces: a CLI (`crates/cli`), an MCP server for AI agents (`crates/mcp`), and a desktop app (`crates/app/src-tauri`). All three need to parse markdown files, build the in-memory graph, run searches, and perform CRUD operations. The question was how to structure the shared logic.

## Decision
Put all domain logic in a single `brainmap-core` crate (`crates/core`). This crate exposes the `Workspace` struct as the public API surface — all read and write operations go through `workspace.rs`. The three interface crates are thin wrappers that translate their respective input formats (CLI args, MCP JSON, Tauri invoke payloads) into `Workspace` method calls.

## Alternatives Considered
- **Separate crates per domain (parser, graph, search, storage):** Would allow finer-grained dependency management but introduces inter-crate coordination overhead. The parser, graph, and search index are tightly coupled (parsing produces graph nodes, search indexes note content). Splitting them would require either shared types crates or duplicated models.
- **Interface-specific logic in each consumer:** Each crate could have its own parser/graph implementation optimized for its use case. This was rejected because it would triple the maintenance burden and allow behavioral drift between interfaces (e.g., CLI creates notes differently than MCP).
- **Shared library via dynamic linking (.so/.dylib):** Adds deployment complexity for no benefit in a Rust workspace where static linking is the default.

## Consequences
- A bug fixed in `brainmap-core` is fixed for all three interfaces simultaneously. A test added to core validates behavior for CLI, MCP, and desktop app.
- The 54 core tests (unit + seed + incremental + perf) provide confidence that any consumer calling `Workspace` methods gets correct behavior.
- Interface crates stay small and focused: CLI is argument parsing + output formatting, MCP is JSON envelope wrapping, Tauri is command registration.
- Trade-off: all interfaces are coupled to the same `Workspace` API. If one interface needed a fundamentally different interaction pattern, it would require adding methods to `Workspace` rather than customizing locally.
