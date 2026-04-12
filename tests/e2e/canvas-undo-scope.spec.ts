import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { type E2EClient } from "./client.js";
import { getClient } from "./connect.js";
import { sleep, isFolderExpanded, clickFolder } from "./helpers.js";

/**
 * Canvas undo/redo scoping E2E tests.
 *
 * Verifies that the canvas capture-phase Cmd+Z handler only fires when
 * focus is inside the canvas container. Before the fix, the handler had
 * no containment check and stole undo/redo from CodeMirror when a canvas
 * was mounted in the left panel.
 */
describe("Canvas Undo/Redo Scoping", () => {
  let client: E2EClient;
  const canvasPath = "Canvas Features Demo.canvas";
  const notePath = "Concepts/Bayesian Networks.md";
  const screenshotsDir = path.join(import.meta.dirname, "screenshots");

  beforeAll(async () => {
    client = await getClient();
    fs.mkdirSync(screenshotsDir, { recursive: true });

    // Open canvas in the left panel and switch sidebar to canvas tab
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        useUIStore.getState().openCanvasInPanel('${canvasPath}');
        useUIStore.getState().setActiveLeftTab('canvas');
        return 'opened';
      })()
    `);
    await sleep(1000);
  });

  afterAll(async () => {
    // Close canvas panel, close tabs, and reload the canvas file from disk
    // to undo any persisted node additions from test runs
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        const { useTabStore } = await import('/src/stores/tabStore.ts');
        if (useUIStore.getState().canvasFullscreen) {
          useUIStore.getState().toggleCanvasFullscreen();
        }
        // Close canvas in left panel (removes CanvasEditorInner and its undo stacks)
        useUIStore.setState({ activeCanvasPath: null });
        useUIStore.getState().setActiveLeftTab('files');
        var tabs = useTabStore.getState().tabs;
        for (var i = 0; i < tabs.length; i++) {
          useTabStore.getState().closeTab(tabs[i].id);
        }
        return 'cleaned';
      })()
    `);
    await sleep(300);

    // Restore the original canvas file from the seed copy
    const seedCanvas = path.join(import.meta.dirname, "../../seed", canvasPath);
    if (fs.existsSync(seedCanvas)) {
      const wsRoot = await client.executeJs(`
        (async () => {
          const { useWorkspaceStore } = await import('/src/stores/workspaceStore.ts');
          return useWorkspaceStore.getState().info?.root || '';
        })()
      `);
      if (typeof wsRoot === "string" && wsRoot) {
        const dest = path.join(wsRoot, canvasPath);
        fs.copyFileSync(seedCanvas, dest);
      }
    }

    // Collapse the Concepts folder if it was expanded (openNote expands it)
    try {
      if (await isFolderExpanded(client, "Concepts")) {
        await clickFolder(client, "Concepts");
        await sleep(400);
      }
    } catch {
      // Folder may not be in tree if workspace state changed
    }
  });

  /** Helper: count canvas nodes in the left panel */
  async function getCanvasNodeCount(): Promise<number> {
    const count = await client.executeJs(`
      (function() {
        return document.querySelectorAll('.react-flow__node').length;
      })()
    `);
    return typeof count === "number" ? count : parseInt(String(count), 10);
  }

  /** Helper: click the "Add text card" toolbar button */
  async function addTextCard(): Promise<void> {
    await client.executeJs(`
      (function() {
        var btns = document.querySelectorAll('.canvas-toolbar button');
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].title === 'Add text card') { btns[i].click(); return 'CLICKED'; }
        }
        return 'NOT_FOUND';
      })()
    `);
    await sleep(500);
  }

  /**
   * Helper: focus the canvas container, then dispatch Cmd+Z on it.
   * Dispatching on the focused element (not document) ensures e.target
   * is inside the container — matching real keyboard behavior where
   * e.target = document.activeElement.
   */
  async function canvasCmdZ(): Promise<void> {
    await client.executeJs(`
      (function() {
        var c = document.querySelector('.canvas-container');
        if (c) c.focus();
        return 'focused';
      })()
    `);
    await sleep(100);
    await client.executeJs(`
      (function() {
        var el = document.activeElement || document;
        el.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'z', metaKey: true, bubbles: true, cancelable: true
        }));
        return 'dispatched on ' + el.tagName;
      })()
    `);
    await sleep(300);
  }

  /** Helper: focus the canvas container, then dispatch Cmd+Shift+Z on it */
  async function canvasCmdShiftZ(): Promise<void> {
    await client.executeJs(`
      (function() {
        var c = document.querySelector('.canvas-container');
        if (c) c.focus();
        return 'focused';
      })()
    `);
    await sleep(100);
    await client.executeJs(`
      (function() {
        var el = document.activeElement || document;
        el.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'z', metaKey: true, shiftKey: true, bubbles: true, cancelable: true
        }));
        return 'dispatched on ' + el.tagName;
      })()
    `);
    await sleep(300);
  }

  it("canvas container is focusable via tabIndex", async () => {
    const result = await client.executeJs(`
      (function() {
        var c = document.querySelector('.canvas-container');
        if (!c) return JSON.stringify({ found: false });
        c.focus();
        var active = document.activeElement;
        return JSON.stringify({
          found: true,
          tabIndex: c.tabIndex,
          isFocused: active === c || c.contains(active)
        });
      })()
    `);
    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    expect(parsed.found).toBe(true);
    expect(parsed.tabIndex).toBe(-1);
    expect(parsed.isFocused).toBe(true);
  });

  it("Cmd+Z in canvas undoes add-card", async () => {
    const before = await getCanvasNodeCount();
    expect(before).toBeGreaterThan(0);

    // Add a card
    await addTextCard();
    const afterAdd = await getCanvasNodeCount();
    expect(afterAdd).toBe(before + 1);

    // Undo
    await canvasCmdZ();
    const afterUndo = await getCanvasNodeCount();
    expect(afterUndo).toBe(before);
  });

  it("canvas undo does NOT fire when CodeMirror editor has focus", async () => {
    // Add a card to the canvas
    const before = await getCanvasNodeCount();
    await addTextCard();
    const afterAdd = await getCanvasNodeCount();
    expect(afterAdd).toBe(before + 1);

    // Open a markdown note in the editor tab via store (avoids needing expanded tree)
    await client.executeJs(`
      (async () => {
        const { useEditorStore } = await import('/src/stores/editorStore.ts');
        await useEditorStore.getState().openNote('${notePath}');
        return 'opened';
      })()
    `);
    await sleep(500);

    // Verify CodeMirror is present
    const hasCM = await client.executeJs(`
      (function() { return !!document.querySelector('.cm-content'); })()
    `);
    expect(hasCM).toBe(true);

    // Focus CM and dispatch Cmd+Z on the focused element — should NOT affect canvas
    await client.executeJs(`
      (function() {
        var cm = document.querySelector('.cm-content');
        if (cm) cm.focus();
        return 'focused CM';
      })()
    `);
    await sleep(100);
    await client.executeJs(`
      (function() {
        var el = document.activeElement || document;
        el.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'z', metaKey: true, bubbles: true, cancelable: true
        }));
        return 'dispatched on ' + el.tagName;
      })()
    `);
    await sleep(300);

    // Canvas node count must be UNCHANGED — the card was NOT undone
    const afterCmdZ = await getCanvasNodeCount();
    expect(afterCmdZ).toBe(afterAdd);

    // Clean up: undo the card via canvas focus
    await canvasCmdZ();
    // Verify cleanup succeeded — if this fails, leaked node will break subsequent tests
    expect(await getCanvasNodeCount()).toBe(before);

    // Close the note tab we opened and re-focus canvas
    await client.executeJs(`
      (async () => {
        const { useTabStore } = await import('/src/stores/tabStore.ts');
        var tabs = useTabStore.getState().tabs;
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i].path && tabs[i].path.endsWith('.md')) {
            useTabStore.getState().closeTab(tabs[i].id);
          }
        }
        return 'closed-note-tabs';
      })()
    `);
    await sleep(500);

    // Re-focus canvas so subsequent tests have clean focus state
    await client.executeJs(`
      (function() {
        var c = document.querySelector('.canvas-container');
        if (c) c.focus();
        return 'refocused';
      })()
    `);
    await sleep(200);

    await client.takeScreenshot(screenshotsDir);
  });

  it("canvas redo works via Cmd+Shift+Z", async () => {
    const before = await getCanvasNodeCount();

    // Add then undo
    await addTextCard();
    expect(await getCanvasNodeCount()).toBe(before + 1);
    await canvasCmdZ();
    expect(await getCanvasNodeCount()).toBe(before);

    // Redo
    await canvasCmdShiftZ();
    const afterRedo = await getCanvasNodeCount();
    expect(afterRedo).toBe(before + 1);

    // Clean up
    await canvasCmdZ();
  });

  it("canvas undo does NOT fire when left panel is hidden", async () => {
    // Add a card
    const before = await getCanvasNodeCount();
    await addTextCard();
    expect(await getCanvasNodeCount()).toBe(before + 1);

    // Switch to files tab (canvas is now display:none but still mounted)
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        useUIStore.getState().setActiveLeftTab('files');
        return 'switched';
      })()
    `);
    await sleep(300);

    // Dispatch Cmd+Z — canvas handler should NOT fire (container hidden)
    await client.executeJs(`
      (function() {
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'z', metaKey: true, bubbles: true, cancelable: true
        }));
        return 'dispatched';
      })()
    `);
    await sleep(300);

    // Switch back to canvas tab and verify node count unchanged
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        useUIStore.getState().setActiveLeftTab('canvas');
        return 'switched';
      })()
    `);
    await sleep(300);

    const afterCmdZ = await getCanvasNodeCount();
    expect(afterCmdZ).toBe(before + 1);

    // Clean up
    await canvasCmdZ();
  });
});
