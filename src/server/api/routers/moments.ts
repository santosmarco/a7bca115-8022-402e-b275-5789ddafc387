import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  fetchMomentByActivity,
  fetchPaginatedMoments,
  fetchVideoMoments,
} from "~/lib/db/moments";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const momentsRouter = createTRPCRouter({
  listByVideo: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      try {
        return await fetchVideoMoments(input.videoId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list moments: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),

  getOne: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        activity: z.string(),
        sequenceId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const moment = await fetchMomentByActivity(
          input.videoId,
          input.activity,
          input.sequenceId,
        );

        if (!moment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Moment not found",
          });
        }

        return moment;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get moment: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),

  listAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(50),
          cursor: z.number().optional(),
        })
        .default({}),
    )
    .query(async ({ input }) => {
      try {
        return await fetchPaginatedMoments(input.limit, input.cursor);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to list all moments: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),
});
