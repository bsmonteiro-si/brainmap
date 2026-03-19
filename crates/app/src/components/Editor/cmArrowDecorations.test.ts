import { describe, it, expect } from "vitest";
import { Text } from "@codemirror/state";
import { scanArrows, buildArrowDecorations } from "./cmArrowDecorations";

function doc(lines: string[]): Text {
  return Text.of(lines);
}

describe("scanArrows", () => {
  it("replaces -> with →", () => {
    const matches = scanArrows(doc(["hello -> world"]));
    expect(matches).toHaveLength(1);
    expect(matches[0].char).toBe("→");
  });

  it("replaces <- with ←", () => {
    const matches = scanArrows(doc(["hello <- world"]));
    expect(matches).toHaveLength(1);
    expect(matches[0].char).toBe("←");
  });

  it("replaces <-> with ↔", () => {
    const matches = scanArrows(doc(["hello <-> world"]));
    expect(matches).toHaveLength(1);
    expect(matches[0].char).toBe("↔");
  });

  it("replaces => with ⇒", () => {
    const matches = scanArrows(doc(["hello => world"]));
    expect(matches).toHaveLength(1);
    expect(matches[0].char).toBe("⇒");
  });

  it("replaces <=> with ⇔", () => {
    const matches = scanArrows(doc(["hello <=> world"]));
    expect(matches).toHaveLength(1);
    expect(matches[0].char).toBe("⇔");
  });

  it("does not replace <= (ambiguous with less-than-or-equal)", () => {
    const matches = scanArrows(doc(["x <= 5"]));
    expect(matches).toHaveLength(0);
  });

  it("handles multiple arrows on one line", () => {
    const matches = scanArrows(doc(["a -> b -> c"]));
    expect(matches).toHaveLength(2);
    expect(matches.every((m) => m.char === "→")).toBe(true);
  });

  it("handles mixed arrow types on one line", () => {
    const matches = scanArrows(doc(["a -> b <- c"]));
    expect(matches).toHaveLength(2);
    expect(matches[0].char).toBe("→");
    expect(matches[1].char).toBe("←");
  });

  it("prioritizes longer matches (<-> over <- and ->)", () => {
    const matches = scanArrows(doc(["a <-> b"]));
    expect(matches).toHaveLength(1);
    expect(matches[0].char).toBe("↔");
  });

  it("prioritizes <=> over => ", () => {
    const matches = scanArrows(doc(["a <=> b"]));
    expect(matches).toHaveLength(1);
    expect(matches[0].char).toBe("⇔");
  });

  it("returns correct offsets", () => {
    const matches = scanArrows(doc(["hello -> world"]));
    expect(matches[0].from).toBe(6);
    expect(matches[0].to).toBe(8);
  });

  it("returns empty for no arrows", () => {
    expect(scanArrows(doc(["just some text"]))).toHaveLength(0);
  });

  it("scans across multiple lines", () => {
    const matches = scanArrows(doc(["a -> b", "c <- d"]));
    expect(matches).toHaveLength(2);
    expect(matches[0].char).toBe("→");
    expect(matches[1].char).toBe("←");
  });
});

describe("buildArrowDecorations", () => {
  it("skips decoration on cursor line", () => {
    const d = doc(["a -> b", "c -> d", "e -> f"]);
    const decoSet = buildArrowDecorations(d, 2);
    const decos: number[] = [];
    const iter = decoSet.iter();
    while (iter.value) {
      decos.push(iter.from);
      iter.next();
    }
    expect(decos).toHaveLength(2);
  });
});
