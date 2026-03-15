import { describe, it, expect, beforeEach } from "vitest";
import { useTabStore, isUntitledTab } from "./tabStore";

beforeEach(() => {
  useTabStore.setState({ tabs: [], activeTabId: null, _untitledCounter: 0 });
});

describe("openTab", () => {
  it("creates a new tab and activates it", () => {
    useTabStore.getState().openTab("a.md", "note", "Note A", "concept");
    const s = useTabStore.getState();
    expect(s.tabs).toHaveLength(1);
    expect(s.tabs[0].id).toBe("a.md");
    expect(s.tabs[0].title).toBe("Note A");
    expect(s.tabs[0].noteType).toBe("concept");
    expect(s.tabs[0].kind).toBe("note");
    expect(s.activeTabId).toBe("a.md");
  });

  it("activates existing tab without duplicating", () => {
    useTabStore.getState().openTab("a.md", "note", "Note A", "concept");
    useTabStore.getState().openTab("b.md", "note", "Note B", "reference");
    useTabStore.getState().openTab("a.md", "note", "Note A", "concept");
    const s = useTabStore.getState();
    expect(s.tabs).toHaveLength(2);
    expect(s.activeTabId).toBe("a.md");
  });

  it("inserts new tab after active tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    // Active is now b.md. Opening c.md should insert after b.md
    useTabStore.getState().openTab("c.md", "note", "C", null);
    const paths = useTabStore.getState().tabs.map((t) => t.id);
    expect(paths).toEqual(["a.md", "b.md", "c.md"]);
  });

  it("inserts after active when active is not last", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    // Activate a.md, then open c.md
    useTabStore.getState().activateTab("a.md");
    useTabStore.getState().openTab("c.md", "note", "C", null);
    const paths = useTabStore.getState().tabs.map((t) => t.id);
    expect(paths).toEqual(["a.md", "c.md", "b.md"]);
  });

  it("creates tab with default editor state", () => {
    useTabStore.getState().openTab("a.md", "note", "A", "concept");
    const tab = useTabStore.getState().tabs[0];
    expect(tab.editedBody).toBeNull();
    expect(tab.editedFrontmatter).toBeNull();
    expect(tab.isDirty).toBe(false);
    expect(tab.conflictState).toBe("none");
    expect(tab.viewMode).toBe("edit");
    expect(tab.scrollTop).toBe(0);
    expect(tab.cursorPos).toBe(0);
  });

  it("handles plain files", () => {
    useTabStore.getState().openTab("img.txt", "plain-file", "img.txt", null);
    const tab = useTabStore.getState().tabs[0];
    expect(tab.kind).toBe("plain-file");
    expect(tab.noteType).toBeNull();
  });
});

describe("closeTab", () => {
  it("removes the tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().closeTab("a.md");
    expect(useTabStore.getState().tabs).toHaveLength(1);
    expect(useTabStore.getState().tabs[0].id).toBe("b.md");
  });

  it("activates next tab when closing active", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().openTab("c.md", "note", "C", null);
    useTabStore.getState().activateTab("b.md");
    useTabStore.getState().closeTab("b.md");
    expect(useTabStore.getState().activeTabId).toBe("c.md");
  });

  it("activates previous when closing last tab in list", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    // b.md is active and last
    useTabStore.getState().closeTab("b.md");
    expect(useTabStore.getState().activeTabId).toBe("a.md");
  });

  it("sets null when closing the only tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().closeTab("a.md");
    expect(useTabStore.getState().tabs).toHaveLength(0);
    expect(useTabStore.getState().activeTabId).toBeNull();
  });

  it("does not change active when closing non-active tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().closeTab("a.md");
    expect(useTabStore.getState().activeTabId).toBe("b.md");
  });

  it("is no-op for unknown id", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().closeTab("unknown.md");
    expect(useTabStore.getState().tabs).toHaveLength(1);
  });
});

