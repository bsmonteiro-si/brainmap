---
type: idea
area: e2e
source: canvas-undo-redo-debug-session
---

Sequential E2E execution won't scale past ~15 specs. The fundamental problem is one app instance shared by all parallel workers — any spec that mutates state (opens files, adds cards, expands folders) pollutes the environment for concurrent specs.

The solution is per-worker app instances: each Vitest worker gets its own Tauri process on its own port/socket with its own temp workspace. Full parallel execution, zero interference.

Required changes:
1. Parameterize `scripts/e2e-app.sh` to accept a port and socket suffix (currently hardcoded to port 1520 and `/tmp/brainmap-mcp-isolated.sock`)
2. A Vitest pool plugin or `globalSetup` that spins up N app instances (one per worker) and tears them down after
3. `getClient()` in `connect.ts` connects to the worker-local socket instead of a shared one
4. Pre-warming a pool of instances could amortize the ~15s cold start per worker
