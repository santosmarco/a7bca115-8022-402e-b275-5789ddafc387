import { TRPCError } from "@trpc/server";

import { sendInvitationEmail } from "~/lib/email";
import { createClient } from "~/lib/supabase/server";
import { UserInviteCreate } from "~/lib/user-invites/schemas";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const userInvitesRouter = createTRPCRouter({
  create: publicProcedure
    .input(UserInviteCreate)
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", input.email)
        .maybeSingle();

      if (checkError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check for existing user",
        });
      }

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      const { data: userInvite, error: createError } = await supabase
        .from("user_invites")
        .insert({
          first_name: input.firstName,
          last_name: input.lastName,
          company: input.companyName,
          email: input.email,
          invited_by: input.userId,
        })
        .select("*, invited_by_profile:profiles(*)")
        .single();

      if (createError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create user invite",
        });
      }

      await sendInvitationEmail({ invite: userInvite });

      return userInvite;
    }),
});
