import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DJANGO = "http://127.0.0.1:8000";

// `npm run build` → ../static/app/ (Django şol ýerden berýär)
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/static/app/" : "/",
  build: { outDir: "../static/app", emptyOutDir: true },
  server: {
    port: 5173,
    proxy: { "/api": DJANGO, "/media": DJANGO, "/panel": DJANGO, "/static": DJANGO },
  },
}));
