import { describe, it, expect } from "vitest";
import { SLASH_COMMANDS, filterSlashCommands } from "./cmSlashCommands";
import { CALLOUT_TYPE_ENTRIES } from "./calloutTypes";

const STATIC_COMMAND_COUNT = 12; // headings(3) + lists(3) + blocks(5) + inline source(1)

describe("SLASH_COMMANDS registry", () => {
  it("has the expected number of commands", () => {
    expect(SLASH_COMMANDS.length).toBe(STATIC_COMMAND_COUNT + CALLOUT_TYPE_ENTRIES.length);
  });

  it("every command has required fields", () => {
    for (const cmd of SLASH_COMMANDS) {
      expect(cmd.keyword).toBeTruthy();
      expect(cmd.label).toBeTruthy();
      expect(cmd.detail).toBeTruthy();
      expect(cmd.section).toBeTruthy();
      expect(cmd.icon).toBeTruthy();
      expect(typeof cmd.apply).toBe("function");
    }
  });

  it("has unique keywords", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("includes all callout types", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(keywords).toContain("ai-answer");
    expect(keywords).toContain("source-callout");
    expect(keywords).toContain("question");
    expect(keywords).toContain("key-insight");
  });

  it("includes standard markdown commands", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(keywords).toContain("h1");
    expect(keywords).toContain("h2");
    expect(keywords).toContain("h3");
    expect(keywords).toContain("bullet");
    expect(keywords).toContain("numbered");
    expect(keywords).toContain("task");
    expect(keywords).toContain("quote");
    expect(keywords).toContain("code");
    expect(keywords).toContain("hr");
    expect(keywords).toContain("table");
    expect(keywords).toContain("link");
  });

  it("includes inline source command", () => {
    const keywords = SLASH_COMMANDS.map((c) => c.keyword);
    expect(keywords).toContain("source");
  });

  it("has valid sections", () => {
    const validSections = new Set(["Headings", "Lists", "Blocks", "BrainMap", "Callouts"]);
    for (const cmd of SLASH_COMMANDS) {
      expect(validSections.has(cmd.section)).toBe(true);
    }
  });
});

describe("filterSlashCommands", () => {
  it("returns all commands for empty query", () => {
    expect(filterSlashCommands("")).toEqual(SLASH_COMMANDS);
  });

  it("filters by keyword", () => {
    const result = filterSlashCommands("h1");
    expect(result.length).toBe(1);
    expect(result[0].keyword).toBe("h1");
  });

  it("filters by partial keyword", () => {
    const result = filterSlashCommands("h");
    const keywords = result.map((c) => c.keyword);
    expect(keywords).toContain("h1");
    expect(keywords).toContain("h2");
    expect(keywords).toContain("h3");
    expect(keywords).toContain("hr");
  });

  it("filters by label (case-insensitive)", () => {
    const result = filterSlashCommands("heading");
    expect(result.length).toBe(3);
    for (const cmd of result) {
      expect(cmd.section).toBe("Headings");
    }
  });

  it("matches ai-answer", () => {
    const result = filterSlashCommands("ai");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((c) => c.keyword === "ai-answer")).toBe(true);
  });

  it("returns empty for no match", () => {
    expect(filterSlashCommands("xyz")).toEqual([]);
  });

  it("is case-insensitive", () => {
    const lower = filterSlashCommands("bullet");
    const upper = filterSlashCommands("BULLET");
    expect(lower).toEqual(upper);
  });

  it("matches 'source' to both inline and callout", () => {
    const result = filterSlashCommands("source");
    const keywords = result.map((c) => c.keyword);
    expect(keywords).toContain("source");
    expect(keywords).toContain("source-callout");
  });
});

describe("slash trigger regex", () => {
  const SLASH_TRIGGER = /(?:^|\s)\/[\w-]*$/;

  it("matches / at line start", () => {
    expect(SLASH_TRIGGER.test("/")).toBe(true);
    expect(SLASH_TRIGGER.test("/h1")).toBe(true);
  });

  it("matches / after whitespace", () => {
    expect(SLASH_TRIGGER.test("text /")).toBe(true);
    expect(SLASH_TRIGGER.test("text /code")).toBe(true);
  });

  it("does not match / inside URL", () => {
    expect(SLASH_TRIGGER.test("https://example")).toBe(false);
  });

  it("does not match / mid-word", () => {
    expect(SLASH_TRIGGER.test("and/or")).toBe(false);
  });

  it("matches / with hyphenated keywords", () => {
    expect(SLASH_TRIGGER.test("/ai-answer")).toBe(true);
    expect(SLASH_TRIGGER.test("/key-insight")).toBe(true);
  });
});
