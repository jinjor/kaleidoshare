import { defineConfig } from "npm:vite@^4.0.4";
import react from "npm:@vitejs/plugin-react@^3.0.1";

// @deno-types="npm:@types/react@^18.2.6"
import "npm:react@^18.2.0";
// @deno-types="npm:@types/react-dom@^18.2.4"
import "npm:react-dom@^18.2.0/client";
// @deno-types="npm:@types/matter-js@^0.18.3"
import "npm:matter-js@^0.19.0";
import "npm:poly-decomp@^0.3.0";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
