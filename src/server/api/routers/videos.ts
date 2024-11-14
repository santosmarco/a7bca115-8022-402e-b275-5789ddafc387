import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getVideo, listVideos } from "~/lib/api-video/videos";
import type { VideoMoment, VideoMoments } from "~/lib/schemas/video-moment";
import type { Tables } from "~/lib/supabase/database.types";
import { createClient } from "~/lib/supabase/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const VideoOptions = z.object({
  tags: z.array(z.string()).optional(),
  moments: z
    .object({
      includeDeprecated: z.boolean().default(false),
      includeNonRelevant: z.boolean().default(false),
    })
    .default({}),
});
export type VideoOptions = z.infer<typeof VideoOptions>;

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
    relevant: moment.relevant,
    reactions: [],
  } satisfies VideoMoment;
}

async function fetchVideoData(
  videoId: string,
  videoOptions: VideoOptions | undefined,
) {
  try {
    const supabase = await createClient();

    let momentsQuery = supabase
      .from("moments")
      .select("*")
      .eq("video_api_id", videoId);

    if (!videoOptions?.moments.includeDeprecated) {
      momentsQuery = momentsQuery.eq("latest", true);
    }
    if (!videoOptions?.moments.includeNonRelevant) {
      momentsQuery = momentsQuery.eq("relevant", true);
    }

    const [meetingResult, momentsResult] = await Promise.all([
      supabase.from("meetings").select("*").eq("video_api_id", videoId),
      momentsQuery,
    ]);

    if (meetingResult.error) throw meetingResult.error;
    if (momentsResult.error) throw momentsResult.error;

    const momentReactionsResult = await supabase
      .from("moment_reactions")
      .select("*")
      .in("moment_id", momentsResult.data?.map((m) => m.id) ?? []);

    if (momentReactionsResult.error) throw momentReactionsResult.error;

    const transformedMoments = momentsResult.data
      .map(transformMoment)
      .map((m) => ({
        ...m,
        reactions: momentReactionsResult.data?.filter(
          (r) => r.moment_id === m.id,
        ),
      }));

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
  listAll: publicProcedure
    .input(
      z
        .object({
          cursor: z.number().nullish(),
          limit: z.number().min(1).max(100).default(50),
          options: VideoOptions.optional(),
        })
        .default({}),
    )
    .query(async ({ input }) => {
      try {
        const { cursor, limit, options } = input;
        const videos = await listVideos({
          pageSize: limit,
          currentPage: cursor ? Math.floor(cursor / limit) + 1 : 1,
          sortBy: "createdAt",
          sortOrder: "desc",
          tags: options?.tags,
        });

        const enrichedVideos = await Promise.all(
          videos.map(async (video) => {
            const { meeting, summary, moments } = await fetchVideoData(
              video.videoId,
              options,
            );

            return {
              ...video,
              meeting,
              vtt: meeting?.original_vtt_file,
              summary,
              moments,
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

        const nextCursor =
          enrichedVideos.length === limit ? (cursor ?? 0) + limit : undefined;

        return {
          videos: enrichedVideos,
          nextCursor,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list videos: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),

  getOne: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        options: VideoOptions.optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const video = await getVideo(input.videoId);
        const { meeting, summary, moments } = await fetchVideoData(
          video.videoId,
          input.options,
        );

        return {
          ...video,
          meeting,
          vtt: meeting?.original_vtt_file,
          summary,
          moments,
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
