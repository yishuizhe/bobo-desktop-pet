import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "src"),
  base: "./",
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        pet: path.resolve(__dirname, "src/renderer-pet/index.html"),
        panel: path.resolve(__dirname, "src/renderer-panel/index.html"),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
