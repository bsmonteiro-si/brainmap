# BrainMap — MCP Server Specification

## Overview

BrainMap exposes a Model Context Protocol (MCP) server so AI agents (Claude, etc.) can natively query and interact with the knowledge graph. The MCP server provides **low-level graph primitives** in v1, with semantic/high-level tools planned for later.

The MCP server starts with `brainmap serve` or `brainmap serve --mcp-only`.

## Tool Naming Convention

All tools follow the pattern `brainmap_{entity}_{action}`. Entity groups: `node`, `link`, `graph`, `search`, `workspace`, `federation`, `config`.

## Response Envelope

All tools return a consistent response envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On failure:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "Node not found: Concepts/Missing.md"
  }
}
```

Error codes match those defined in the [CLI specification](./03-cli-spec.md#error-behavior).

## Tools vs Resources

**Tools** are used for operations that require parameters, have side effects, or return computed results (e.g., creating a node, running a search, traversing the graph). **Resources** are used for simple, parameter-free reads of known data (e.g., reading a specific node's raw content, reading workspace configuration). When an agent needs to filter, mutate, or compute, use a tool. When it needs to read a known entity by URI, use a resource.

## Tools

### Node Operations

#### `brainmap_node_get`

Retrieve a single node's metadata and content.

**Description:** Retrieves a node's frontmatter, body content, and incoming links by workspace-relative path. Use this when you need detailed information about a specific note.

**Input:**
```json
{
  "path": "Concepts/Counterfactuals.md",
  "include_content": true,
  "include_incoming_links": true
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "path": "Concepts/Counterfactuals.md",
    "frontmatter": {
      "title": "Counterfactual Reasoning",
      "type": "concept",
      "tags": ["causality", "reasoning"],
      "status": "draft",
      "created": "2026-03-09",
      "modified": "2026-03-09",
      "source": "The Book of Why, Ch.1",
      "summary": "Core reasoning framework for causal inference.",
      "links": [
        {"target": "Concepts/Causal Inference.md", "relationship": "extends"}
      ],
      "domain": "causal-ml",
      "maturity": "foundational"
    },
    "content": "# Counterfactual Reasoning\n\nThe ability to reason about...",
    "incoming_links": [
      {"source": "Books/Book of Why/Ch1.md", "relationship": "contains"}
    ]
  },
  "error": null
}
```

#### `brainmap_node_list`

List nodes with optional filters.

**Description:** Lists nodes in the workspace with optional type, tag, and status filters. Supports pagination via limit and offset. Returns summary information (path, title, type, tags) for each matching node.

**Input:**
```json
{
  "type": "concept",
  "tags": ["causality"],
  "status": "draft",
  "limit": 20,
  "offset": 0
}
```

All fields optional. Returns array of node summaries (path, title, type, tags).

**Output:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {"path": "Concepts/Counterfactuals.md", "title": "Counterfactual Reasoning", "type": "concept", "tags": ["causality", "reasoning"]},
      {"path": "Concepts/Causal Inference.md", "title": "Causal Inference", "type": "concept", "tags": ["causality"]}
    ],
    "total": 2,
    "limit": 20,
    "offset": 0
  },
  "error": null
}
```

#### `brainmap_node_create`

Create a new note.

**Description:** Creates a new markdown note at the given workspace-relative path with frontmatter and optional body content. Use this when an agent needs to add knowledge to the graph.

**Input:**
```json
{
  "path": "Concepts/New Concept.md",
  "frontmatter": {
    "title": "New Concept",
    "type": "concept",
    "tags": ["tag1"],
    "status": "draft"
  },
  "content": "# New Concept\n\nDescription here...",
  "template": "concept"
}
```

The `template` field is optional. When provided, the node is initialized from the named template before applying the given frontmatter and content overrides.

**Output:**
```json
{
  "success": true,
  "data": {
    "path": "Concepts/New Concept.md",
    "created": true
  },
  "error": null
}
```

#### `brainmap_node_update`

Update a note's frontmatter and/or content.

**Description:** Updates an existing node's frontmatter fields and/or body content. Only fields present in `frontmatter_updates` are changed; absent fields are left untouched. To explicitly clear a field, include its name in `clear_fields`. Pass `content` to replace the body text.

