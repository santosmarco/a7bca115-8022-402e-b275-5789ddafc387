import { logger, schedules } from "@trigger.dev/sdk/v3";
import dayjs from "dayjs";

import { googleCalendar, oauth2Client } from "~/lib/google-calendar/client";
import { GoogleCalendarConferenceEntryPointType } from "~/lib/google-calendar/constants";
import type { GoogleCalendarVideoConference } from "~/lib/google-calendar/schemas";
import { meetingBaas } from "~/lib/meeting-baas/client";
import { createClient } from "~/lib/supabase/client";
import type { Json } from "~/lib/supabase/database.types";

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
            timeMin: dayjs(payload.timestamp).toISOString(),
            timeMax: dayjs(payload.timestamp).add(4, "minutes").toISOString(),
            singleEvents: true,
            timeZone: "UTC",
          });

          const videoConferencesInTheNextFourMinutes =
            eventsInTheNextFourMinutes.filter(
              (event): event is typeof event & GoogleCalendarVideoConference =>
                !!(
                  event.id &&
                  event.start?.dateTime &&
                  event.conferenceData?.entryPoints?.some(
                    (entryPoint) =>
                      entryPoint.entryPointType ===
                        GoogleCalendarConferenceEntryPointType.VIDEO &&
                      entryPoint.uri,
                  )
                ),
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

          const videoConferencesInTheNextFourMinutesWithNotetakerInvited =
            videoConferencesInTheNextFourMinutes.filter((conference) =>
              conference.attendees?.some(
                (attendee) =>
                  attendee.email?.trim()?.toLowerCase() ===
                  "notetaker@withtitan.com",
              ),
            );

          if (
            !videoConferencesInTheNextFourMinutesWithNotetakerInvited.length
          ) {
            logger.info(
              `Found ${videoConferencesInTheNextFourMinutes.length} video conferences in the next 4 minutes for google calendar, but none of them have the notetaker invited`,
              {
                userId: credential.user_id,
                calendar,
                events: videoConferencesInTheNextFourMinutes,
              },
            );
            continue;
          }

          logger.info(
            `Found ${videoConferencesInTheNextFourMinutesWithNotetakerInvited.length} video conferences with the notetaker invited in the next 4 minutes for google calendar`,
            {
              userId: credential.user_id,
              calendar,
              events: videoConferencesInTheNextFourMinutesWithNotetakerInvited,
            },
          );

          for (const conference of videoConferencesInTheNextFourMinutesWithNotetakerInvited) {
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

            const { data: maybeMeetingBots, error: maybeMeetingBotsError } =
              await supabase
                .from("meeting_bots")
                .select("id")
                .contains("raw_data", {
                  google_calendar_raw_data: {
                    id: conference.id,
                  },
                });

            if (maybeMeetingBotsError) {
              logger.error("Error checking for existing meeting bot", {
                error: maybeMeetingBotsError,
              });
              continue;
            }

            if (maybeMeetingBots?.length) {
              logger.info("Skipping event - already has a meeting bot", {
                userId: credential.user_id,
                calendar,
                eventId: conference.id,
              });
              continue;
            }

            const { bot_id: meetingBotId } = await meetingBaas.meetings.join({
              bot_name: "Notetaker",
              reserved: true,
              meeting_url: meetingUrl,
              bot_image: "https://i.ibb.co/X7QvTBN/Titan-Image-1600x900.png",
              recording_mode: "speaker_view",
              speech_to_text: { provider: "Default" },
              automatic_leave: {
                waiting_room_timeout: 60 * 60, // 1 hour
                noone_joined_timeout: 60 * 60, // 1 hour
              },
              extra: {
                userId: credential.user_id,
                event: conference,
                google_calendar_raw_data: conference,
              },
            });

            await supabase.from("meeting_bots").insert({
              id: meetingBotId,
              raw_data: {
                google_calendar_raw_data: conference,
              } as Json,
            });

            logger.info("Successfully joined meeting", {
              userId: credential.user_id,
              calendar,
              eventId: conference.id,
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
