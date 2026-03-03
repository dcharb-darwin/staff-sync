import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PORT = parseInt(process.env.PORT || "3000", 10);

async function start() {
    const app = express();

    // TODO: Wire tRPC router
    // import { appRouter } from "../routers";
    // import * as trpcExpress from "@trpc/server/adapters/express";
    // app.use("/api/trpc", trpcExpress.createExpressMiddleware({ router: appRouter }));

    // Vite dev middleware (P7: explicit configFile path for Docker)
    const vite = await createViteServer({
        configFile: path.resolve(import.meta.dirname, "../../vite.config.ts"),
        root: path.resolve(import.meta.dirname, "../../client"),
        server: { middlewareMode: true, hmr: true },
        appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

start().catch(console.error);
