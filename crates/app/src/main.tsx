import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Dev-only: MCP plugin listeners for GUI automation/testing
if (import.meta.env.DEV) {
  import("tauri-plugin-mcp").then(({ setupPluginListeners }) => {
    setupPluginListeners();
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
