import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import schemaPlugin from "./schema-plugin";

export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
  plugins: [schemaPlugin(), react()],
});
