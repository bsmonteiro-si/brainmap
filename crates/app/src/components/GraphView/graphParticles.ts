import type { Core } from "cytoscape";

export function startParticleAnimation(
  cy: Core,
  canvas: HTMLCanvasElement,
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  let frame: number;
  let running = true;
  let lastW = 0;
  let lastH = 0;

  function tick() {
    if (!running) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width * dpr;
      const h = rect.height * dpr;
      if (w !== lastW || h !== lastH) {
        canvas.width = w;
        canvas.height = h;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastW = w;
        lastH = h;
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    }

    const visibleEdges = cy.edges(":visible");
    if (visibleEdges.length > 200) {
      // Auto-disable for performance
      frame = requestAnimationFrame(tick);
      return;
    }

    const t = (Date.now() % 3000) / 3000;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();

    visibleEdges.forEach((edge, i) => {
      const offset = (i * 0.618) % 1; // golden ratio offset for visual variety
      const t2 = (t + offset) % 1;
      const sp = edge.source().renderedPosition();
      const tp = edge.target().renderedPosition();
      const x = sp.x + (tp.x - sp.x) * t2;
      const y = sp.y + (tp.y - sp.y) * t2;
      ctx.moveTo(x + 1.5, y);
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    });

    ctx.fill();
    frame = requestAnimationFrame(tick);
  }

  tick();

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
