const MOCK_DELAYS: Record<string, number> = {
  openWorkspace: 400,
  getGraphTopology: 200,
  search: 100,
  readNote: 30,
  createNote: 150,
  updateNote: 100,
  deleteNote: 100,
  getNeighbors: 50,
  getStats: 20,
  default: 20,
};

export function mockDelay(operation: string): Promise<void> {
  const ms = MOCK_DELAYS[operation] ?? MOCK_DELAYS.default;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
