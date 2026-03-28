/**
 * Reusable DOM interaction helpers for E2E tests.
 *
 * These target the actual BrainMap DOM structure:
 * - Tree items:  [data-tree-path="..."]
 * - Folders:     [data-tree-is-folder="1"]
 * - Expanded:    sibling .tree-children-anim has class .tree-children-anim--open
 * - Collapsed:   CSS grid-template-rows: 0fr + overflow: hidden (children are in DOM but 0 height)
 */
import { E2EClient } from "./client.js";

/** Escape a string for safe interpolation into JS template literals. */
function escapeJs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * Get all tree item paths that are actually visible.
 * Items inside collapsed folders are in the DOM but hidden via
 * grid-template-rows: 0fr + overflow: hidden. We check that every
 * ancestor .tree-children-anim container has the --open class.
 */
export async function getVisibleTreeItems(
  client: E2EClient,
): Promise<string[]> {
  const result = await client.executeJs(`
    (function() {
      var items = document.querySelectorAll('[data-tree-path]');
      var visible = [];
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var hidden = false;
        var ancestor = el.parentElement;
        while (ancestor) {
          if (ancestor.classList.contains('tree-children-anim') &&
              !ancestor.classList.contains('tree-children-anim--open')) {
            hidden = true;
            break;
          }
          ancestor = ancestor.parentElement;
        }
        if (!hidden) {
          visible.push(el.getAttribute('data-tree-path'));
        }
      }
      return visible;
    })()
  `);
  // executeJs parses object-type results from JSON, so result is already an array
  return Array.isArray(result) ? result : [];
}

/**
 * Click a folder to toggle its expanded/collapsed state.
 */
export async function clickFolder(
  client: E2EClient,
  folderPath: string,
): Promise<void> {
  const safe = escapeJs(folderPath);
  const result = await client.executeJs(`
    (function() {
      var el = document.querySelector('[data-tree-path="' + CSS.escape('${safe}') + '"][data-tree-is-folder="1"]');
      if (!el) return 'NOT_FOUND';
      el.click();
      return 'CLICKED';
    })()
  `);
  if (result === "NOT_FOUND") {
    throw new Error(`Folder not found: ${folderPath}`);
  }
}

/**
 * Check if a folder is currently expanded.
 */
export async function isFolderExpanded(
  client: E2EClient,
  folderPath: string,
): Promise<boolean> {
  const safe = escapeJs(folderPath);
  const result = await client.executeJs(`
    (function() {
      var folder = document.querySelector('[data-tree-path="' + CSS.escape('${safe}') + '"][data-tree-is-folder="1"]');
      if (!folder) return 'NOT_FOUND';
      var parent = folder.parentElement;
      if (!parent) return false;
      var anim = parent.querySelector('.tree-children-anim');
      return anim ? anim.classList.contains('tree-children-anim--open') : false;
    })()
  `);
  if (result === "NOT_FOUND") {
    throw new Error(`Folder not found: ${folderPath}`);
  }
  return result === true;
}

/**
 * Click a file to open it in the editor.
 */
export async function clickFile(
  client: E2EClient,
  filePath: string,
): Promise<void> {
  const safe = escapeJs(filePath);
  const result = await client.executeJs(`
    (function() {
      var el = document.querySelector('[data-tree-path="' + CSS.escape('${safe}') + '"]');
      if (!el) return 'NOT_FOUND';
      el.click();
      return 'CLICKED';
    })()
  `);
  if (result === "NOT_FOUND") {
    throw new Error(`File not found in tree: ${filePath}`);
  }
}

/**
 * Wait for the file tree to have at least one item rendered.
 */
export async function waitForTreeLoaded(
  client: E2EClient,
  timeoutMs = 10_000,
): Promise<void> {
  await client.waitForSelector("[data-tree-path]", timeoutMs);
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