**Input:**
```json
{
  "path": "Concepts/Counterfactuals.md",
  "frontmatter_updates": {
    "status": "review",
    "tags": ["causality", "reasoning", "pearl"]
  },
  "clear_fields": ["summary"],
  "content": null
}
```

Fields in `frontmatter_updates` are merged into existing frontmatter. Fields listed in `clear_fields` are removed entirely. Absent fields (not present in `frontmatter_updates` and not in `clear_fields`) are left unchanged. Pass `content` as a string to replace body text; pass `null` or omit to leave body unchanged.

**Output:**
```json
{
  "success": true,
  "data": {
    "path": "Concepts/Counterfactuals.md",
    "updated_fields": ["status", "tags"],
    "cleared_fields": ["summary"]
  },
  "error": null
}
```

#### `brainmap_node_delete`

Delete a note.

**Description:** Deletes a node from the workspace. When force is false and other nodes link to this one, returns a warning with the list of incoming links instead of deleting.

**Input:**
```json
{
  "path": "Concepts/Old Concept.md",
  "force": false
}
```

Returns warning with incoming links if `force` is false and links exist.

**Output (when force is false and links exist):**
```json
{
  "success": false,
  "data": {
    "path": "Concepts/Old Concept.md",
    "incoming_links": [
      {"source": "Books/Book of Why/Ch2.md", "relationship": "extends"},
      {"source": "Concepts/Causal Inference.md", "relationship": "related-to"}
    ]
  },
  "error": {
    "code": "HAS_INCOMING_LINKS",
    "message": "Node has 2 incoming links. Use force: true to delete anyway."
  }
}
```

**Output (on successful deletion):**
```json
{
  "success": true,
  "data": {
    "path": "Concepts/Old Concept.md",
    "deleted": true
  },
  "error": null
}
```

#### `brainmap_node_move`

Atomically move/rename a node and rewrite all references workspace-wide.

**Description:** Moves a node from one path to another, renaming the underlying file and rewriting all references (links in frontmatter, content references) across the entire workspace. This is the safe way to reorganize notes without breaking links.

**Input:**
```json
{
  "old_path": "Concepts/Counterfactuals.md",
  "new_path": "Concepts/Causality/Counterfactuals.md"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "old_path": "Concepts/Counterfactuals.md",
    "new_path": "Concepts/Causality/Counterfactuals.md",
    "references_rewritten": 4,
    "affected_files": [
      "Books/Book of Why/Ch1.md",
      "Concepts/Causal Inference.md",
      "Concepts/Potential Outcomes.md",
      "Questions/Open Questions.md"
    ]
  },
  "error": null
}
```

---

### Edge Operations

#### `brainmap_link_create`

Create a typed relationship.

**Description:** Creates a directional typed link between two nodes by writing the relationship into the source node's frontmatter. Both source and target must exist.

**Input:**
```json
{
  "source": "Concepts/Do-Calculus.md",
  "target": "Concepts/SCM.md",
  "relationship": "extends"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "source": "Concepts/Do-Calculus.md",
    "target": "Concepts/SCM.md",
    "relationship": "extends",
    "created": true
  },
  "error": null
}
```

#### `brainmap_link_delete`

Remove a relationship.

**Description:** Removes a typed link between two nodes by deleting the relationship entry from the source node's frontmatter.

**Input:**
```json
{
  "source": "Concepts/Do-Calculus.md",
  "target": "Concepts/SCM.md",
  "relationship": "extends"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "source": "Concepts/Do-Calculus.md",
    "target": "Concepts/SCM.md",
    "relationship": "extends",
    "deleted": true
  },
  "error": null
}
```

#### `brainmap_link_list`

List all relationships for a node.

**Description:** Lists all incoming and/or outgoing relationships for a given node. Use the direction parameter to filter by incoming, outgoing, or both.

**Input:**
```json
{
  "path": "Concepts/Counterfactuals.md",
  "direction": "both",
  "relationship": null
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "path": "Concepts/Counterfactuals.md",
    "outgoing": [
      {"target": "Concepts/Causal Inference.md", "relationship": "extends"},
      {"target": "People/Judea Pearl.md", "relationship": "authored-by"}
    ],
    "incoming": [
      {"source": "Books/Book of Why/Ch1.md", "relationship": "contains"},
      {"source": "Concepts/Potential Outcomes.md", "relationship": "related-to"}
    ]
  },
  "error": null
}
```

