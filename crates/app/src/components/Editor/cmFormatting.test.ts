import { describe, it, expect } from "vitest";
import { EditorState, EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { toggleWrap, toggleLinePrefix, toggleOrderedList, setHeading, insertLink, insertAtCursor } from "./cmFormatting";

function makeView(doc: string, from: number, to?: number): EditorView {
  const state = EditorState.create({
    doc,
    selection: EditorSelection.create([
      to !== undefined
        ? EditorSelection.range(from, to)
        : EditorSelection.cursor(from),
    ]),
  });
  return new EditorView({ state });
}

function text(view: EditorView): string {
  return view.state.doc.toString();
}

function sel(view: EditorView) {
  const r = view.state.selection.main;
  return { from: r.from, to: r.to };
}

describe("toggleWrap", () => {
  it("wraps selected text with marker", () => {
    const view = makeView("hello world", 6, 11); // "world" selected
    toggleWrap(view, "**");
    expect(text(view)).toBe("hello **world**");
    expect(sel(view)).toEqual({ from: 8, to: 13 }); // "world" still selected
  });

  it("unwraps already-wrapped selection", () => {
    const view = makeView("hello **world**", 8, 13); // "world" selected, markers outside
    toggleWrap(view, "**");
    expect(text(view)).toBe("hello world");
    expect(sel(view)).toEqual({ from: 6, to: 11 });
  });

  it("inserts marker pair at cursor (empty selection)", () => {
    const view = makeView("hello", 5);
    toggleWrap(view, "*");
    expect(text(view)).toBe("hello**");
    expect(sel(view)).toEqual({ from: 6, to: 6 }); // cursor between markers
  });

  it("wraps with backtick for inline code", () => {
    const view = makeView("let x = 1", 4, 5); // "x" selected
    toggleWrap(view, "`");
    expect(text(view)).toBe("let `x` = 1");
  });

  it("wraps with strikethrough markers", () => {
    const view = makeView("old text", 0, 8);
    toggleWrap(view, "~~");
    expect(text(view)).toBe("~~old text~~");
  });

  it("does not unwrap at document start when markers are absent", () => {
    const view = makeView("hello", 0, 5);
    toggleWrap(view, "**");
    expect(text(view)).toBe("**hello**");
  });

  it("correctly unwraps at document start", () => {
    const view = makeView("**hello**", 2, 7); // "hello" selected
    toggleWrap(view, "**");
    expect(text(view)).toBe("hello");
    expect(sel(view)).toEqual({ from: 0, to: 5 });
  });
});

describe("toggleLinePrefix", () => {
  it("adds prefix to line without it", () => {
    const view = makeView("hello world", 0);
    toggleLinePrefix(view, "- ");
    expect(text(view)).toBe("- hello world");
  });

  it("removes prefix from line that has it", () => {
    const view = makeView("- hello world", 0);
    toggleLinePrefix(view, "- ");
    expect(text(view)).toBe("hello world");
  });

  it("adds prefix to multiple lines when not all have it", () => {
    const view = makeView("line one\nline two\nline three", 0, 27);
    toggleLinePrefix(view, "> ");
    expect(text(view)).toBe("> line one\n> line two\n> line three");
  });

  it("removes prefix from multiple lines when all have it", () => {
    const view = makeView("> line one\n> line two", 0, 21);
    toggleLinePrefix(view, "> ");
    expect(text(view)).toBe("line one\nline two");
  });

  it("adds prefix to lines missing it in mixed selection", () => {
    const view = makeView("- line one\nline two\n- line three", 0, 31);
    toggleLinePrefix(view, "- ");
    expect(text(view)).toBe("- line one\n- line two\n- line three");
  });

  it("adjusts cursor position after adding prefix", () => {
    const view = makeView("hello", 3); // cursor at position 3
    toggleLinePrefix(view, "- ");
    expect(text(view)).toBe("- hello");
    expect(sel(view)).toEqual({ from: 5, to: 5 }); // shifted by 2
  });

  it("adjusts cursor position after removing prefix", () => {
    const view = makeView("- hello", 4); // cursor at position 4
    toggleLinePrefix(view, "- ");
    expect(text(view)).toBe("hello");
    expect(sel(view)).toEqual({ from: 2, to: 2 }); // shifted by -2
  });
});

describe("toggleOrderedList", () => {
  it("adds numbered prefix to single line", () => {
    const view = makeView("first item", 0);
    toggleOrderedList(view);
    expect(text(view)).toBe("1. first item");
  });

  it("adds incrementing numbers to multiple lines", () => {
    const view = makeView("alpha\nbeta\ngamma", 0, 16);
    toggleOrderedList(view);
    expect(text(view)).toBe("1. alpha\n2. beta\n3. gamma");
  });

  it("removes numbered prefix from all lines", () => {
    const view = makeView("1. alpha\n2. beta", 0, 16);
    toggleOrderedList(view);
    expect(text(view)).toBe("alpha\nbeta");
  });
});

describe("setHeading", () => {
  it("adds heading prefix to plain line", () => {
    const view = makeView("Title", 0);
    setHeading(view, 1);
    expect(text(view)).toBe("# Title");
  });

  it("replaces existing heading level", () => {
    const view = makeView("# Title", 0);
    setHeading(view, 2);
    expect(text(view)).toBe("## Title");
  });

  it("removes heading when toggling same level", () => {
    const view = makeView("## Title", 0);
    setHeading(view, 2);
    expect(text(view)).toBe("Title");
  });

  it("handles h3", () => {
    const view = makeView("Section", 0);
    setHeading(view, 3);
    expect(text(view)).toBe("### Section");
  });

  it("works with cursor in middle of line", () => {
    const view = makeView("My Title", 5); // cursor mid-line
    setHeading(view, 2);
    expect(text(view)).toBe("## My Title");
  });
});

describe("insertLink", () => {
  it("inserts link template at cursor", () => {
    const view = makeView("hello ", 6);
    insertLink(view);
    expect(text(view)).toBe("hello [](url)");
    expect(sel(view)).toEqual({ from: 7, to: 7 }); // cursor inside []
  });

  it("wraps selected text as link text and selects url", () => {
    const view = makeView("click here", 6, 10); // "here" selected
    insertLink(view);
    expect(text(view)).toBe("click [here](url)");
    expect(sel(view)).toEqual({ from: 13, to: 16 }); // "url" selected
  });
});

describe("insertAtCursor", () => {
  it("inserts text at cursor position", () => {
    const view = makeView("hello\n", 6);
    insertAtCursor(view, "\n---\n");
    expect(text(view)).toBe("hello\n\n---\n");
  });

  it("replaces selected text", () => {
    const view = makeView("hello world", 6, 11); // "world" selected
    insertAtCursor(view, "there");
    expect(text(view)).toBe("hello there");
  });
});
