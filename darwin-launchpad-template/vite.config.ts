import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client/src"), // P9: no trailing slash
        },
    },
    root: "client",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
    },
    server: {
        proxy: {
            "/api": {
                target: `http://localhost:${process.env.PORT || 3000}`,
                changeOrigin: true,
            },
        },
    },
});
