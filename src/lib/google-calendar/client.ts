import { google } from "googleapis";

import { env } from "~/env";

export const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_OAUTH_CLIENT_ID,
  env.GOOGLE_OAUTH_CLIENT_SECRET,
  "https://db.withtitan.com/auth/v1/callback",
);

export const googleCalendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});
