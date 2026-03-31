/**
 * Vitest globalSetup — launches a real BrainMap Tauri app instance for E2E tests.
 *
 * Lifecycle:
 *   setup()    → copy seed, spawn `cargo tauri dev`, wait for socket, connect, open workspace
 *   teardown() → disconnect, kill process tree, clean up temp files
 */
import { spawn, type ChildProcess, execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { E2EClient } from "./client.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const APP_CWD = path.join(REPO_ROOT, "crates/app");
const SEED_DIR = path.join(REPO_ROOT, "seed");

const SOCKET_PATH = `/tmp/brainmap-mcp-test-${process.pid}.sock`;
const TOKEN_PATH = `${SOCKET_PATH}.token`;
const VITE_PORT = "1520";
const VITE_HMR_PORT = "1521";

const POLL_INTERVAL_MS = 500;
const MAX_WAIT_MS = 180_000; // 3 minutes — cold Rust compile can be slow

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let tauriProcess: ChildProcess | null = null;
let client: E2EClient | null = null;
let tempWorkspaceDir: string | null = null;
let logStream: fs.WriteStream | null = null;

// ---------------------------------------------------------------------------
// setup()
// ---------------------------------------------------------------------------

export async function setup(): Promise<void> {
  console.log("[e2e] Starting setup...");

  // 1. Clean up stale socket files from previous runs
  cleanStaleFiles();

  // 2. Copy seed/ to a temp directory
  tempWorkspaceDir = fs.mkdtempSync(path.join(os.tmpdir(), "brainmap-e2e-"));
  fs.cpSync(SEED_DIR, tempWorkspaceDir, { recursive: true });
  console.log(`[e2e] Test workspace: ${tempWorkspaceDir}`);

  // 3. Ensure logs directory exists
  const logsDir = path.join(import.meta.dirname, "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  logStream = fs.createWriteStream(path.join(logsDir, "tauri-dev.log"), {
    flags: "w",
  });

  // 4. Check if Vite port is already in use (e.g. leftover e2e-app.sh instance)
  try {
    execSync(`lsof -ti:${VITE_PORT}`, { stdio: "pipe" });
    // If we get here, something is listening on the port
    throw new Error(
      `Port ${VITE_PORT} is already in use. Kill the process with: lsof -ti:${VITE_PORT} | xargs kill\n` +
      `Or stop the isolated app: ./scripts/e2e-app.sh stop`,
    );
  } catch (e: unknown) {
    // lsof exits with code 1 when nothing is listening — that's what we want
    if (e instanceof Error && "status" in e) {
      // execSync threw because lsof returned non-zero → port is free, continue
    } else {
      // Our own Error from the throw above
      throw e;
    }
  }

  // 5. Spawn cargo tauri dev
  const tauriConfigOverride = JSON.stringify({
    build: {
      devUrl: `http://localhost:${VITE_PORT}`,
      beforeDevCommand: `vite --port ${VITE_PORT}`,
    },
  });

  tauriProcess = spawn(
    "npx",
    ["tauri", "dev", "--config", tauriConfigOverride],
    {
      cwd: APP_CWD,
      env: {
        ...process.env,
        PATH: `${process.env.HOME}/.cargo/bin:${process.env.PATH}`,
        BRAINMAP_MCP_SOCKET: SOCKET_PATH,
        BRAINMAP_LOG_DIR: path.join(import.meta.dirname, "logs", "app"),
        VITE_PORT,
        VITE_HMR_PORT,
      },
      stdio: ["ignore", "pipe", "pipe"],
      // Create a process group so we can kill the whole tree with process.kill(-pid)
      detached: true,
    },
  );

  tauriProcess.stdout?.pipe(logStream);
  tauriProcess.stderr?.pipe(logStream);

  tauriProcess.on("error", (err) => {
    console.error("[e2e] cargo tauri dev failed to start:", err.message);
  });

  tauriProcess.on("exit", (code, signal) => {
    console.log(
      `[e2e] cargo tauri dev exited (code=${code}, signal=${signal})`,
    );
    tauriProcess = null;
  });

  // 6. Safety-net: kill children on unexpected exit
  process.on("exit", killTauriProcess);
  process.on("SIGINT", () => {
    killTauriProcess();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    killTauriProcess();
    process.exit(143);
  });

  // 7. Poll for socket file (token file is optional — not all plugin versions create one)
  console.log(`[e2e] Waiting for socket at ${SOCKET_PATH} ...`);
  await waitForFiles([SOCKET_PATH], MAX_WAIT_MS);
  console.log("[e2e] Socket file detected.");

  // 8. Connect client (small delay to ensure socket is accepting connections)
  await new Promise((r) => setTimeout(r, 1_000));
  client = new E2EClient(SOCKET_PATH);
  await client.connect();
  console.log("[e2e] Connected to Tauri MCP socket.");

  // 9. Wait for the WebView to be ready (JS context loaded)
  await waitForWebView(client);
  console.log("[e2e] WebView is ready.");

  // 10. Open test workspace via the app's segment actions
  //    This replicates what the SegmentPicker UI does: addSegment + openWorkspace + loadTopology.
  //    We import the bundled module dynamically from the Vite dev server's module graph.
  const escapedPath = tempWorkspaceDir!.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  await client.executeJs(`
    (async () => {
      const { openFolderAsSegment } = await import('/src/stores/segmentActions.ts');
      await openFolderAsSegment('${escapedPath}');
      return 'ok';
    })()
  `);
  console.log("[e2e] Workspace opened via openFolderAsSegment.");

  // 11. Wait for the file tree to render
  await client.waitForSelector("[data-tree-path]", 30_000);
  console.log("[e2e] File tree loaded. Setup complete.");

  // 12. Write socket path to a file so test workers can create their own client
  fs.writeFileSync(
    path.join(import.meta.dirname, ".e2e-socket-path"),
    SOCKET_PATH,
    "utf-8",
  );
}

