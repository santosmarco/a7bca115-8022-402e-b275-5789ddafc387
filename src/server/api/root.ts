import { calendarRouter } from "~/server/api/routers/calendar";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { authRouter } from "./routers/auth";
import { chatsRouter } from "./routers/chats";
import { clientsRouter } from "./routers/clients";
import { coachingFrameworksRouter } from "./routers/coaching-frameworks";
import { meetingsRouter } from "./routers/meetings";
import { momentsRouter } from "./routers/moments";
import { notionRouter } from "./routers/notion";
import { onboardingRouter } from "./routers/onboarding";
import { settingsRouter } from "./routers/settings";
import { userInvitesRouter } from "./routers/user-invites";
import { videosRouter } from "./routers/videos";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  chats: chatsRouter,
  moments: momentsRouter,
  notion: notionRouter,
  videos: videosRouter,
  coachingFrameworks: coachingFrameworksRouter,
  clients: clientsRouter,
  userInvites: userInvitesRouter,
  settings: settingsRouter,
  onboarding: onboardingRouter,
  meetings: meetingsRouter,
  calendar: calendarRouter,
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
