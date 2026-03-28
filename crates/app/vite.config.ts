import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: parseInt(process.env.VITE_PORT || "1420", 10),
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: parseInt(process.env.VITE_HMR_PORT || "1421", 10),
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
