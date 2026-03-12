import { useState, useCallback, useRef, useEffect } from "react";
import { getAPI } from "../../api/bridge";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useUIStore } from "../../stores/uiStore";
import type { SearchResult } from "../../api/types";
import { log } from "../../utils/logger";

export function SearchPanel() {
  const expanded = useUIStore((s) => s.searchExpanded);
  const toggleExpanded = useUIStore((s) => s.toggleSearchExpanded);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchCounterRef = useRef(0);
  const noteTypes = useWorkspaceStore((s) => s.noteTypes);
  const selectNode = useGraphStore((s) => s.selectNode);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const doSearch = useCallback(
    async (q: string, type: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      const thisSearch = ++searchCounterRef.current;
      try {
        const api = await getAPI();
        const res = await api.search(q, {
          note_type: type || undefined,
        });
        // Only apply results if this is still the latest search
        if (thisSearch === searchCounterRef.current) {
          setResults(res);
        }
      } catch (e) {
        log.error("components::SearchPanel", "search failed", { query: q, error: String(e) });
      } finally {
        if (thisSearch === searchCounterRef.current) {
          setIsSearching(false);
        }
      }
    },
    []
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(value, typeFilter), 300);
    },
    [doSearch, typeFilter]
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      setTypeFilter(value);
      if (query.trim()) {
        doSearch(query, value);
      }
    },
    [doSearch, query]
  );

  const handleResultClick = (result: SearchResult) => {
    selectNode(result.path);
    useEditorStore.getState().openNote(result.path);
  };

  return (
    <div className="search-panel">
      <button
        className="section-toggle"
        aria-expanded={expanded}
        aria-controls="search-content"
        onClick={toggleExpanded}
      >
        <span>{expanded ? "▾" : "▸"}</span>
        Search
      </button>
      {expanded && (
        <div id="search-content">
          <div className="search-input-bar">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search notes..."
            />
            <div className="search-filters">
              <select value={typeFilter} onChange={(e) => handleTypeChange(e.target.value)}>
                <option value="">All Types</option>
                {noteTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="search-results">
            {isSearching && (
              <div style={{ padding: 12, color: "var(--text-muted)", fontSize: 13 }}>
                Searching...
              </div>
            )}
            {!isSearching && query && results.length === 0 && (
              <div style={{ padding: 12, color: "var(--text-muted)", fontSize: 13 }}>
                No results found.
              </div>
            )}
            {results.map((r) => (
              <div
                key={r.path}
                className="search-result-item"
                onClick={() => handleResultClick(r)}
              >
                <div className="title">
                  <span className="type-badge">{r.note_type}</span>
                  {r.title}
                </div>
                <div className="snippet">{r.snippet}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
