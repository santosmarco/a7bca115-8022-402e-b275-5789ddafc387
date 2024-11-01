import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getVideo, listVideos } from "~/lib/api-video/videos";
import {
  type VideoMoment,
  type VideoMoments,
} from "~/lib/schemas/video-moment";
import { type Tables } from "~/lib/supabase/database.types";
import { createClient } from "~/lib/supabase/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

function transformMoment(moment: Tables<"moments">, idx: number) {
  return {
    id: moment.id,
    index: `${moment.video_api_id}_${moment.activity}_${idx}`,
    sequence_id: idx ?? "",
    segment_id_sequence_start: moment.segment_id_sequence_start ?? 0,
    segment_id_sequence_end: moment.segment_id_sequence_end ?? 0,
    title: (moment.title ?? "").replace(/^"|"$/g, ""),
    summary: (moment.summary ?? "").replace(/^"|"$/g, ""),
    segment_start_timestamp: moment.segment_start_timestamp ?? "",
    segment_end_timestamp: moment.segment_end_timestamp ?? "",
    segment_start_timestamp_in_seconds:
      moment.segment_start_timestamp_in_seconds ?? 0,
    segment_end_timestamp_in_seconds:
      moment.segment_end_timestamp_in_seconds ?? 0,
    video_id: moment.video_api_id ?? "",
    activity_type: moment.activity_type ?? "",
    activity_reasoning: (moment.activity_reasoning ?? "").replace(/^"|"$/g, ""),
    target_person_type: moment.target_person_type ?? "",
    target_person_reasoning: null,
    activity: moment.activity ?? "",
  } satisfies VideoMoment;
}

async function fetchVideoData(videoId: string) {
  try {
    const supabase = await createClient();

    const [meetingResult, momentsResult] = await Promise.all([
      supabase.from("meetings").select("*").eq("video_api_id", videoId),
      supabase
        .from("moments")
        .select("*")
        .eq("video_api_id", videoId)
        .eq("latest", true),
    ]);

    if (meetingResult.error) throw meetingResult.error;
    if (momentsResult.error) throw momentsResult.error;

    const transformedMoments: VideoMoments =
      momentsResult.data.map(transformMoment);

    return {
      meeting: meetingResult.data?.[0],
      summary: (meetingResult.data?.[0]?.summary ?? "").replace(/^"|"$/g, ""),
      moments: transformedMoments,
    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to fetch video data: ${(error as Error).message}`,
      cause: error,
    });
  }
}

export const videosRouter = createTRPCRouter({
  listAll: publicProcedure.query(async () => {
    try {
      const videos = await listVideos({ pageSize: 25 });

      return await Promise.all(
        videos.map(async (video) => {
          const { meeting, summary, moments } = await fetchVideoData(
            video.videoId,
          );

          return {
            ...video,
            vtt: meeting?.original_vtt_file,
            metadata: [
              ...video.metadata.filter(
                (m) => m.key !== "summary" && m.key !== "activities",
              ),
              { key: "summary", value: summary },
              { key: "activities", value: JSON.stringify(moments) },
            ],
          };
        }),
      );
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to list videos: ${(error as Error).message}`,
        cause: error,
      });
    }
  }),

  getOne: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      try {
        const video = await getVideo(input.videoId);
        const { summary, moments } = await fetchVideoData(video.videoId);

        return {
          ...video,
          metadata: [
            ...video.metadata.filter(
              (m) => m.key !== "summary" && m.key !== "activities",
            ),
            { key: "summary", value: summary },
            { key: "activities", value: JSON.stringify(moments) },
          ],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get video: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),
});
