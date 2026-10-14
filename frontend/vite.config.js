import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Requests to /api are forwarded to the Flask backend, so both must be running.
export default defineConfig({
  plugins: [react()],
  // npm run build puts the finished site in backend/static so Flask can serve it
  build: { outDir: "../backend/static", emptyOutDir: true },
  server: {
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:5000" },
  },
});