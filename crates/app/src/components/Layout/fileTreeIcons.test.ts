import { describe, it, expect } from "vitest";
import { File } from "lucide-react";
import { getIconForType } from "./fileTreeIcons";
import { NOTE_TYPE_COLORS } from "../GraphView/graphStyles";

describe("getIconForType", () => {
  const ALL_TYPES = Object.keys(NOTE_TYPE_COLORS);

  it("returns a non-fallback icon for every known note type", () => {
    for (const type of ALL_TYPES) {
      const icon = getIconForType(type);
      expect(icon, `${type} should have a dedicated icon`).not.toBe(File);
    }
  });

  it("covers all 11 note types", () => {
    expect(ALL_TYPES).toHaveLength(11);
    for (const type of ALL_TYPES) {
      expect(getIconForType(type)).toBeDefined();
    }
  });

  it("returns fallback icon for unknown type", () => {
    expect(getIconForType("unknown-type")).toBe(File);
  });
});
