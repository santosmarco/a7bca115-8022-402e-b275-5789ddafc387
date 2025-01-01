import { z } from "zod";

import { createClient } from "~/lib/supabase/server";
import { transformUserInviteIntoProfile } from "~/lib/user-invites/transformations";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const clientsRouter = createTRPCRouter({
  getClients: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        loadAll: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      const clientsQuery = supabase
        .from("profiles")
        .select("*, coach:profiles!coach_id(*)");

      if (!input.loadAll) {
        clientsQuery.eq("coach_id", input.userId);
      }

      const userInvitesQuery = supabase
        .from("user_invites")
        .select("*, invited_by_profile:profiles(*)");

      if (!input.loadAll) {
        userInvitesQuery.eq("invited_by", input.userId);
      }

      const [{ data: clients }, { data: userInvites }] = await Promise.all([
        clientsQuery,
        userInvitesQuery,
      ]);

      return [
        ...(clients ?? []),
        ...(userInvites ?? []).map(transformUserInviteIntoProfile),
      ];
    }),
});
