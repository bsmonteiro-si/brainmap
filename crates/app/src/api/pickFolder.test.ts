import { describe, it, expect, vi } from "vitest";

// Mock the dialog plugin before importing pickFolder
vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

import { pickFolder } from "./pickFolder";
import { open } from "@tauri-apps/plugin-dialog";

const mockOpen = vi.mocked(open);

describe("pickFolder", () => {
  it("returns the path when open() returns a string", async () => {
    mockOpen.mockResolvedValueOnce("/Users/me/notes");
    const result = await pickFolder();
    expect(result).toBe("/Users/me/notes");
    expect(mockOpen).toHaveBeenCalledWith({
      directory: true,
      multiple: false,
      title: "Choose a folder",
    });
  });

  it("returns null when open() returns null (user cancelled)", async () => {
    mockOpen.mockResolvedValueOnce(null);
    const result = await pickFolder();
    expect(result).toBeNull();
  });

  it("returns null when open() returns undefined", async () => {
    mockOpen.mockResolvedValueOnce(undefined as any);
    const result = await pickFolder();
    expect(result).toBeNull();
  });
});
