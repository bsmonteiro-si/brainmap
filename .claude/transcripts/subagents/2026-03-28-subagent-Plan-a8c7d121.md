# 2026-03-28 — Subagent Transcript: Plan

**Date:** 2026-03-28 16:49:55
**Agent:** Plan
**Agent ID:** a8c7d12187bacb6e4
**Parent Session:** 69c4eac9-b05a-46f8-937c-2b6d2f7e6284

---

## User

I need a plan to fix a bug where canvas file nodes lose their summary display after file watcher events.

## Root Cause

The `NodeDtoPayload` struct in `crates/app/src-tauri/src/watcher.rs` (lines 28-33) is missing `summary` and `modified` fields:

```rust
pub(crate) struct NodeDtoPayload {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    // missing: summary, modified
}
```

When a file changes on disk, the watcher emits a `node-updated` event with this incomplete payload. The frontend `graphDiff.ts:32-34` does a full replacement `nodes.set(event.path, event.node)`, overwriting the complete NodeDto (with summary/modified) with the stripped-down payload.

The same struct is used for `topology-changed` events' `added_nodes`, so new/moved nodes also lose summary/modified.

## What needs to change

### Option A: Add missing fields to NodeDtoPayload
Add `summary: Option<String>` and `modified: Option<String>` to `NodeDtoPayload`, and update `node_to_payload()` to populate them from `NodeData`.

This is the simplest fix. The `NodeDtoPayload` should match `NodeDto` since the frontend types expect a `NodeDto`.

### Option B: Merge instead of replace in graphDiff.ts
Change the frontend to merge incoming event data with existing node data. This is more defensive but adds complexity and the real fix is to send complete data.

## Files involved
- `crates/app/src-tauri/src/watcher.rs` - NodeDtoPayload struct and node_to_payload fn
- `crates/app/src/api/mock/index.ts` - MockBridge also emits node-updated without summary (line 185)
- `crates/app/src/stores/graphDiff.test.ts` - test for node-updated event (test data has no summary field)

Please recommend the best approach and detail the exact changes needed.

---

## Assistant



I'll explore the codebase to understand the current state and provide a detailed implementation plan.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"NodeDto","output_mode":"files_with_matches"}`

---

## Assistant

Let me now read the key files to understand the full picture.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/generated/NodeDto.ts"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.ts"}`

---

## Assistant

Now let me check the mock bridge and the NodeData model to see what fields are available.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts","offset":175,"limit":30}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.test.ts"}`

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"pub struct NodeData","output_mode":"content","-A":15,"glob":"**/model*"}`

---

## Assistant

Now let me check if there are any other callers of `node_to_payload` in the handlers.

---

## Assistant

### Tool Calls

- **Grep**: `{"pattern":"node_to_payload","path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src","output_mode":"content"}`

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/types.ts"}`

---

## Assistant

I now have a complete picture. Let me check how `node_to_payload` is used in commands.rs for the create/update paths to confirm the scope.

---

## Assistant

### Tool Calls

- **Read**: `{"file_path":"/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/commands.rs","offset":195,"limit":30}`

---

## Assistant

I have all the information needed. Here is my analysis and plan.

---

## Recommendation: Option A (add missing fields to NodeDtoPayload)

Option A is the correct fix. The root cause is a data completeness problem on the Rust side -- `NodeDtoPayload` does not carry `summary` and `modified`, so the frontend receives incomplete data. The frontend type system (`WorkspaceEvent`) already declares these payloads as `NodeDto`, which includes `summary: string | null` and `modified: string | null`. The Rust side simply needs to match what the frontend expects.

Option B (merge in graphDiff.ts) would mask the real issue and add unnecessary complexity. The backend has the data available -- `NodeData` already has `modified: Option<NaiveDate>` and `summary: Option<String>` (confirmed at `crates/core/src/model.rs:189-190`).

