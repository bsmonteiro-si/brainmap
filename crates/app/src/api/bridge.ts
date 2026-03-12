import type { BrainMapAPI } from "./types";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

let cachedApi: BrainMapAPI | null = null;

export async function getAPI(): Promise<BrainMapAPI> {
  if (cachedApi) return cachedApi;

  if (isTauri()) {
    const { TauriBridge } = await import("./tauri");
    cachedApi = new TauriBridge();
  } else {
    const { MockBridge } = await import("./mock/index");
    cachedApi = new MockBridge();
  }

  return cachedApi;
}
