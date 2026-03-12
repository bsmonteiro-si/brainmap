import { NOTE_TYPE_COLORS, getNodeShape } from "./graphStyles";

const SHAPE_PATHS: Record<string, string> = {
  ellipse: "M5,1 A4,4 0 1,1 5,9 A4,4 0 1,1 5,1 Z",
  roundrectangle: "M2,1 H8 A1,1 0 0,1 9,2 V8 A1,1 0 0,1 8,9 H2 A1,1 0 0,1 1,8 V2 A1,1 0 0,1 2,1 Z",
  diamond: "M5,0 L10,5 L5,10 L0,5 Z",
  rectangle: "M1,1 H9 V9 H1 Z",
  star: "M5,0 L6.5,3.5 L10,4 L7.5,6.5 L8,10 L5,8 L2,10 L2.5,6.5 L0,4 L3.5,3.5 Z",
  triangle: "M5,0 L10,10 L0,10 Z",
  pentagon: "M5,0 L10,4 L8,10 L2,10 L0,4 Z",
  hexagon: "M3,0 H7 L10,5 L7,10 H3 L0,5 Z",
  octagon: "M3,0 H7 L10,3 V7 L7,10 H3 L0,7 V3 Z",
  tag: "M0,1 H7 L10,5 L7,9 H0 Z",
};

function ShapeIcon({ shape, color }: { shape: string; color: string }) {
  const path = SHAPE_PATHS[shape] ?? SHAPE_PATHS.ellipse;
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" style={{ flexShrink: 0 }}>
      <path d={path} fill={color} />
    </svg>
  );
}

export function GraphLegend() {
  return (
    <div className="graph-legend">
      {Object.entries(NOTE_TYPE_COLORS).map(([type, color]) => (
        <div key={type} className="legend-item">
          <ShapeIcon shape={getNodeShape(type)} color={color} />
          <span className="legend-label">{type}</span>
        </div>
      ))}
    </div>
  );
}
