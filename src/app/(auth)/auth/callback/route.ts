import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { env } from "~/env";
import { logger } from "~/lib/logging/server";
import { createClient as createRecallClient } from "~/lib/recall/client";
import { __dangerouslyCreateAdminClient__ } from "~/lib/supabase/admin";
import { createClient } from "~/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const provider = searchParams.get("provider");
    const next = searchParams.get("next") ?? "";
    const invite = searchParams.get("invite");

    if (code) {
      const supabase = await createClient();

      // If invite exists, verify it's valid
      if (invite) {
        const { data: inviteData } = await supabase
          .from("user_invites")
          .select("*")
          .eq("id", invite)
          .maybeSingle();

        if (!inviteData) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${env.NEXT_PUBLIC_SITE_URL}/login?reason=invitation-expired`,
          );
        }
      }

      const { data: authData, error: authError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (authError) {
        logger.error("Auth exchange error:", authError);
        throw authError;
      }

      const { user, session } = authData;
      if (!user || !session) {
        logger.error("Missing user or session data");
        throw new Error("Missing user or session data");
      }

      const { data: userProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (userProfile?.status === "inactive") {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${env.NEXT_PUBLIC_SITE_URL}/login?reason=inactive`,
        );
      }

      // Handle invite case - delete the invite after successful auth
      if (invite) {
        const { data: inviteData } = await supabase
          .from("user_invites")
          .select("*")
          .eq("id", invite)
          .single();

        if (!inviteData) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${env.NEXT_PUBLIC_SITE_URL}/login?reason=invitation-expired&email=${encodeURIComponent(user.email ?? "")}`,
          );
        }

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (existingProfile) {
          await supabase
            .from("profiles")
            .update({
              nickname: [inviteData?.first_name, inviteData?.last_name]
                .filter(Boolean)
                .join(" "),
              company: inviteData?.company,
              coach_id: inviteData?.invited_by,
            })
            .eq("id", existingProfile.id);
        } else {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            nickname: [inviteData?.first_name, inviteData?.last_name]
              .filter(Boolean)
              .join(" "),
            company: inviteData?.company,
            coach_id: inviteData?.invited_by,
          });
        }

        await supabase.from("user_invites").delete().eq("id", invite);
      } else {
        // No invite - check if this is a new signup
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", user.id)
          .maybeSingle();

        // If no metadata found or created_at is very recent, this is a new signup
        if (
          !profile?.created_at ||
          new Date().getTime() - new Date(profile.created_at).getTime() < 5000
        ) {
          const supabaseAdmin = await __dangerouslyCreateAdminClient__();
          // Delete the user, sign out, and redirect
          await supabaseAdmin.from("profiles").delete().eq("id", user.id);
          await supabaseAdmin.auth.admin.deleteUser(user.id);
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${env.NEXT_PUBLIC_SITE_URL}/login?reason=forbidden`,
          );
        }
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      const { data: existingCalendar } = await supabase
        .from("recall_calendars")
        .select("*, profile:profiles(*)")
        .eq("profile_id", user.id)
        .eq("platform", "google_calendar")
        .maybeSingle();

      if (
        provider === "google" &&
        session.provider_refresh_token &&
        !existingCalendar &&
        profile?.role !== "coach"
      ) {
        const recall = createRecallClient();
        const now = new Date().toISOString();

        try {
          const recallCalendar = await recall.calendarV2.calendars_create({
            id: uuidv4(),
            oauth_client_id: env.GOOGLE_OAUTH_CLIENT_ID,
            oauth_client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
            oauth_refresh_token: session.provider_refresh_token,
            platform: "google_calendar",
            platform_email: user.email ?? null,
            oauth_email: user.email ?? null,
            status: "connected",
            created_at: now,
            updated_at: now,
          });

          const { error: insertError } = await supabase
            .from("recall_calendars")
            .insert({
              id: recallCalendar.id,
              profile_id: user.id,
              platform: "google_calendar",
            });

          if (insertError) {
            logger.error("Failed to insert recall calendar:", insertError);
          }
        } catch (error) {
          logger.error("Failed to create recall calendar:", error as Error);
        }
      }
    }

    // Handle redirect
    const forwardedHost = request.headers.get("x-forwarded-host");

    if (forwardedHost) {
      return NextResponse.redirect(
        `http${env.NODE_ENV !== "production" ? "" : "s"}://${forwardedHost}${next}`,
      );
    }

    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}${next}`);
  } catch (error) {
    logger.error("Callback error:", error as Error);
    // Redirect to error page or home with error param
    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/auth/error`);
  }
}
