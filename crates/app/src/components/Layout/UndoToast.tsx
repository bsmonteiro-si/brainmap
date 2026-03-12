import { useEffect, useState } from "react";
import { useUndoStore } from "../../stores/undoStore";

export function UndoToast() {
  const message = useUndoStore((s) => s.toastMessage);
  const toastKey = useUndoStore((s) => s.toastKey);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [message, toastKey]);

  if (!visible || !message) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    padding: "8px 16px",
    fontSize: 13,
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    backdropFilter: "blur(12px)",
    pointerEvents: "none",
  };

  return <div style={style}>{message}</div>;
}
