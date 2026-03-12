import type { WorkspaceEvent } from "../types";

type Listener = (event: WorkspaceEvent) => void;

class MockEventBus {
  private listeners: Set<Listener> = new Set();

  subscribe(callback: Listener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  emit(event: WorkspaceEvent): void {
    this.listeners.forEach((cb) => cb(event));
  }
}

export const eventBus = new MockEventBus();
