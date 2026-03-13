import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { scanCallouts } from "./cmCalloutDecorations";

function doc(s: string): Text {
  return Text.of(s.split("\n"));
}

describe("scanCallouts", () => {
  it("finds a single callout with type and title", () => {
    const d = doc("[!ai-answer] My Title {\nsome body\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].type).toBe("ai-answer");
    expect(ranges[0].title).toBe("My Title");
    expect(ranges[0].closed).toBe(true);
    expect(ranges[0].bodyLineCount).toBe(1);
  });

  it("finds a callout with no title", () => {
    const d = doc("[!question] {\nbody\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].type).toBe("question");
    expect(ranges[0].title).toBe("");
    expect(ranges[0].closed).toBe(true);
  });

  it("finds multiple callouts", () => {
    const d = doc("[!ai-answer] {\nfirst\n}\nsome text\n[!source] Title {\nsecond\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(2);
    expect(ranges[0].type).toBe("ai-answer");
    expect(ranges[1].type).toBe("source");
    expect(ranges[1].title).toBe("Title");
  });

  it("handles empty callout (no body lines)", () => {
    const d = doc("[!key-insight] {\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].bodyLineCount).toBe(0);
    expect(ranges[0].closed).toBe(true);
  });

  it("handles unclosed callout gracefully", () => {
    const d = doc("[!ai-answer] {\nbody line\nmore body");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].closed).toBe(false);
    expect(ranges[0].bodyLineCount).toBe(2);
  });

  it("skips callouts inside fenced code blocks", () => {
    const d = doc("```\n[!ai-answer] {\nbody\n}\n```");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(0);
  });

  it("skips callouts inside tilde fenced code blocks", () => {
    const d = doc("~~~\n[!source] {\nbody\n}\n~~~");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(0);
  });

  it("finds callout after fenced code block ends", () => {
    const d = doc("```\ncode\n```\n[!question] {\nbody\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].type).toBe("question");
  });

  it("handles unknown callout types", () => {
    const d = doc("[!warning] Careful {\nbe careful\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].type).toBe("warning");
    expect(ranges[0].title).toBe("Careful");
  });

  it("does not close on } inside a fenced block within a callout", () => {
    const d = doc("[!ai-answer] {\n```\n}\n```\nactual body\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].closed).toBe(true);
    expect(ranges[0].bodyLineCount).toBe(4); // ```, }, ```, actual body
  });

  it("handles multi-paragraph body", () => {
    const d = doc("[!source] Ref {\nparagraph one\n\nparagraph two\n}");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    expect(ranges[0].bodyLineCount).toBe(3); // 2 text lines + 1 blank
  });

  it("returns correct positions", () => {
    const d = doc("before\n[!ai-answer] {\nbody\n}\nafter");
    const ranges = scanCallouts(d);
    expect(ranges).toHaveLength(1);
    // Header starts at line 2
    const headerLine = d.line(2);
    expect(ranges[0].headerFrom).toBe(headerLine.from);
    expect(ranges[0].headerTo).toBe(headerLine.to);
    // Closing at line 4
    const closingLine = d.line(4);
    expect(ranges[0].closingLineFrom).toBe(closingLine.from);
    expect(ranges[0].closingLineTo).toBe(closingLine.to);
  });
});
