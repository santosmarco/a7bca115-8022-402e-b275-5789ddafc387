import type { AuthTokenResponse } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { env } from "~/env";
import { listCalendars } from "~/lib/google-calendar/client";
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
  const expiry_date = expires_at
    ? new Date(expires_at * 1000).toISOString()
    : null;
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
  const { data } = await supabase
    .from("integration_credentials")
    .insert({ user_id, provider, access_token, refresh_token, expiry_date })
    .select()
    .maybeSingle();
  if (data && provider === "google") {
    await synchronizeGoogleCalendar(data);
  }
}

async function synchronizeGoogleCalendar(
  credentials: Tables<"integration_credentials">,
) {
  if (!credentials.refresh_token) return;

  const supabase = await createClient();

  try {
    // Get all calendars for the user
    const calendars = await listCalendars(credentials.refresh_token);

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
    throw error;
  }
}
