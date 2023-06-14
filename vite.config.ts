import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import markdown, { Mode } from "vite-plugin-markdown";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  plugins: [react(), markdown({ mode: [Mode.HTML] })],
});
