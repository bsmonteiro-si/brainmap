import { describe, it, expect } from "vitest";
import { File, FileText, Globe, FileCode, Braces, Image, Music, Film, Archive, Terminal, Database, Lock, GitBranch, ScrollText, Table, Paintbrush, FileSliders } from "lucide-react";
import { getIconForType, getExtensionIcon } from "./fileTreeIcons";
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

describe("getExtensionIcon", () => {
  it("returns correct icons for common extensions", () => {
    expect(getExtensionIcon("readme.md").icon).toBe(FileText);
    expect(getExtensionIcon("doc.pdf").icon).toBe(FileText);
    expect(getExtensionIcon("page.html").icon).toBe(Globe);
    expect(getExtensionIcon("page.htm").icon).toBe(Globe);
    expect(getExtensionIcon("style.css").icon).toBe(Paintbrush);
    expect(getExtensionIcon("app.js").icon).toBe(FileCode);
    expect(getExtensionIcon("app.ts").icon).toBe(FileCode);
    expect(getExtensionIcon("app.tsx").icon).toBe(FileCode);
    expect(getExtensionIcon("app.jsx").icon).toBe(FileCode);
    expect(getExtensionIcon("data.json").icon).toBe(Braces);
    expect(getExtensionIcon("config.yaml").icon).toBe(FileSliders);
    expect(getExtensionIcon("config.yml").icon).toBe(FileSliders);
    expect(getExtensionIcon("config.toml").icon).toBe(FileSliders);
    expect(getExtensionIcon("data.csv").icon).toBe(Table);
    expect(getExtensionIcon("query.sql").icon).toBe(Database);
    expect(getExtensionIcon("photo.png").icon).toBe(Image);
    expect(getExtensionIcon("photo.jpg").icon).toBe(Image);
    expect(getExtensionIcon("photo.svg").icon).toBe(Image);
    expect(getExtensionIcon("song.mp3").icon).toBe(Music);
    expect(getExtensionIcon("video.mp4").icon).toBe(Film);
    expect(getExtensionIcon("archive.zip").icon).toBe(Archive);
    expect(getExtensionIcon("archive.tar").icon).toBe(Archive);
    expect(getExtensionIcon("main.py").icon).toBe(FileCode);
    expect(getExtensionIcon("main.rs").icon).toBe(FileCode);
    expect(getExtensionIcon("main.go").icon).toBe(FileCode);
    expect(getExtensionIcon("script.sh").icon).toBe(Terminal);
    expect(getExtensionIcon("secrets.env").icon).toBe(Lock);
    expect(getExtensionIcon("output.log").icon).toBe(ScrollText);
    expect(getExtensionIcon("notes.txt").icon).toBe(FileText);
  });

  it("returns correct icons for dotfiles", () => {
    expect(getExtensionIcon(".gitignore").icon).toBe(GitBranch);
    expect(getExtensionIcon(".dockerignore").icon).toBe(GitBranch);
    expect(getExtensionIcon(".env").icon).toBe(Lock);
    expect(getExtensionIcon(".env.local").icon).toBe(Lock);
  });

  it("returns fallback for unknown extensions", () => {
    expect(getExtensionIcon("something.xyz")).toEqual({ icon: File, color: "#95a5a6" });
    expect(getExtensionIcon("noext")).toEqual({ icon: File, color: "#95a5a6" });
  });

  it("is case-insensitive for extensions", () => {
    expect(getExtensionIcon("IMAGE.PNG").icon).toBe(Image);
    expect(getExtensionIcon("Doc.PDF").icon).toBe(FileText);
    expect(getExtensionIcon("App.JS").icon).toBe(FileCode);
  });

  it("returns distinct colors for different categories", () => {
    const mdColor = getExtensionIcon("file.md").color;
    const pdfColor = getExtensionIcon("file.pdf").color;
    const htmlColor = getExtensionIcon("file.html").color;
    const jsonColor = getExtensionIcon("file.json").color;
    const imgColor = getExtensionIcon("file.png").color;
    // All should be different
    const colors = new Set([mdColor, pdfColor, htmlColor, jsonColor, imgColor]);
    expect(colors.size).toBe(5);
  });
});
