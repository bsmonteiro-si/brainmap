# 2026-03-13 — Claude Code Session

**Date:** 2026-03-13 16:03:27
**Session:** c02fcf0e-8ccb-4809-9cea-1b2a5005ee83

---

## User

Tools like Notion have a very vast option for commands like different panels and such. How do they achieve that? Do they use .md files underlying their structures or their own custom types?

---

## Assistant

Notion uses a **custom block-based data model**, not markdown files. Here's how it works:

## Notion's Architecture

**Everything is a block.** Pages, paragraphs, headings, toggles, databases, embeds — they're all blocks in a tree structure. Each block has:

- A UUID
- A `type` (text, heading, todo, toggle, database, page, etc.)
- A `parent` pointer (block ID)
- An ordered `children` list
- `properties` — rich text runs with inline formatting, mentions, etc.

**Storage is a custom format**, not markdown. Blocks are stored in a normalized relational/document-hybrid backend (originally PostgreSQL, later augmented with their own infrastructure). The rich text within blocks uses an **annotation-based model** — text is stored as arrays of segments like:

```json
[["Hello ", []], ["world", [["b"]]]]  // "world" is bold
```

## Why Not Markdown?

Markdown is too limited for what Notion does:

- **Nested blocks** — toggles inside callouts inside columns. Markdown has no native nesting model.
- **Inline databases** — tables with filters, views, relations, rollups. No markdown equivalent.
- **Real-time collaboration** — they need OT/CRDT-friendly structures. Line-based text formats make conflict resolution much harder.
- **Rich embeds** — synced blocks, mentions, equations, file attachments are first-class citizens, not afterthoughts.

## The "Slash Command" System

The `/` command palette is essentially a **block type picker**. When you type `/`, it filters a registry of available block types and inserts one. It's a UI pattern on top of the block model — not a file-format feature.

## How This Compares to BrainMap

Your project takes a different (and valid) approach: **files as source of truth** with markdown + YAML frontmatter. This trades Notion's flexibility for:

- Portability (plain files, git-friendly)
- Simplicity (no custom DB schema for content)
- Interoperability (any editor can open the files)

The tradeoff is that deeply nested, richly typed block structures are harder to represent in flat markdown. Tools like Obsidian sit in the same camp as BrainMap — markdown-first with extensions layered on top.

---

## User

How can we make our own extensions? Think like our own formats for "AI Agent Answer", "Source Citation", "Warning", "Research Later" and whatever could be useful for study notes.

---

## Assistant

Great question. Since BrainMap is markdown-first, the key is choosing a syntax that stays valid markdown (so files remain portable) while giving your editor/preview rich rendering.

## The Approach: Callout Blocks

The best pattern (used by Obsidian, GitHub, and others) is **extended blockquote syntax**:

```markdown
> [!ai-answer]
> The French Revolution began in 1789, triggered by fiscal crisis
> and social inequality under the Ancien Régime.

> [!source] Pearl, J. (2000). *Causality*. Cambridge UP, p. 42
> Defines structural causal models as directed acyclic graphs.

> [!warning]
> This contradicts the earlier claim in chapter 3 — needs reconciliation.

> [!research-later]
> How does this connect to Granger causality? Check Econ literature.

> [!question] Does correlation imply causation in any formal system?
> Pearl argues no, but some Bayesian frameworks disagree.
```

**Why this works:**

- It's valid markdown — any renderer shows it as a blockquote (graceful degradation)
- The `[!type]` tag is parseable with a simple regex
- Obsidian users already recognize the syntax
- Titles are optional (inline after the tag)
- Content can contain any markdown (bold, links, code, etc.)

## What You'd Build

Three layers:

| Layer | What | Where |
|-------|------|-------|
| **Parser** | Extract `[!type]` + title + body from blockquotes | Remark plugin or regex pass |
| **Preview** | Render as styled cards with icons, colors, borders | React component in preview mode |
| **Editor** | Syntax highlight + decorations in edit mode | CodeMirror 6 extension |

## Useful Block Types for Study Notes

| Type | Purpose | Visual |
|------|---------|--------|
| `[!ai-answer]` | AI-generated content (provenance tracking) | Robot icon, blue-gray bg |
| `[!source]` | Citation with attribution | Book icon, green left bar |
| `[!warning]` | Contradictions, caveats | Triangle icon, amber bg |
| `[!research-later]` | Open threads to investigate | Magnifying glass, dashed border |
| `[!question]` | Unresolved questions | Question mark, purple accent |
| `[!key-insight]` | Core takeaways to remember | Lightbulb, yellow highlight |
| `[!example]` | Concrete illustrations | Beaker, teal accent |
| `[!definition]` | Formal definitions | Dictionary icon, bordered card |
| `[!connection]` | Cross-references between ideas | Link icon, dotted border |
| `[!mistake]` | Common misconceptions to avoid | X icon, red accent |

## How It Fits Your Stack

**Parsing** — a remark plugin (or simple regex) during preview:
```ts
// matches: > [!type] optional title
const CALLOUT_RE = /^\[!([a-z-]+)\]\s*(.*)?$/;
```

**CodeMirror** — a `ViewPlugin` that scans blockquotes and adds `Decoration.widget` / `Decoration.line` to style them in-place (similar to how your `cmLinkNavigation.ts` works).

**Preview** — a React component that replaces matching blockquotes with styled cards:
```tsx
<Callout type="ai-answer" title="On the French Revolution">
  <p>The French Revolution began in 1789...</p>
</Callout>
```

**Search** — since it's plain text, your existing FTS5 index searches callout content with zero changes.

Want me to build this out? I'd start with the preview renderer + a few block types, then add the CodeMirror editor decorations.

---

## User

I like these ideas! Pleas plan this implementation. Let's start with
[!ai-answer]
[!source]
[!question]
[!key-insight]

They should also be in the editor header, along common features like bold and italic.

---

## Assistant

### Tool Calls

- **ToolSearch**: `{"query":"select:EnterPlanMode","max_results":1}`

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Explore editor & toolbar","subagent_type":"Explore","prompt":"Explore the BrainMap desktop app's editor infrastructure. I need to understand:\n\n1. The EditorToolbar component — where `

---

## Assistant

### Tool Calls

- **Agent**: `{"description":"Explore callout/blockquote patterns","subagent_type":"Explore","prompt":"Explore the BrainMap desktop app to understand:\n\n1. How the existing graph styles and type-color system works`

---

