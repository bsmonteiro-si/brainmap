import { useUIStore, FONT_PRESETS, BUILTIN_TAB_SIZES, THEME_OPTIONS, SOURCE_STYLE_OPTIONS, EXAMPLE_STYLE_OPTIONS, MATH_STYLE_OPTIONS, ATTENTION_STYLE_OPTIONS, BULLET_STYLE_OPTIONS } from "../../stores/uiStore";
import type { LeftTab, ComponentTheme, ThemeName, SourceStyle, ExampleStyle, MathStyle, AttentionStyle, BulletStyle } from "../../stores/uiStore";

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
  const filesTheme = useUIStore((s) => s.filesTheme);
  const editorTheme = useUIStore((s) => s.editorTheme);
  const setFilesTheme = useUIStore((s) => s.setFilesTheme);
  const setEditorTheme = useUIStore((s) => s.setEditorTheme);
  const uiFontFamily = useUIStore((s) => s.uiFontFamily);
  const uiFontSize = useUIStore((s) => s.uiFontSize);
  const editorFontFamily = useUIStore((s) => s.editorFontFamily);
  const editorFontSize = useUIStore((s) => s.editorFontSize);
  const setUIFontFamily = useUIStore((s) => s.setUIFontFamily);
  const setUIFontSize = useUIStore((s) => s.setUIFontSize);
  const setEditorFontFamily = useUIStore((s) => s.setEditorFontFamily);
  const setEditorFontSize = useUIStore((s) => s.setEditorFontSize);
  const showLineNumbers = useUIStore((s) => s.showLineNumbers);
  const setEditorLineNumbersDefault = useUIStore((s) => s.setEditorLineNumbersDefault);
  const sourceStyle = useUIStore((s) => s.sourceStyle);
  const setSourceStyle = useUIStore((s) => s.setSourceStyle);
  const exampleStyle = useUIStore((s) => s.exampleStyle);
  const setExampleStyle = useUIStore((s) => s.setExampleStyle);
  const attentionStyle = useUIStore((s) => s.attentionStyle);
  const setAttentionStyle = useUIStore((s) => s.setAttentionStyle);
  const mathStyle = useUIStore((s) => s.mathStyle);
  const setMathStyle = useUIStore((s) => s.setMathStyle);
  const bulletStyle = useUIStore((s) => s.bulletStyle);
  const setBulletStyle = useUIStore((s) => s.setBulletStyle);
  const lineWrapping = useUIStore((s) => s.lineWrapping);
  const setLineWrapping = useUIStore((s) => s.setLineWrapping);
  const spellCheck = useUIStore((s) => s.spellCheck);
  const setSpellCheck = useUIStore((s) => s.setSpellCheck);
  const editorIndentSize = useUIStore((s) => s.editorIndentSize);
  const setEditorIndentSize = useUIStore((s) => s.setEditorIndentSize);
  const mermaidMaxHeight = useUIStore((s) => s.mermaidMaxHeight);
  const setMermaidMaxHeight = useUIStore((s) => s.setMermaidMaxHeight);
  const resetFontPrefs = useUIStore((s) => s.resetFontPrefs);
  const tooltipFontSize = useUIStore((s) => s.tooltipFontSize);
  const tooltipPillSize = useUIStore((s) => s.tooltipPillSize);
  const tooltipConnectionsSize = useUIStore((s) => s.tooltipConnectionsSize);
  const tooltipSummarySize = useUIStore((s) => s.tooltipSummarySize);
  const tooltipTagSize = useUIStore((s) => s.tooltipTagSize);
  const setTooltipFontSize = useUIStore((s) => s.setTooltipFontSize);
  const setTooltipPillSize = useUIStore((s) => s.setTooltipPillSize);
  const setTooltipConnectionsSize = useUIStore((s) => s.setTooltipConnectionsSize);
  const setTooltipSummarySize = useUIStore((s) => s.setTooltipSummarySize);
  const setTooltipTagSize = useUIStore((s) => s.setTooltipTagSize);
  const resetTooltipPrefs = useUIStore((s) => s.resetTooltipPrefs);
  const nodeLabelSize = useUIStore((s) => s.nodeLabelSize);
  const nodeIconSize = useUIStore((s) => s.nodeIconSize);
  const nodeLabelBgPadding = useUIStore((s) => s.nodeLabelBgPadding);
  const setNodeOverallSize = useUIStore((s) => s.setNodeOverallSize);
  const setNodeLabelSize = useUIStore((s) => s.setNodeLabelSize);
  const setNodeLabelBgPadding = useUIStore((s) => s.setNodeLabelBgPadding);
  const edgeLabelSize = useUIStore((s) => s.edgeLabelSize);
  const setEdgeLabelSize = useUIStore((s) => s.setEdgeLabelSize);
  const resetNodePrefs = useUIStore((s) => s.resetNodePrefs);
  const setDefaultTabSize = useUIStore((s) => s.setDefaultTabSize);
  const resetLayoutPrefs = useUIStore((s) => s.resetLayoutPrefs);
  const panelSizes = useUIStore((s) => s.panelSizes);
  const autoRevealFile = useUIStore((s) => s.autoRevealFile);
  const setAutoRevealFile = useUIStore((s) => s.setAutoRevealFile);

  const getContentSize = (tab: LeftTab) =>
    panelSizes[tab]?.content ?? BUILTIN_TAB_SIZES[tab].content;

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
                  onChange={(e) => setTheme(e.target.value as ThemeName | "system")}
                >
                  <option value="system">System</option>
                  {THEME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Files Panel</span>
              <div className="settings-control">
                <select
                  value={filesTheme}
                  onChange={(e) => setFilesTheme(e.target.value as ComponentTheme)}
                >
                  <option value="inherit">Inherit</option>
                  {THEME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Editor Panel</span>
              <div className="settings-control">
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value as ComponentTheme)}
                >
                  <option value="inherit">Inherit</option>
                  {THEME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Layout ── */}
          <div className="settings-section">
            <div className="settings-section-title">Panel Layout</div>
            {(["files", "graph", "search"] as LeftTab[]).map((tab) => (
              <div className="settings-row" key={tab}>
                <span className="settings-label" style={{ textTransform: "capitalize" }}>{tab}</span>
                <div className="settings-control">
                  <div className="settings-size-row">
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={5}
                      value={getContentSize(tab)}
                      onChange={(e) => setDefaultTabSize(tab, Number(e.target.value))}
                    />
                    <span className="settings-size-value">{getContentSize(tab)}% / {100 - getContentSize(tab)}%</span>
                  </div>
                </div>
              </div>
            ))}
            <button className="settings-reset" onClick={resetLayoutPrefs}>
              Reset layout to defaults
            </button>
          </div>

          {/* ── Files Panel ── */}
          <div className="settings-section">
            <div className="settings-section-title">Files Panel</div>
            <div className="settings-row" style={{ alignItems: "center" }}>
              <span className="settings-label">Auto-reveal</span>
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  checked={autoRevealFile}
                  onChange={(e) => setAutoRevealFile(e.target.checked)}
                />
                Reveal active file in tree
              </label>
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
            <div className="settings-row" style={{ alignItems: "center" }}>
              <span className="settings-label">Line numbers</span>
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setEditorLineNumbersDefault(e.target.checked)}
                />
                Show by default
              </label>
            </div>
            <div className="settings-row">
              <span className="settings-label">Source citations</span>
              <div className="settings-control">
                <select
                  value={sourceStyle}
                  onChange={(e) => setSourceStyle(e.target.value as SourceStyle)}
                >
                  {SOURCE_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Example citations</span>
              <div className="settings-control">
                <select
                  value={exampleStyle}
                  onChange={(e) => setExampleStyle(e.target.value as ExampleStyle)}
                >
                  {EXAMPLE_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Math citations</span>
              <div className="settings-control">
                <select
                  value={mathStyle}
                  onChange={(e) => setMathStyle(e.target.value as MathStyle)}
                >
                  {MATH_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Attention citations</span>
              <div className="settings-control">
                <select
                  value={attentionStyle}
                  onChange={(e) => setAttentionStyle(e.target.value as AttentionStyle)}
                >
                  {ATTENTION_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">List bullet style</span>
              <div className="settings-control">
                <select
                  value={bulletStyle}
                  onChange={(e) => setBulletStyle(e.target.value as BulletStyle)}
                >
                  {BULLET_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="settings-row" style={{ alignItems: "center" }}>
              <span className="settings-label">Line wrapping</span>
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  checked={lineWrapping}
                  onChange={(e) => setLineWrapping(e.target.checked)}
                />
                Wrap long lines
              </label>
            </div>
            <div className="settings-row" style={{ alignItems: "center" }}>
              <span className="settings-label">Spell check</span>
              <label className="settings-checkbox-label">
                <input
                  type="checkbox"
                  checked={spellCheck}
                  onChange={(e) => setSpellCheck(e.target.checked)}
                />
                Enable spell checking
              </label>
            </div>
            <div className="settings-row">
              <span className="settings-label">Indent size</span>
              <div className="settings-control">
                <select
                  value={editorIndentSize}
                  onChange={(e) => setEditorIndentSize(Number(e.target.value))}
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Mermaid Diagrams ── */}
          <div className="settings-section">
            <div className="settings-section-title">Mermaid Diagrams</div>
            <div className="settings-row">
              <span className="settings-label">Max height</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input
                    type="range"
                    min={150}
                    max={800}
                    step={50}
                    value={mermaidMaxHeight}
                    onChange={(e) => setMermaidMaxHeight(Number(e.target.value))}
                  />
                  <span className="settings-size-value">{mermaidMaxHeight}px</span>
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

          {/* ── Graph Nodes ── */}
          <div className="settings-section">
            <div className="settings-section-title">Graph Nodes</div>
            <div className="settings-row">
              <span className="settings-label">Overall</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={8} max={40} step={1} value={nodeIconSize} onChange={(e) => setNodeOverallSize(Number(e.target.value))} />
                  <span className="settings-size-value">{nodeIconSize}px</span>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Label size</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={6} max={24} step={1} value={nodeLabelSize} onChange={(e) => setNodeLabelSize(Number(e.target.value))} />
                  <span className="settings-size-value">{nodeLabelSize}px</span>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Label padding</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={0} max={12} step={1} value={nodeLabelBgPadding} onChange={(e) => setNodeLabelBgPadding(Number(e.target.value))} />
                  <span className="settings-size-value">{nodeLabelBgPadding}px</span>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Edge labels</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={4} max={16} step={1} value={edgeLabelSize} onChange={(e) => setEdgeLabelSize(Number(e.target.value))} />
                  <span className="settings-size-value">{edgeLabelSize}px</span>
                </div>
              </div>
            </div>
            <button className="settings-reset" onClick={resetNodePrefs}>
              Reset node defaults
            </button>
          </div>

          {/* ── Graph Tooltip ── */}
          <div className="settings-section">
            <div className="settings-section-title">Graph Tooltip</div>
            <div className="settings-row">
              <span className="settings-label">Overall</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={10} max={28} step={1} value={tooltipFontSize} onChange={(e) => setTooltipFontSize(Number(e.target.value))} />
                  <span className="settings-size-value">{tooltipFontSize}px</span>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Type pill</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={8} max={24} step={1} value={tooltipPillSize} onChange={(e) => setTooltipPillSize(Number(e.target.value))} />
                  <span className="settings-size-value">{tooltipPillSize}px</span>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Links</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={8} max={24} step={1} value={tooltipConnectionsSize} onChange={(e) => setTooltipConnectionsSize(Number(e.target.value))} />
                  <span className="settings-size-value">{tooltipConnectionsSize}px</span>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Summary</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={8} max={24} step={1} value={tooltipSummarySize} onChange={(e) => setTooltipSummarySize(Number(e.target.value))} />
                  <span className="settings-size-value">{tooltipSummarySize}px</span>
                </div>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Tags</span>
              <div className="settings-control">
                <div className="settings-size-row">
                  <input type="range" min={8} max={24} step={1} value={tooltipTagSize} onChange={(e) => setTooltipTagSize(Number(e.target.value))} />
                  <span className="settings-size-value">{tooltipTagSize}px</span>
                </div>
              </div>
            </div>
            <button className="settings-reset" onClick={resetTooltipPrefs}>
              Reset tooltip to defaults
            </button>
          </div>

          <button className="settings-reset" onClick={resetFontPrefs}>
            Reset fonts to defaults
          </button>
        </div>
      </div>
    </div>
  );
}
