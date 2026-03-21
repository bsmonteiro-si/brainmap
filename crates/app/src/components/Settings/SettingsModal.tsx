import { useState, useCallback, useRef } from "react";
import { useUIStore, FONT_PRESETS, BUILTIN_TAB_SIZES, THEME_OPTIONS, THEME_BASE, SOURCE_STYLE_OPTIONS, EXAMPLE_STYLE_OPTIONS, MATH_STYLE_OPTIONS, ATTENTION_STYLE_OPTIONS, BULLET_STYLE_OPTIONS, BOLD_WEIGHT_OPTIONS, ARROW_COLOR_OPTIONS, ARROW_TYPE_LABELS, ALL_ARROW_TYPES } from "../../stores/uiStore";
import type { LeftTab, ComponentTheme, ThemeName, SourceStyle, ExampleStyle, MathStyle, AttentionStyle, BulletStyle, ArrowColorStyle, ArrowType } from "../../stores/uiStore";
import { DARK_CODE_THEMES, LIGHT_CODE_THEMES, resolveCodeTheme } from "../Editor/cmCodeHighlight";

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "layout", label: "Layout" },
  { id: "editor", label: "Editor" },
  { id: "formatting", label: "Formatting" },
  { id: "graph", label: "Graph" },
  { id: "canvas", label: "Canvas" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

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
  const [activeSection, setActiveSection] = useState<SectionId>("general");

  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const closeSettings = useUIStore((s) => s.closeSettings);
  const settingsSize = useUIStore((s) => s.settingsSize);
  const setSettingsSize = useUIStore((s) => s.setSettingsSize);
  const filesTheme = useUIStore((s) => s.filesTheme);
  const editorTheme = useUIStore((s) => s.editorTheme);
  const excalidrawTheme = useUIStore((s) => s.excalidrawTheme);
  const canvasTheme = useUIStore((s) => s.canvasTheme);
  const canvasShowDots = useUIStore((s) => s.canvasShowDots);
  const canvasDotOpacity = useUIStore((s) => s.canvasDotOpacity);
  const canvasArrowSize = useUIStore((s) => s.canvasArrowSize);
  const canvasCardBgOpacity = useUIStore((s) => s.canvasCardBgOpacity);
  const canvasCalloutTailSize = useUIStore((s) => s.canvasCalloutTailSize);
  const canvasStickyRotation = useUIStore((s) => s.canvasStickyRotation);
  const canvasRoundedRadius = useUIStore((s) => s.canvasRoundedRadius);
  const canvasPanelFontFamily = useUIStore((s) => s.canvasPanelFontFamily);
  const canvasPanelFontSize = useUIStore((s) => s.canvasPanelFontSize);
  const setFilesTheme = useUIStore((s) => s.setFilesTheme);
  const setEditorTheme = useUIStore((s) => s.setEditorTheme);
  const setExcalidrawTheme = useUIStore((s) => s.setExcalidrawTheme);
  const setCanvasTheme = useUIStore((s) => s.setCanvasTheme);
  const setCanvasShowDots = useUIStore((s) => s.setCanvasShowDots);
  const setCanvasDotOpacity = useUIStore((s) => s.setCanvasDotOpacity);
  const setCanvasArrowSize = useUIStore((s) => s.setCanvasArrowSize);
  const setCanvasCardBgOpacity = useUIStore((s) => s.setCanvasCardBgOpacity);
  const setCanvasCalloutTailSize = useUIStore((s) => s.setCanvasCalloutTailSize);
  const setCanvasStickyRotation = useUIStore((s) => s.setCanvasStickyRotation);
  const setCanvasRoundedRadius = useUIStore((s) => s.setCanvasRoundedRadius);
  const setCanvasPanelFontFamily = useUIStore((s) => s.setCanvasPanelFontFamily);
  const setCanvasPanelFontSize = useUIStore((s) => s.setCanvasPanelFontSize);
  const codeTheme = useUIStore((s) => s.codeTheme);
  const setCodeTheme = useUIStore((s) => s.setCodeTheme);
  const effectiveEditorTheme = useUIStore((s) => s.effectiveEditorTheme);
  const editorIsDark = THEME_BASE[effectiveEditorTheme] === "dark";
  const codeThemeOptions = editorIsDark ? DARK_CODE_THEMES : LIGHT_CODE_THEMES;
  const resolvedCodeTheme = resolveCodeTheme(codeTheme, editorIsDark);
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
  const boldWeight = useUIStore((s) => s.boldWeight);
  const setBoldWeight = useUIStore((s) => s.setBoldWeight);
  const boldTint = useUIStore((s) => s.boldTint);
  const setBoldTint = useUIStore((s) => s.setBoldTint);
  const italicTint = useUIStore((s) => s.italicTint);
  const setItalicTint = useUIStore((s) => s.setItalicTint);
  const arrowLigatures = useUIStore((s) => s.arrowLigatures);
  const setArrowLigatures = useUIStore((s) => s.setArrowLigatures);
  const arrowEnabledTypes = useUIStore((s) => s.arrowEnabledTypes);
  const toggleArrowType = useUIStore((s) => s.toggleArrowType);
  const arrowColor = useUIStore((s) => s.arrowColor);
  const setArrowColor = useUIStore((s) => s.setArrowColor);
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

  const dragRef = useRef<{ startX: number; startY: number; startW: number; startH: number; mode: "right" | "bottom" | "corner" } | null>(null);

  const onResizeStart = useCallback((e: React.MouseEvent, mode: "right" | "bottom" | "corner") => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = settingsSize.width;
    const startH = settingsSize.height;
    dragRef.current = { startX, startY, startW, startH, mode };

    const onMouseMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      let w = d.startW;
      let h = d.startH;
      if (d.mode === "right" || d.mode === "corner") {
        w = Math.max(400, Math.min(window.innerWidth * 0.9, d.startW + (ev.clientX - d.startX) * 2));
      }
      if (d.mode === "bottom" || d.mode === "corner") {
        h = Math.max(300, Math.min(window.innerHeight * 0.9, d.startH + (ev.clientY - d.startY) * 2));
      }
      setSettingsSize({ width: w, height: h });
    };

    const onMouseUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [settingsSize, setSettingsSize]);

  const renderGeneral = () => (
    <>
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
        <div className="settings-row">
          <span className="settings-label">Code Theme</span>
          <div className="settings-control">
            <select
              value={resolvedCodeTheme}
              onChange={(e) => setCodeTheme(e.target.value)}
            >
              {codeThemeOptions.map((t) => (
                <option key={t.label} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Excalidraw</span>
          <div className="settings-control">
            <select
              value={excalidrawTheme}
              onChange={(e) => setExcalidrawTheme(e.target.value as "light" | "dark")}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
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
    </>
  );

  const renderLayout = () => (
    <>
      {/* ── Panel Layout ── */}
      <div className="settings-section">
        <div className="settings-section-title">Panel Layout</div>
        {(["files", "graph", "search", "canvas"] as LeftTab[]).map((tab) => (
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
    </>
  );

  const renderEditor = () => (
    <>
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

      <div className="settings-section">
        <div className="settings-section-title">Text Style</div>
        <div className="settings-row">
          <span className="settings-label">Bold weight</span>
          <div className="settings-control">
            <select
              value={boldWeight}
              onChange={(e) => setBoldWeight(Number(e.target.value))}
            >
              {BOLD_WEIGHT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Bold accent tint</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={boldTint}
                onChange={(e) => setBoldTint(Number(e.target.value))}
              />
              <span className="settings-size-value">{boldTint}%</span>
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Italic accent tint</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={italicTint}
                onChange={(e) => setItalicTint(Number(e.target.value))}
              />
              <span className="settings-size-value">{italicTint}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderFormatting = () => (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Citations</div>
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
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Lists</div>
        <div className="settings-row">
          <span className="settings-label">Bullet style</span>
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
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Arrows</div>
        <div className="settings-row" style={{ alignItems: "center" }}>
          <span className="settings-label">Arrow ligatures</span>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              checked={arrowLigatures}
              onChange={(e) => setArrowLigatures(e.target.checked)}
            />
            Replace ASCII arrows with Unicode
          </label>
        </div>
        {arrowLigatures && (
          <>
            <div className="settings-row">
              <span className="settings-label">Arrow types</span>
              <div className="settings-control" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {ALL_ARROW_TYPES.map((t) => (
                  <label key={t} className="settings-checkbox-label">
                    <input
                      type="checkbox"
                      checked={arrowEnabledTypes.includes(t)}
                      onChange={() => toggleArrowType(t)}
                    />
                    {ARROW_TYPE_LABELS[t]}
                  </label>
                ))}
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label">Arrow color</span>
              <div className="settings-control">
                <select
                  value={arrowColor}
                  onChange={(e) => setArrowColor(e.target.value as ArrowColorStyle)}
                >
                  {ARROW_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
      </div>

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
    </>
  );

  const renderGraph = () => (
    <>
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
    </>
  );

  const renderCanvas = () => (
    <>
      <div className="settings-section">
        <div className="settings-section-title">Theme</div>
        <div className="settings-row">
          <span className="settings-label">Canvas theme</span>
          <div className="settings-control">
            <select
              value={canvasTheme}
              onChange={(e) => setCanvasTheme(e.target.value as "light" | "dark")}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Grid</div>
        <div className="settings-row" style={{ alignItems: "center" }}>
          <span className="settings-label">Grid dots</span>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              checked={canvasShowDots}
              onChange={(e) => setCanvasShowDots(e.target.checked)}
            />
            Show grid dots
          </label>
        </div>
        {canvasShowDots && (
          <div className="settings-row">
            <span className="settings-label">Dot intensity</span>
            <div className="settings-control">
              <div className="settings-size-row">
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={10}
                  value={canvasDotOpacity}
                  onChange={(e) => setCanvasDotOpacity(Number(e.target.value))}
                />
                <span className="settings-size-value">{canvasDotOpacity}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Edges</div>
        <div className="settings-row">
          <span className="settings-label">Arrow size</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={canvasArrowSize}
                onChange={(e) => setCanvasArrowSize(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasArrowSize}px</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Cards</div>
        <div className="settings-row">
          <span className="settings-label">Fill opacity</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={canvasCardBgOpacity}
                onChange={(e) => setCanvasCardBgOpacity(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasCardBgOpacity}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Shapes</div>
        <div className="settings-row">
          <span className="settings-label">Callout tail</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={8}
                max={30}
                step={2}
                value={canvasCalloutTailSize}
                onChange={(e) => setCanvasCalloutTailSize(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasCalloutTailSize}px</span>
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Sticky rotation</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={canvasStickyRotation}
                onChange={(e) => setCanvasStickyRotation(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasStickyRotation}°</span>
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Rounded radius</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={6}
                max={50}
                step={2}
                value={canvasRoundedRadius}
                onChange={(e) => setCanvasRoundedRadius(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasRoundedRadius}px</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Panel Font</div>
        <div className="settings-row">
          <span className="settings-label">Family</span>
          <FontFamilySelect value={canvasPanelFontFamily} onChange={setCanvasPanelFontFamily} />
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
                value={canvasPanelFontSize}
                onChange={(e) => setCanvasPanelFontSize(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasPanelFontSize}px</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "general": return renderGeneral();
      case "layout": return renderLayout();
      case "editor": return renderEditor();
      case "formatting": return renderFormatting();
      case "graph": return renderGraph();
      case "canvas": return renderCanvas();
    }
  };

  return (
    <div className="settings-overlay" onClick={closeSettings}>
      <div
        className="settings-modal"
        style={{ width: settingsSize.width, height: settingsSize.height }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <span>Settings</span>
          <button onClick={closeSettings} title="Close" aria-label="Close settings">×</button>
        </div>

        <div className="settings-layout">
          <nav className="settings-sidebar">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className={`settings-sidebar-item${activeSection === s.id ? " active" : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="settings-body">
            {renderContent()}
          </div>
        </div>

        <div className="settings-resize-handle right" onMouseDown={(e) => onResizeStart(e, "right")} />
        <div className="settings-resize-handle bottom" onMouseDown={(e) => onResizeStart(e, "bottom")} />
        <div className="settings-resize-handle corner" onMouseDown={(e) => onResizeStart(e, "corner")} />
      </div>
    </div>
  );
}
