import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  signOut: publicProcedure.mutation(async ({ ctx }) => {
    try {
      const { error } = await ctx.supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to sign out: ${(error as Error).message}`,
        cause: error,
      });
    }
  }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    try {
      const {
        data: { session },
        error,
      } = await ctx.supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get session: ${(error as Error).message}`,
        cause: error,
      });
    }
  }),

  getUser: publicProcedure.query(async ({ ctx }) => {
    try {
      const {
        data: { user },
        error,
      } = await ctx.supabase.auth.getUser();
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get user: ${(error as Error).message}`,
          cause: error,
        });
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      const { data: profile, error: profileError } = await ctx.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileError)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get profile: ${(profileError as Error).message}`,
          cause: profileError,
        });
      if (!profile)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      return { ...user, ...profile };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get user: ${(error as Error).message}`,
        cause: error,
      });
    }
  }),

  signInWithOAuth: publicProcedure
    .input(
      z.object({
        provider: z.enum(["google"]),
        redirectTo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase.auth.signInWithOAuth({
          provider: input.provider,
          options: {
            redirectTo: input.redirectTo,
          },
        });
        if (error) throw error;
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sign in: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),
});