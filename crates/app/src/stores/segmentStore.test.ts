import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { loadStoredSegments, useSegmentStore, pickDockSegments, type Segment } from "./segmentStore";

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

describe("openSegmentIds management", () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    storage = makeMockStorage();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, val: string) => { storage[key] = val; },
      removeItem: (key: string) => { delete storage[key]; },
      clear: () => { for (const k in storage) delete storage[k]; },
    });
    useSegmentStore.setState({ segments: [], activeSegmentId: null, openSegmentIds: [] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("addOpenSegment appends to the list", () => {
    useSegmentStore.getState().addOpenSegment("seg-1");
    expect(useSegmentStore.getState().openSegmentIds).toEqual(["seg-1"]);
  });

  it("addOpenSegment is idempotent", () => {
    useSegmentStore.getState().addOpenSegment("seg-1");
    useSegmentStore.getState().addOpenSegment("seg-1");
    expect(useSegmentStore.getState().openSegmentIds).toEqual(["seg-1"]);
  });

  it("removeOpenSegment removes the ID", () => {
    useSegmentStore.getState().addOpenSegment("seg-1");
    useSegmentStore.getState().addOpenSegment("seg-2");
    useSegmentStore.getState().removeOpenSegment("seg-1");
    expect(useSegmentStore.getState().openSegmentIds).toEqual(["seg-2"]);
  });

  it("removeOpenSegment no-ops for unknown ID", () => {
    useSegmentStore.getState().addOpenSegment("seg-1");
    useSegmentStore.getState().removeOpenSegment("unknown");
    expect(useSegmentStore.getState().openSegmentIds).toEqual(["seg-1"]);
  });

  it("getOpenSegments returns full segment objects for open IDs", () => {
    const { segment: a } = useSegmentStore.getState().addSegment("A", "/a");
    const { segment: b } = useSegmentStore.getState().addSegment("B", "/b");
    useSegmentStore.getState().addOpenSegment(a.id);
    useSegmentStore.getState().addOpenSegment(b.id);
    const open = useSegmentStore.getState().getOpenSegments();
    expect(open).toHaveLength(2);
    expect(open[0].name).toBe("A");
    expect(open[1].name).toBe("B");
  });

  it("getOpenSegments filters out IDs that no longer match a known segment", () => {
    const { segment } = useSegmentStore.getState().addSegment("A", "/a");
    useSegmentStore.getState().addOpenSegment(segment.id);
    useSegmentStore.getState().addOpenSegment("orphan-id");
    const open = useSegmentStore.getState().getOpenSegments();
    expect(open).toHaveLength(1);
    expect(open[0].id).toBe(segment.id);
  });
});

describe("pickDockSegments", () => {
  function makeSegment(name: string, path: string, lastOpenedAt: string): Segment {
    return {
      id: crypto.randomUUID(),
      name,
      path,
      lastOpenedAt,
      createdAt: "2024-01-01T00:00:00.000Z",
    };
  }

  it("returns empty array for empty input", () => {
    expect(pickDockSegments([])).toEqual([]);
  });

  it("returns all segments when fewer than max", () => {
    const segments = [
      makeSegment("A", "/a", "2024-06-01T00:00:00.000Z"),
      makeSegment("B", "/b", "2024-06-02T00:00:00.000Z"),
    ];
    const result = pickDockSegments(segments);
    expect(result).toHaveLength(2);
    // Most recent first
    expect(result[0]).toEqual({ name: "B", path: "/b" });
    expect(result[1]).toEqual({ name: "A", path: "/a" });
  });

  it("caps at max (default 10)", () => {
    const segments = Array.from({ length: 15 }, (_, i) =>
      makeSegment(`Seg-${i}`, `/path/${i}`, new Date(2024, 0, i + 1).toISOString()),
    );
    const result = pickDockSegments(segments);
    expect(result).toHaveLength(10);
    // Most recent should be the last ones (highest date)
    expect(result[0].name).toBe("Seg-14");
  });

  it("respects custom max", () => {
    const segments = [
      makeSegment("A", "/a", "2024-01-01T00:00:00.000Z"),
      makeSegment("B", "/b", "2024-01-02T00:00:00.000Z"),
      makeSegment("C", "/c", "2024-01-03T00:00:00.000Z"),
    ];
    const result = pickDockSegments(segments, 2);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "C", path: "/c" });
    expect(result[1]).toEqual({ name: "B", path: "/b" });
  });

  it("sorts by lastOpenedAt descending", () => {
    const segments = [
      makeSegment("Old", "/old", "2024-01-01T00:00:00.000Z"),
      makeSegment("New", "/new", "2024-12-31T00:00:00.000Z"),
      makeSegment("Mid", "/mid", "2024-06-15T00:00:00.000Z"),
    ];
    const result = pickDockSegments(segments);
    expect(result.map((s) => s.name)).toEqual(["New", "Mid", "Old"]);
  });

  it("does not mutate the input array", () => {
    const segments = [
      makeSegment("B", "/b", "2024-06-02T00:00:00.000Z"),
      makeSegment("A", "/a", "2024-06-01T00:00:00.000Z"),
    ];
    const original = [...segments];
    pickDockSegments(segments);
    expect(segments).toEqual(original);
  });
});
