import type { Session, User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { env } from "~/env";
import { logger } from "~/lib/logging/server";
import { createClient as createRecallClient } from "~/lib/recall/client";
import { __dangerouslyCreateAdminClient__ } from "~/lib/supabase/admin";
import type { Tables, TablesUpdate } from "~/lib/supabase/database.types";
import { createClient, type SupabaseServerClient } from "~/lib/supabase/server";

export async function GET(request: NextRequest) {
  logger.info("Auth callback started", { url: request.url });
  const { code, provider, next, invite } = validateAndSetupRequest(request);
  logger.info("Request params", { code, provider, next, invite });

  // Step 1: Validate code presence
  if (!code || !provider) {
    logger.warn("Missing code or provider in auth callback", {
      code,
      provider,
    });
    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/auth/error`);
  }

  const supabase = await createClient();
  logger.info("Supabase client created");

  try {
    // Step 2: Validate invite if present
    if (invite) {
      logger.info("Validating invite", { invite });
      const inviteData = await validateInvite(supabase, invite);
      logger.info("Invite validation result", { inviteData });
      if (!inviteData) {
        logger.warn("Invalid invite", { invite });
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${env.NEXT_PUBLIC_SITE_URL}/login?reason=invitation-expired`,
        );
      }
    }

    // Step 3: Authenticate user
    logger.info("Authenticating user", { code });
    const { user, session } = await performAuthentication(supabase, code);
    logger.info("Authentication result", { user, session });
    if (!user || !session) {
      logger.error("Authentication failed: Missing user or session data", {
        user,
        session,
      });
      return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/auth/error`);
    }

    // Step 4: Check user profile status
    logger.info("Checking user profile", { userId: user.id });
    const userProfile = await getUserProfile(supabase, user.id);
    logger.info("User profile result", { userProfile });
    if (userProfile?.status === "inactive") {
      logger.warn("Inactive user profile", {
        userId: user.id,
        status: userProfile.status,
      });
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${env.NEXT_PUBLIC_SITE_URL}/login?reason=inactive`,
      );
    }

    // Step 5: Handle user profile creation/update
    if (invite) {
      logger.info("Processing invited user", { invite, userId: user.id });
      const inviteData = await validateInvite(supabase, invite);
      logger.info("Invite data for profile creation", { inviteData });
      if (!inviteData) {
        logger.warn("Invalid invite during profile creation", { invite });
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${env.NEXT_PUBLIC_SITE_URL}/login?reason=invitation-expired&email=${encodeURIComponent(
            user.email ?? "",
          )}&role=user`,
        );
      }
      await handleInvitedUserProfile(supabase, user, inviteData);
      logger.info("Invited user profile handled successfully");
    } else {
      try {
        logger.info("Checking for new signup", { userId: user.id });
        const isNewSignup = await checkNewSignup(supabase, user.id);
        logger.info("New signup check result", { isNewSignup });
        if (isNewSignup) {
          logger.warn("Handling unauthorized new signup", { userId: user.id });
          await handleNewSignup(supabase, user.id);
          return NextResponse.redirect(
            `${env.NEXT_PUBLIC_SITE_URL}/login?reason=forbidden`,
          );
        }
      } catch (error) {
        logger.error("Error handling regular user profile:", {
          error,
          userId: user.id,
        });
        throw error;
      }
    }

    // Step 6: Setup Google Calendar if applicable
    logger.info("Checking Google Calendar setup requirements", {
      userId: user.id,
      provider,
    });
    const profile = await getUserProfile(supabase, user.id);
    logger.info("Profile for calendar setup", { profile });
    if (profile && provider === "google" && profile.role !== "coach") {
      logger.info("Setting up Google Calendar", { userId: user.id });
      await setupGoogleCalendar(supabase, user, session, profile);
      logger.info("Google Calendar setup complete");
    }

    // Step 7: Handle final redirect
    logger.info("Processing final redirect", { next });
    return handleRedirect(request, next);
  } catch (error) {
    logger.error("Auth callback error:", {
      error,
      stack: (error as Error).stack,
    });
    return NextResponse.redirect(`${env.NEXT_PUBLIC_SITE_URL}/auth/error`);
  }
}

function validateAndSetupRequest(request: NextRequest) {
  logger.info("Setting up request", { url: request.url });
  const { searchParams: searchParams1 } = new URL(request.url);
  const { searchParams: searchParams2 } = request.nextUrl ?? {};
  const searchParams = {
    get(key: string) {
      return searchParams1.get(key) || searchParams2?.get(key);
    },
  };

  let invite: string | null = null;
  let provider: string | null = null;

  // Parse and validate the state parameter
  const stateParam = searchParams.get("state");
  if (stateParam) {
    try {
      const stateData = JSON.parse(decodeURIComponent(stateParam)) as {
        invite: string | null;
        provider: string | null;
        nonce: string;
        timestamp: number;
      };

      // Validate timestamp to prevent replay attacks (15 minute window)
      const timestamp = stateData.timestamp;
      const fifteenMinutes = 15 * 60 * 1000;
      const isTimestampValid =
        timestamp && Date.now() - timestamp < fifteenMinutes;

      if (!isTimestampValid) {
        logger.warn("State timestamp invalid or expired", {
          timestamp,
          now: Date.now(),
        });
      } else if (stateData.provider !== "google") {
        logger.warn("Invalid provider in state", {
          provider: stateData.provider,
        });
      } else {
        invite = stateData.invite ?? null;
        provider = stateData.provider;
      }
    } catch (error) {
      logger.warn("Failed to parse state parameter", {
        stateParam,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const result = {
    code: searchParams.get("code"),
    provider: provider ?? searchParams.get("provider"),
    next: searchParams.get("next") ?? "",
    invite: invite ?? searchParams.get("invite"),
  };

  logger.info("Request setup result", {
    ...result,
    hasInvite: !!invite,
    hasProvider: !!provider,
  });
  return result;
}

async function validateInvite(
  supabase: SupabaseServerClient,
  inviteId: string,
) {
  logger.info("Validating invite", { inviteId });
  const { data } = await supabase
    .from("user_invites")
    .select()
    .eq("id", inviteId)
    .maybeSingle();
  logger.info("Invite validation result", { data });
  return data;
}

async function performAuthentication(
  supabase: SupabaseServerClient,
  code: string,
) {
  logger.info("Performing authentication", { code });
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    logger.error("Auth exchange error:", { error, code });
    throw error;
  }
  logger.info("Authentication successful", { data });
  return data;
}

async function getUserProfile(supabase: SupabaseServerClient, userId: string) {
  logger.info("Fetching user profile", { userId });
  const { data } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .maybeSingle();
  logger.info("User profile result", { data });
  return data;
}

async function checkNewSignup(supabase: SupabaseServerClient, userId: string) {
  logger.info("Checking new signup", { userId });
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();
  logger.info("Profile creation check", { profile });

  const isNew =
    !profile?.created_at ||
    new Date().getTime() - new Date(profile.created_at).getTime() < 5000;
  logger.info("New signup check result", { isNew, userId });
  return isNew;
}

async function handleNewSignup(supabase: SupabaseServerClient, userId: string) {
  logger.info("Handling new signup", { userId });
  const supabaseAdmin = await __dangerouslyCreateAdminClient__();
  logger.info("Admin client created");
  await Promise.all([
    supabaseAdmin.from("profiles").delete().eq("id", userId),
    supabaseAdmin.auth.admin.deleteUser(userId),
    supabase.auth.signOut(),
  ]);
  logger.info("New signup handled - user deleted", { userId });
}

async function handleInvitedUserProfile(
  supabase: SupabaseServerClient,
  user: User,
  inviteData: Tables<"user_invites">,
) {
  logger.info("Handling invited user profile", { user, inviteData });
  const profileData = {
    nickname:
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata.name === "string"
          ? user.user_metadata.name
          : [inviteData.first_name, inviteData.last_name]
              .filter(Boolean)
              .join(" "),
    company: inviteData.company,
    coach_id: inviteData.invited_by,
    role: inviteData.role === "user" ? "user" : "coach",
  } satisfies TablesUpdate<"profiles">;
  logger.info("Profile data prepared", { profileData });

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();
  logger.info("Existing profile check", { existingProfile });

  await Promise.all([
    (existingProfile
      ? supabase
          .from("profiles")
          .update(profileData)
          .eq("id", existingProfile.id)
          .select("*")
          .maybeSingle()
      : supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            ...profileData,
          })
          .select("*")
          .maybeSingle()
    ).then(async ({ data: profile }) => {
      const { data: userSettings } = await supabase
        .from("user_settings")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      // Get first name by taking everything before the first space
      const firstName = (profile?.nickname ?? profileData.nickname).split(
        " ",
      )[0];

      if (userSettings) {
        await supabase
          .from("user_settings")
          .update({
            bot_name: `${firstName}'s Notetaker`,
          })
          .eq("id", userSettings.id);
      } else {
        await supabase.from("user_settings").insert({
          profile_id: user.id,
          bot_name: `${firstName}'s Notetaker`,
        });
      }
    }),
    supabase.from("user_invites").delete().eq("id", inviteData.id),
  ]);
  logger.info("Invited user profile handled successfully", { userId: user.id });
}

