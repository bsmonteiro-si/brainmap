import { useState } from "react";

interface Props {
  extra: Record<string, unknown>;
  onChange: (extra: Record<string, unknown>) => void;
}

function displayValue(v: unknown): string {
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

export function ExtraFieldsEditor({ extra, onChange }: Props) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const entries = Object.entries(extra);

  const updateValue = (key: string, value: string) => {
    const orig = extra[key];
    if (typeof orig !== "string") {
      try {
        onChange({ ...extra, [key]: JSON.parse(value) });
        return;
      } catch { /* fall through to string */ }
    }
    onChange({ ...extra, [key]: value });
  };

  const removeField = (key: string) => {
    const next = { ...extra };
    delete next[key];
    onChange(next);
  };

  const addField = () => {
    const key = newKey.trim();
    if (!key || key in extra) return;
    onChange({ ...extra, [key]: newValue });
    setNewKey("");
    setNewValue("");
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addField();
    }
  };

  return (
    <div className="extra-fields-editor">
      {entries.map(([key, val]) => (
        <div key={key} className="extra-field-row">
          <span className="extra-field-key">{key}</span>
          <input
            type="text"
            className="extra-field-value"
            value={displayValue(val)}
            onChange={(e) => updateValue(key, e.target.value)}
          />
          <button
            type="button"
            className="extra-field-remove"
            onClick={() => removeField(key)}
            aria-label={`Remove field ${key}`}
          >
            ×
          </button>
        </div>
      ))}
      <div className="extra-field-row extra-field-add-row">
        <input
          type="text"
          className="extra-field-new-key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="Field name"
        />
        <input
          type="text"
          className="extra-field-new-value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="Value"
        />
        <button
          type="button"
          className="extra-field-add-btn"
          onClick={addField}
          disabled={!newKey.trim() || newKey.trim() in extra}
        >
          +
        </button>
      </div>
    </div>
  );
}
