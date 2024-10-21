import { listVideos } from "~/lib/api-video/videos";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const videosRouter = createTRPCRouter({
  listAll: publicProcedure.query(async () => {
    return await listVideos({ pageSize: 25 });
  }),
});
