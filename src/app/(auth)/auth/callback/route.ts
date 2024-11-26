import type { AuthTokenResponse } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { env } from "~/env";
import {
  getGoogleCalendar,
  setGoogleCredentials,
} from "~/lib/google-calendar/client";
import type { Tables } from "~/lib/supabase/database.types";
import { createClient } from "~/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const provider = searchParams.get("provider");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const authTokenResponse = await supabase.auth.exchangeCodeForSession(code);
    const { error } = authTokenResponse;
    if (!error) {
      await handleIntegrationCredentials(authTokenResponse, provider);
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}

async function handleIntegrationCredentials(
  authTokenResponse: AuthTokenResponse,
  provider: string | null,
) {
  if (!authTokenResponse.data.user || !provider) return;

  const supabase = await createClient();
  const user_id = authTokenResponse.data.user.id;
  const access_token = authTokenResponse.data.session.provider_token;
  const refresh_token = authTokenResponse.data.session.provider_refresh_token;
  const expires_at = authTokenResponse.data.session.expires_at;

  if (!access_token || !refresh_token) {
    console.error("Missing access_token or refresh_token from auth response");
    return;
  }

  const expiry_date = expires_at
    ? new Date(expires_at * 1000).toISOString()
    : null;

  // Delete any existing credentials for this user/provider
  const { data: maybeExistingCredentials } = await supabase
    .from("integration_credentials")
    .select("id")
    .eq("user_id", user_id)
    .eq("provider", provider)
    .maybeSingle();

  if (maybeExistingCredentials) {
    await supabase
      .from("integration_credentials")
      .delete()
      .eq("id", maybeExistingCredentials.id);
  }

  // Insert new credentials with all required fields
  const { data, error } = await supabase
    .from("integration_credentials")
    .insert({
      user_id,
      provider,
      access_token,
      refresh_token,
      expiry_date,
      requires_reauth: false,
      last_refresh_attempt: new Date().toISOString(),
      refresh_error: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert integration credentials:", error);
    return;
  }

  // For Google specifically, set up the credentials and sync calendars
  if (data && provider === "google") {
    try {
      // Set up the Google credentials
      await setGoogleCredentials(user_id, refresh_token);
      // Sync calendars
      await synchronizeGoogleCalendar(data);
    } catch (error) {
      console.error("Failed to setup Google integration:", error);
      // Update the credentials to indicate failure
      await supabase
        .from("integration_credentials")
        .update({
          requires_reauth: true,
          refresh_error: (error as Error).message,
        })
        .eq("id", data.id);
    }
  }
}

async function synchronizeGoogleCalendar(
  credentials: Tables<"integration_credentials">,
) {
  if (!credentials.access_token || !credentials.refresh_token) return;

  const supabase = await createClient();

  try {
    const googleCalendar = getGoogleCalendar(credentials.user_id);
    const {
      data: { items: calendars = [] },
    } = await googleCalendar.calendarList.list({
      minAccessRole: "reader",
    });

    // Store each calendar
    for (const calendar of calendars) {
      if (!calendar.id) continue;

      // Store calendar integration details
      await supabase.from("calendar_integrations").upsert({
        user_id: credentials.user_id,
        google_id: calendar.id,
        name: calendar.summary ?? "",
        email: calendar.id,
      });
    }
  } catch (error) {
    console.error("Failed to synchronize calendars:", error);
    // throw error;
  }
}
