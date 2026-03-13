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

export function getIconForType(noteType: string): LucideIcon {
  return NOTE_TYPE_ICONS[noteType] ?? FALLBACK_ICON;
}

export function NoteTypeIcon({
  noteType,
  size = 14,
}: {
  noteType?: string;
  size?: number;
}) {
  const Icon = noteType ? getIconForType(noteType) : FALLBACK_ICON;
  const color = noteType ? getNodeColor(noteType) : "#95a5a6";
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
