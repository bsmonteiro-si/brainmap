// SVG data URI generator for Cytoscape graph node icons.
// Icon paths extracted from lucide-react v0.577.0 to match fileTreeIcons.tsx.

type SvgElement = [string, Record<string, string>];

const NOTE_TYPE_ICON_PATHS: Record<string, SvgElement[]> = {
  concept: [
    // Lightbulb
    [
      "path",
      {
        d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      },
    ],
    ["path", { d: "M9 18h6" }],
    ["path", { d: "M10 22h4" }],
  ],
  "book-note": [
    // BookOpen
    ["path", { d: "M12 7v14" }],
    [
      "path",
      {
        d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      },
    ],
  ],
  question: [
    // CircleHelp (HelpCircle)
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" }],
    ["path", { d: "M12 17h.01" }],
  ],
  reference: [
    // FileText
    [
      "path",
      {
        d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      },
    ],
    ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
    ["path", { d: "M10 9H8" }],
    ["path", { d: "M16 13H8" }],
    ["path", { d: "M16 17H8" }],
  ],
  index: [
    // List
    ["path", { d: "M3 5h.01" }],
    ["path", { d: "M3 12h.01" }],
    ["path", { d: "M3 19h.01" }],
    ["path", { d: "M8 5h13" }],
    ["path", { d: "M8 12h13" }],
    ["path", { d: "M8 19h13" }],
  ],
  argument: [
    // MessageSquare
    [
      "path",
      {
        d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
      },
    ],
  ],
  evidence: [
    // FlaskConical
    [
      "path",
      {
        d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2",
      },
    ],
    ["path", { d: "M6.453 15h11.094" }],
    ["path", { d: "M8.5 2h7" }],
  ],
  experiment: [
    // TestTube
    [
      "path",
      {
        d: "M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5c-1.4 0-2.5-1.1-2.5-2.5V2",
      },
    ],
    ["path", { d: "M8.5 2h7" }],
    ["path", { d: "M14.5 16h-5" }],
  ],
  person: [
    // User
    ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
    ["circle", { cx: "12", cy: "7", r: "4" }],
  ],
  project: [
    // FolderKanban
    [
      "path",
      {
        d: "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z",
      },
    ],
    ["path", { d: "M8 10v4" }],
    ["path", { d: "M12 10v2" }],
    ["path", { d: "M16 10v6" }],
  ],
  folder: [
    // Folder
    [
      "path",
      {
        d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      },
    ],
  ],
};

// Fallback: File icon
const FALLBACK_ICON_PATHS: SvgElement[] = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
    },
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5" }],
];

function renderSvgElement(el: SvgElement): string {
  const [tag, attrs] = el;
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<${tag} ${attrStr}/>`;
}

function buildSvgDataUri(paths: SvgElement[], strokeColor: string): string {
  const children = paths.map(renderSvgElement).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Cache computed data URIs keyed by "noteType|color"
const iconCache = new Map<string, string>();

export function getNodeIconSvg(noteType: string, color: string): string {
  const key = `${noteType}|${color}`;
  if (iconCache.has(key)) return iconCache.get(key)!;
  const paths = NOTE_TYPE_ICON_PATHS[noteType] ?? FALLBACK_ICON_PATHS;
  const uri = buildSvgDataUri(paths, color);
  iconCache.set(key, uri);
  return uri;
}

// White-stroke variant for selected nodes (inverted: white icon on colored background)
const whiteIconCache = new Map<string, string>();

export function getNodeIconSvgWhite(noteType: string): string {
  if (whiteIconCache.has(noteType)) return whiteIconCache.get(noteType)!;
  const paths = NOTE_TYPE_ICON_PATHS[noteType] ?? FALLBACK_ICON_PATHS;
  const uri = buildSvgDataUri(paths, "white");
  whiteIconCache.set(noteType, uri);
  return uri;
}