describe("closeActiveTab", () => {
  it("closes the active tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().closeActiveTab();
    expect(useTabStore.getState().tabs).toHaveLength(0);
  });

  it("is no-op when no active tab", () => {
    useTabStore.getState().closeActiveTab();
    expect(useTabStore.getState().tabs).toHaveLength(0);
  });
});

describe("closeOtherTabs", () => {
  it("keeps only the specified tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().openTab("c.md", "note", "C", null);
    useTabStore.getState().closeOtherTabs("b.md");
    expect(useTabStore.getState().tabs).toHaveLength(1);
    expect(useTabStore.getState().tabs[0].id).toBe("b.md");
    expect(useTabStore.getState().activeTabId).toBe("b.md");
  });
});

describe("closeAllTabs", () => {
  it("removes all tabs", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().closeAllTabs();
    expect(useTabStore.getState().tabs).toHaveLength(0);
    expect(useTabStore.getState().activeTabId).toBeNull();
  });
});

describe("activateTab", () => {
  it("switches active tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().activateTab("a.md");
    expect(useTabStore.getState().activeTabId).toBe("a.md");
  });

  it("is no-op for unknown id", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().activateTab("unknown.md");
    expect(useTabStore.getState().activeTabId).toBe("a.md");
  });
});

describe("updateTabState", () => {
  it("updates partial state on a tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().updateTabState("a.md", { isDirty: true, editedBody: "changed" });
    const tab = useTabStore.getState().getTab("a.md");
    expect(tab?.isDirty).toBe(true);
    expect(tab?.editedBody).toBe("changed");
  });

  it("does not affect other tabs", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().updateTabState("a.md", { isDirty: true });
    expect(useTabStore.getState().getTab("b.md")?.isDirty).toBe(false);
  });
});

describe("getTab", () => {
  it("returns the tab by id", () => {
    useTabStore.getState().openTab("a.md", "note", "A", "concept");
    expect(useTabStore.getState().getTab("a.md")?.title).toBe("A");
  });

  it("returns undefined for unknown id", () => {
    expect(useTabStore.getState().getTab("unknown.md")).toBeUndefined();
  });
});

describe("reset", () => {
  it("clears all tabs and active tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().reset();
    expect(useTabStore.getState().tabs).toHaveLength(0);
    expect(useTabStore.getState().activeTabId).toBeNull();
  });

  it("resets untitled counter", () => {
    useTabStore.getState().createUntitledTab();
    useTabStore.getState().createUntitledTab();
    useTabStore.getState().reset();
    expect(useTabStore.getState()._untitledCounter).toBe(0);
    const id = useTabStore.getState().createUntitledTab();
    expect(id).toBe("__untitled__/1");
  });
});

describe("isUntitledTab", () => {
  it("returns true for untitled tab IDs", () => {
    expect(isUntitledTab("__untitled__/1")).toBe(true);
    expect(isUntitledTab("__untitled__/99")).toBe(true);
  });

  it("returns false for regular file paths", () => {
    expect(isUntitledTab("notes/foo.md")).toBe(false);
    expect(isUntitledTab("")).toBe(false);
    expect(isUntitledTab("untitled")).toBe(false);
  });
});

describe("createUntitledTab", () => {
  it("creates a tab with correct ID and title", () => {
    const id = useTabStore.getState().createUntitledTab();
    expect(id).toBe("__untitled__/1");
    const tab = useTabStore.getState().getTab(id);
    expect(tab).toBeDefined();
    expect(tab!.title).toBe("Untitled-1");
    expect(tab!.kind).toBe("untitled");
    expect(tab!.noteType).toBeNull();
    expect(tab!.isDirty).toBe(false);
  });

  it("increments counter on each call", () => {
    const id1 = useTabStore.getState().createUntitledTab();
    const id2 = useTabStore.getState().createUntitledTab();
    const id3 = useTabStore.getState().createUntitledTab();
    expect(id1).toBe("__untitled__/1");
    expect(id2).toBe("__untitled__/2");
    expect(id3).toBe("__untitled__/3");
    expect(useTabStore.getState()._untitledCounter).toBe(3);
  });

  it("inserts after active tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().activateTab("a.md");
    useTabStore.getState().createUntitledTab();
    const ids = useTabStore.getState().tabs.map((t) => t.id);
    expect(ids).toEqual(["a.md", "__untitled__/1", "b.md"]);
  });

  it("activates the new untitled tab", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    const id = useTabStore.getState().createUntitledTab();
    expect(useTabStore.getState().activeTabId).toBe(id);
  });

  it("counter persists after closing untitled tabs", () => {
    const id1 = useTabStore.getState().createUntitledTab();
    useTabStore.getState().closeTab(id1);
    const id2 = useTabStore.getState().createUntitledTab();
    expect(id2).toBe("__untitled__/2");
  });
});

