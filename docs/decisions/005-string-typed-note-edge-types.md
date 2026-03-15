# String-Typed Note and Edge Types
**Date:** 2026-03-15 | **Status:** accepted

## Context
The data model needs to represent note types (concept, book-note, question, etc.) and edge relationship types (causes, supports, contradicts, etc.). The choice was between Rust enums and plain strings for these fields.

## Decision
Use `String` for both `Frontmatter.note_type` and `Edge.rel`. The system defines 11 known note types and 15 known edge types as conventions, but the parser accepts any string value. Type validation happens at the application layer (CLI warnings, UI dropdowns) rather than the data layer.

## Alternatives Considered
- **Rust enums with serde deserialization:** Would provide compile-time exhaustiveness checks and prevent typos. Rejected because it makes the system closed to extension — adding a new note type (e.g., "recipe", "meeting-note") would require a code change, recompilation, and release. Users cannot experiment with custom types. The YAML frontmatter would fail to parse if it contained an unknown type, causing data loss for notes created by other tools.
- **Enum with `Other(String)` variant:** A compromise that validates known types while accepting unknowns. Rejected because the `Other` variant infects all match statements with a catch-all arm, negating the exhaustiveness benefit. Serialization roundtrips become awkward (does `Other("concept")` equal `Concept`?).
- **Type registry with runtime validation:** A set of registered type strings checked at parse time. Rejected as over-engineering — the graph works correctly regardless of what type string a note carries. Invalid types are a user concern, not a data integrity concern.

## Consequences
- Users can create notes with any `type:` value in frontmatter and they will parse, index, and appear in the graph without code changes.
- The desktop app UI uses the known types for dropdowns and color palettes, but gracefully handles unknown types with fallback styling.
- Statistics (`stats.nodes_by_type`) naturally group by whatever strings exist, auto-discovering custom types.
- Trade-off: typos in type names (e.g., "concpet" instead of "concept") are silently accepted. The `validate` command catches some of these, but prevention relies on UI affordances rather than type system guarantees.
