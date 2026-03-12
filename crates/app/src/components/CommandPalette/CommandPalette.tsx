import { useState, useEffect, useRef, useCallback } from "react";
import { useUIStore } from "../../stores/uiStore";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";

interface PaletteItem {
  type: "note" | "command";
  label: string;
  path?: string;
  action?: () => void;
}

export function CommandPalette() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useUIStore((s) => s.closeCommandPalette);
  const nodes = useGraphStore((s) => s.nodes);
  const selectNode = useGraphStore((s) => s.selectNode);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Build items list
  const items: PaletteItem[] = [];

  // Static commands
  const commands: PaletteItem[] = [
    {
      type: "command",
      label: "Create Note",
      action: () => {
        close();
        useUIStore.getState().openCreateNoteDialog();
      },
    },
  ];

  const q = query.toLowerCase();

  // Filter or show all commands
  for (const cmd of commands) {
    if (!q || cmd.label.toLowerCase().includes(q)) {
      items.push(cmd);
    }
  }

  // Notes matching query
  if (q) {
    for (const node of nodes.values()) {
      if (node.title.toLowerCase().includes(q)) {
        items.push({ type: "note", label: node.title, path: node.path });
      }
    }
  } else {
    // Show all notes when empty
    for (const node of nodes.values()) {
      items.push({ type: "note", label: node.title, path: node.path });
    }
  }

  // Limit to 20
  const limitedItems = items.slice(0, 20);

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      if (item.path) {
        selectNode(item.path);
        useEditorStore.getState().openNote(item.path);
      }
      if (item.action) {
        item.action();
      }
      close();
    },
    [selectNode, close]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, limitedItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (limitedItems[selectedIndex]) {
        handleSelect(limitedItems[selectedIndex]);
      }
    }
  };

  return (
    <div className="command-palette-overlay" onClick={close}>
      <div
        className="command-palette"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search notes..."
        />
        <div className="results">
          {limitedItems.map((item, i) => (
            <div
              key={item.path ?? item.label}
              className={`result-item ${i === selectedIndex ? "selected" : ""}`}
              onClick={() => handleSelect(item)}
            >
              <span className="result-icon">
                {item.type === "note" ? "doc" : "cmd"}
              </span>
              {item.label}
            </div>
          ))}
          {limitedItems.length === 0 && (
            <div
              style={{
                padding: "12px 16px",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              No results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
