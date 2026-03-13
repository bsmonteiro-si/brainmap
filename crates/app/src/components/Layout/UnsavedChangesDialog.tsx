import { useUIStore } from "../../stores/uiStore";
import { useTabStore } from "../../stores/tabStore";
import { resolveUnsavedChanges } from "../../stores/unsavedChangesPrompt";

export function UnsavedChangesDialog() {
  const tabId = useUIStore((s) => s.unsavedChangesTabId);
  const tab = useTabStore((s) => tabId ? s.tabs.find((t) => t.id === tabId) : undefined);
  const title = tab?.title ?? "Untitled";

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const boxStyle: React.CSSProperties = {
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    padding: 24,
    width: 400,
    maxWidth: "90vw",
    boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const btnStyle: React.CSSProperties = {
    padding: "6px 16px",
    fontSize: 13,
    border: "1px solid var(--border-color)",
    borderRadius: 4,
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    cursor: "pointer",
  };

  const btnPrimaryStyle: React.CSSProperties = {
    ...btnStyle,
    background: "var(--accent)",
    color: "white",
    border: "none",
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) resolveUnsavedChanges("cancel"); }}>
      <div style={boxStyle}>
        <p style={{ fontSize: 14, color: "var(--text-primary)", margin: 0 }}>
          Do you want to save the changes you made to <strong>{title}</strong>?
        </p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
          Your changes will be lost if you don't save them.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <button style={btnStyle} onClick={() => resolveUnsavedChanges("discard")}>
            Don't Save
          </button>
          <button style={btnStyle} onClick={() => resolveUnsavedChanges("cancel")}>
            Cancel
          </button>
          <button style={btnPrimaryStyle} onClick={() => resolveUnsavedChanges("save")}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
