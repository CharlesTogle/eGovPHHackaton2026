import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/egov-ai": {
        target: "https://egov-ai-core-ws.oueg.info",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/egov-ai/, "/api/v1/egov/integration"),
      },
      "/api/ereport": {
        target: "https://stg-ereport-ws.oueg.info",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ereport/, "/api/integration"),
      },
    },
  },
})
