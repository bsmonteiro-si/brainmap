import { useState, useMemo } from "react";
import type { TypedLinkDto } from "../../api/types";
import { getAPI } from "../../api/bridge";
import { useGraphStore } from "../../stores/graphStore";
import { useEditorStore } from "../../stores/editorStore";
import { useUIStore } from "../../stores/uiStore";
import { log } from "../../utils/logger";

// User-selectable edge types (excludes auto-generated: contains, part-of, mentioned-in)
const LINK_TYPES = [
  "causes",
  "supports",
  "contradicts",
  "extends",
  "depends-on",
  "exemplifies",
  "precedes",
  "leads-to",
  "evolved-from",
  "related-to",
  "authored-by",
  "sourced-from",
];

interface Props {
  notePath: string;
  links: TypedLinkDto[];
}

export function LinksEditor({ notePath, links }: Props) {
  const nodes = useGraphStore((s) => s.nodes);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTarget, setNewTarget] = useState("");
  const [newRel, setNewRel] = useState(LINK_TYPES[0]);

  // Build datalist options: all nodes except self (includes folder nodes)
  const nodeOptions = useMemo(() => {
    const opts: { path: string; title: string }[] = [];
    nodes.forEach((node, path) => {
      if (path !== notePath) {
        const label = node.note_type === "folder" ? `${node.title} (folder)` : node.title;
        opts.push({ path, title: label });
      }
    });
    opts.sort((a, b) => a.title.localeCompare(b.title));
    return opts;
  }, [nodes, notePath]);

  // Resolve typed title to path
  const resolvedTarget = useMemo(() => {
    const match = nodeOptions.find(
      (o) => o.title === newTarget,
    );
    return match?.path ?? null;
  }, [newTarget, nodeOptions]);

  // Check if this exact link already exists
  const isDuplicate = useMemo(() => {
    if (!resolvedTarget) return false;
    return links.some(
      (l) => l.target === resolvedTarget && l.rel === newRel,
    );
  }, [resolvedTarget, newRel, links]);

  const canAdd = resolvedTarget !== null && !isDuplicate && !busy;
  const showCreateAndLink = newTarget.trim().length > 0 && resolvedTarget === null && !busy;

  const handleCreateAndLink = () => {
    const trimmed = newTarget.trim();
    if (!trimmed) return;
    useUIStore.getState().openCreateNoteDialog({
      initialTitle: trimmed,
      mode: "create-and-link",
      linkSource: { notePath, rel: newRel },
    });
    setNewTarget("");
  };

  const handleRemove = async (link: TypedLinkDto) => {
    setBusy(true);
    setError(null);
    try {
      const api = await getAPI();
      await api.deleteLink(notePath, link.target, link.rel);
      useGraphStore.getState().applyEvent({
        type: "edge-deleted",
        edge: {
          source: notePath,
          target: link.target,
          rel: link.rel,
          kind: "Explicit",
        },
      });
      await useEditorStore.getState().refreshActiveNote();
    } catch (e) {
      log.error("components::LinksEditor", "failed to delete link", { notePath, target: link.target, error: String(e) });
      setError("Failed to remove link");
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async () => {
    if (!resolvedTarget || isDuplicate) return;
    setBusy(true);
    setError(null);
    try {
      const api = await getAPI();
      await api.createLink(notePath, resolvedTarget, newRel);
      useGraphStore.getState().applyEvent({
        type: "edge-created",
        edge: {
          source: notePath,
          target: resolvedTarget,
          rel: newRel,
          kind: "Explicit",
        },
      });
      await useEditorStore.getState().refreshActiveNote();
      setNewTarget("");
    } catch (e) {
      log.error("components::LinksEditor", "failed to create link", { notePath, target: resolvedTarget, error: String(e) });
      setError("Failed to add link");
    } finally {
      setBusy(false);
    }
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canAdd) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="links-editor">
      {links.map((link) => {
        const targetNode = nodes.get(link.target);
        const title = targetNode?.title ?? link.target;
        return (
          <div key={`${link.target}:${link.rel}`} className="link-row">
            <span className="link-rel">{link.rel}</span>
            <span
              className="link-target link-target-navigable"
              title={link.target}
              onClick={(e) => {
                e.preventDefault();
                if (targetNode?.note_type === "folder") {
                  useUIStore.getState().setGraphFocus(link.target, "folder");
                } else {
                  useGraphStore.getState().selectNode(link.target);
                  useEditorStore.getState().openNote(link.target);
                }
              }}
            >
              {title}
            </span>
            <button
              type="button"
              className="link-remove"
              disabled={busy}
              onClick={() => handleRemove(link)}
              aria-label={`Remove link ${link.rel} to ${title}`}
            >
              ×
            </button>
          </div>
        );
      })}
      <div className="link-add-row">
        <input
          type="text"
          className="link-add-target"
          list="link-target-options"
          value={newTarget}
          onChange={(e) => setNewTarget(e.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="Target note…"
          disabled={busy}
        />
        <datalist id="link-target-options">
          {nodeOptions.map((o) => (
            <option key={o.path} value={o.title} />
          ))}
        </datalist>
        <select
          className="link-add-type"
          value={newRel}
          onChange={(e) => setNewRel(e.target.value)}
          disabled={busy}
        >
          {LINK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {showCreateAndLink ? (
          <button
            type="button"
            className="link-create-btn"
            onClick={handleCreateAndLink}
          >
            Create &amp; Link
          </button>
        ) : (
          <button
            type="button"
            className="link-add-btn"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            +
          </button>
        )}
      </div>
      {error && <div className="link-error">{error}</div>}
    </div>
  );
}
