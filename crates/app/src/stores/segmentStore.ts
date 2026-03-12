import { create } from "zustand";

export interface Segment {
  id: string;           // crypto.randomUUID() at creation
  name: string;         // user-defined label
  path: string;         // absolute folder path, no trailing slash
  lastOpenedAt: string; // ISO-8601, updated on every successful open
  createdAt: string;    // ISO-8601, immutable
}

interface SegmentStore {
  segments: Segment[];
  activeSegmentId: string | null;

  /** Idempotent by path. Returns { segment, created: false } if path already exists. */
  addSegment: (name: string, path: string) => { segment: Segment; created: boolean };
  removeSegment: (id: string) => void;
  /** Updates lastOpenedAt to now. Call after a successful openWorkspace. */
  touchSegment: (id: string) => void;
  setActiveSegmentId: (id: string | null) => void;
  getSegmentByPath: (path: string) => Segment | undefined;
}

const STORAGE_KEY = "brainmap:segments";

function normalizePath(rawPath: string): string {
  return rawPath.replace(/\/+$/, "");
}

function isValidSegment(s: unknown): s is Segment {
  return (
    typeof s === "object" && s !== null &&
    typeof (s as Segment).id === "string" &&
    typeof (s as Segment).name === "string" &&
    typeof (s as Segment).path === "string" &&
    typeof (s as Segment).lastOpenedAt === "string" &&
    typeof (s as Segment).createdAt === "string"
  );
}

export function loadStoredSegments(): Segment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidSegment) : [];
  } catch {
    return [];
  }
}

function persistSegments(segments: Segment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
}

const storedSegments = loadStoredSegments();

export const useSegmentStore = create<SegmentStore>((set, get) => ({
  segments: storedSegments,
  activeSegmentId: null,

  addSegment: (name, rawPath) => {
    const path = normalizePath(rawPath);
    const existing = get().segments.find((s) => s.path === path);
    if (existing) return { segment: existing, created: false };
    const segment: Segment = {
      id: crypto.randomUUID(),
      name,
      path,
      lastOpenedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const next = [...get().segments, segment];
    persistSegments(next);
    set({ segments: next });
    return { segment, created: true };
  },

  removeSegment: (id) => {
    const { segments, activeSegmentId } = get();
    const next = segments.filter((s) => s.id !== id);
    persistSegments(next);
    set({
      segments: next,
      activeSegmentId: activeSegmentId === id ? null : activeSegmentId,
    });
  },

  touchSegment: (id) => {
    const next = get().segments.map((s) =>
      s.id === id ? { ...s, lastOpenedAt: new Date().toISOString() } : s
    );
    persistSegments(next);
    set({ segments: next });
  },

  setActiveSegmentId: (id) => set({ activeSegmentId: id }),

  getSegmentByPath: (rawPath) => {
    const path = normalizePath(rawPath);
    return get().segments.find((s) => s.path === path);
  },
}));
