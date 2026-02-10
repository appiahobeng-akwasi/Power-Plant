import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    open: true,
    proxy: {
      "/plantnet-api": {
        target: "https://my-api.plantnet.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/plantnet-api/, ""),
        headers: {
          Origin: "https://my-api.plantnet.org",
          Referer: "https://my-api.plantnet.org/",
        },
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("origin", "https://my-api.plantnet.org");
            proxyReq.removeHeader("referer");
          });
        },
      },
      "/plantid-api": {
        target: "https://plant.id",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/plantid-api/, "/api"),
      },
    },
  },
});
