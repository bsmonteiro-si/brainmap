import { describe, it, expect, beforeAll } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import { type E2EClient } from "./client.js";
import { getClient } from "./connect.js";
import {
  getVisibleTreeItems,
  clickFolder,
  isFolderExpanded,
  waitForTreeLoaded,
  sleep,
} from "./helpers.js";

describe("File Tree", () => {
  let client: E2EClient;

  beforeAll(async () => {
    client = await getClient();
  });

  it("expand folder shows children", async () => {
    await waitForTreeLoaded(client);

    // Verify Concepts folder is visible but collapsed
    const before = await getVisibleTreeItems(client);
    expect(before).toContain("Concepts");
    const childrenBefore = before.filter((p) => p.startsWith("Concepts/"));
    expect(childrenBefore).toHaveLength(0);

    // Expand the folder
    await clickFolder(client, "Concepts");

    // Wait for CSS animation (150ms) + React render
    await sleep(400);

    // Verify folder is now expanded
    const expanded = await isFolderExpanded(client, "Concepts");
    expect(expanded).toBe(true);

    // Verify children are now visible
    const after = await getVisibleTreeItems(client);
    const childrenAfter = after.filter((p) => p.startsWith("Concepts/"));
    expect(childrenAfter.length).toBeGreaterThan(0);

    // Spot-check a known child
    expect(childrenAfter).toContain("Concepts/Causal Inference.md");

    // Take a screenshot for visual review
    const screenshotsDir = path.join(import.meta.dirname, "screenshots");
    fs.mkdirSync(screenshotsDir, { recursive: true });
    await client.takeScreenshot(screenshotsDir);
  });

  it("collapse folder hides children", async () => {
    // Ensure folder is expanded first (self-contained, doesn't depend on prior test)
    if (!(await isFolderExpanded(client, "Concepts"))) {
      await clickFolder(client, "Concepts");
      await sleep(400);
    }

    // Collapse it
    await clickFolder(client, "Concepts");
    await sleep(400);

    // Verify collapsed
    const collapsed = await isFolderExpanded(client, "Concepts");
    expect(collapsed).toBe(false);

    // Children should no longer be visible (0 height)
    const items = await getVisibleTreeItems(client);
    const children = items.filter((p) => p.startsWith("Concepts/"));
    expect(children).toHaveLength(0);
  });
});
