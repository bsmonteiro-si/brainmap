# Seed Dataset as Test Fixture
**Date:** 2026-03-15 | **Status:** accepted

## Context
The test suite needs a dataset to validate parsing, graph construction, search, CLI commands, and MCP tools. The choice was between synthetic test data generated programmatically and a curated real-world dataset.

## Decision
Use a hand-written 34-note dataset derived from Judea Pearl's "The Book of Why" as the primary test fixture (`seed/` directory). The dataset covers all 10 user-facing note types (concept, book-note, question, reference, index, argument, evidence, experiment, person, project), uses all 15 edge types, includes multi-level directory nesting, and contains real prose with realistic frontmatter. Tests in all three interface crates (`core`, `cli`, `mcp`) use this same dataset.

## Alternatives Considered
- **Programmatic test fixtures:** `tempdir` + generated `.md` files per test. Used for incremental operation tests where isolation matters, but rejected as the primary fixture because synthetic data tends to be minimal and uniform — it misses the irregularities found in real notes (varying tag counts, optional fields present or absent, deeply nested paths, mixed link types).
- **Multiple small fixtures per test module:** Each test file creates its own 2-3 note fixture. Rejected because it duplicates setup logic, produces inconsistent test data across modules, and does not test the system's behavior with a realistic graph topology (orphan nodes, cycles, varying connectivity).
- **Large generated dataset (100+ notes):** Would stress-test performance but makes test failures harder to diagnose (which of the 100 notes caused the issue?). The 34-note seed is large enough to cover type diversity and graph patterns while small enough that every note can be manually inspected.

## Consequences
- All interfaces are tested against the same data, ensuring behavioral consistency. A search that works in CLI tests will work identically in MCP tests.
- The seed dataset doubles as documentation — new contributors can browse `seed/` to understand the expected file format, frontmatter fields, and link conventions.
- The dataset includes edge cases naturally: notes with no links, notes with many links, nested subdirectories, notes linking to non-existent targets (for dangling reference testing).
- 8 dedicated seed dataset tests validate structural properties (all types present, edge counts, search results, orphan detection).
- Trade-off: tests depend on the specific seed content. Changing a seed file can break unrelated tests. This is mitigated by the `LazyLock<Mutex<Workspace>>` shared fixture pattern that loads the workspace once.
