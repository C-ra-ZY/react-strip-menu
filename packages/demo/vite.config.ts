import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/react-strip-menu-demo/" : "/",
  server: {
    port: 3456,
    open: true,
  },
}));
