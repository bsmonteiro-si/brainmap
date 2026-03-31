import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { type E2EClient } from "./client.js";
import { getClient } from "./connect.js";
import { sleep } from "./helpers.js";

/**
 * Canvas fullscreen E2E tests.
 *
 * Verifies that entering/exiting fullscreen preserves canvas content,
 * viewport state, and the surrounding app layout.
 *
 * The canvas opens in the left panel via openCanvasInPanel (not in the
 * editor tab area). Fullscreen uses CSS position:fixed overlay — the
 * component stays mounted throughout.
 */
describe("Canvas Fullscreen", () => {
  let client: E2EClient;
  const canvasPath = "The Smoking Controversy.canvas";
  const screenshotsDir = path.join(import.meta.dirname, "screenshots");

  beforeAll(async () => {
    client = await getClient();
    fs.mkdirSync(screenshotsDir, { recursive: true });

    // Open the seed canvas in the left panel
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        useUIStore.getState().openCanvasInPanel('${canvasPath}');
        return 'opened';
      })()
    `);
    await sleep(1000);
  });

  afterAll(async () => {
    // Ensure fullscreen is off and canvas is closed
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        if (useUIStore.getState().canvasFullscreen) {
          useUIStore.getState().toggleCanvasFullscreen();
        }
        useUIStore.getState().setActiveLeftTab('files');
        return 'cleaned';
      })()
    `);
  });

  it("canvas loads with nodes in left panel", async () => {
    const nodeCount = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return nodes.length;
      })()
    `);
    expect(nodeCount).toBeGreaterThan(0);
  });

  it("entering fullscreen preserves all nodes", async () => {
    // Count nodes before
    const beforeCount = await client.executeJs(`
      (function() {
        return document.querySelectorAll('.react-flow__node').length;
      })()
    `);

    // Get node IDs before
    const beforeIds = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return n.getAttribute('data-id');
        }).sort());
      })()
    `);

    // Enter fullscreen
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        var path = useUIStore.getState().activeCanvasPath;
        useUIStore.getState().toggleCanvasFullscreen(path);
        return 'entered';
      })()
    `);
    await sleep(500);

    // Verify fullscreen CSS class is applied (proves state is set)
    const hasFullscreenClass = await client.executeJs(`
      (function() {
        return !!document.querySelector('.canvas-container.canvas-fullscreen');
      })()
    `);
    expect(hasFullscreenClass).toBe(true);

    // Verify CSS class is applied
    const hasClass = await client.executeJs(`
      (function() {
        return !!document.querySelector('.canvas-container.canvas-fullscreen');
      })()
    `);
    expect(hasClass).toBe(true);

    // Count nodes after — must be identical (same instance, no remount)
    const afterCount = await client.executeJs(`
      (function() {
        return document.querySelectorAll('.react-flow__node').length;
      })()
    `);
    expect(afterCount).toBe(beforeCount);

    // Verify same node IDs
    const afterIds = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return n.getAttribute('data-id');
        }).sort());
      })()
    `);
    expect(afterIds).toBe(beforeIds);

    await client.takeScreenshot(screenshotsDir);
  });

  it("fullscreen container has fixed positioning", async () => {
    // Ensure we're still in fullscreen from previous test (self-contained fallback)
    const inFs = await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        if (!useUIStore.getState().canvasFullscreen) {
          var path = useUIStore.getState().activeCanvasPath;
          useUIStore.getState().toggleCanvasFullscreen(path);
        }
        return true;
      })()
    `);
    await sleep(300);

    const style = await client.executeJs(`
      (function() {
        var el = document.querySelector('.canvas-container.canvas-fullscreen');
        if (!el) return null;
        var cs = getComputedStyle(el);
        return JSON.stringify({
          position: cs.position,
          top: cs.top,
          left: cs.left,
          zIndex: cs.zIndex
        });
      })()
    `);

    const parsed = typeof style === "string" ? JSON.parse(style) : style;
    expect(parsed).not.toBeNull();
    expect(parsed.position).toBe("fixed");
    expect(parsed.top).toBe("0px");
    expect(parsed.left).toBe("0px");
    expect(parseInt(parsed.zIndex)).toBeGreaterThanOrEqual(9999);
  });

  it("fullscreen hides app chrome visually", async () => {
    // Sidebar and status bar should be behind the fullscreen overlay
    const canvasCoversViewport = await client.executeJs(`
      (function() {
        var el = document.querySelector('.canvas-container.canvas-fullscreen');
        if (!el) return false;
        var rect = el.getBoundingClientRect();
        return rect.width >= window.innerWidth && rect.height >= window.innerHeight;
      })()
    `);
    expect(canvasCoversViewport).toBe(true);
  });

  it("exiting fullscreen restores layout", async () => {
    // Exit fullscreen
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        useUIStore.getState().toggleCanvasFullscreen();
        return 'exited';
      })()
    `);
    await sleep(500);

    // Verify fullscreen CSS class is removed (proves state is cleared)
    const hasClass = await client.executeJs(`
      (function() {
        return !!document.querySelector('.canvas-container.canvas-fullscreen');
      })()
    `);
    expect(hasClass).toBe(false);

    // Verify sidebar is visible again
    const sidebarVisible = await client.executeJs(`
      (function() {
        var sidebar = document.querySelector('.icon-sidebar');
        if (!sidebar) return false;
        var rect = sidebar.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })()
    `);
    expect(sidebarVisible).toBe(true);

    // Verify canvas still has nodes (same component, never unmounted)
    const nodeCount = await client.executeJs(`
      (function() {
        return document.querySelectorAll('.react-flow__node').length;
      })()
    `);
    expect(nodeCount).toBeGreaterThan(0);

    await client.takeScreenshot(screenshotsDir);
  });

  it("toolbar fullscreen button toggles via DOM click", async () => {
    // Click the Fullscreen button in the canvas toolbar
    const clicked = await client.executeJs(`
      (function() {
        var btns = document.querySelectorAll('.canvas-toolbar button');
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].title === 'Fullscreen') {
            btns[i].click();
            return 'CLICKED';
          }
        }
        return 'NOT_FOUND';
      })()
    `);
    expect(clicked).toBe("CLICKED");
    await sleep(500);

    // Verify fullscreen activated
    const hasClass = await client.executeJs(`
      (function() {
        return !!document.querySelector('.canvas-container.canvas-fullscreen');
      })()
    `);
    expect(hasClass).toBe(true);

    // Click "Exit fullscreen (Esc)" button
    const exited = await client.executeJs(`
      (function() {
        var btns = document.querySelectorAll('.canvas-toolbar button');
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].title === 'Exit fullscreen (Esc)') {
            btns[i].click();
            return 'CLICKED';
          }
        }
        return 'NOT_FOUND';
      })()
    `);
    expect(exited).toBe("CLICKED");
    await sleep(500);

    // Verify fullscreen deactivated
    const hasClassAfter = await client.executeJs(`
      (function() {
        return !!document.querySelector('.canvas-container.canvas-fullscreen');
      })()
    `);
    expect(hasClassAfter).toBe(false);
  });

  it("viewport state is preserved across fullscreen toggle", async () => {
    // Get viewport before
    const vpBefore = await client.executeJs(`
      (function() {
        var renderer = document.querySelector('.react-flow__renderer');
        if (!renderer || !renderer.__zoom) return null;
        var z = renderer.__zoom;
        return JSON.stringify({ x: Math.round(z.x), y: Math.round(z.y), zoom: Math.round(z.k * 100) });
      })()
    `);
    expect(vpBefore).not.toBeNull();

    // Enter fullscreen
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        var path = useUIStore.getState().activeCanvasPath;
        useUIStore.getState().toggleCanvasFullscreen(path);
        return 'entered';
      })()
    `);
    await sleep(500);

    // Get viewport during fullscreen
    const vpDuring = await client.executeJs(`
      (function() {
        var renderer = document.querySelector('.react-flow__renderer');
        if (!renderer || !renderer.__zoom) return null;
        var z = renderer.__zoom;
        return JSON.stringify({ x: Math.round(z.x), y: Math.round(z.y), zoom: Math.round(z.k * 100) });
      })()
    `);

    // Exit fullscreen
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        useUIStore.getState().toggleCanvasFullscreen();
        return 'exited';
      })()
    `);
    await sleep(500);

    // Get viewport after
    const vpAfter = await client.executeJs(`
      (function() {
        var renderer = document.querySelector('.react-flow__renderer');
        if (!renderer || !renderer.__zoom) return null;
        var z = renderer.__zoom;
        return JSON.stringify({ x: Math.round(z.x), y: Math.round(z.y), zoom: Math.round(z.k * 100) });
      })()
    `);

    // Viewport should be the same throughout (same component, never unmounted)
    const before = typeof vpBefore === "string" ? JSON.parse(vpBefore) : vpBefore;
    const during = typeof vpDuring === "string" ? JSON.parse(vpDuring) : vpDuring;
    const after = typeof vpAfter === "string" ? JSON.parse(vpAfter) : vpAfter;

    expect(during.zoom).toBe(before.zoom);
    expect(after.zoom).toBe(before.zoom);
  });

  it("zoom in preserves all nodes and their IDs", async () => {
    // Snapshot nodes before zoom
    const beforeSnapshot = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return { id: n.getAttribute('data-id'), text: n.textContent.trim().substring(0, 80) };
        }).sort(function(a, b) { return a.id < b.id ? -1 : 1; }));
      })()
    `);
    const before = typeof beforeSnapshot === "string" ? JSON.parse(beforeSnapshot) : beforeSnapshot;
    expect(before.length).toBeGreaterThan(0);

    // Zoom in via controls button
    await client.executeJs(`
      (function() {
        var btn = document.querySelector('.react-flow__controls-zoomin');
        if (btn) { btn.click(); btn.click(); btn.click(); }
        return 'zoomed';
      })()
    `);
    await sleep(500);

    // Snapshot nodes after zoom in
    const afterSnapshot = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return { id: n.getAttribute('data-id'), text: n.textContent.trim().substring(0, 80) };
        }).sort(function(a, b) { return a.id < b.id ? -1 : 1; }));
      })()
    `);
    const after = typeof afterSnapshot === "string" ? JSON.parse(afterSnapshot) : afterSnapshot;

    // Same number of nodes, same IDs, same text content
    expect(after.length).toBe(before.length);
    for (let i = 0; i < before.length; i++) {
      expect(after[i].id).toBe(before[i].id);
      expect(after[i].text).toBe(before[i].text);
    }
  });

  it("zoom out preserves all nodes and their IDs", async () => {
    // Snapshot nodes before zoom
    const beforeSnapshot = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return { id: n.getAttribute('data-id'), text: n.textContent.trim().substring(0, 80) };
        }).sort(function(a, b) { return a.id < b.id ? -1 : 1; }));
      })()
    `);
    const before = typeof beforeSnapshot === "string" ? JSON.parse(beforeSnapshot) : beforeSnapshot;

    // Zoom out via controls button
    await client.executeJs(`
      (function() {
        var btn = document.querySelector('.react-flow__controls-zoomout');
        if (btn) { btn.click(); btn.click(); btn.click(); }
        return 'zoomed';
      })()
    `);
    await sleep(500);

    // Snapshot nodes after zoom out
    const afterSnapshot = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return { id: n.getAttribute('data-id'), text: n.textContent.trim().substring(0, 80) };
        }).sort(function(a, b) { return a.id < b.id ? -1 : 1; }));
      })()
    `);
    const after = typeof afterSnapshot === "string" ? JSON.parse(afterSnapshot) : afterSnapshot;

    expect(after.length).toBe(before.length);
    for (let i = 0; i < before.length; i++) {
      expect(after[i].id).toBe(before[i].id);
      expect(after[i].text).toBe(before[i].text);
    }
  });

  it("zoom in during fullscreen preserves nodes", async () => {
    // Enter fullscreen
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        var path = useUIStore.getState().activeCanvasPath;
        if (!useUIStore.getState().canvasFullscreen) {
          useUIStore.getState().toggleCanvasFullscreen(path);
        }
        return 'entered';
      })()
    `);
    await sleep(500);

    // Snapshot nodes
    const beforeSnapshot = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return n.getAttribute('data-id');
        }).sort());
      })()
    `);
    const before = typeof beforeSnapshot === "string" ? JSON.parse(beforeSnapshot) : beforeSnapshot;

    // Zoom in
    await client.executeJs(`
      (function() {
        var btn = document.querySelector('.react-flow__controls-zoomin');
        if (btn) { btn.click(); btn.click(); }
        return 'zoomed';
      })()
    `);
    await sleep(500);

    // Verify same node IDs
    const afterSnapshot = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return n.getAttribute('data-id');
        }).sort());
      })()
    `);
    const after = typeof afterSnapshot === "string" ? JSON.parse(afterSnapshot) : afterSnapshot;

    expect(after).toEqual(before);

    // Exit fullscreen and verify nodes survive the round-trip
    await client.executeJs(`
      (async () => {
        const { useUIStore } = await import('/src/stores/uiStore.ts');
        useUIStore.getState().toggleCanvasFullscreen();
        return 'exited';
      })()
    `);
    await sleep(500);

    const exitedSnapshot = await client.executeJs(`
      (function() {
        var nodes = document.querySelectorAll('.react-flow__node');
        return JSON.stringify(Array.from(nodes).map(function(n) {
          return n.getAttribute('data-id');
        }).sort());
      })()
    `);
    const exited = typeof exitedSnapshot === "string" ? JSON.parse(exitedSnapshot) : exitedSnapshot;

    expect(exited).toEqual(before);
  });
});
