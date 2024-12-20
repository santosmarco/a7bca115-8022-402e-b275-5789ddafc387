import { createClient } from "~/lib/supabase/server";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const coachingFrameworksRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    const supabase = await createClient();

    const { data: frameworks } = await supabase
      .from("coaching_frameworks")
      .select("*")
      .order("title", { ascending: true });

    return frameworks;
  }),
});
