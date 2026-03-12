import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadStoredSegments, useSegmentStore } from "./segmentStore";

const STORAGE_KEY = "brainmap:segments";

function makeMockStorage(): Record<string, string> {
  return {};
}

describe("loadStoredSegments", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = makeMockStorage();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { for (const k in storage) delete storage[k]; },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns [] when nothing is stored", () => {
    expect(loadStoredSegments()).toEqual([]);
  });

  it("returns [] on corrupt JSON", () => {
    storage[STORAGE_KEY] = "not-valid-json{{{";
    expect(loadStoredSegments()).toEqual([]);
  });

  it("returns [] when stored value is not an array", () => {
    storage[STORAGE_KEY] = JSON.stringify({ id: "x" });
    expect(loadStoredSegments()).toEqual([]);
  });

  it("returns the stored segments on valid data", () => {
    const segments = [
      { id: "1", name: "My Brain", path: "/notes", lastOpenedAt: "2024-01-01T00:00:00.000Z", createdAt: "2024-01-01T00:00:00.000Z" },
    ];
    storage[STORAGE_KEY] = JSON.stringify(segments);
    expect(loadStoredSegments()).toEqual(segments);
  });
});

describe("segmentStore actions", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = makeMockStorage();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { for (const k in storage) delete storage[k]; },
    });
    // Reset store state before each test
    useSegmentStore.setState({ segments: [], activeSegmentId: null });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("addSegment creates a new segment and returns created: true", () => {
    const { segment, created } = useSegmentStore.getState().addSegment("My Notes", "/Users/me/notes");
    expect(created).toBe(true);
    expect(segment.name).toBe("My Notes");
    expect(segment.path).toBe("/Users/me/notes");
    expect(segment.id).toBeTruthy();
    expect(useSegmentStore.getState().segments).toHaveLength(1);
  });

  it("addSegment with existing path returns existing segment and created: false", () => {
    const { segment: first } = useSegmentStore.getState().addSegment("First", "/Users/me/notes");
    const { segment: second, created } = useSegmentStore.getState().addSegment("Second", "/Users/me/notes");
    expect(created).toBe(false);
    expect(second.id).toBe(first.id);
    expect(useSegmentStore.getState().segments).toHaveLength(1);
  });

  it("addSegment normalizes trailing slashes before uniqueness check", () => {
    useSegmentStore.getState().addSegment("First", "/Users/me/notes");
    const { created } = useSegmentStore.getState().addSegment("Second", "/Users/me/notes///");
    expect(created).toBe(false);
    expect(useSegmentStore.getState().segments).toHaveLength(1);
  });

  it("addSegment persists to localStorage", () => {
    useSegmentStore.getState().addSegment("My Notes", "/Users/me/notes");
    const persisted = JSON.parse(storage[STORAGE_KEY]);
    expect(Array.isArray(persisted)).toBe(true);
    expect(persisted).toHaveLength(1);
    expect(persisted[0].name).toBe("My Notes");
  });

  it("removeSegment removes by id and updates localStorage", () => {
    const { segment } = useSegmentStore.getState().addSegment("A", "/a");
    useSegmentStore.getState().removeSegment(segment.id);
    expect(useSegmentStore.getState().segments).toHaveLength(0);
    const persisted = JSON.parse(storage[STORAGE_KEY]);
    expect(persisted).toHaveLength(0);
  });

  it("removeSegment clears activeSegmentId when removing the active segment", () => {
    const { segment } = useSegmentStore.getState().addSegment("A", "/a");
    useSegmentStore.getState().setActiveSegmentId(segment.id);
    expect(useSegmentStore.getState().activeSegmentId).toBe(segment.id);
    useSegmentStore.getState().removeSegment(segment.id);
    expect(useSegmentStore.getState().activeSegmentId).toBeNull();
  });

  it("touchSegment updates lastOpenedAt without changing other fields", async () => {
    const { segment } = useSegmentStore.getState().addSegment("A", "/a");
    const before = segment.lastOpenedAt;
    // Advance time slightly
    await new Promise((r) => setTimeout(r, 5));
    useSegmentStore.getState().touchSegment(segment.id);
    const updated = useSegmentStore.getState().segments[0];
    expect(updated.lastOpenedAt).not.toBe(before);
    expect(updated.name).toBe("A");
    expect(updated.path).toBe("/a");
    expect(updated.createdAt).toBe(segment.createdAt);
  });
});
