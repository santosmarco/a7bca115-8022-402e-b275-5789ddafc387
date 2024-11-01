import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { authRouter } from "./routers/auth";
import { momentsRouter } from "./routers/moments";
import { notionRouter } from "./routers/notion";
import { videosRouter } from "./routers/videos";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  moments: momentsRouter,
  notion: notionRouter,
  videos: videosRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
