import { google } from "googleapis";

import { env } from "~/env";
import { type SupabaseBrowserClient } from "../supabase/client";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
];

// Cache OAuth2 clients per user
const oauth2Clients = new Map<
  string,
  InstanceType<typeof google.auth.OAuth2>
>();

export function getOAuth2Client(
  userId: string,
): InstanceType<typeof google.auth.OAuth2> {
  let oauth2Client = oauth2Clients.get(userId);

  if (!oauth2Client) {
    oauth2Client = new google.auth.OAuth2({
      clientId: env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: `${getBaseUrl()}auth/callback`,
    });
    oauth2Clients.set(userId, oauth2Client);
  }

  return oauth2Client;
}

export async function setGoogleCredentials(
  userId: string,
  refreshToken: string,
): Promise<void> {
  const oauth2Client = getOAuth2Client(userId);

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    scope: SCOPES.join(" "),
  });
}

export async function getGoogleCalendar(
  userId: string,
  supabaseClient: SupabaseBrowserClient,
) {
  const oauth2Client = getOAuth2Client(userId);

  // Get fresh credentials from database
  const { data: credentials } = await supabaseClient
    .from("integration_credentials")
    .select()
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (!credentials?.refresh_token) {
    throw new Error("No Google credentials found");
  }

  // Set fresh credentials
  oauth2Client.setCredentials({
    refresh_token: credentials.refresh_token,
    scope: SCOPES.join(" "),
  });

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
