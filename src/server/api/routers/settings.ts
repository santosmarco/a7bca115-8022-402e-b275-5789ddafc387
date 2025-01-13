import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createClient } from "~/lib/supabase/server";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const settingsRouter = createTRPCRouter({
  retrieveForProfile: publicProcedure
    .input(z.object({ profileId: z.string().nullish() }))
    .query(async ({ input }) => {
      if (!input.profileId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Profile ID is required",
        });
      }

      const supabase = await createClient();

      const { data: settings, error: settingsError } = await supabase
        .from("user_settings")
        .select("*, profile:profiles(*)")
        .eq("profile_id", input.profileId)
        .single();

      if (settingsError) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      return settings;
    }),
});
