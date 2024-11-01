import { videosRouter } from "~/server/api/routers/videos";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { momentsRouter } from "./routers/moments";

export const appRouter = createTRPCRouter({
  moments: momentsRouter,
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
