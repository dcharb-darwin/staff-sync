import { initTRPC } from "@trpc/server";

const t = initTRPC.create();

export const appRouter = t.router({
    // TODO: Add your tRPC procedures here
    // Example:
    // getUsers: t.procedure.query(async () => {
    //   const { db } = await import("./db");
    //   const { users } = await import("./db/schema");
    //   return await db.select().from(users);
    // }),
});

export type AppRouter = typeof appRouter;
