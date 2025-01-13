import { logger, schedules } from "@trigger.dev/sdk/v3";
import dayjs from "dayjs";

import { getGoogleCalendar } from "~/lib/google-calendar/client";
import { GoogleCalendarConferenceEntryPointType } from "~/lib/google-calendar/constants";
import type { GoogleCalendarVideoConference } from "~/lib/google-calendar/schemas";
import { meetingBaas } from "~/lib/meeting-baas/client";
import { slack } from "~/lib/slack";
import { createClient } from "~/lib/supabase/client";
import type { Json } from "~/lib/supabase/database.types";

export const checkMeetings = schedules.task({
  id: "check-meetings-v2",
  maxDuration: 300,
  cron: "*/3 * * * *",
  machine: { preset: "small-2x" },
  run: async (payload) => {
    return await logger.trace("check-meetings.run", async (span) => {
      span.setAttribute("timestamp", payload.timestamp.toISOString());

      const supabase = createClient();

      return await logger.trace(
        "fetch-google-credentials",
        async (credentialsSpan) => {
          const { data: googleCredentials, error: googleCredentialsError } =
            await supabase
              .from("integration_credentials")
              .select("*, user:profiles(*)")
              .eq("provider", "google");

          credentialsSpan.setAttribute(
            "credentialsCount",
            googleCredentials?.length ?? 0,
          );

          if (googleCredentialsError) {
            credentialsSpan.recordException(googleCredentialsError);
            await slack.error({
              text: `Error fetching Google credentials: ${googleCredentialsError.message}`,
            });
            logger.error("Error fetching google credentials", {
              error: googleCredentialsError,
            });
            throw googleCredentialsError;
          }

          for (const credential of googleCredentials) {
            await logger.trace("process-credential", async (credSpan) => {
              credSpan.setAttribute("userId", credential.user_id);
              credSpan.setAttribute(
                "userEmail",
                credential.user?.email ?? "undefined",
              );

              if (credential.requires_reauth) {
                credSpan.setAttribute("requiresReauth", true);
                logger.warn("Google reauthorization required, skipping...", {
                  userId: credential.user_id,
                  user: credential.user,
                });
                return;
              }

              if (!credential.access_token || !credential.refresh_token) {
                credSpan.setAttribute("missingTokens", true);
                await slack.warn({
                  text: `No access token or refresh token found for Google credential (User ID: ${credential.user_id})`,
                });
                logger.warn(
                  "No access token or refresh token found for google credential, skipping...",
                  { userId: credential.user_id },
                );
                return;
              }

              await logger.trace("process-calendars", async (calSpan) => {
                try {
                  const calendarClient = await getGoogleCalendar(
                    credential.user_id,
                    supabase,
                  );

                  const calendars = await logger.trace(
                    "fetch-calendar-list",
                    async (listSpan) => {
                      try {
                        const response = await calendarClient.calendarList.list(
                          {
                            minAccessRole: "reader",
                          },
                        );
                        listSpan.setAttribute(
                          "calendarCount",
                          response.data.items?.length ?? 0,
                        );
                        return response.data.items ?? [];
                      } catch (apiError) {
                        listSpan.recordException(apiError as Error);
                        logger.error("Error fetching calendars", {
                          error: apiError,
                          credentials: credential,
                        });

                        if (
                          (apiError as Error).message.includes("invalid_grant")
                        ) {
                          await supabase
                            .from("integration_credentials")
                            .update({
                              requires_reauth: true,
                              last_refresh_attempt: new Date().toISOString(),
                              refresh_error: (apiError as Error).message,
                            })
                            .eq("user_id", credential.user_id)
                            .eq("provider", "google");
                        }
                        throw apiError;
                      }
                    },
                  );

                  if (!calendars.length) {
                    calSpan.setAttribute("noCalendars", true);
                    await slack.info({
                      text: `No calendars found for user ${credential.user_id}`,
                    });
                    return;
                  }

                  for (const calendar of calendars) {
                    await logger.trace(
                      "process-calendar",
                      async (singleCalSpan) => {
                        singleCalSpan.setAttribute(
                          "calendarId",
                          calendar?.id ?? "undefined",
                        );
                        singleCalSpan.setAttribute(
                          "calendarSummary",
                          calendar?.summary ?? "undefined",
                        );

                        if (!calendar.id) {
                          singleCalSpan.setAttribute("missingId", true);
                          await slack.warn({
                            text: `No calendar ID found for calendar "${calendar.summary}"`,
                          });
                          return;
                        }

                        const events = await logger.trace(
                          "fetch-upcoming-events",
                          async (eventsSpan) => {
                            const {
                              data: { items = [] },
                            } = await calendarClient.events.list({
                              ...(calendar.id && { calendarId: calendar.id }),
                              timeMin: dayjs(payload.timestamp).toISOString(),
                              timeMax: dayjs(payload.timestamp)
                                .add(4, "minutes")
                                .toISOString(),
                              singleEvents: true,
                              timeZone: "UTC",
                            });
                            eventsSpan.setAttribute("eventCount", items.length);
                            return items;
                          },
                        );

                        await logger.trace(
                          "process-video-conferences",
                          async (confSpan) => {
                            const videoConferences = events.filter(
                              (
                                event,
                              ): event is typeof event &
                                GoogleCalendarVideoConference =>
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

                            confSpan.setAttribute(
                              "videoConferenceCount",
                              videoConferences.length,
                            );

                            const conferencesWithNotetaker =
                              videoConferences.filter((conference) =>
                                conference.attendees?.some(
                                  (attendee) =>
                                    attendee.email?.trim()?.toLowerCase() ===
                                    "notetaker@withtitan.com",
                                ),
                              );

                            confSpan.setAttribute(
                              "conferencesWithNotetakerCount",
                              conferencesWithNotetaker.length,
                            );

                            for (const conference of conferencesWithNotetaker) {
                              await logger.trace(
                                "process-conference",
                                async (confProcessSpan) => {
                                  confProcessSpan.setAttribute(
                                    "conferenceId",
                                    conference.id,
                                  );
                                  confProcessSpan.setAttribute(
                                    "conferenceSummary",
                                    conference?.summary ?? "undefined",
                                  );

                                  const meetingUrl =
                                    conference.conferenceData.entryPoints.find(
                                      (entryPoint) =>
                                        entryPoint.entryPointType ===
                                        GoogleCalendarConferenceEntryPointType.VIDEO,
                                    )?.uri;

                                  if (!meetingUrl) {
                                    confProcessSpan.setAttribute(
                                      "noMeetingUrl",
                                      true,
                                    );
                                    await slack.warn({
                                      text: `No video URL found for meeting "${conference.summary}" (User: ${credential.user_id})`,
                                    });
                                    return;
                                  }

                                  const existingBot = await logger.trace(
                                    "check-existing-bot",
                                    async (botCheckSpan) => {
                                      const { data, error } = await supabase
                                        .from("meeting_bots")
                                        .select("id")
                                        .contains("raw_data", {
                                          google_calendar_raw_data: {
                                            id: conference.id,
                                          },
                                        });

                                      if (error) {
                                        botCheckSpan.recordException(error);
                                        throw error;
                                      }

                                      return data;
                                    },
                                  );

                                  if (existingBot?.length) {
                                    confProcessSpan.setAttribute(
                                      "existingBot",
                                      true,
                                    );
                                    await slack.info({
                                      text: `Skipping meeting "${conference.summary}" - already has a bot assigned`,
                                    });
                                    return;
                                  }

                                  const botResult = await logger.trace(
                                    "join-meeting",
                                    async (joinSpan) => {
                                      const result =
                                        await meetingBaas.meetings.join({
                                          bot_name: "Notetaker",
                                          reserved: true,
                                          meeting_url: meetingUrl,
                                          recording_mode: "speaker_view",
                                          speech_to_text: {
                                            provider: "Default",
                                          },
                                          automatic_leave: {
                                            waiting_room_timeout: 60 * 60,
                                            noone_joined_timeout: 60 * 60,
                                          },
                                          extra: {
                                            userId: credential.user_id,
                                            event: conference,
                                            google_calendar_raw_data:
                                              conference,
                                          },
                                        });

                                      joinSpan.setAttribute(
                                        "botId",
                                        result.bot_id,
                                      );
                                      return result;
                                    },
                                  );

                                  await logger.trace(
                                    "save-bot-record",
                                    async (saveSpan) => {
                                      await supabase
                                        .from("meeting_bots")
                                        .insert({
                                          id: botResult.bot_id,
                                          raw_data: {
                                            google_calendar_raw_data:
                                              conference,
                                          } as Json,
                                        });
                                    },
                                  );

                                  await slack.success({
                                    text: `Successfully joined meeting "${conference.summary}" (Bot ID: ${botResult.bot_id})`,
                                  });
                                },
                              );
                            }
                          },
                        );
                      },
                    );
                  }
                } catch (error) {
                  calSpan.recordException(error as Error);
                  await slack.error({
                    text: `Error processing Google calendar for user ${credential.user_id}: ${(error as Error).message}`,
                  });
                  logger.error("Error processing google credential", {
                    error,
                    userId: credential.user_id,
                  });
                }
              });
            });
          }
        },
      );
    });
  },
});
