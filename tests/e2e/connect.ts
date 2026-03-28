/**
 * Helper for test files to connect to the running E2E app instance.
 * The globalSetup writes the socket path to .e2e-socket-path.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { E2EClient } from "./client.js";

let sharedClient: E2EClient | null = null;

/**
 * Get a connected E2EClient. Reuses a single connection across all tests
 * in the same worker process.
 */
export async function getClient(): Promise<E2EClient> {
  if (sharedClient) return sharedClient;

  const socketPathFile = path.join(import.meta.dirname, ".e2e-socket-path");
  if (!fs.existsSync(socketPathFile)) {
    throw new Error(
      "Socket path file not found. Did globalSetup run successfully?",
    );
  }

  const socketPath = fs.readFileSync(socketPathFile, "utf-8").trim();
  sharedClient = new E2EClient(socketPath);
  await sharedClient.connect();
  return sharedClient;
}
