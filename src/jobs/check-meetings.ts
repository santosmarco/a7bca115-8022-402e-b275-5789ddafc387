import { logger, schedules } from "@trigger.dev/sdk/v3";

import { env } from "~/env";
import { googleCalendar, oauth2Client } from "~/lib/google-calendar/client";
import { meetingBaas } from "~/lib/meeting-baas/client";
import type {
  MeetingBaasBotParam2,
  MeetingBaasEvent,
} from "~/lib/meeting-baas/schemas";
import { createClient } from "~/lib/supabase/client";

const EVENTS_BATCH_SIZE = 300;

function getBotConfig(event: MeetingBaasEvent) {
  return {
    bot_name: "Notetaker",
    recording_mode: "speaker_view",
    bot_image:
      "https://files.slack.com/files-pri/T07J0D5HJJZ-F07V5BU7L75/titan_image.png",
    speech_to_text: { provider: "Default" },
    waiting_room_timeout: 900,
    noone_joined_timeout: 900,
    extra: { event },
  } as const satisfies MeetingBaasBotParam2;
}

async function handleCalendarEvents(
  calendar: { id?: string | null | undefined },
  meetingBaasCalendar: { uuid: string },
  _ctx: { attempt: { number: number } },
  _lastTimestamp?: Date,
) {
  let allEvents: Awaited<ReturnType<typeof meetingBaas.events.list>> = [];
  let hasMore = true;
  let offset = 0;

  while (hasMore) {
    const batch = await meetingBaas.events.list({
      calendarId: meetingBaasCalendar.uuid,
      offset,
      limit: EVENTS_BATCH_SIZE,
    });

    allEvents = [...allEvents, ...batch];

    if (batch.length < EVENTS_BATCH_SIZE) {
      hasMore = false;
    } else {
      offset += EVENTS_BATCH_SIZE;
    }
  }

  const events = allEvents;

  logger.info(`Found ${events.length} event(s) in meeting baas calendar`, {
    calendar,
    meetingBaasCalendar,
    events,
  });

  const unscheduledEvents = events.filter((e) => !e.bot_param);

  await Promise.all(
    unscheduledEvents.map((event) =>
      meetingBaas.events
        .schedule(event.uuid, getBotConfig(event))
        .catch((error) => {
          logger.error("Failed to schedule event", {
            eventId: event.uuid,
            error,
          });
        }),
    ),
  );

  return events.length;
}

async function setupMeetingBaasCalendar(
  calendar: { id?: string | null | undefined },
  refreshToken: string,
) {
  try {
    await meetingBaas.calendars.create({
      oauth_client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      oauth_client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      oauth_refresh_token: refreshToken,
      platform: "Google",
      raw_calendar_id: calendar.id,
    });
    logger.info("Created meeting baas calendar", { calendar });
    return true;
  } catch (error) {
    logger.error("Failed to create meeting baas calendar", {
      calendar,
      error,
    });
    return false;
  }
}

async function processCalendar(
  calendar: { id?: string | null | undefined },
  credential: { user_id: string; refresh_token: string | null },
  meetingBaasCalendars: Array<{ uuid: string; google_id: string }>,
  ctx: { attempt: { number: number } },
  lastTimestamp?: Date,
) {
  if (!calendar.id) {
    logger.warn("No calendar id found for google calendar, skipping...", {
      userId: credential.user_id,
      calendar,
    });
    return;
  }

  const existingCalendar = meetingBaasCalendars.find(
    (c) => c.google_id === calendar.id,
  );

  if (!existingCalendar) {
    if (!credential.refresh_token) {
      logger.error("No refresh token available for calendar creation", {
        userId: credential.user_id,
        calendar,
      });
      return;
    }

    const created = await setupMeetingBaasCalendar(
      calendar,
      credential.refresh_token,
    );
    if (!created) return;
  }

  const meetingBaasCalendar = meetingBaasCalendars.find(
    (c) => c.google_id === calendar.id,
  );

  if (!meetingBaasCalendar) {
    logger.warn("No meeting baas calendar found, skipping...", {
      userId: credential.user_id,
      calendar,
    });
    return;
  }

  await handleCalendarEvents(calendar, meetingBaasCalendar, ctx, lastTimestamp);
}

export const checkMeetings = schedules.task({
  id: "check-meetings-v2",
  maxDuration: 300,
  cron: "*/5 * * * *",
  machine: { preset: "small-2x" },
  run: async (payload, { ctx }) => {
    const supabase = createClient();

    const { data: googleCredentials, error: googleCredentialsError } =
      await supabase
        .from("integration_credentials")
        .select("*")
        .eq("provider", "google");

    if (googleCredentialsError) {
      logger.error("Error fetching google credentials", {
        error: googleCredentialsError,
      });
      throw googleCredentialsError;
    }

    for (const credential of googleCredentials) {
      if (!credential.refresh_token) {
        logger.warn(
          "No refresh token found for google credential, skipping...",
          { userId: credential.user_id },
        );
        continue;
      }

      try {
        oauth2Client.setCredentials({
          access_token: credential.access_token,
          refresh_token: credential.refresh_token,
        });

        const {
          data: { items: calendars = [] },
        } = await googleCalendar.calendarList.list({
          minAccessRole: "reader",
        });

        if (!calendars.length) {
          logger.warn("No calendars found for google credential, skipping...", {
            userId: credential.user_id,
          });
          continue;
        }

        const meetingBaasCalendars = await meetingBaas.calendars.list();

        await Promise.all(
          calendars.map((calendar) =>
            processCalendar(
              calendar,
              credential,
              meetingBaasCalendars,
              ctx,
              payload.lastTimestamp,
            ),
          ),
        );
      } catch (error) {
        logger.error("Error processing google credential", {
          error,
          userId: credential.user_id,
        });
        continue;
      }
    }
  },
});
