import { describe, it, expect, vi, beforeEach } from "vitest";
import { promptUnsavedChanges, resolveUnsavedChanges } from "./unsavedChangesPrompt";

// Mock uiStore
vi.mock("./uiStore", () => ({
  useUIStore: {
    getState: () => ({
      openUnsavedChangesDialog: vi.fn(),
      closeUnsavedChangesDialog: vi.fn(),
    }),
  },
}));

describe("unsavedChangesPrompt", () => {
  it("resolves with 'save' when user clicks Save", async () => {
    const p = promptUnsavedChanges("tab1");
    resolveUnsavedChanges("save");
    await expect(p).resolves.toBe("save");
  });

  it("resolves with 'discard' when user clicks Don't Save", async () => {
    const p = promptUnsavedChanges("tab1");
    resolveUnsavedChanges("discard");
    await expect(p).resolves.toBe("discard");
  });

  it("resolves with 'cancel' when user clicks Cancel", async () => {
    const p = promptUnsavedChanges("tab1");
    resolveUnsavedChanges("cancel");
    await expect(p).resolves.toBe("cancel");
  });

  it("cancels previous prompt when a new one is opened", async () => {
    const p1 = promptUnsavedChanges("tab1");
    const p2 = promptUnsavedChanges("tab2");
    // p1 should have been auto-cancelled
    await expect(p1).resolves.toBe("cancel");
    resolveUnsavedChanges("save");
    await expect(p2).resolves.toBe("save");
  });
});