async function setupGoogleCalendar(
  supabase: SupabaseServerClient,
  user: User,
  session: Session,
  profile: Tables<"profiles">,
) {
  logger.info("Setting up Google Calendar", { user, profile });
  const { data: existingCalendar } = await supabase
    .from("recall_calendars_v2")
    .select("*, profile:profiles(*)")
    .eq("profile_id", user.id)
    .eq("platform", "google_calendar")
    .maybeSingle();
  logger.info("Existing calendar check", { existingCalendar });

  if (!existingCalendar && profile.role !== "coach") {
    logger.info("Creating new recall calendar", { userId: user.id });
    const recallCalendar = await createRecallCalendar(
      user,
      session.provider_refresh_token,
    );
    logger.info("Recall calendar created", { recallCalendar });
    await supabase.from("recall_calendars_v2").insert({
      id: recallCalendar.id,
      profile_id: user.id,
      platform: "google_calendar",
      created_at: recallCalendar.created_at,
      updated_at: recallCalendar.updated_at,
    });
    logger.info("Calendar setup complete", { userId: user.id });
  }
}

async function createRecallCalendar(
  user: User,
  providerRefreshToken: string | null | undefined,
) {
  logger.info("Creating recall calendar", { user, providerRefreshToken });
  if (!providerRefreshToken) {
    logger.error("Missing provider refresh token", { user });
    throw new Error("Missing provider refresh token");
  }

  const recall = createRecallClient();
  const now = new Date().toISOString();
  logger.info("Recall client created", { now });

  try {
    const result = await recall.calendarV2.calendars_create({
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
    logger.info("Recall calendar created successfully", { result });
    return result;
  } catch (error) {
    logger.error("Failed to create recall calendar:", { error, user });
    throw error;
  }
}

function handleRedirect(request: NextRequest, next: string): NextResponse {
  logger.info("Handling redirect", { next });
  const forwardedHost = request.headers.get("x-forwarded-host");
  logger.info("Forwarded host", { forwardedHost });
  if (!forwardedHost) {
    const url = `${env.NEXT_PUBLIC_SITE_URL}${next}`;
    logger.info("Redirecting without forwarded host", { url });
    return NextResponse.redirect(url);
  }

  const protocol = env.NODE_ENV === "production" ? "https" : "http";
  const url = `${protocol}://${forwardedHost}${next}`;
  logger.info("Redirecting with forwarded host", { url, protocol });
  return NextResponse.redirect(url);
}