There is also a secondary concern: `NodeDtoPayload` and `NodeDto` (from dto.rs) are structurally identical in purpose but defined separately. Ideally you would eliminate `NodeDtoPayload` entirely and reuse `NodeDto` from dto.rs. However, to keep this fix minimal and focused, just adding the two fields is safest.

---

## Detailed Implementation Plan

### Step 1: Update `NodeDtoPayload` struct in watcher.rs (lines 27-33)

Add two new fields to match `NodeDto`:

```rust
pub(crate) struct NodeDtoPayload {
    pub path: String,
    pub title: String,
    pub note_type: String,
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub modified: Option<String>,
}
```

Use `skip_serializing_if` to match the convention in `NodeDto` (dto.rs lines 111-116) so `null` fields are omitted from the JSON payload rather than sent as explicit nulls.

### Step 2: Update `node_to_payload()` in watcher.rs (lines 120-127)

Populate the new fields from `NodeData`:

```rust
pub(crate) fn node_to_payload(n: &NodeData) -> NodeDtoPayload {
    NodeDtoPayload {
        path: n.path.as_str().to_string(),
        title: n.title.clone(),
        note_type: n.note_type.clone(),
        tags: n.tags.clone(),
        summary: n.summary.clone(),
        modified: n.modified.map(|d| d.to_string()),
    }
}
```

This mirrors exactly how `NodeDto::from(&NodeData)` works in dto.rs lines 119-134.

### Step 3: Update MockBridge `node-updated` emission in mock/index.ts (line 185)

The mock currently omits `summary`. Add it:

```typescript
node: {
  path: note.path,
  title: note.title,
  note_type: note.note_type,
  tags: note.tags.length > 0 ? note.tags : null,
  modified: note.modified,
  summary: note.summary ?? null,
},
```

### Step 4: Update test helpers in graphDiff.test.ts

The `makeNodes` helper (line 5-11) creates `NodeDto` objects without `summary` or `modified`. Since these are optional (`| null`) in the TypeScript type, the existing test data is technically valid (undefined is assignable to `string | null` in this context). However, to be explicit and to test that watcher events preserve these fields, add a new test case:

Add a test in the `node-updated` describe block that verifies summary/modified are preserved:

```typescript
it("preserves summary and modified from the event payload", () => {
  const state = makeState(makeNodes(["A.md", "Old", "concept"]));
  const event: WorkspaceEvent = {
    type: "node-updated",
    path: "A.md",
    node: { path: "A.md", title: "New", note_type: "concept", tags: null, summary: "A summary", modified: "2026-03-28" },
  };
  const result = applyTopologyDiff(state, event);
  expect(result.nodes.get("A.md")?.summary).toBe("A summary");
  expect(result.nodes.get("A.md")?.modified).toBe("2026-03-28");
});
```

### Step 5: Verify no other callers are affected

I confirmed that `node_to_payload` is called in:
- `watcher.rs:272` -- topology event for file changes (already correct path, will now include the new fields)
- `watcher.rs:288` -- node-updated event on file modify (already correct path)
- `commands.rs:170,179,209,819,851` -- command handlers that also emit topology events (will now include the new fields, fixing the same bug for command-driven topology events)

All callers pass `&NodeData` which already has `modified` and `summary`, so no caller changes are needed.

### Potential concern: tags field type mismatch

Note that `NodeDtoPayload.tags` is `Vec<String>` while `NodeDto.tags` is `Option<Vec<String>>`. The existing code serializes `tags: Vec<String>` which always produces an array (even empty), whereas `NodeDto` uses `Option<Vec<String>>` which can be `null`. This is a pre-existing inconsistency but not part of this bug. Fixing it would be a separate improvement.

---

### Critical Files for Implementation
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/watcher.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/api/mock/index.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src/stores/graphDiff.test.ts`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/app/src-tauri/src/dto.rs`
- `/Users/bsmonteiro/Desktop/Personal/brainmap/crates/core/src/model.rs`

---

