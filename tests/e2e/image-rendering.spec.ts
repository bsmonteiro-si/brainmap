import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { type E2EClient } from "./client.js";
import { getClient } from "./connect.js";
import {
  clickFolder,
  clickFile,
  isFolderExpanded,
  waitForTreeLoaded,
  sleep,
} from "./helpers.js";

/**
 * Ensure the editor is in Edit mode (not Preview or Raw).
 */
async function ensureEditMode(client: E2EClient): Promise<void> {
  await client.executeJs(`
    (function() {
      var btns = document.querySelectorAll('.editor-view-btn');
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].textContent.trim() === 'Edit' && !btns[i].classList.contains('editor-view-btn--active')) {
          btns[i].click();
          return 'switched';
        }
      }
      return 'already-edit';
    })()
  `);
  await sleep(300);
}

/**
 * Scroll the CM editor to make the image line visible and wait for the widget.
 */
async function scrollToImageAndWait(client: E2EClient): Promise<void> {
  // Scroll to bottom to force CM6 to parse the full document
  await client.executeJs(`
    (function() {
      var scroller = document.querySelector('.cm-scroller');
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
      return 'scrolled';
    })()
  `);
  await sleep(300);
  // Scroll back so image line is visible
  await client.executeJs(`
    (function() {
      var scroller = document.querySelector('.cm-scroller');
      if (scroller) scroller.scrollTop = Math.max(0, scroller.scrollHeight - 400);
      return 'scrolled';
    })()
  `);
  // Wait for the async image widget to resolve
  await client.waitForSelector(".cm-image-widget", 10_000);
}

