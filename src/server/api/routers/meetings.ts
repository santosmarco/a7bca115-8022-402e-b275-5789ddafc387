import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createClient } from "~/lib/supabase/server";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const meetingsRouter = createTRPCRouter({
  getForProfile: publicProcedure.input(z.string()).query(async ({ input }) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("profile_id", input);
    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    return data;
  }),
});