// ---------------------------------------------------------------------------
// teardown()
// ---------------------------------------------------------------------------

export async function teardown(): Promise<void> {
  console.log("[e2e] Starting teardown...");

  // Disconnect client
  if (client) {
    client.disconnect();
    client = null;
  }

  // Kill the tauri process
  killTauriProcess();

  // Close log stream
  if (logStream) {
    logStream.end();
    logStream = null;
  }

  // Clean up temp workspace
  if (tempWorkspaceDir && fs.existsSync(tempWorkspaceDir)) {
    fs.rmSync(tempWorkspaceDir, { recursive: true, force: true });
    console.log(`[e2e] Cleaned up temp workspace: ${tempWorkspaceDir}`);
  }

  // Clean up socket path file, socket, and token files
  const socketPathFile = path.join(import.meta.dirname, ".e2e-socket-path");
  for (const f of [socketPathFile, SOCKET_PATH, TOKEN_PATH]) {
    try {
      fs.unlinkSync(f);
    } catch {
      // already gone
    }
  }

  console.log("[e2e] Teardown complete.");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cleanStaleFiles(): void {
  // Remove stale socket/token files from previous test runs whose PIDs are dead
  const tmpDir = "/tmp";
  try {
    for (const f of fs.readdirSync(tmpDir)) {
      if (!f.startsWith("brainmap-mcp-test-") || !(f.endsWith(".sock") || f.endsWith(".token"))) continue;
      const pidMatch = f.match(/brainmap-mcp-test-(\d+)/);
      if (!pidMatch) continue;
      const pid = parseInt(pidMatch[1], 10);
      // Check if the owning process is still alive (kill(pid, 0) throws if dead)
      try {
        process.kill(pid, 0);
        // Process still alive — don't delete its socket
      } catch {
        // Process is dead — safe to clean up
        try {
          fs.unlinkSync(path.join(tmpDir, f));
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // /tmp not readable — unlikely but harmless
  }
}

function killTauriProcess(): void {
  if (!tauriProcess || tauriProcess.exitCode !== null) return;

  const pid = tauriProcess.pid;
  if (!pid) return;

  console.log(`[e2e] Killing cargo tauri dev (pid=${pid})...`);

  // Try SIGTERM first
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      tauriProcess.kill("SIGTERM");
    } catch {
      // already dead
    }
  }

  // Force kill after 5s
  setTimeout(() => {
    if (tauriProcess && tauriProcess.exitCode === null) {
      console.log("[e2e] Force-killing with SIGKILL...");
      try {
        process.kill(-pid, "SIGKILL");
      } catch {
        try {
          tauriProcess.kill("SIGKILL");
        } catch {
          // already dead
        }
      }
    }
  }, 5_000);
}

/**
 * Retry executeJs until the WebView JS context AND the Tauri IPC bridge are ready.
 * Tauri v2 uses `window.__TAURI_INTERNALS__.invoke` (not `window.__TAURI__`).
 */
async function waitForWebView(c: E2EClient, timeoutMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const result = await c.executeJs(
        "typeof window.__TAURI_INTERNALS__ !== 'undefined' && typeof window.__TAURI_INTERNALS__.invoke === 'function' ? 'ready' : 'not-ready'",
      );
      if (result === "ready") return;
    } catch {
      // JS execution failed — WebView not ready yet, retry
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error(`WebView + Tauri IPC not ready after ${timeoutMs}ms`);
}

async function waitForFiles(
  paths: string[],
  timeoutMs: number,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // Bail early if the tauri process died
    if (tauriProcess && tauriProcess.exitCode !== null) {
      throw new Error(
        `cargo tauri dev exited with code ${tauriProcess.exitCode} before socket was ready. Check tests/e2e/logs/tauri-dev.log`,
      );
    }
    if (paths.every((p) => fs.existsSync(p))) return;
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(
    `Timed out after ${timeoutMs}ms waiting for: ${paths.filter((p) => !fs.existsSync(p)).join(", ")}`,
  );
}
