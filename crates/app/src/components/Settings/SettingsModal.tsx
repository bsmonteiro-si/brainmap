import { useUIStore, FONT_PRESETS } from "../../stores/uiStore";

function FontFamilySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const presetValue =
    FONT_PRESETS.find((p) => p.value !== "custom" && p.value === value)?.value ?? "custom";
  const isCustom = presetValue === "custom";

  return (
    <div className="settings-control">
      <select
        value={presetValue}
        onChange={(e) => onChange(e.target.value === "custom" ? "" : e.target.value)}
      >
        <optgroup label="Sans-serif">
          {FONT_PRESETS.filter((_, i) => i <= 4).map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </optgroup>
        <optgroup label="Serif">
          {FONT_PRESETS.filter((p) => ["Georgia", "Lora", "Merriweather"].includes(p.label)).map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </optgroup>
        <optgroup label="Monospace">
          {FONT_PRESETS.filter((p) =>
            ["System Mono", "JetBrains Mono", "Fira Code", "Cascadia Code", "Source Code Pro", "IBM Plex Mono"].includes(p.label)
          ).map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </optgroup>
        <option value="custom">Custom</option>
      </select>
      {isCustom && (
        <input
          type="text"
          placeholder="e.g. 'Operator Mono', monospace"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function SettingsModal() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const closeSettings = useUIStore((s) => s.closeSettings);
  const uiFontFamily = useUIStore((s) => s.uiFontFamily);
  const uiFontSize = useUIStore((s) => s.uiFontSize);
  const editorFontFamily = useUIStore((s) => s.editorFontFamily);
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const setUIFontFamily = useUIStore((s) => s.setUIFontFamily);
  const setUIFontSize = useUIStore((s) => s.setUIFontSize);
  const setEditorFontFamily = useUIStore((s) => s.setEditorFontFamily);
  const setEditorFontSize = useUIStore((s) => s.setEditorFontSize);
  const resetFontPrefs = useUIStore((s) => s.resetFontPrefs);

  return (
    <div className="settings-overlay" onClick={closeSettings}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span>Settings</span>
          <button onClick={closeSettings} title="Close" aria-label="Close settings">×</button>
        </div>

        <div className="settings-body">
          {/* ── Appearance ── */}
          <div className="settings-section">
            <div className="settings-section-title">Appearance</div>
            <div className="settings-row">
              <span className="settings-label">Theme</span>
              <div className="settings-control">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Editor Font ── */}
          <div className="settings-section">
            <div className="settings-section-title">Editor Font</div>
            <div className="settings-row">
              <span className="settings-label">Family</span>
              <FontFamilySelect value={editorFontFamily} onChange={setEditorFontFamily} />
            </div>
            <div className="settings-row">
              <span className="settings-label">Size</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input
                    type="range"
                    min={10}
                    max={28}
                    step={1}
                    value={editorFontSize}
                    onChange={(e) => setEditorFontSize(Number(e.target.value))}
                  />
                  <span className="settings-size-value">{editorFontSize}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Interface Font ── */}
          <div className="settings-section">
            <div className="settings-section-title">Interface Font</div>
            <div className="settings-row">
              <span className="settings-label">Family</span>
              <FontFamilySelect value={uiFontFamily} onChange={setUIFontFamily} />
            </div>
            <div className="settings-row">
              <span className="settings-label">Size</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input
                    type="range"
                    min={10}
                    max={20}
                    step={1}
                    value={uiFontSize}
                    onChange={(e) => setUIFontSize(Number(e.target.value))}
                  />
                  <span className="settings-size-value">{uiFontSize}px</span>
                </div>
              </div>
            </div>
          </div>

          <button className="settings-reset" onClick={resetFontPrefs}>
            Reset fonts to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
