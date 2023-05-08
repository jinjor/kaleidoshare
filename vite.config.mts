import { defineConfig } from "npm:vite@^4.0.4";
import react from "npm:@vitejs/plugin-react@^3.0.1";

import "npm:react@^18.2.0";
import "npm:react-dom@^18.2.0/client";
import "npm:matter-js@^0.19.0";
import "npm:poly-decomp@^0.3.0";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
