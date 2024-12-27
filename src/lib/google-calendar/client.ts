import { google } from "googleapis";

import { env } from "~/env";

import type { SupabaseBrowserClient } from "../supabase/client";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.calendars.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
];

export async function getGoogleOAuth2Client(
  accessToken: string,
  refreshToken: string,
) {
  const oauth2Client = new google.auth.OAuth2({
    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: `${getBaseUrl()}auth/callback?provider=google`,
  });

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    scope: SCOPES.join(" "),
  });

  return oauth2Client;
}

export async function getGoogleCalendar(
  userId: string,
  supabaseClient: SupabaseBrowserClient,
) {
  // Get fresh credentials from database
  const { data: credentialsArr } = await supabaseClient
    .from("integration_credentials")
    .select()
    .eq("user_id", userId)
    .eq("provider", "google")
    .order("updated_at", { ascending: false })
    .limit(1);

  const credentials = credentialsArr?.[0];

  if (!credentials?.access_token || !credentials?.refresh_token) {
    throw new Error("No Google credentials found");
  }

  // Set fresh credentials
  const oauth2Client = await getGoogleOAuth2Client(
    credentials.access_token,
    credentials.refresh_token,
  );

  const now = new Date().toISOString();

  try {
    const {
      credentials: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expiry_date: newExpiryDate,
      },
    } = await oauth2Client.refreshAccessToken();

    await supabaseClient
      .from("integration_credentials")
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        requires_reauth: false,
        last_refresh_attempt: now,
        updated_at: now,
        ...(newExpiryDate && {
          expiry_date: new Date(newExpiryDate).toISOString(),
        }),
      })
      .eq("id", credentials.id);
  } catch (error) {
    console.error(error);

    await supabaseClient
      .from("integration_credentials")
      .update({
        requires_reauth: true,
        last_refresh_attempt: now,
        updated_at: now,
      })
      .eq("id", credentials.id);
  }

  return google.calendar({ version: "v3", auth: oauth2Client });
}

function getBaseUrl() {
  let url =
    env.NEXT_PUBLIC_SITE_URL ??
    env.NEXT_PUBLIC_VERCEL_URL ??
    window.location.origin;
  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
}
