// Global test setup: polyfill browser APIs that jsdom doesn't implement.

// window.matchMedia — used by uiStore at module initialisation time.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (_query: string) => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});
