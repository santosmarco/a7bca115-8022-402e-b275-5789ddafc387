import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { authRouter } from "./routers/auth";
import { chatsRouter } from "./routers/chats";
import { clientsRouter } from "./routers/clients";
import { momentsRouter } from "./routers/moments";
import { notionRouter } from "./routers/notion";
import { userInvitesRouter } from "./routers/user-invites";
import { videosRouter } from "./routers/videos";
import { coachingFrameworksRouter } from "./routers/coaching-frameworks";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  chats: chatsRouter,
  moments: momentsRouter,
  notion: notionRouter,
  videos: videosRouter,
  coachingFrameworks: coachingFrameworksRouter,
  clients: clientsRouter,
  userInvites: userInvitesRouter,
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
