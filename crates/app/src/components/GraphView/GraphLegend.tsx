import { NOTE_TYPE_COLORS } from "./graphStyles";
import { NoteTypeIcon } from "../Layout/fileTreeIcons";

export function GraphLegend() {
  return (
    <div className="graph-legend">
      {Object.entries(NOTE_TYPE_COLORS).map(([type]) => (
        <div key={type} className="legend-item">
          <NoteTypeIcon noteType={type} size={12} />
          <span className="legend-label">{type}</span>
        </div>
      ))}
    </div>
  );
}
