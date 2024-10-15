import { Activities } from "~/lib/schemas/activity";
import { apiVideo } from "~/server/api/services/api-video";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const videosRouter = createTRPCRouter({
  listAll: publicProcedure.query(async () => {
    const videos = await apiVideo.videos.list();
    const videosWithDuration = await Promise.all(
      videos.data.map(async (video) => {
        const details = await apiVideo.videos.getStatus(video.videoId);
        return { ...video, details };
      }),
    );
    const videosWithMetadataParsed = videosWithDuration.map((video) => {
      const summary = video.metadata?.find(
        (item) => item.key === "summary",
      )?.value;
      const activities = video.metadata?.find(
        (item) => item.key === "activities",
      )?.value;
      const activitiesParsed = activities
        ? Activities.parse(JSON.parse(activities))
        : null;
      return { ...video, summary, activity: activitiesParsed };
    });
    return { data: videosWithMetadataParsed };
  }),
});
