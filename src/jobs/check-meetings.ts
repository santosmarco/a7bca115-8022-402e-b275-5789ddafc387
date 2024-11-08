import { logger, schedules } from "@trigger.dev/sdk/v3";
import dayjs from "dayjs";

import { googleCalendar, oauth2Client } from "~/lib/google-calendar/client";
import { GoogleCalendarConferenceEntryPointType } from "~/lib/google-calendar/constants";
import { GoogleCalendarVideoConference } from "~/lib/google-calendar/schemas";
import { meetingBaas } from "~/lib/meeting-baas/client";
import { createClient } from "~/lib/supabase/client";

export const checkMeetings = schedules.task({
  id: "check-meetings-v2",
  maxDuration: 300,
  cron: "*/1 * * * *",
  machine: { preset: "small-2x" },
  run: async (payload) => {
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

        for (const calendar of calendars) {
          if (!calendar.id) {
            logger.warn(
              "No calendar id found for google calendar, skipping...",
              {
                userId: credential.user_id,
                calendar,
              },
            );
            continue;
          }

          const {
            data: { items: eventsInTheNextFourMinutes = [] },
          } = await googleCalendar.events.list({
            calendarId: calendar.id,
            timeMin: dayjs(payload.timestamp).add(4, "minutes").toISOString(),
          });

          const videoConferencesInTheNextFourMinutes =
            eventsInTheNextFourMinutes.filter(
              (event): event is typeof event & GoogleCalendarVideoConference =>
                GoogleCalendarVideoConference.safeParse(event).success,
            );

          if (!videoConferencesInTheNextFourMinutes.length) {
            logger.info(
              `Found ${eventsInTheNextFourMinutes.length} events in the next 4 minutes for google calendar, but none of them are video conferences`,
              {
                userId: credential.user_id,
                calendar,
                events: eventsInTheNextFourMinutes,
              },
            );
            continue;
          }

          logger.info(
            `Found ${videoConferencesInTheNextFourMinutes.length} video conferences in the next 4 minutes for google calendar`,
            {
              userId: credential.user_id,
              calendar,
              events: videoConferencesInTheNextFourMinutes,
            },
          );

          for (const conference of videoConferencesInTheNextFourMinutes) {
            const meetingUrl = conference.conferenceData.entryPoints.find(
              (entryPoint) =>
                entryPoint.entryPointType ===
                GoogleCalendarConferenceEntryPointType.VIDEO,
            )?.uri;
            if (!meetingUrl) {
              logger.warn(
                "No video entry point found for google calendar event",
                {
                  userId: credential.user_id,
                  calendar,
                  event: conference,
                },
              );
              continue;
            }

            await meetingBaas.meetings.join({
              bot_name: "Notetaker",
              reserved: true,
              meeting_url: meetingUrl,
              bot_image: "https://i.ibb.co/X7QvTBN/Titan-Image-1600x900.png",
              recording_mode: "speaker_view",
              speech_to_text: { provider: "Default" },
              automatic_leave: {
                waiting_room_timeout: 900,
                noone_joined_timeout: 900,
              },
              extra: { userId: credential.user_id, event: conference },
            });
          }
        }
      } catch (error) {
        logger.error("Error processing google credential", {
          error,
          userId: credential.user_id,
        });
      }
    }
  },
});
