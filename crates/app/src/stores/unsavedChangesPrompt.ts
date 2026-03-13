import { useUIStore } from "./uiStore";

export type UnsavedAction = "save" | "discard" | "cancel";

let resolvePrompt: ((action: UnsavedAction) => void) | null = null;

/**
 * Show the unsaved-changes dialog and return the user's choice.
 * Only one prompt can be active at a time.
 */
export function promptUnsavedChanges(tabId: string): Promise<UnsavedAction> {
  // Cancel any pending prompt before opening a new one
  resolvePrompt?.("cancel");
  resolvePrompt = null;

  useUIStore.getState().openUnsavedChangesDialog(tabId);
  return new Promise((resolve) => {
    resolvePrompt = resolve;
  });
}

/** Called by UnsavedChangesDialog when the user clicks a button. */
export function resolveUnsavedChanges(action: UnsavedAction) {
  useUIStore.getState().closeUnsavedChangesDialog();
  resolvePrompt?.(action);
  resolvePrompt = null;
}
