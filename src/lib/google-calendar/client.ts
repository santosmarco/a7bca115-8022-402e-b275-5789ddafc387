import { google } from "googleapis";

import { env } from "~/env";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_OAUTH_CLIENT_ID,
  env.GOOGLE_OAUTH_CLIENT_SECRET,
  "https://db.withtitan.com/auth/v1/callback",
);

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

export function generateAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events.readonly",
    ],
    prompt: "consent",
  });
}

export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getEvents(accessToken: string, calendarId = "primary") {
  oauth2Client.setCredentials({ access_token: accessToken });

  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    q: "hangoutsMeet",
  });

  return (
    response.data.items?.filter(
      (event) => event.conferenceData?.conferenceId,
    ) ?? []
  );
}

export async function listCalendars(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });

  const response = await calendar.calendarList.list({
    minAccessRole: "reader",
  });

  return response.data.items ?? [];
}
