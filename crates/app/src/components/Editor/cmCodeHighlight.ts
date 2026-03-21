/**
 * Code block syntax highlighting theme registry.
 *
 * Uses pre-built highlight style arrays from @uiw/codemirror-themes-all.
 * We only import the *Style arrays (token→color mappings) — NOT the full
 * themes — so our own CSS-variable-based editor theme stays in control of
 * backgrounds, selection, gutters, etc.
 */
import { HighlightStyle } from "@codemirror/language";
import {
  githubDarkStyle,
  githubLightStyle,
  draculaDarkStyle,
  materialDarkStyle,
  materialLightStyle,
  vscodeDarkStyle,
  vscodeLightStyle,
  tokyoNightStyle,
  tokyoNightStormStyle,
  tokyoNightDayStyle,
  monokaiDarkStyle,
  sublimeDarkStyle,
  atomoneDarkStyle,
  nordDarkStyle,
  solarizedDarkStyle,
  solarizedLightStyle,
  copilotDarkStyle,
  darculaDarkStyle,
  xcodeDarkStyle,
  xcodeLightStyle,
  eclipseLightStyle,
  quietlightStyle,
  bbeditLightStyle,
  noctisLilacLightStyle,
} from "@uiw/codemirror-themes-all";
import type { TagStyle } from "@codemirror/language";

export interface CodeThemeEntry {
  label: string;
  styles: readonly TagStyle[];
}

export const DARK_CODE_THEMES: CodeThemeEntry[] = [
  { label: "GitHub Dark", styles: githubDarkStyle },
  { label: "Dracula", styles: draculaDarkStyle },
  { label: "VS Code Dark", styles: vscodeDarkStyle },
  { label: "Material Dark", styles: materialDarkStyle },
  { label: "Tokyo Night", styles: tokyoNightStyle },
  { label: "Tokyo Night Storm", styles: tokyoNightStormStyle },
  { label: "Monokai", styles: monokaiDarkStyle },
  { label: "Sublime", styles: sublimeDarkStyle },
  { label: "Atom One Dark", styles: atomoneDarkStyle },
  { label: "Nord", styles: nordDarkStyle },
  { label: "Solarized Dark", styles: solarizedDarkStyle },
  { label: "Copilot", styles: copilotDarkStyle },
  { label: "Darcula", styles: darculaDarkStyle },
  { label: "Xcode Dark", styles: xcodeDarkStyle },
];

export const LIGHT_CODE_THEMES: CodeThemeEntry[] = [
  { label: "GitHub Light", styles: githubLightStyle },
  { label: "VS Code Light", styles: vscodeLightStyle },
  { label: "Material Light", styles: materialLightStyle },
  { label: "Eclipse", styles: eclipseLightStyle },
  { label: "Xcode Light", styles: xcodeLightStyle },
  { label: "Solarized Light", styles: solarizedLightStyle },
  { label: "Quiet Light", styles: quietlightStyle },
  { label: "BBEdit", styles: bbeditLightStyle },
  { label: "Noctis Lilac", styles: noctisLilacLightStyle },
  { label: "Tokyo Night Day", styles: tokyoNightDayStyle },
];

const styleCache = new Map<string, HighlightStyle>();

function findStyles(label: string): readonly TagStyle[] {
  for (const t of DARK_CODE_THEMES) if (t.label === label) return t.styles;
  for (const t of LIGHT_CODE_THEMES) if (t.label === label) return t.styles;
  return githubDarkStyle;
}

export function buildCodeHighlight(themeLabel: string): HighlightStyle {
  let cached = styleCache.get(themeLabel);
  if (cached) return cached;
  cached = HighlightStyle.define([...findStyles(themeLabel)]);
  styleCache.set(themeLabel, cached);
  return cached;
}

/** Default code theme label for a given dark/light mode. */
export function defaultCodeTheme(isDark: boolean): string {
  return isDark ? "GitHub Dark" : "GitHub Light";
}

/** Check if a code theme label is valid for the given dark/light mode. */
export function isCodeThemeValidForMode(label: string, isDark: boolean): boolean {
  const list = isDark ? DARK_CODE_THEMES : LIGHT_CODE_THEMES;
  return list.some((t) => t.label === label);
}

/** Return a valid code theme for the mode, falling back to the default if needed. */
export function resolveCodeTheme(label: string, isDark: boolean): string {
  if (isCodeThemeValidForMode(label, isDark)) return label;
  return defaultCodeTheme(isDark);
}