---

### Search

#### `brainmap_search`

Full-text search across notes.

**Description:** Searches note content and/or metadata using a text query. Returns matching notes ranked by relevance with context snippets. Supports filtering by type, tags, and status.

**Input:**
```json
{
  "query": "randomized controlled trial",
  "type": "concept",
  "tags": null,
  "status": null,
  "limit": 10,
  "offset": 0,
  "content_only": false,
  "meta_only": false
}
```

All fields except `query` are optional. `content_only` restricts search to body content; `meta_only` restricts to frontmatter fields. These two flags are mutually exclusive.

**Output:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "path": "Concepts/RCT.md",
        "title": "Randomized Controlled Trials",
        "type": "concept",
        "matches": 3,
        "snippet": "...a randomized controlled trial is the gold standard..."
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  },
  "error": null
}
```

---

### Graph Traversal

#### `brainmap_graph_neighbors`

Get nodes connected to a given node within N hops.

**Description:** Returns all nodes reachable from a center node within the specified depth, along with the edges connecting them. Useful for exploring a node's local neighborhood in the knowledge graph. Tracks visited nodes to avoid cycles.

**Input:**
```json
{
  "path": "Concepts/Counterfactuals.md",
  "depth": 2,
  "relationship": null,
  "direction": "both"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "center": "Concepts/Counterfactuals.md",
    "nodes": [
      {"path": "Concepts/Causal Inference.md", "title": "Causal Inference", "depth": 1},
      {"path": "People/Judea Pearl.md", "title": "Judea Pearl", "depth": 1},
      {"path": "Concepts/Probability Theory.md", "title": "Probability Theory", "depth": 2}
    ],
    "edges": [
      {"source": "Concepts/Counterfactuals.md", "target": "Concepts/Causal Inference.md", "relationship": "extends"},
      {"source": "Concepts/Causal Inference.md", "target": "Concepts/Probability Theory.md", "relationship": "depends-on"}
    ]
  },
  "error": null
}
```

#### `brainmap_graph_find_path`

Find shortest path(s) between two nodes.

**Description:** Finds the shortest path(s) between a source and target node in the knowledge graph, up to a maximum traversal depth. Returns all paths of minimal length.

**Input:**
```json
{
  "source": "Concepts/Counterfactuals.md",
  "target": "Concepts/Bayesian Networks.md",
  "max_depth": 5
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "paths": [
      {
        "length": 2,
        "nodes": ["Concepts/Counterfactuals.md", "People/Judea Pearl.md", "Concepts/Bayesian Networks.md"],
        "edges": [
          {"source": "Concepts/Counterfactuals.md", "target": "People/Judea Pearl.md", "relationship": "authored-by"},
          {"source": "Concepts/Bayesian Networks.md", "target": "People/Judea Pearl.md", "relationship": "authored-by"}
        ]
      }
    ]
  },
  "error": null
}
```

#### `brainmap_graph_subgraph`

Extract a subgraph around a node.

**Description:** Extracts all nodes and edges within a given depth of a center node, returning the full subgraph data suitable for visualization or analysis. Tracks visited nodes to avoid cycles.

**Input:**
```json
{
  "center": "Concepts/Causality.md",
  "depth": 2,
  "relationship": null
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "center": "Concepts/Causality.md",
    "nodes": [
      {"path": "Concepts/Causality.md", "title": "Causality", "type": "concept"},
      {"path": "Concepts/Counterfactuals.md", "title": "Counterfactual Reasoning", "type": "concept"},
      {"path": "Concepts/Interventions.md", "title": "Interventions", "type": "concept"},
      {"path": "Concepts/Causal Inference.md", "title": "Causal Inference", "type": "concept"}
    ],
    "edges": [
      {"source": "Concepts/Causality.md", "target": "Concepts/Counterfactuals.md", "relationship": "contains"},
      {"source": "Concepts/Causality.md", "target": "Concepts/Interventions.md", "relationship": "contains"},
      {"source": "Concepts/Counterfactuals.md", "target": "Concepts/Causal Inference.md", "relationship": "extends"}
    ],
    "node_count": 4,
    "edge_count": 3
  },
  "error": null
}
```

---

### Workspace

#### `brainmap_workspace_status`

Get workspace status and summary statistics.

**Description:** Returns the current workspace name, location, node/edge counts broken down by type, and index health. Use this to get a quick overview of the workspace state.

**Input:**
```json
{}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "name": "Masters Thesis",
    "path": "~/brain-map/masters-thesis",
    "node_count": 47,
    "edge_count": 123,
    "edges_explicit": 68,
    "edges_derived": 55,
    "types": {"concept": 21, "book-note": 14, "question": 6, "reference": 4, "index": 2},
    "index_status": "up_to_date",
    "last_indexed": "2026-03-09T14:23:00Z"
  },
  "error": null
}
```

#### `brainmap_workspace_validate`

Run validation checks (broken links, orphans, missing fields).

**Description:** Validates the workspace by checking for broken links, orphan nodes, missing frontmatter, and other structural issues. Returns a categorized list of all problems found.

**Input:**
```json
{}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "issue_count": 4,
    "issues": [
      {"type": "broken_link", "path": "Concepts/Old.md", "target": "Concepts/Removed.md", "message": "Link target file not found"},
      {"type": "orphan_node", "path": "Concepts/Isolated Thought.md", "message": "No incoming or outgoing links"},
      {"type": "missing_frontmatter", "path": "Notes/Quick Note.md", "message": "Missing fields: title, type"},
      {"type": "missing_required_field", "path": "Concepts/WIP.md", "message": "Missing fields: created"}
    ]
  },
  "error": null
}
```

#### `brainmap_workspace_stats`

Get graph analytics (node/edge counts, clusters, most connected nodes).

**Description:** Returns detailed graph analytics including node and edge counts, edge type distribution, cluster detection, and identification of the most connected nodes. Use this for understanding the structure and health of the knowledge graph.

**Input:**
```json
{}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "node_count": 47,
    "edge_count": 123,
    "edges_by_type": {"contains": 55, "extends": 23, "causes": 12, "supports": 10},
    "edges_explicit": 68,
    "edges_derived": 55,
    "most_connected": [
      {"path": "Concepts/Causal Inference.md", "title": "Causal Inference", "edge_count": 14}
    ],
    "clusters": [
      {"name": "Causality core", "node_count": 18},
      {"name": "Statistics foundations", "node_count": 12},
      {"name": "Book of Why notes", "node_count": 9},
      {"name": "People", "node_count": 8}
    ],
    "orphan_count": 1
  },
  "error": null
}
```

#### `brainmap_workspace_reindex`

Force a full re-index of all notes.

**Description:** Triggers a complete re-index of the workspace, rebuilding the search index and graph database from the markdown files on disk. Use this when data appears stale or after bulk external changes.

**Input:**
```json
{}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "nodes_indexed": 47,
    "duration_ms": 300
  },
  "error": null
}
```

#### `brainmap_workspace_export`

Export the full graph or a subgraph in a specified format.

**Description:** Exports graph data in JSON, DOT, or GraphML format. Optionally scoped to a subgraph around a center node. Use this when you need a portable representation of the knowledge graph.

**Input:**
```json
{
  "format": "json",
  "center": null,
  "depth": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `format` | string | Required. One of `json`, `dot`, `graphml`. |
| `center` | string | Optional. Workspace-relative path for subgraph export. |
| `depth` | number | Optional. Depth for subgraph export. Required if `center` is provided. |

**Output:**
```json
{
  "success": true,
  "data": {
    "format": "json",
    "node_count": 47,
    "edge_count": 123,
    "content": "{ ... }"
  },
  "error": null
}
```

---

### Configuration

#### `brainmap_config_get`

Read a workspace configuration value.

**Description:** Retrieves the value of a specific workspace configuration key, or returns all configuration when no key is specified.

**Input:**
```json
{
  "key": "name"
}
```

`key` is optional. Omit to return the full configuration object.

**Output:**
```json
{
  "success": true,
  "data": {
    "key": "name",
    "value": "Masters Thesis"
  },
  "error": null
}
```

#### `brainmap_config_set`

Update a workspace configuration value.

**Description:** Sets a workspace configuration key to a new value. Use this to programmatically update workspace settings.

**Input:**
```json
{
  "key": "name",
  "value": "Causal ML Research"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "key": "name",
    "old_value": "Masters Thesis",
    "new_value": "Causal ML Research"
  },
  "error": null
}
```

---

### Federation

#### `brainmap_federation_list`

List all federated workspaces.

**Description:** Returns the list of all federated workspaces configured for the current workspace, including their names, paths, and reachability status.

**Input:**
```json
{}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "workspaces": [
      {"name": "Personal", "path": "~/brain-map/personal", "reachable": true, "node_count": 32},
      {"name": "Work", "path": "~/brain-map/work-notes", "reachable": true, "node_count": 104}
    ]
  },
  "error": null
}
```

#### `brainmap_federation_add`

Add a federated workspace.

**Description:** Registers an external BrainMap workspace as a federation source, enabling cross-workspace links and traversal.

**Input:**
```json
{
  "name": "Personal",
  "path": "~/brain-map/personal"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "name": "Personal",
    "path": "~/brain-map/personal",
    "reachable": true,
    "node_count": 32
  },
  "error": null
}
```

#### `brainmap_federation_remove`

Remove a federated workspace.

**Description:** Removes a federated workspace from the configuration. Does not delete the external workspace itself. Existing cross-workspace links will become broken.

**Input:**
```json
{
  "name": "Work"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "name": "Work",
    "removed": true
  },
  "error": null
}
```

---

### Batch Operations

#### `brainmap_batch`

Execute multiple operations in a single request.

**Description:** Accepts an array of BrainMap operations and executes them sequentially. Useful for AI agent workflows that need to create or update multiple nodes in a single interaction, reducing round-trips. If an operation fails, subsequent operations are skipped and the response indicates which operations succeeded and which failed.

**Input:**
```json
{
  "operations": [
    {
      "tool": "brainmap_node_create",
      "input": {
        "path": "Concepts/Concept A.md",
        "frontmatter": {"title": "Concept A", "type": "concept"},
        "content": "# Concept A\n\nDescription."
      }
    },
    {
      "tool": "brainmap_node_create",
      "input": {
        "path": "Concepts/Concept B.md",
        "frontmatter": {"title": "Concept B", "type": "concept"},
        "content": "# Concept B\n\nDescription."
      }
    },
    {
      "tool": "brainmap_link_create",
      "input": {
        "source": "Concepts/Concept A.md",
        "target": "Concepts/Concept B.md",
        "relationship": "related-to"
      }
    }
  ]
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "total": 3,
    "succeeded": 3,
    "failed": 0,
    "results": [
      {"index": 0, "success": true, "data": {"path": "Concepts/Concept A.md", "created": true}},
      {"index": 1, "success": true, "data": {"path": "Concepts/Concept B.md", "created": true}},
      {"index": 2, "success": true, "data": {"source": "Concepts/Concept A.md", "target": "Concepts/Concept B.md", "relationship": "related-to", "created": true}}
    ]
  },
  "error": null
}
```

On partial failure:
```json
{
  "success": false,
  "data": {
    "total": 3,
    "succeeded": 1,
    "failed": 1,
    "skipped": 1,
    "results": [
      {"index": 0, "success": true, "data": {"path": "Concepts/Concept A.md", "created": true}},
      {"index": 1, "success": false, "error": {"code": "DUPLICATE_PATH", "message": "Node already exists: Concepts/Concept B.md"}},
      {"index": 2, "skipped": true}
    ]
  },
  "error": {
    "code": "BATCH_PARTIAL_FAILURE",
    "message": "1 of 3 operations failed. Execution stopped at index 1."
  }
}
```

---

## MCP Resources

The MCP server also exposes **resources** for direct file access:

| URI Pattern | Description |
|-------------|-------------|
| `brainmap://nodes/{path}` | A specific note's content |
| `brainmap://graph` | Full graph as JSON |
| `brainmap://config` | Workspace configuration (read-only; use `brainmap_config_get`/`brainmap_config_set` tools for programmatic access) |

## Future Semantic Tools (v2+)

These will be layered on top of the low-level primitives:

- `brainmap_explore_topic` — Given a topic, return a curated subgraph with summaries
- `brainmap_find_connections` — Discover non-obvious connections between two concepts
- `brainmap_summarize_area` — Summarize a cluster of related notes
- `brainmap_suggest_links` — Suggest missing relationships based on content similarity
- `brainmap_ask` — RAG-style Q&A over the knowledge base
