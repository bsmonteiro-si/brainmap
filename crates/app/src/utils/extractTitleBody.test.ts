import { describe, it, expect } from "vitest";
import { extractTitleBody } from "./extractTitleBody";

describe("extractTitleBody", () => {
  it("extracts title from first line and body from rest", () => {
    const result = extractTitleBody("My Title\nSome body content\nMore content");
    expect(result.title).toBe("My Title");
    expect(result.body).toBe("Some body content\nMore content");
  });

  it("skips leading empty lines", () => {
    const result = extractTitleBody("\n\n  \nActual Title\nBody here");
    expect(result.title).toBe("Actual Title");
    expect(result.body).toBe("Body here");
  });

  it("returns empty body when only title exists", () => {
    const result = extractTitleBody("Just a title");
    expect(result.title).toBe("Just a title");
    expect(result.body).toBe("");
  });

  it("trims the title", () => {
    const result = extractTitleBody("  Padded Title  \nBody");
    expect(result.title).toBe("Padded Title");
    expect(result.body).toBe("Body");
  });

  it("returns empty for empty string", () => {
    const result = extractTitleBody("");
    expect(result.title).toBe("");
    expect(result.body).toBe("");
  });

  it("returns empty for whitespace-only string", () => {
    const result = extractTitleBody("   \n  \n  ");
    expect(result.title).toBe("");
    expect(result.body).toBe("");
  });

  it("trims trailing whitespace from body", () => {
    const result = extractTitleBody("Title\nBody\n\n  ");
    expect(result.title).toBe("Title");
    expect(result.body).toBe("Body");
  });
});