describe("Image Rendering", () => {
  let client: E2EClient;
  const screenshotsDir = path.join(import.meta.dirname, "screenshots");

  beforeAll(async () => {
    client = await getClient();
    fs.mkdirSync(screenshotsDir, { recursive: true });
    await waitForTreeLoaded(client);
  });

  beforeEach(async () => {
    // Each test opens the note fresh to be self-contained
    // Ensure Concepts folder is expanded
    if (!(await isFolderExpanded(client, "Concepts"))) {
      await clickFolder(client, "Concepts");
      await sleep(400);
    }
    await clickFile(client, "Concepts/Bayesian Networks.md");
    await sleep(500);
    await ensureEditMode(client);
  });

  afterAll(async () => {
    // Ensure we're in edit mode first (preview mode may hide the tab close button)
    await ensureEditMode(client);

    // Close the tab
    await client.executeJs(`
      (function() {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', metaKey: true, bubbles: true }));
        return 'closed';
      })()
    `);
    await sleep(500);

    // Collapse Concepts only if it's currently expanded
    if (await isFolderExpanded(client, "Concepts")) {
      await clickFolder(client, "Concepts");
      await sleep(400);
      // Verify it actually collapsed
      const stillExpanded = await isFolderExpanded(client, "Concepts");
      if (stillExpanded) {
        // Try once more
        await clickFolder(client, "Concepts");
        await sleep(400);
      }
    }
  });

  it("edit mode renders image widget below image syntax line", async () => {
    await scrollToImageAndWait(client);

    const result = await client.executeJs(`
      (function() {
        var widgets = document.querySelectorAll('.cm-image-widget');
        if (widgets.length === 0) return { found: false };
        var widget = widgets[0];
        var img = widget.querySelector('img.cm-image-preview');
        var loading = widget.querySelector('.cm-image-loading');
        var error = widget.querySelector('.cm-image-error');
        return {
          found: true,
          widgetCount: widgets.length,
          hasImg: !!img,
          hasLoading: !!loading,
          hasError: !!error,
          imgSrc: img ? img.src : null,
          imgAlt: img ? img.alt : null,
          imgDraggable: img ? img.draggable : null,
          imgComplete: img ? img.complete : null,
          imgNaturalWidth: img ? img.naturalWidth : null
        };
      })()
    `);

    expect(result.found).toBe(true);
    expect(result.hasImg).toBe(true);
    expect(result.hasLoading).toBe(false);
    expect(result.hasError).toBe(false);
    expect(result.imgSrc).toContain("asset://");
    expect(result.imgSrc).toContain("bayesian-network-diagram.png");
    expect(result.imgAlt).toBe("Bayesian network diagram");
    expect(result.imgDraggable).toBe(false);
    // Verify the image actually loaded (not just that the element exists)
    expect(result.imgComplete).toBe(true);
    expect(result.imgNaturalWidth).toBeGreaterThan(0);
  });

  it("preview mode renders resolved image", async () => {
    // Switch to Preview mode
    await client.executeJs(`
      (function() {
        var btns = document.querySelectorAll('.editor-view-btn');
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].textContent.trim() === 'Preview') { btns[i].click(); return 'clicked'; }
        }
        return 'not-found';
      })()
    `);
    // Wait for the preview image to appear via the async MarkdownImage component
    await client.waitForSelector(".md-preview img", 10_000);

    const result = await client.executeJs(`
      (function() {
        var preview = document.querySelector('.md-preview');
        if (!preview) return { hasPreview: false };
        var imgs = preview.querySelectorAll('img');
        var results = [];
        for (var i = 0; i < imgs.length; i++) {
          results.push({ src: imgs[i].src, alt: imgs[i].alt });
        }
        var errors = preview.querySelectorAll('.md-image-error');
        return {
          hasPreview: true,
          imgCount: imgs.length,
          imgs: results,
          errorCount: errors.length
        };
      })()
    `);

    expect(result.hasPreview).toBe(true);
    expect(result.imgCount).toBeGreaterThanOrEqual(1);

    const bayesianImg = result.imgs.find(
      (img: { alt: string }) => img.alt === "Bayesian network diagram",
    );
    expect(bayesianImg).toBeDefined();
    expect(bayesianImg.src).toContain("asset://");
    expect(bayesianImg.src).toContain("bayesian-network-diagram.png");
    expect(result.errorCount).toBe(0);
  });

  it("edit mode shows error for broken image path", async () => {
    await scrollToImageAndWait(client);

    // Insert a broken image reference via CM dispatch
    const insertResult = await client.executeJs(`
      (function() {
        var content = document.querySelector('.cm-content');
        if (!content) return 'NO_CONTENT';
        var view = content.cmTile && content.cmTile.view;
        if (!view) return 'NO_VIEW';
        var doc = view.state.doc;
        view.dispatch({ changes: { from: doc.length, insert: '\\n\\n![broken image](nonexistent-image.png)\\n' } });
        view.dispatch({ selection: { anchor: 0 } });
        var scroller = document.querySelector('.cm-scroller');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
        return 'INSERTED';
      })()
    `);
    expect(insertResult).toBe("INSERTED");

    // Wait for the error widget to appear
    await client.waitForSelector(".cm-image-error", 10_000);

    const result = await client.executeJs(`
      (function() {
        var widgets = document.querySelectorAll('.cm-image-widget');
        var errors = [];
        var successes = [];
        for (var i = 0; i < widgets.length; i++) {
          var err = widgets[i].querySelector('.cm-image-error');
          var img = widgets[i].querySelector('img.cm-image-preview');
          if (err) errors.push(err.textContent);
          if (img) successes.push(img.alt);
        }
        return { widgetCount: widgets.length, errors: errors, successes: successes };
      })()
    `);

    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.successes).toContain("Bayesian network diagram");

    await client.takeScreenshot(screenshotsDir);

    // Undo the insertion to restore clean state
    const cleanResult = await client.executeJs(`
      (function() {
        var content = document.querySelector('.cm-content');
        var view = content.cmTile && content.cmTile.view;
        if (!view) return 'NO_VIEW';
        var text = view.state.doc.toString();
        var idx = text.indexOf('\\n\\n![broken image]');
        if (idx < 0) return 'NOT_FOUND';
        view.dispatch({ changes: { from: idx, to: view.state.doc.length } });
        return 'CLEANED';
      })()
    `);
    expect(cleanResult).toBe("CLEANED");
  });

  it("image widget hides when cursor is on image line", async () => {
    await scrollToImageAndWait(client);

    // Confirm widget is present before testing cursor behavior
    const before = await client.executeJs(`
      (function() {
        var widgets = document.querySelectorAll('.cm-image-widget');
        return { count: widgets.length };
      })()
    `);
    expect(before.count).toBeGreaterThanOrEqual(1);

    // Place cursor on the image line
    const moveResult = await client.executeJs(`
      (function() {
        var content = document.querySelector('.cm-content');
        if (!content) return 'NO_CONTENT';
        var view = content.cmTile && content.cmTile.view;
        if (!view) return 'NO_VIEW';
        var text = view.state.doc.toString();
        var idx = text.indexOf('![Bayesian network diagram]');
        if (idx < 0) return 'NOT_FOUND';
        view.dispatch({ selection: { anchor: idx } });
        view.focus();
        return 'MOVED_CURSOR';
      })()
    `);
    expect(moveResult).toBe("MOVED_CURSOR");
    await sleep(300);

    // Widget should be hidden (cursor-aware behavior)
    const during = await client.executeJs(`
      (function() {
        var widgets = document.querySelectorAll('.cm-image-widget');
        return { count: widgets.length };
      })()
    `);
    expect(during.count).toBe(0);

    // Move cursor away from the image line
    await client.executeJs(`
      (function() {
        var content = document.querySelector('.cm-content');
        var view = content.cmTile && content.cmTile.view;
        if (!view) return 'NO_VIEW';
        view.dispatch({ selection: { anchor: 0 } });
        return 'MOVED';
      })()
    `);

    // Wait for widget to reappear
    await client.waitForSelector(".cm-image-widget", 10_000);

    const after = await client.executeJs(`
      (function() {
        var widgets = document.querySelectorAll('.cm-image-widget');
        var hasImg = false;
        for (var i = 0; i < widgets.length; i++) {
          if (widgets[i].querySelector('img.cm-image-preview')) hasImg = true;
        }
        return { count: widgets.length, hasImg: hasImg };
      })()
    `);
    expect(after.count).toBeGreaterThanOrEqual(1);
    expect(after.hasImg).toBe(true);

    await client.takeScreenshot(screenshotsDir);
  });
});
