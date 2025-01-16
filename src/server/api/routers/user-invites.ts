import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
        .eq("role", input.role)
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
          role: input.role,
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

  resendInvitation: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["coach", "user"]),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      const { data: userInvite, error: userInviteError } = await supabase
        .from("user_invites")
        .select("*, invited_by_profile:profiles(*)")
        .eq("email", input.email)
        .eq("role", input.role)
        .maybeSingle();

      if (userInviteError || !userInvite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User invite not found",
        });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", input.email)
        .maybeSingle();

      if (profile?.status === "active") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Client is already active",
        });
      }

      await sendInvitationEmail({ invite: userInvite });

      return { success: true };
    }),
});
