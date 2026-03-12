import { describe, it, expect, vi, beforeEach } from "vitest";
import { log } from "./logger";

describe("logger", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let debugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    return () => {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      infoSpy.mockRestore();
      debugSpy.mockRestore();
    };
  });

  it("emits error to console.error with [brainmap] prefix", () => {
    log.error("stores::editor", "save failed", { path: "test.md" });
    expect(errorSpy).toHaveBeenCalledOnce();
    const arg = errorSpy.mock.calls[0][0] as string;
    expect(arg).toMatch(/^\[brainmap\] /);
    const json = JSON.parse(arg.replace("[brainmap] ", ""));
    expect(json.level).toBe("ERROR");
    expect(json.target).toBe("stores::editor");
    expect(json.msg).toBe("save failed");
    expect(json.fields).toEqual({ path: "test.md" });
    expect(json.ts).toBeDefined();
  });

  it("emits warn to console.warn", () => {
    log.warn("graph", "missing node");
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it("emits info to console.info", () => {
    log.info("workspace", "opened", { root: "/tmp" });
    expect(infoSpy).toHaveBeenCalledOnce();
  });

  it("emits debug to console.debug", () => {
    log.debug("parser", "parsed file");
    expect(debugSpy).toHaveBeenCalledOnce();
  });

  it("omits fields key when no fields provided", () => {
    log.info("test", "no fields");
    const arg = infoSpy.mock.calls[0][0] as string;
    const json = JSON.parse(arg.replace("[brainmap] ", ""));
    expect(json.fields).toBeUndefined();
  });

  it("omits fields key when empty object provided", () => {
    log.info("test", "empty fields", {});
    const arg = infoSpy.mock.calls[0][0] as string;
    const json = JSON.parse(arg.replace("[brainmap] ", ""));
    expect(json.fields).toBeUndefined();
  });

  it("includes ISO timestamp", () => {
    log.info("test", "ts check");
    const arg = infoSpy.mock.calls[0][0] as string;
    const json = JSON.parse(arg.replace("[brainmap] ", ""));
    expect(() => new Date(json.ts)).not.toThrow();
    expect(json.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
