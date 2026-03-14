import { describe, it, expect } from "vitest";
import { preprocessCallouts, encodeLinkSpaces } from "./calloutPreprocess";

describe("preprocessCallouts", () => {
  it("converts basic brace callout to blockquote", () => {
    const input = "[!ai-answer] {\nSome AI response.\n}";
    expect(preprocessCallouts(input)).toBe("> [!ai-answer]\n> Some AI response.");
  });

  it("converts callout with title", () => {
    const input = "[!source] Pearl, J. (2000) {\nDefines structural causal models.\n}";
    expect(preprocessCallouts(input)).toBe(
      "> [!source] Pearl, J. (2000)\n> Defines structural causal models."
    );
  });

  it("handles multi-paragraph body", () => {
    const input = [
      "[!key-insight] The Ladder {",
      "First paragraph.",
      "",
      "Second paragraph.",
      "}",
    ].join("\n");
    expect(preprocessCallouts(input)).toBe(
      [
        "> [!key-insight] The Ladder",
        "> First paragraph.",
        ">",
        "> Second paragraph.",
      ].join("\n")
    );
  });

  it("leaves existing blockquote callout syntax untouched", () => {
    const input = "> [!ai-answer]\n> Body here.";
    expect(preprocessCallouts(input)).toBe(input);
  });

  it("leaves regular text untouched", () => {
    const input = "Just some regular markdown.\n\nWith paragraphs.";
    expect(preprocessCallouts(input)).toBe(input);
  });

  it("skips brace callout inside fenced code block", () => {
    const input = [
      "```",
      "[!ai-answer] {",
      "This is code, not a callout.",
      "}",
      "```",
    ].join("\n");
    expect(preprocessCallouts(input)).toBe(input);
  });

  it("handles empty body", () => {
    const input = "[!question] {\n}";
    expect(preprocessCallouts(input)).toBe("> [!question]");
  });

  it("handles multiple callouts in sequence", () => {
    const input = [
      "[!ai-answer] First {",
      "Body one.",
      "}",
      "",
      "[!source] Second {",
      "Body two.",
      "}",
    ].join("\n");
    expect(preprocessCallouts(input)).toBe(
      [
        "> [!ai-answer] First",
        "> Body one.",
        "",
        "> [!source] Second",
        "> Body two.",
      ].join("\n")
    );
  });

  it("handles callout with surrounding text", () => {
    const input = [
      "Some intro text.",
      "",
      "[!key-insight] {",
      "Important point.",
      "}",
      "",
      "Some outro text.",
    ].join("\n");
    expect(preprocessCallouts(input)).toBe(
      [
        "Some intro text.",
        "",
        "> [!key-insight]",
        "> Important point.",
        "",
        "Some outro text.",
      ].join("\n")
    );
  });

  it("does not close on } inside a fenced block within a callout", () => {
    const input = [
      "[!ai-answer] {",
      "Here is code:",
      "```",
      "function foo() {",
      "}",
      "```",
      "More text.",
      "}",
    ].join("\n");
    expect(preprocessCallouts(input)).toBe(
      [
        "> [!ai-answer]",
        "> Here is code:",
        "> ```",
        "> function foo() {",
        "> }",
        "> ```",
        "> More text.",
      ].join("\n")
    );
  });

  it("gracefully handles unclosed brace (no closing })", () => {
    const input = "[!ai-answer] {\nSome text without closing brace.";
    const result = preprocessCallouts(input);
    // Should emit what it has — header + body lines
    expect(result).toContain("> [!ai-answer]");
    expect(result).toContain("> Some text without closing brace.");
  });
});

describe("encodeLinkSpaces", () => {
  it("encodes spaces in link destinations", () => {
    expect(encodeLinkSpaces("[Ch1](./Ch1 - Ladder.md)")).toBe(
      "[Ch1](./Ch1%20-%20Ladder.md)"
    );
  });

  it("handles multiple links with spaces", () => {
    const input = "- [A](./A B.md)\n- [C](./C D/E F.md)";
    expect(encodeLinkSpaces(input)).toBe(
      "- [A](./A%20B.md)\n- [C](./C%20D/E%20F.md)"
    );
  });

  it("leaves links without spaces unchanged", () => {
    const input = "[Foo](./Foo.md)";
    expect(encodeLinkSpaces(input)).toBe(input);
  });

  it("leaves external URLs unchanged when they have no spaces", () => {
    const input = "[Example](https://example.com/path)";
    expect(encodeLinkSpaces(input)).toBe(input);
  });

  it("preserves link labels with spaces", () => {
    expect(encodeLinkSpaces("[My Label](./My File.md)")).toBe(
      "[My Label](./My%20File.md)"
    );
  });

  it("leaves already-encoded links unchanged", () => {
    const input = "[Foo](./My%20File.md)";
    expect(encodeLinkSpaces(input)).toBe(input);
  });
});
