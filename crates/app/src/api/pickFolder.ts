import { open } from "@tauri-apps/plugin-dialog";

/**
 * Opens a native folder picker dialog.
 * Returns the selected absolute path, or null if cancelled.
 */
export async function pickFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Choose a folder",
  });
  return selected ?? null;
}
