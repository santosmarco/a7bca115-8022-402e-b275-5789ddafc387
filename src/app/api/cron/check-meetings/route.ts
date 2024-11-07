import axios from "axios";
import { NextResponse } from "next/server";

import { env } from "~/env";
import { getEvents } from "~/lib/google-calendar/client";
import { createClient } from "~/lib/supabase/server";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const maxDuration = 300;

export async function GET(request: Request) {
  console.log("Starting cron job to check meetings...");

  // Verify cron secret to ensure request is from Vercel
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    console.warn("Unauthorized cron job attempt");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = await createClient();

  try {
    // 1. Get all calendar integrations
    console.log("Fetching calendar integrations...");
    const { data: calendarIntegrations, error: calendarIntegrationsError } =
      await supabase.from("calendar_integrations").select("*");

    if (calendarIntegrationsError) {
      console.error(
        "Failed to fetch calendar integrations:",
        calendarIntegrationsError,
      );
      throw calendarIntegrationsError;
    }

    if (!calendarIntegrations) {
      console.log("No calendar integrations found");
      return NextResponse.json({
        success: true,
        calendarsProcessed: 0,
        meetingsNotified: 0,
      });
    }

    console.log(`Found ${calendarIntegrations.length} calendar integrations`);

    // 2. For each calendar, get upcoming meetings and store them
    for (const calendarIntegration of calendarIntegrations) {
      console.log(`Processing calendar: ${calendarIntegration.google_id}`);

      const userId = calendarIntegration.user_id;

      const {
        data: integrationCredentials,
        error: integrationCredentialsError,
      } = await supabase
        .from("integration_credentials")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", "google")
        .maybeSingle();

      if (integrationCredentialsError) {
        console.error(
          "Failed to fetch integration credentials:",
          integrationCredentialsError,
        );
        continue;
      }
      if (!integrationCredentials) {
        console.warn(
          `No integration credentials found for calendar ${calendarIntegration.google_id}`,
        );
        continue;
      }

      const refreshToken = integrationCredentials.refresh_token;

      if (!refreshToken) {
        console.warn(
          `No access token found for calendar ${calendarIntegration.google_id}`,
        );
        continue;
      }

      try {
        const events = await getEvents(
          refreshToken,
          calendarIntegration.google_id,
        );

        if (!events) {
          console.log(
            `No events found for calendar ${calendarIntegration.google_id}`,
          );
          continue;
        }

        console.log(
          `Found ${events.length} events for calendar ${calendarIntegration.google_id}`,
        );

        // Get existing meetings for this calendar to avoid duplicates
        const { data: existingMeetings } = await supabase
          .from("scheduled_meetings")
          .select("event_id")
          .eq("calendar_id", calendarIntegration.google_id);

        const existingEventIds = new Set(
          existingMeetings?.map((m) => m.event_id),
        );

        for (const event of events) {
          if (
            !event.id ||
            !event.start?.dateTime ||
            !event.conferenceData?.conferenceId ||
            !event.conferenceData?.entryPoints?.[0]?.uri
          ) {
            console.log(
              `Skipping event ${event.id ?? "unknown"} due to missing required data`,
            );
            continue;
          }

          const startTime = new Date(event.start.dateTime);
          // Validate date parsing
          if (Number.isNaN(startTime.getTime())) {
            console.log(`Invalid start time for event ${event.id}`);
            continue;
          }

          const notificationTime = new Date(
            startTime.getTime() - 4 * 60 * 1000,
          );

          // Only insert if event doesn't already exist
          if (!existingEventIds.has(event.id)) {
            console.log(`Storing new meeting: ${event.id}`);
            const { error: insertError } = await supabase
              .from("scheduled_meetings")
              .insert({
                event_id: event.id,
                calendar_id: calendarIntegration.google_id,
                start_time: startTime.toISOString(),
                notification_time: notificationTime.toISOString(),
                summary: event.summary ?? "",
                meet_link: event.conferenceData.entryPoints[0].uri,
                conference_id: event.conferenceData.conferenceId,
                status: "scheduled",
              });

            if (insertError) {
              console.error(
                `Failed to insert meeting ${event.id}:`,
                insertError,
              );
            }
          } else {
            console.log(`Meeting ${event.id} already exists, skipping`);
          }
        }
      } catch (error) {
        console.error(
          `Failed to process calendar ${calendarIntegration.google_id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    // 3. Get meetings that need notification now
    console.log("Checking for meetings that need notification...");
    const now = new Date();
    const { data: meetings, error: meetingsError } = await supabase
      .from("scheduled_meetings")
      .select("*")
      .eq("status", "scheduled")
      .gte("notification_time", now.toISOString())
      .lte(
        "notification_time",
        new Date(now.getTime() + 4 * 60 * 1000).toISOString(),
      );

    if (meetingsError) throw meetingsError;

    if (!meetings) {
      console.log("No meetings found that need notification");
      return NextResponse.json({
        success: true,
        calendarsProcessed: calendarIntegrations.length,
        meetingsNotified: 0,
      });
    }

    console.log(`Found ${meetings.length} meetings that need notification`);

    // 4. Process each meeting that needs notification
    for (const meeting of meetings) {
      console.log(`Processing meeting ${meeting.id}`);
      try {
        if (!meeting.meet_link) {
          console.log(`Meeting ${meeting.id} has no meet link, skipping`);
          continue;
        }

        // Send notification to recording service
        console.log(
          `Sending notification to recording service for meeting ${meeting.id}`,
        );
        const response = await axios.post(
          "https://api.meetingbaas.com/bots",
          {
            meeting_url: meeting.meet_link,
            bot_name: "AI Notetaker",
            reserved: true,
            recording_mode: "speaker_view",
            bot_image: "https://example.com/image.png",
            entry_message: "I am a good meeting bot :)",
            speech_to_text: {
              provider: "Default",
            },
            automatic_leave: {
              waiting_room_timeout: 900,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-meeting-baas-api-key": env.MEETING_BAAS_API_KEY,
            },
          },
        );

        if (response.status !== 200) {
          throw new Error(
            `Recording service returned status ${response.status}`,
          );
        }

        // Update meeting status
        console.log(`Updating meeting ${meeting.id} status to notified`);
        const { error: updateError } = await supabase
          .from("scheduled_meetings")
          .update({ status: "notified" })
          .eq("id", meeting.id);

        if (updateError) {
          throw updateError;
        }
      } catch (error) {
        console.error(
          `Failed to process meeting ${meeting.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    console.log("Cron job completed successfully");
    return NextResponse.json({
      success: true,
      calendarsProcessed: calendarIntegrations.length,
      meetingsNotified: meetings.length,
    });
  } catch (error) {
    console.error("Failed to process meetings:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
