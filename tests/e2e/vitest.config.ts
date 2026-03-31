import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60_000,
    hookTimeout: 120_000,
    globalSetup: "./setup.ts",
    include: ["**/*.spec.ts"],
    forceExit: true,
    // Sequential execution: all specs share a single app instance via MCP socket.
    // Parallel execution causes specs to mutate shared state (canvas files, open
    // tabs, expanded folders) and interfere with each other. See todo:
    // .claude/todo/e2e-per-worker-app-instances.md for the parallel-at-scale plan.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
