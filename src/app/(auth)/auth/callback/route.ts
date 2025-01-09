import type { AuthSession, Session, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { env } from "~/env";
import { logger } from "~/lib/logging/server";
import { createClient as createRecallClient } from "~/lib/recall/client";
import { __dangerouslyCreateAdminClient__ } from "~/lib/supabase/admin";
import type { Tables } from "~/lib/supabase/database.types";
import { createClient, type SupabaseServerClient } from "~/lib/supabase/server";

export async function GET(request: Request) {
  const { code, provider, next, invite } = validateAndSetupRequest(request);

  // Step 1: Validate code presence
  if (!code || !provider) {
    logger.warn("Missing code or provider in auth callback");
    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/auth/error`);
  }

  const supabase = await createClient();

  try {
    // Step 2: Validate invite if present
    if (invite) {
      const inviteData = await validateInvite(supabase, invite);
      if (!inviteData) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${env.NEXT_PUBLIC_SITE_URL}/login?reason=invitation-expired`,
        );
      }
    }

    // Step 3: Authenticate user
    const { user, session } = await performAuthentication(supabase, code);
    if (!user || !session) {
      logger.error("Authentication failed: Missing user or session data");
      return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/auth/error`);
    }

    // Step 4: Check user profile status
    const userProfile = await getUserProfile(supabase, user.id);
    if (userProfile?.status === "inactive") {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_SITE_URL}/login?reason=inactive`,
      );
    }

    // Step 5: Handle user profile creation/update
    if (invite) {
      const inviteData = await validateInvite(supabase, invite);
      if (!inviteData) {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${env.NEXT_PUBLIC_SITE_URL}/login?reason=invitation-expired&email=${encodeURIComponent(
            user.email ?? "",
          )}`,
        );
      }
      await handleInvitedUserProfile(supabase, user, inviteData);
    } else {
      try {
        const isNewSignup = await checkNewSignup(supabase, user.id);
        if (isNewSignup) {
          await handleNewSignup(supabase, user.id);
          return NextResponse.redirect(
            `${env.NEXT_PUBLIC_SITE_URL}/login?reason=forbidden`,
          );
        }
      } catch (error) {
        logger.error("Error handling regular user profile:", { error });
        throw error;
      }
    }

    // Step 6: Setup Google Calendar if applicable
    const profile = await getUserProfile(supabase, user.id);
    if (profile && provider === "google" && profile.role !== "coach") {
      await setupGoogleCalendar(supabase, user, session, profile);
    }

    // Step 7: Handle final redirect
    return handleRedirect(request, next);
  } catch (error) {
    logger.error("Auth callback error:", { error });
    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/auth/error`);
  }
}

function validateAndSetupRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  return {
    code: searchParams.get("code"),
    provider: searchParams.get("provider"),
    next: searchParams.get("next") ?? "",
    invite: searchParams.get("invite"),
  };
}

async function validateInvite(
  supabase: SupabaseServerClient,
  inviteId: string,
) {
  const { data } = await supabase
    .from("user_invites")
    .select()
    .eq("id", inviteId)
    .maybeSingle();
  return data;
}

async function performAuthentication(
  supabase: SupabaseServerClient,
  code: string,
) {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    logger.error("Auth exchange error:", { error });
    throw error;
  }
  return data;
}

async function getUserProfile(supabase: SupabaseServerClient, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .maybeSingle();
  return data;
}

async function checkNewSignup(supabase: SupabaseServerClient, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();

  return (
    !profile?.created_at ||
    new Date().getTime() - new Date(profile.created_at).getTime() < 5000
  );
}

async function handleNewSignup(supabase: SupabaseServerClient, userId: string) {
  const supabaseAdmin = await __dangerouslyCreateAdminClient__();
  await Promise.all([
    supabaseAdmin.from("profiles").delete().eq("id", userId),
    supabaseAdmin.auth.admin.deleteUser(userId),
    supabase.auth.signOut(),
  ]);
}

async function handleInvitedUserProfile(
  supabase: SupabaseServerClient,
  user: User,
  inviteData: Tables<"user_invites">,
) {
  const profileData = {
    nickname: [inviteData.first_name, inviteData.last_name]
      .filter(Boolean)
      .join(" "),
    company: inviteData.company,
    coach_id: inviteData.invited_by,
  };

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();

  await Promise.all([
    existingProfile
      ? supabase
          .from("profiles")
          .update(profileData)
          .eq("id", existingProfile.id)
      : supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          ...profileData,
        }),
    supabase.from("user_invites").delete().eq("id", inviteData.id),
  ]);
}

async function setupGoogleCalendar(
  supabase: SupabaseServerClient,
  user: User,
  session: Session,
  profile: Tables<"profiles">,
) {
  const { data: existingCalendar } = await supabase
    .from("recall_calendars")
    .select("*, profile:profiles(*)")
    .eq("profile_id", user.id)
    .eq("platform", "google_calendar")
    .maybeSingle();

  if (!existingCalendar && profile.role !== "coach") {
    const recallCalendar = await createRecallCalendar(
      user,
      session.provider_refresh_token,
    );
    await supabase.from("recall_calendars").insert({
      id: recallCalendar.id,
      profile_id: user.id,
      platform: "google_calendar",
    });
  }
}

async function createRecallCalendar(
  user: User,
  providerRefreshToken: string | null | undefined,
) {
  if (!providerRefreshToken) throw new Error("Missing provider refresh token");

  const recall = createRecallClient();
  const now = new Date().toISOString();

  try {
    return await recall.calendarV2.calendars_create({
      id: uuidv4(),
      oauth_client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      oauth_client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      oauth_refresh_token: providerRefreshToken,
      platform: "google_calendar",
      platform_email: user.email ?? null,
      oauth_email: user.email ?? null,
      status: "connected",
      created_at: now,
      updated_at: now,
    });
  } catch (error) {
    logger.error("Failed to create recall calendar:", { error });
    throw error;
  }
}

function handleRedirect(request: Request, next: string): NextResponse {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}${next}`);
  }

  const protocol = env.NODE_ENV === "production" ? "https" : "http";
  return NextResponse.redirect(`${protocol}://${forwardedHost}${next}`);
}