describe("renamePath", () => {
  it("renames a tab's id, path, and title", () => {
    useTabStore.getState().openTab("A/Note.md", "note", "Note", "concept");
    useTabStore.getState().renamePath("A/Note.md", "B/Note.md");
    const tab = useTabStore.getState().getTab("B/Note.md");
    expect(tab).toBeDefined();
    expect(tab!.id).toBe("B/Note.md");
    expect(tab!.path).toBe("B/Note.md");
    expect(tab!.title).toBe("Note");
  });

  it("updates activeTabId when renaming the active tab", () => {
    useTabStore.getState().openTab("A/Note.md", "note", "Note", "concept");
    expect(useTabStore.getState().activeTabId).toBe("A/Note.md");
    useTabStore.getState().renamePath("A/Note.md", "B/Note.md");
    expect(useTabStore.getState().activeTabId).toBe("B/Note.md");
  });

  it("does not change other tabs", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().openTab("b.md", "note", "B", null);
    useTabStore.getState().renamePath("a.md", "X/a.md");
    expect(useTabStore.getState().getTab("b.md")).toBeDefined();
    expect(useTabStore.getState().getTab("X/a.md")).toBeDefined();
  });

  it("uses custom title if provided", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().renamePath("a.md", "X/a.md", "Custom Title");
    expect(useTabStore.getState().getTab("X/a.md")!.title).toBe("Custom Title");
  });

  it("no-op when path not found", () => {
    useTabStore.getState().openTab("a.md", "note", "A", null);
    useTabStore.getState().renamePath("nonexistent.md", "x.md");
    expect(useTabStore.getState().tabs).toHaveLength(1);
    expect(useTabStore.getState().tabs[0].id).toBe("a.md");
  });
});

describe("renamePathPrefix", () => {
  it("renames all tabs matching the prefix", () => {
    useTabStore.getState().openTab("A/note1.md", "note", "Note1", null);
    useTabStore.getState().openTab("A/note2.md", "note", "Note2", null);
    useTabStore.getState().openTab("B/note3.md", "note", "Note3", null);
    useTabStore.getState().renamePathPrefix("A", "C/A");
    const tabs = useTabStore.getState().tabs;
    expect(tabs[0].id).toBe("C/A/note1.md");
    expect(tabs[1].id).toBe("C/A/note2.md");
    expect(tabs[2].id).toBe("B/note3.md");
  });

  it("updates activeTabId when it matches the prefix", () => {
    useTabStore.getState().openTab("A/note1.md", "note", "Note1", null);
    expect(useTabStore.getState().activeTabId).toBe("A/note1.md");
    useTabStore.getState().renamePathPrefix("A", "B");
    expect(useTabStore.getState().activeTabId).toBe("B/note1.md");
  });

  it("does not match prefix collision (A vs A-extra)", () => {
    useTabStore.getState().openTab("A-extra/note.md", "note", "Note", null);
    useTabStore.getState().renamePathPrefix("A", "B");
    expect(useTabStore.getState().tabs[0].id).toBe("A-extra/note.md");
  });

  it("handles nested folders", () => {
    useTabStore.getState().openTab("A/B/C/note.md", "note", "Note", null);
    useTabStore.getState().renamePathPrefix("A", "X");
    expect(useTabStore.getState().tabs[0].id).toBe("X/B/C/note.md");
  });
});
