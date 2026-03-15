# BrainMapAPI Bridge Pattern
**Date:** 2026-03-15 | **Status:** accepted

## Context
The React frontend runs in two contexts: inside a Tauri webview (production) where it communicates with the Rust backend via `invoke()`, and in a plain browser (development / testing) where no Tauri runtime exists. The frontend needs to work in both without conditional logic scattered through components.

## Decision
Define a `BrainMapAPI` TypeScript interface in `api/types.ts` with all backend operations. Provide two implementations: `TauriBridge` (wraps Tauri `invoke()` calls) and `MockBridge` (in-memory implementation using seed JSON data). A `getAPI()` factory in `api/bridge.ts` detects the runtime environment and returns the appropriate implementation, cached as a singleton.

## Alternatives Considered
- **Direct `invoke()` calls everywhere:** Would require `if (isTauri()) { invoke(...) } else { ... }` guards in every component or store that touches the backend. Untestable without mocking Tauri internals. Tight coupling between UI and transport layer.
- **MSW (Mock Service Worker) or similar network mocking:** The Tauri `invoke()` API is not HTTP-based, so network-level mocking tools do not apply. Would require a fake HTTP layer that does not match the real communication path.
- **Dependency injection via React context:** Would work but forces all API consumers to be React components or use `useContext`. Zustand stores (which call API methods imperatively) would need awkward workarounds. The singleton factory pattern is simpler and works everywhere.

## Consequences
- Frontend tests run with `npm test` alone, no Tauri build required. MockBridge provides deterministic data from the seed dataset.
- `npm run dev` launches a working UI in any browser for rapid iteration on styling and layout, even without the Rust backend compiled.
- The interface contract (`BrainMapAPI`) serves as living documentation of the backend's capabilities. Adding a new backend operation requires updating the interface first, then both implementations.
- Trade-off: MockBridge must be kept in sync with TauriBridge manually. Drift is caught by TypeScript compilation (both must satisfy `BrainMapAPI`) but behavioral differences can slip through.
