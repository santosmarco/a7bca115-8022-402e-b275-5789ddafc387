import { google } from "googleapis";

import { env } from "~/env";
import { slack } from "~/lib/slack";
import { createClient } from "~/lib/supabase/client";

// Create a map to store OAuth clients per user
const oauth2ClientMap = new Map<
  string,
  InstanceType<typeof google.auth.OAuth2>
>();

function createOAuth2Client() {
  return new google.auth.OAuth2({
    clientId: env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri: "https://db.withtitan.com/auth/v1/callback",
  });
}

async function getRefreshToken(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("integration_credentials")
    .select("refresh_token")
    .eq("user_id", userId)
    .eq("provider", "google")
    .single();

  if (error || !data?.refresh_token) {
    throw new Error(`Refresh token not found for user ${userId}`);
  }

  return data.refresh_token;
}

// Get or create an OAuth2 client for a specific user
function getOAuth2Client(userId: string) {
  if (!oauth2ClientMap.has(userId)) {
    const client = createOAuth2Client();

    // Set up token refresh handler for this client
    client.on("tokens", async (tokens) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("integration_credentials")
        .update({
          access_token: tokens.access_token,
          refresh_token:
            tokens.refresh_token || (await getRefreshToken(userId)),
          expiry_date: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
          last_refresh_attempt: new Date().toISOString(),
          requires_reauth: false,
          refresh_error: null,
        })
        .eq("user_id", userId)
        .eq("provider", "google");

      if (error) {
        await slack.error({
          text: `Failed to update tokens after refresh for user ${userId}: ${error.message}`,
        });
      }
    });

    oauth2ClientMap.set(userId, client);
  }

  const client = oauth2ClientMap.get(userId);
  if (!client) throw new Error(`OAuth2 client not found for user ${userId}`);

  return client;
}

export async function setGoogleCredentials(
  userId: string,
  refreshToken: string,
) {
  try {
    const oauth2Client = getOAuth2Client(userId);
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
  } catch (error) {
    await slack.error({
      text: `Failed to set Google credentials for user ${userId}: ${(error as Error).message}`,
    });
    throw error;
  }
}

// Create a calendar client for a specific user
export function getGoogleCalendar(userId: string) {
  const oauth2Client = getOAuth2Client(userId);
  return google.calendar({ version: "v3", auth: oauth2Client });
}
