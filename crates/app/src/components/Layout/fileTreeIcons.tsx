import {
  Lightbulb,
  BookOpen,
  HelpCircle,
  FileText,
  List,
  MessageSquare,
  FlaskConical,
  TestTube,
  User,
  FolderKanban,
  Folder,
  FolderOpen,
  ChevronRight,
  File,
  Globe,
  Paintbrush,
  FileCode,
  Braces,
  FileSliders,
  Table,
  Image,
  Music,
  Film,
  Archive,
  Terminal,
  Database,
  Lock,
  GitBranch,
  ScrollText,
  Pencil,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getNodeColor } from "../GraphView/graphStyles";

const NOTE_TYPE_ICONS: Record<string, LucideIcon> = {
  concept: Lightbulb,
  "book-note": BookOpen,
  question: HelpCircle,
  reference: FileText,
  index: List,
  argument: MessageSquare,
  evidence: FlaskConical,
  experiment: TestTube,
  person: User,
  project: FolderKanban,
  folder: Folder,
};

const FALLBACK_ICON: LucideIcon = File;
const FALLBACK_COLOR = "#95a5a6";

interface ExtIcon {
  icon: LucideIcon;
  color: string;
}

const FILE_EXT_ICONS: Record<string, ExtIcon> = {
  // Markdown / text
  md: { icon: FileText, color: "#6b7d8d" },
  txt: { icon: FileText, color: "#95a5a6" },
  // Documents
  pdf: { icon: FileText, color: "#e74c3c" },
  excalidraw: { icon: Pencil, color: "#6965db" },
  canvas: { icon: LayoutDashboard, color: "#10b981" },
  // Web
  html: { icon: Globe, color: "#e44d26" },
  htm: { icon: Globe, color: "#e44d26" },
  css: { icon: Paintbrush, color: "#264de4" },
  // JavaScript / TypeScript
  js: { icon: FileCode, color: "#d4a017" },
  mjs: { icon: FileCode, color: "#d4a017" },
  cjs: { icon: FileCode, color: "#d4a017" },
  jsx: { icon: FileCode, color: "#61dafb" },
  ts: { icon: FileCode, color: "#3178c6" },
  tsx: { icon: FileCode, color: "#3178c6" },
  // Data / config
  json: { icon: Braces, color: "#a8b34d" },
  yaml: { icon: FileSliders, color: "#cb171e" },
  yml: { icon: FileSliders, color: "#cb171e" },
  toml: { icon: FileSliders, color: "#9c4221" },
  xml: { icon: FileCode, color: "#f16529" },
  csv: { icon: Table, color: "#27ae60" },
  sql: { icon: Database, color: "#336791" },
  // Images
  png: { icon: Image, color: "#9b59b6" },
  jpg: { icon: Image, color: "#9b59b6" },
  jpeg: { icon: Image, color: "#9b59b6" },
  gif: { icon: Image, color: "#9b59b6" },
  svg: { icon: Image, color: "#9b59b6" },
  webp: { icon: Image, color: "#9b59b6" },
  ico: { icon: Image, color: "#9b59b6" },
  bmp: { icon: Image, color: "#9b59b6" },
  // Audio
  mp3: { icon: Music, color: "#e91e63" },
  wav: { icon: Music, color: "#e91e63" },
  ogg: { icon: Music, color: "#e91e63" },
  flac: { icon: Music, color: "#e91e63" },
  aac: { icon: Music, color: "#e91e63" },
  // Video
  mp4: { icon: Film, color: "#ff5722" },
  webm: { icon: Film, color: "#ff5722" },
  mov: { icon: Film, color: "#ff5722" },
  avi: { icon: Film, color: "#ff5722" },
  // Archives
  zip: { icon: Archive, color: "#795548" },
  tar: { icon: Archive, color: "#795548" },
  gz: { icon: Archive, color: "#795548" },
  rar: { icon: Archive, color: "#795548" },
  "7z": { icon: Archive, color: "#795548" },
  // Programming languages
  py: { icon: FileCode, color: "#3776ab" },
  rs: { icon: FileCode, color: "#dea584" },
  go: { icon: FileCode, color: "#00add8" },
  // Shell
  sh: { icon: Terminal, color: "#4eaa25" },
  bash: { icon: Terminal, color: "#4eaa25" },
  zsh: { icon: Terminal, color: "#4eaa25" },
  // Environment / secrets
  env: { icon: Lock, color: "#eab308" },
  // Logs
  log: { icon: ScrollText, color: "#6b7280" },
};

/** Dotfile names that get special icons (no extension to match on). */
const DOTFILE_ICONS: Record<string, ExtIcon> = {
  ".gitignore": { icon: GitBranch, color: "#f05032" },
  ".dockerignore": { icon: GitBranch, color: "#f05032" },
  ".env": { icon: Lock, color: "#eab308" },
  ".env.local": { icon: Lock, color: "#eab308" },
  ".env.production": { icon: Lock, color: "#eab308" },
  ".env.development": { icon: Lock, color: "#eab308" },
};

export function getExtensionIcon(fileName: string): ExtIcon {
  // Check dotfile names first
  const dotMatch = DOTFILE_ICONS[fileName];
  if (dotMatch) return dotMatch;

  // Extract extension
  const dotIdx = fileName.lastIndexOf(".");
  if (dotIdx > 0) {
    const ext = fileName.slice(dotIdx + 1).toLowerCase();
    const extMatch = FILE_EXT_ICONS[ext];
    if (extMatch) return extMatch;
  }

  return { icon: FALLBACK_ICON, color: FALLBACK_COLOR };
}

export function getIconForType(noteType: string): LucideIcon {
  return NOTE_TYPE_ICONS[noteType] ?? FALLBACK_ICON;
}

export function NoteTypeIcon({
  noteType,
  fileName,
  size = 14,
}: {
  noteType?: string;
  fileName?: string;
  size?: number;
}) {
  if (noteType) {
    const Icon = getIconForType(noteType);
    const color = getNodeColor(noteType);
    return <Icon size={size} style={{ color, flexShrink: 0 }} aria-hidden="true" />;
  }

  const { icon: Icon, color } = fileName
    ? getExtensionIcon(fileName)
    : { icon: FALLBACK_ICON, color: FALLBACK_COLOR };

  return <Icon size={size} style={{ color, flexShrink: 0 }} aria-hidden="true" />;
}

export function FolderTreeIcon({
  isOpen,
  size = 14,
}: {
  isOpen: boolean;
  size?: number;
}) {
  const Icon = isOpen ? FolderOpen : Folder;
  return (
    <Icon
      size={size}
      style={{ color: "var(--text-secondary)", flexShrink: 0 }}
      aria-hidden="true"
    />
  );
}

export function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <ChevronRight
      size={12}
      className={`tree-chevron-icon${isOpen ? " tree-chevron-icon--open" : ""}`}
      aria-hidden="true"
    />
  );
}
