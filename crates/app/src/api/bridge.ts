import type { BrainMapAPI } from "./types";
import { log } from "../utils/logger";

function isTauri(): boolean {
  return typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

let cachedApi: BrainMapAPI | null = null;

export async function getAPI(): Promise<BrainMapAPI> {
  if (cachedApi) return cachedApi;

  if (isTauri()) {
    log.info("api::bridge", "Tauri detected, using TauriBridge");
    const { TauriBridge } = await import("./tauri");
    cachedApi = new TauriBridge();
  } else {
    log.info("api::bridge", "Tauri NOT detected, using MockBridge");
    const { MockBridge } = await import("./mock/index");
    cachedApi = new MockBridge();
  }

  return cachedApi;
}
