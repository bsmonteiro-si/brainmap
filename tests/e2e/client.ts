/**
 * E2E test client — talks directly to the tauri-plugin-mcp Unix socket.
 *
 * Protocol: newline-delimited JSON.
 *   Request:  {"command":"...","payload":{...},"id":"...","authToken":"..."}\n
 *   Response: {"success":true,"data":...,"id":"..."}\n
 */
import * as net from "node:net";
import * as fs from "node:fs";

const REQUEST_TIMEOUT_MS = 30_000;

export class E2EClient {
  private socket: net.Socket | null = null;
  private buffer = "";
  private pending = new Map<
    string,
    { resolve: (v: any) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }
  >();
  private authToken?: string;

  constructor(private socketPath: string) {}

  /** Connect to the Tauri MCP socket. Reads auth token from <socketPath>.token. */
  async connect(): Promise<void> {
    // Read auth token
    const tokenPath = `${this.socketPath}.token`;
    try {
      if (fs.existsSync(tokenPath)) {
        this.authToken = fs.readFileSync(tokenPath, "utf-8").trim() || undefined;
      }
    } catch {
      // No token — proceed without auth
    }

    return new Promise((resolve, reject) => {
      this.socket = net.createConnection({ path: this.socketPath }, () => {
        this.socket!.on("data", (data) => this.handleData(data));
        resolve();
      });
      this.socket.on("error", (err) => reject(err));
    });
  }

  /** Disconnect from the socket. */
  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    // Reject any pending requests and clear their timers
    for (const [id, cb] of this.pending) {
      clearTimeout(cb.timer);
      cb.reject(new Error("Client disconnected"));
      this.pending.delete(id);
    }
  }

  // ---------------------------------------------------------------------------
  // Typed convenience methods
  // ---------------------------------------------------------------------------

  /** Execute JavaScript in the app's WebView. Returns the evaluation result. */
  async executeJs(code: string): Promise<any> {
    const data = await this.send("execute_js", { code, window_label: "main" });
    // Plugin wraps result as {result: "...", type: "string"|"boolean"|"number"|"object"|...}
    // The `result` field is always a string representation — coerce based on `type`.
    if (data && typeof data === "object" && "result" in data && "type" in data) {
      const raw = data.result;
      switch (data.type) {
        case "boolean":
          return raw === "true";
        case "number":
          return Number(raw);
        case "null":
        case "undefined":
          return null;
        case "object":
          // Could be JSON-stringified or a toString() like "[object Object]"
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        default:
          return raw;
      }
    }
    return data;
  }

  /**
   * Take a screenshot. Returns raw result from the plugin (base64 data and/or file path).
   * Use `outputDir` to save to a specific directory.
   */
  async takeScreenshot(outputDir?: string): Promise<any> {
    const payload: Record<string, any> = {
      window_label: "main",
      save_to_disk: true,
      thumbnail: false,
    };
    if (outputDir) payload.output_dir = outputDir;
    return this.send("take_screenshot", payload);
  }

  /** Wait for a CSS selector to be visible in the DOM. */
  async waitForSelector(
    selector: string,
    timeoutMs = 10_000,
  ): Promise<any> {
    return this.send("wait_for", {
      window_label: "main",
      selector,
      state: "visible",
      timeout_ms: timeoutMs,
    });
  }

  /** Wait for text to appear on the page. */
  async waitForText(text: string, timeoutMs = 10_000): Promise<any> {
    return this.send("wait_for", {
      window_label: "main",
      text,
      state: "visible",
      timeout_ms: timeoutMs,
    });
  }

  /** Query page state (URL, title, scroll, viewport). */
  async queryPageState(): Promise<any> {
    return this.send("get_page_state", { window_label: "main" });
  }

  /** Get app info (name, version, OS, windows, monitors). */
  async queryAppInfo(): Promise<any> {
    return this.send("get_app_info", {});
  }

  // ---------------------------------------------------------------------------
  // Low-level transport
  // ---------------------------------------------------------------------------

  private send(
    command: string,
    payload: Record<string, any>,
  ): Promise<any> {
    if (!this.socket) {
      return Promise.reject(new Error("Not connected"));
    }

    return new Promise((resolve, reject) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substring(2);

      const request =
        JSON.stringify({
          command,
          payload,
          id,
          ...(this.authToken ? { authToken: this.authToken } : {}),
        }) + "\n";

      // Timeout guard — cleared on resolve/reject
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
        }
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(id, { resolve, reject, timer });

      this.socket!.write(request, (err) => {
        if (err) {
          clearTimeout(timer);
          this.pending.delete(id);
          reject(new Error(`Socket write failed: ${err.message}`));
        }
      });
    });
  }

  private handleData(data: Buffer): void {
    this.buffer += data.toString();

    let newlineIdx: number;
    while ((newlineIdx = this.buffer.indexOf("\n")) !== -1) {
      const jsonStr = this.buffer.substring(0, newlineIdx);
      this.buffer = this.buffer.substring(newlineIdx + 1);

      let response: any;
      try {
        response = JSON.parse(jsonStr);
      } catch {
        // Line was complete (delimited by \n) but not valid JSON — protocol error.
        // Reject the oldest pending request so callers get a real error, not a timeout.
        const oldest = Array.from(this.pending.keys()).sort()[0];
        if (oldest) {
          const cb = this.pending.get(oldest)!;
          clearTimeout(cb.timer);
          this.pending.delete(oldest);
          cb.reject(new Error(`Invalid JSON response: ${jsonStr.substring(0, 200)}`));
        }
        continue;
      }

      // Match response to request by ID only — no FIFO fallback to avoid misrouting
      if (response.id && this.pending.has(response.id)) {
        const cb = this.pending.get(response.id)!;
        clearTimeout(cb.timer);
        this.pending.delete(response.id);

        if (!response.success) {
          cb.reject(
            new Error(response.error || "Command failed without error message"),
          );
        } else {
          cb.resolve(response.data);
        }
      }
      // Responses with unknown/missing IDs are silently dropped (e.g. server notifications)
    }
  }
}
