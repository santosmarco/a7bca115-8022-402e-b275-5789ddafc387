import { google } from "googleapis";

import { env } from "~/env";
import { slack } from "~/lib/slack";
import { createClient } from "~/lib/supabase/client";
import { exponentialBackoff } from "~/lib/utils";

export const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_OAUTH_CLIENT_ID,
  env.GOOGLE_OAUTH_CLIENT_SECRET,
  "https://db.withtitan.com/auth/v1/callback",
);

export const googleCalendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

async function refreshAccessToken(userId: string, refreshToken: string) {
  const supabase = createClient();

  // Try up to 3 times with exponential backoff
  return await exponentialBackoff(
    async () => {
      try {
        oauth2Client.setCredentials({
          refresh_token: refreshToken,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        // Update the credentials in the database
        const { error: updateError } = await supabase
          .from("integration_credentials")
          .update({
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token ?? refreshToken,
            expiry_date: credentials.expiry_date
              ? new Date(credentials.expiry_date).toISOString()
              : null,
            last_refresh_attempt: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("provider", "google");

        if (updateError) {
          await slack.error({
            text: `Failed to update Google credentials for user ${userId}: ${updateError.message}`,
          });
          throw updateError;
        }

        return credentials;
      } catch (error) {
        const isInvalidGrant = (error as Error).message.includes(
          "invalid_grant",
        );

        if (isInvalidGrant) {
          // Mark the credentials as requiring reauthorization
          await supabase
            .from("integration_credentials")
            .update({
              requires_reauth: true,
              last_refresh_attempt: new Date().toISOString(),
              refresh_error: (error as Error).message,
            })
            .eq("user_id", userId)
            .eq("provider", "google");

          // TODO: Send email to user about needing to reauthorize
          await slack.warn({
            text: `User ${userId} needs to reauthorize their Google account - token refresh failed with invalid_grant`,
          });
        }

        throw error;
      }
    },
    {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 10000,
    },
  );
}

export async function setGoogleCredentials(
  userId: string,
  accessToken: string,
  refreshToken: string,
) {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Add event listener for token refresh
    oauth2Client.on("tokens", async (tokens) => {
      const supabase = createClient();

      await supabase
        .from("integration_credentials")
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token ?? refreshToken,
          expiry_date: tokens.expiry_date
            ? new Date(tokens.expiry_date).toISOString()
            : null,
          last_refresh_attempt: new Date().toISOString(),
          requires_reauth: false,
          refresh_error: null,
        })
        .eq("user_id", userId)
        .eq("provider", "google");
    });
  } catch (error) {
    await slack.error({
      text: `Failed to set Google credentials for user ${userId}: ${(error as Error).message}`,
    });
    throw error;
  }
}

export { refreshAccessToken };
