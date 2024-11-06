import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createClient } from "~/lib/supabase/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  signOut: publicProcedure.mutation(async () => {
    const supabase = await createClient();
    try {
      const { error } = await supabase.auth.signOut();
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sign out: ${(error as Error).message}`,
          cause: error,
        });
      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to sign out: ${(error as Error).message}`,
        cause: error,
      });
    }
  }),

  getSession: publicProcedure.query(async () => {
    const supabase = await createClient();
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get session: ${(error as Error).message}`,
          cause: error,
        });
      if (!session)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      return session;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get session: ${(error as Error).message}`,
        cause: error,
      });
    }
  }),

  getUser: publicProcedure.query(async () => {
    const supabase = await createClient();
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get user: ${(error as Error).message}`,
          cause: error,
        });
      if (!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      const { data: profile, error: profileError } = await supabase
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
    .mutation(async ({ input }) => {
      const supabase = await createClient();
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
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
