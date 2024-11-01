import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  fetchMomentByActivity,
  fetchPaginatedMoments,
  fetchVideoMoments,
} from "~/lib/db/moments";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const reactionTypeSchema = z.enum(["thumbs_up", "thumbs_down"]);

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

  getReactions: publicProcedure
    .input(z.object({ momentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("moment_reactions")
        .select("*, user:profiles(*)")
        .eq("moment_id", input.momentId);

      if (error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      return data;
    }),

  addReaction: publicProcedure
    .input(
      z.object({
        momentId: z.string(),
        type: reactionTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.supabase.auth.getUser();
      if (!user.data.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingReaction = await ctx.supabase
        .from("moment_reactions")
        .select("*")
        .eq("moment_id", input.momentId)
        .eq("user_id", user.data.user.id);

      if (existingReaction.data?.[0]?.id) {
        const { error } = await ctx.supabase
          .from("moment_reactions")
          .delete()
          .eq("id", existingReaction.data[0].id);

        if (error)
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      }

      const { error } = await ctx.supabase.from("moment_reactions").upsert({
        moment_id: input.momentId,
        user_id: user.data.user.id,
        reaction_type: input.type,
      });

      if (error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      return { success: true };
    }),

  getComments: publicProcedure
    .input(z.object({ momentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("moment_comments")
        .select("*, user:profiles(*)")
        .eq("moment_id", input.momentId)
        .order("created_at", { ascending: true });

      if (error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      return data;
    }),

  addComment: publicProcedure
    .input(
      z.object({
        momentId: z.string(),
        content: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.supabase.auth.getUser();
      if (!user.data.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { error } = await ctx.supabase.from("moment_comments").insert({
        moment_id: input.momentId,
        user_id: user.data.user.id,
        content: input.content,
      });

      if (error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      return { success: true };
    }),
});
