import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateFolderDialog } from "./CreateFolderDialog";

const mockCreateFolder = vi.fn();

vi.mock("../../api/bridge", () => ({
  getAPI: () => Promise.resolve({ createFolder: mockCreateFolder }),
}));

let uiStoreState = {
  createFolderInitialPath: null as string | null,
};
const mockClose = vi.fn();
const mockAddEmptyFolder = vi.fn();
const mockPushAction = vi.fn();

vi.mock("../../stores/uiStore", () => {
  const storeFunc = (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      closeCreateFolderDialog: mockClose,
      ...uiStoreState,
    });
  storeFunc.getState = () => ({
    closeCreateFolderDialog: mockClose,
    addEmptyFolder: mockAddEmptyFolder,
    ...uiStoreState,
  });
  return { useUIStore: storeFunc };
});

vi.mock("../../stores/undoStore", () => ({
  useUndoStore: {
    getState: () => ({ pushAction: mockPushAction }),
  },
}));

describe("CreateFolderDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateFolder.mockResolvedValue(undefined);
    uiStoreState = { createFolderInitialPath: null };
  });

  it("shows 'Create Folder' heading", () => {
    render(<CreateFolderDialog />);
    expect(screen.getByText("Create Folder")).toBeDefined();
  });

  it("pre-fills path from initialPath", () => {
    uiStoreState.createFolderInitialPath = "Concepts/";
    render(<CreateFolderDialog />);
    expect(screen.getByDisplayValue("Concepts/")).toBeDefined();
  });

  it("Create button is disabled when path is empty", () => {
    render(<CreateFolderDialog />);
    const btn = screen.getByRole("button", { name: "Create" });
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("submits and calls createFolder, addEmptyFolder, pushAction, then closes", async () => {
    render(<CreateFolderDialog />);
    const input = screen.getByPlaceholderText("folder/subfolder");
    fireEvent.change(input, { target: { value: "NewFolder" } });

    const btn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith("NewFolder");
      expect(mockAddEmptyFolder).toHaveBeenCalledWith("NewFolder");
      expect(mockPushAction).toHaveBeenCalledWith({ kind: "create-folder", folderPath: "NewFolder" });
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it("shows error on API failure", async () => {
    mockCreateFolder.mockRejectedValueOnce(new Error("path traversal"));
    render(<CreateFolderDialog />);

    const input = screen.getByPlaceholderText("folder/subfolder");
    fireEvent.change(input, { target: { value: "../escape" } });

    const btn = screen.getByRole("button", { name: "Create" });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText("path traversal")).toBeDefined();
    });
    // Dialog should NOT close on error
    expect(mockClose).not.toHaveBeenCalled();
  });

  it("closes on Escape key", () => {
    render(<CreateFolderDialog />);
    fireEvent.keyDown(screen.getByText("Create Folder").parentElement!, { key: "Escape" });
    expect(mockClose).toHaveBeenCalled();
  });

  it("submits on Enter key", async () => {
    render(<CreateFolderDialog />);
    const input = screen.getByPlaceholderText("folder/subfolder");
    fireEvent.change(input, { target: { value: "Quick" } });
    fireEvent.keyDown(input.closest("div[style]")!, { key: "Enter" });

    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith("Quick");
    });
  });

  it("closes on Cancel button", () => {
    render(<CreateFolderDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockClose).toHaveBeenCalled();
  });
});
