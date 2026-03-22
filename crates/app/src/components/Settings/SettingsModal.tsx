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
  const settingsPosition = useUIStore((s) => s.settingsPosition);
  const setSettingsPosition = useUIStore((s) => s.setSettingsPosition);
  const filesTheme = useUIStore((s) => s.filesTheme);
  const editorTheme = useUIStore((s) => s.editorTheme);
  const excalidrawTheme = useUIStore((s) => s.excalidrawTheme);
  const canvasTheme = useUIStore((s) => s.canvasTheme);
  const canvasDotOpacity = useUIStore((s) => s.canvasDotOpacity);
  const canvasArrowSize = useUIStore((s) => s.canvasArrowSize);
  const canvasEdgeWidth = useUIStore((s) => s.canvasEdgeWidth);
  const canvasCardBgOpacity = useUIStore((s) => s.canvasCardBgOpacity);
  const canvasDefaultCardWidth = useUIStore((s) => s.canvasDefaultCardWidth);
  const canvasDefaultCardHeight = useUIStore((s) => s.canvasDefaultCardHeight);
  const canvasCalloutTailSize = useUIStore((s) => s.canvasCalloutTailSize);
  const canvasStickyRotation = useUIStore((s) => s.canvasStickyRotation);
  const canvasStickyColor = useUIStore((s) => s.canvasStickyColor);
  const canvasStickyShadow = useUIStore((s) => s.canvasStickyShadow);
  const canvasStickyFoldSize = useUIStore((s) => s.canvasStickyFoldSize);
  const canvasStickyPin = useUIStore((s) => s.canvasStickyPin);
  const canvasStickyTape = useUIStore((s) => s.canvasStickyTape);
  const canvasStickyLines = useUIStore((s) => s.canvasStickyLines);
  const canvasStickyCurl = useUIStore((s) => s.canvasStickyCurl);
  const canvasStickyStripe = useUIStore((s) => s.canvasStickyStripe);
  const canvasRoundedRadius = useUIStore((s) => s.canvasRoundedRadius);
  const canvasPanelFontFamily = useUIStore((s) => s.canvasPanelFontFamily);
  const canvasPanelFontSize = useUIStore((s) => s.canvasPanelFontSize);
  const setFilesTheme = useUIStore((s) => s.setFilesTheme);
  const setEditorTheme = useUIStore((s) => s.setEditorTheme);
  const setExcalidrawTheme = useUIStore((s) => s.setExcalidrawTheme);
  const setCanvasTheme = useUIStore((s) => s.setCanvasTheme);
  const setCanvasDotOpacity = useUIStore((s) => s.setCanvasDotOpacity);
  const setCanvasArrowSize = useUIStore((s) => s.setCanvasArrowSize);
  const setCanvasEdgeWidth = useUIStore((s) => s.setCanvasEdgeWidth);
  const setCanvasCardBgOpacity = useUIStore((s) => s.setCanvasCardBgOpacity);
  const setCanvasDefaultCardWidth = useUIStore((s) => s.setCanvasDefaultCardWidth);
  const setCanvasDefaultCardHeight = useUIStore((s) => s.setCanvasDefaultCardHeight);
  const setCanvasCalloutTailSize = useUIStore((s) => s.setCanvasCalloutTailSize);
  const setCanvasStickyRotation = useUIStore((s) => s.setCanvasStickyRotation);
  const setCanvasStickyColor = useUIStore((s) => s.setCanvasStickyColor);
  const setCanvasStickyShadow = useUIStore((s) => s.setCanvasStickyShadow);
  const setCanvasStickyFoldSize = useUIStore((s) => s.setCanvasStickyFoldSize);
  const setCanvasStickyPin = useUIStore((s) => s.setCanvasStickyPin);
  const setCanvasStickyTape = useUIStore((s) => s.setCanvasStickyTape);
  const setCanvasStickyLines = useUIStore((s) => s.setCanvasStickyLines);
  const setCanvasStickyCurl = useUIStore((s) => s.setCanvasStickyCurl);
  const setCanvasStickyStripe = useUIStore((s) => s.setCanvasStickyStripe);
  const setCanvasRoundedRadius = useUIStore((s) => s.setCanvasRoundedRadius);
  const canvasGroupFontFamily = useUIStore((s) => s.canvasGroupFontFamily);
  const canvasGroupFontSize = useUIStore((s) => s.canvasGroupFontSize);
  const setCanvasGroupFontFamily = useUIStore((s) => s.setCanvasGroupFontFamily);
  const setCanvasGroupFontSize = useUIStore((s) => s.setCanvasGroupFontSize);
  const canvasSelectionColor = useUIStore((s) => s.canvasSelectionColor);
  const canvasSelectionWidth = useUIStore((s) => s.canvasSelectionWidth);
  const setCanvasSelectionColor = useUIStore((s) => s.setCanvasSelectionColor);
  const setCanvasSelectionWidth = useUIStore((s) => s.setCanvasSelectionWidth);
  const setCanvasPanelFontFamily = useUIStore((s) => s.setCanvasPanelFontFamily);
  const setCanvasPanelFontSize = useUIStore((s) => s.setCanvasPanelFontSize);
  const canvasShowMinimap = useUIStore((s) => s.canvasShowMinimap);
  const setCanvasShowMinimap = useUIStore((s) => s.setCanvasShowMinimap);
  const canvasSnapToGrid = useUIStore((s) => s.canvasSnapToGrid);
  const setCanvasSnapToGrid = useUIStore((s) => s.setCanvasSnapToGrid);
  const canvasSnapGridSize = useUIStore((s) => s.canvasSnapGridSize);
  const setCanvasSnapGridSize = useUIStore((s) => s.setCanvasSnapGridSize);
  const canvasBackgroundVariant = useUIStore((s) => s.canvasBackgroundVariant);
  const setCanvasBackgroundVariant = useUIStore((s) => s.setCanvasBackgroundVariant);
  const canvasNodeShadow = useUIStore((s) => s.canvasNodeShadow);
  const setCanvasNodeShadow = useUIStore((s) => s.setCanvasNodeShadow);
  const canvasDefaultEdgeType = useUIStore((s) => s.canvasDefaultEdgeType);
  const setCanvasDefaultEdgeType = useUIStore((s) => s.setCanvasDefaultEdgeType);
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
  const moveRef = useRef<{ startX: number; startY: number; startLeft: number; startTop: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const onResizeStart = useCallback((e: React.MouseEvent, mode: "right" | "bottom" | "corner") => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = settingsSize.width;
    const startH = settingsSize.height;
    dragRef.current = { startX, startY, startW, startH, mode };
    const positioned = useUIStore.getState().settingsPosition != null;

    const onMouseMove = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      let w = d.startW;
      let h = d.startH;
      const factor = positioned ? 1 : 2;
      if (d.mode === "right" || d.mode === "corner") {
        w = Math.max(400, Math.min(window.innerWidth * 0.9, d.startW + (ev.clientX - d.startX) * factor));
      }
      if (d.mode === "bottom" || d.mode === "corner") {
        h = Math.max(300, Math.min(window.innerHeight * 0.9, d.startH + (ev.clientY - d.startY) * factor));
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

  const onMoveStart = useCallback((e: React.MouseEvent) => {
    // Only drag on left mouse button, ignore clicks on the close button
    if (e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startLeft = rect.left;
    const startTop = rect.top;
    moveRef.current = { startX: e.clientX, startY: e.clientY, startLeft, startTop };
    setDragging(true);

    const onMouseMove = (ev: MouseEvent) => {
      const m = moveRef.current;
      if (!m) return;
      const x = Math.max(0, Math.min(window.innerWidth - 100, m.startLeft + (ev.clientX - m.startX)));
      const y = Math.max(0, Math.min(window.innerHeight - 50, m.startTop + (ev.clientY - m.startY)));
      setSettingsPosition({ x, y });
    };

    const onMouseUp = () => {
      moveRef.current = null;
      setDragging(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [setSettingsPosition]);

  const onHeaderDoubleClick = useCallback(() => {
    setSettingsPosition(null);
  }, [setSettingsPosition]);

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
        <div className="settings-section-title">Grid & Background</div>
        <div className="settings-row">
          <span className="settings-label">Background</span>
          <div className="settings-control">
            <select
              value={canvasBackgroundVariant}
              onChange={(e) => setCanvasBackgroundVariant(e.target.value)}
            >
              <option value="dots">Dots</option>
              <option value="lines">Lines</option>
              <option value="cross">Cross</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
        {canvasBackgroundVariant !== "none" && (
          <div className="settings-row">
            <span className="settings-label">Pattern intensity</span>
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
        <div className="settings-row" style={{ alignItems: "center" }}>
          <span className="settings-label">Snap to grid</span>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              checked={canvasSnapToGrid}
              onChange={(e) => setCanvasSnapToGrid(e.target.checked)}
            />
            Snap nodes to grid
          </label>
        </div>
        {canvasSnapToGrid && (
          <div className="settings-row">
            <span className="settings-label">Grid size</span>
            <div className="settings-control">
              <div className="settings-size-row">
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={canvasSnapGridSize}
                  onChange={(e) => setCanvasSnapGridSize(Number(e.target.value))}
                />
                <span className="settings-size-value">{canvasSnapGridSize}px</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Display</div>
        <div className="settings-row" style={{ alignItems: "center" }}>
          <span className="settings-label">Minimap</span>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              checked={canvasShowMinimap}
              onChange={(e) => setCanvasShowMinimap(e.target.checked)}
            />
            Show minimap
          </label>
        </div>
        <div className="settings-row">
          <span className="settings-label">Node shadow</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={canvasNodeShadow}
                onChange={(e) => setCanvasNodeShadow(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasNodeShadow === 0 ? "Off" : `${canvasNodeShadow}px`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Edges</div>
        <div className="settings-row">
          <span className="settings-label">Default style</span>
          <div className="settings-control">
            <select
              value={canvasDefaultEdgeType}
              onChange={(e) => setCanvasDefaultEdgeType(e.target.value)}
            >
              <option value="bezier">Bezier (curved)</option>
              <option value="straight">Straight</option>
              <option value="step">Step (elbow)</option>
            </select>
          </div>
        </div>
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
        <div className="settings-row">
          <span className="settings-label">Edge width</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={canvasEdgeWidth}
                onChange={(e) => setCanvasEdgeWidth(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasEdgeWidth}px</span>
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
        <div className="settings-row">
          <span className="settings-label">Default width</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={100}
                max={500}
                step={10}
                value={canvasDefaultCardWidth}
                onChange={(e) => setCanvasDefaultCardWidth(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasDefaultCardWidth}px</span>
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Default height</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={50}
                max={400}
                step={10}
                value={canvasDefaultCardHeight}
                onChange={(e) => setCanvasDefaultCardHeight(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasDefaultCardHeight}px</span>
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
          <span className="settings-label">Sticky color</span>
          <div className="settings-control">
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { color: "#fef3c7", label: "Yellow" },
                { color: "#fce4ec", label: "Pink" },
                { color: "#e3f2fd", label: "Blue" },
                { color: "#e8f5e9", label: "Green" },
                { color: "#fff3e0", label: "Orange" },
              ].map((c) => (
                <button
                  key={c.color}
                  className={`canvas-color-swatch${canvasStickyColor === c.color ? " canvas-color-swatch--selected" : ""}`}
                  style={{ backgroundColor: c.color, width: 24, height: 24, border: canvasStickyColor === c.color ? "2px solid var(--accent)" : "1px solid var(--border-color)", borderRadius: 4, cursor: "pointer" }}
                  title={c.label}
                  onClick={() => setCanvasStickyColor(c.color)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Sticky shadow</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={canvasStickyShadow}
                onChange={(e) => setCanvasStickyShadow(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasStickyShadow}px</span>
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Sticky fold</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={40}
                step={2}
                value={canvasStickyFoldSize}
                onChange={(e) => setCanvasStickyFoldSize(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasStickyFoldSize}px</span>
            </div>
          </div>
        </div>
        <div className="settings-row" style={{ alignItems: "center" }}>
          <span className="settings-label">Sticky pin</span>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              checked={canvasStickyPin}
              onChange={(e) => setCanvasStickyPin(e.target.checked)}
            />
            Show pushpin
          </label>
        </div>
        <div className="settings-row" style={{ alignItems: "center" }}>
          <span className="settings-label">Tape strip</span>
          <label className="settings-checkbox-label">
            <input
              type="checkbox"
              checked={canvasStickyTape}
              onChange={(e) => setCanvasStickyTape(e.target.checked)}
            />
            Show tape
          </label>
        </div>
        <div className="settings-row">
          <span className="settings-label">Paper lines</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                value={canvasStickyLines}
                onChange={(e) => setCanvasStickyLines(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasStickyLines === 0 ? "Off" : canvasStickyLines}</span>
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Bottom curl</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={15}
                step={1}
                value={canvasStickyCurl}
                onChange={(e) => setCanvasStickyCurl(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasStickyCurl === 0 ? "Off" : `${canvasStickyCurl}px`}</span>
            </div>
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Top stripe</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={0}
                max={16}
                step={1}
                value={canvasStickyStripe}
                onChange={(e) => setCanvasStickyStripe(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasStickyStripe === 0 ? "Off" : `${canvasStickyStripe}px`}</span>
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
        <div className="settings-section-title">Group Label</div>
        <div className="settings-row">
          <span className="settings-label">Family</span>
          <FontFamilySelect value={canvasGroupFontFamily} onChange={setCanvasGroupFontFamily} />
        </div>
        <div className="settings-row">
          <span className="settings-label">Size</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={10}
                max={24}
                step={1}
                value={canvasGroupFontSize}
                onChange={(e) => setCanvasGroupFontSize(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasGroupFontSize}px</span>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Selection</div>
        <div className="settings-row">
          <span className="settings-label">Color</span>
          <div className="settings-control">
            <input
              type="color"
              value={canvasSelectionColor}
              onChange={(e) => setCanvasSelectionColor(e.target.value)}
            />
          </div>
        </div>
        <div className="settings-row">
          <span className="settings-label">Border width</span>
          <div className="settings-control">
            <div className="settings-size-row">
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={canvasSelectionWidth}
                onChange={(e) => setCanvasSelectionWidth(Number(e.target.value))}
              />
              <span className="settings-size-value">{canvasSelectionWidth}px</span>
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
    <div className={`settings-overlay${settingsPosition ? " positioned" : ""}`} onClick={closeSettings}>
      <div
        ref={modalRef}
        className="settings-modal"
        style={{
          width: settingsSize.width,
          height: settingsSize.height,
          ...(settingsPosition ? { position: "fixed", left: settingsPosition.x, top: settingsPosition.y } : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`settings-header${dragging ? " dragging" : ""}`}
          onMouseDown={onMoveStart}
          onDoubleClick={onHeaderDoubleClick}
        >
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
