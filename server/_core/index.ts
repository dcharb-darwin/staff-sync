import express from "express";
import path from "node:path";
import fs from "node:fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { db } from "../db/index";
import { seedDatabase } from "../db/seed";

const app = express();
const PORT = 3000;
const isDev = process.env.NODE_ENV !== "production";

// tRPC middleware
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({ db }),
  }),
);

if (isDev) {
  // Vite dev server as middleware
  const { createServer } = await import("vite");
  const vite = await createServer({
    configFile: path.resolve(import.meta.dirname, "../../vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
    root: path.resolve(import.meta.dirname, "../../client"),
  });
  app.use(vite.middlewares);

  // SPA fallback — read and transform index.html through Vite
  app.use("*", async (req, res, next) => {
    try {
      const htmlPath = path.resolve(
        import.meta.dirname,
        "../../client/index.html",
      );
      let html = fs.readFileSync(htmlPath, "utf-8");
      html = await vite.transformIndexHtml(req.originalUrl, html);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      next(e);
    }
  });
} else {
  // Production: serve built static files
  const distPath = path.resolve(import.meta.dirname, "../../dist/public");
  app.use(express.static(distPath));

  // SPA fallback
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Seed and start
await seedDatabase(db);
app.listen(PORT, () => {
  console.log(`Staff Sync server running on http://localhost:${PORT}`);
});
