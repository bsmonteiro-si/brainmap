import { describe, it, expect } from "vitest";
import {
  DARK_CODE_THEMES,
  LIGHT_CODE_THEMES,
  buildCodeHighlight,
  defaultCodeTheme,
  isCodeThemeValidForMode,
  resolveCodeTheme,
} from "./cmCodeHighlight";

describe("cmCodeHighlight", () => {
  describe("theme registries", () => {
    it("has at least one dark theme", () => {
      expect(DARK_CODE_THEMES.length).toBeGreaterThan(0);
    });

    it("has at least one light theme", () => {
      expect(LIGHT_CODE_THEMES.length).toBeGreaterThan(0);
    });

    it("all themes have non-empty labels and styles", () => {
      for (const t of [...DARK_CODE_THEMES, ...LIGHT_CODE_THEMES]) {
        expect(t.label).toBeTruthy();
        expect(t.styles.length).toBeGreaterThan(0);
      }
    });

    it("has no duplicate labels within dark themes", () => {
      const labels = DARK_CODE_THEMES.map((t) => t.label);
      expect(new Set(labels).size).toBe(labels.length);
    });

    it("has no duplicate labels within light themes", () => {
      const labels = LIGHT_CODE_THEMES.map((t) => t.label);
      expect(new Set(labels).size).toBe(labels.length);
    });
  });

  describe("buildCodeHighlight", () => {
    it("returns a HighlightStyle for a known dark theme", () => {
      const hs = buildCodeHighlight("GitHub Dark");
      expect(hs).toBeTruthy();
      expect(hs.specs).toBeDefined();
    });

    it("returns a HighlightStyle for a known light theme", () => {
      const hs = buildCodeHighlight("GitHub Light");
      expect(hs).toBeTruthy();
      expect(hs.specs).toBeDefined();
    });

    it("returns the same instance on repeated calls (caching)", () => {
      const a = buildCodeHighlight("Dracula");
      const b = buildCodeHighlight("Dracula");
      expect(a).toBe(b);
    });

    it("returns a fallback for an unknown theme", () => {
      const hs = buildCodeHighlight("Nonexistent Theme");
      expect(hs).toBeTruthy();
      expect(hs.specs.length).toBeGreaterThan(0);
    });
  });

  describe("defaultCodeTheme", () => {
    it("returns a dark theme for dark mode", () => {
      const label = defaultCodeTheme(true);
      expect(DARK_CODE_THEMES.some((t) => t.label === label)).toBe(true);
    });

    it("returns a light theme for light mode", () => {
      const label = defaultCodeTheme(false);
      expect(LIGHT_CODE_THEMES.some((t) => t.label === label)).toBe(true);
    });
  });

  describe("isCodeThemeValidForMode", () => {
    it("validates a dark theme in dark mode", () => {
      expect(isCodeThemeValidForMode("GitHub Dark", true)).toBe(true);
    });

    it("rejects a dark theme in light mode", () => {
      expect(isCodeThemeValidForMode("GitHub Dark", false)).toBe(false);
    });

    it("validates a light theme in light mode", () => {
      expect(isCodeThemeValidForMode("GitHub Light", false)).toBe(true);
    });

    it("rejects a light theme in dark mode", () => {
      expect(isCodeThemeValidForMode("GitHub Light", true)).toBe(false);
    });

    it("rejects an unknown theme", () => {
      expect(isCodeThemeValidForMode("Nonexistent", true)).toBe(false);
      expect(isCodeThemeValidForMode("Nonexistent", false)).toBe(false);
    });
  });

  describe("resolveCodeTheme", () => {
    it("returns the label if valid for the mode", () => {
      expect(resolveCodeTheme("Dracula", true)).toBe("Dracula");
      expect(resolveCodeTheme("Eclipse", false)).toBe("Eclipse");
    });

    it("falls back to default when theme is wrong mode", () => {
      const resolved = resolveCodeTheme("GitHub Dark", false);
      expect(resolved).toBe("GitHub Light");
    });

    it("falls back to default for unknown themes", () => {
      expect(resolveCodeTheme("Unknown", true)).toBe("GitHub Dark");
      expect(resolveCodeTheme("Unknown", false)).toBe("GitHub Light");
    });
  });
});
