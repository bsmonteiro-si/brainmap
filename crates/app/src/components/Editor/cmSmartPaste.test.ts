import { describe, it, expect } from "vitest";
import { isUrl } from "./cmSmartPaste";

describe("isUrl", () => {
  it("accepts http URLs", () => {
    expect(isUrl("http://example.com")).toBe(true);
    expect(isUrl("http://example.com/path?q=1")).toBe(true);
  });

  it("accepts https URLs", () => {
    expect(isUrl("https://example.com")).toBe(true);
    expect(isUrl("https://sub.example.com/path#anchor")).toBe(true);
  });

  it("trims whitespace", () => {
    expect(isUrl("  https://example.com  ")).toBe(true);
  });

  it("rejects non-URLs", () => {
    expect(isUrl("hello world")).toBe(false);
    expect(isUrl("not a url")).toBe(false);
    expect(isUrl("ftp://files.example.com")).toBe(false);
    expect(isUrl("")).toBe(false);
    expect(isUrl("example.com")).toBe(false);
  });

  it("rejects URLs with spaces", () => {
    expect(isUrl("https://example.com/path with spaces")).toBe(false);
  });
});
