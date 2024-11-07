import { logger, schedules } from "@trigger.dev/sdk/v3";

import { env } from "~/env";
import { googleCalendar, oauth2Client } from "~/lib/google-calendar/client";
import { meetingBaas } from "~/lib/meeting-baas/client";
import { createClient } from "~/lib/supabase/client";

export const checkMeetings = schedules.task({
  id: "check-meetings",
  maxDuration: 300,
  cron: "*/5 * * * *",
  // schema: z.object({
  //   timestamp: z.date(),
  //   timezone: z.string(),
  // }),
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
      const { user_id: userId, refresh_token: refreshToken } = credential;

      if (!refreshToken) {
        logger.warn(
          "No refresh token found for google credential, skipping...",
          { userId },
        );
        continue;
      }

      try {
        oauth2Client.setCredentials({
          access_token: credential.access_token,
          refresh_token: refreshToken,
        });
      } catch (error) {
        logger.error("Error refreshing google credentials", {
          error,
          userId,
        });
        continue;
      }

      logger.info("Refreshed google credentials", { userId, credential });

      const {
        data: { items: calendars = [] },
      } = await googleCalendar.calendarList.list({
        minAccessRole: "reader",
      });
      if (!calendars.length) {
        logger.warn("No calendars found for google credential, skipping...", {
          userId,
        });
        continue;
      }

      for (const calendar of calendars) {
        if (!calendar.id) {
          logger.warn("No calendar id found for google calendar, skipping...", {
            userId,
            calendar,
          });
          continue;
        }

        const meetingBaasCalendars = await meetingBaas.calendars.list();
        if (!meetingBaasCalendars.find((c) => c.google_id === calendar.id)) {
          try {
            await meetingBaas.calendars.create({
              oauth_client_id: env.GOOGLE_OAUTH_CLIENT_ID,
              oauth_client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
              oauth_refresh_token: refreshToken,
              platform: "Google",
              raw_calendar_id: calendar.id,
            });
          } catch {
            // noop
          }
          logger.info("Created meeting baas calendar", { userId, calendar });
        }

        for (const meetingBaasCalendar of meetingBaasCalendars) {
          const events = await meetingBaas.events.list({
            calendarId: meetingBaasCalendar.uuid,
            offset: 0,
            limit: 100,
            updatedAtGte: payload.lastTimestamp?.toISOString(),
          });

          logger.info(
            `Found ${events.length} event(s) in meeting baas calendar`,
            { userId, calendar, meetingBaasCalendar, events },
          );

          for (const event of events.filter((e) => !e.bot_param)) {
            await meetingBaas.events.schedule(event.uuid, {
              bot_name: "AI Notetaker",
              recording_mode: "speaker_view",
              bot_image: "https://example.com/image.png",
              enter_message: "I am a good meeting bot :)",
              speech_to_text: {
                provider: "Default",
              },
              waiting_room_timeout: 900,
              noone_joined_timeout: 900,
            });
          }
        }

        // const now = ctx.attempt.startedAt;
        // const fiveMinutesFromNow = dayjs(now).add(5, "minutes").toDate();

        // const {
        //   data: { items: events = [] },
        // } = await googleCalendar.events.list({
        //   calendarId: calendar.id,
        //   eventTypes: [
        //     GoogleCalendarEventType.DEFAULT,
        //     GoogleCalendarEventType.FROM_GMAIL,
        //   ],
        //   singleEvents: true,
        //   timeMin: now.toISOString(),
        //   timeMax: fiveMinutesFromNow.toISOString(),
        //   timeZone: "UTC",
        //   orderBy: "startTime",
        // });
        // if (!events.length) {
        //   logger.info("No events found, skipping...", { userId, calendar });
        //   continue;
        // }

        // const videoConferences = events.filter(
        //   (event): event is typeof event & GoogleCalendarVideoConference =>
        //     GoogleCalendarVideoConference.safeParse(event).success,
        // );

        // logger.info(
        //   `Found ${events.length} event(s), ${videoConferences.length} video conference(s)`,
        //   { userId, calendar, events },
        // );

        // for (const conference of videoConferences) {
        //   for (const entryPoint of conference.conferenceData.entryPoints) {
        //     const response = await axios.post(
        //       "https://api.meetingbaas.com/bots",
        //       {
        //         meeting_url: entryPoint.uri,
        //         bot_name: "AI Notetaker",
        //         reserved: true,
        //         recording_mode: "speaker_view",
        //         bot_image: "https://example.com/image.png",
        //         entry_message: "I am a good meeting bot :)",
        //         speech_to_text: {
        //           provider: "Default",
        //         },
        //         automatic_leave: {
        //           waiting_room_timeout: 900,
        //         },
        //       },
        //       {
        //         headers: {
        //           "Content-Type": "application/json",
        //           "x-meeting-baas-api-key": env.MEETING_BAAS_API_KEY,
        //         },
        //       },
        //     );
        //   }
        // }
      }
    }
  },
});
