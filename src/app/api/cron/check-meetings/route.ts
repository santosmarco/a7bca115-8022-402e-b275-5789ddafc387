import axios from "axios";
import { NextResponse } from "next/server";

import { env } from "~/env";
import { getEvents } from "~/lib/google-calendar/client";
import { createClient } from "~/lib/supabase/server";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const maxDuration = 300;

export default async function handler(request: Request) {
  // Verify cron secret to ensure request is from Vercel
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = await createClient();

  try {
    // 1. Get all calendar integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from("calendar_integrations")
      .select("*, credentials:integration_credentials(*)");

    if (integrationsError) throw integrationsError;

    // 2. For each calendar, get upcoming meetings and store them
    for (const integration of integrations) {
      const accessToken = integration.credentials.find(
        (credential) => credential.provider === "google",
      )?.access_token;

      if (!accessToken) continue;

      try {
        const events = await getEvents(accessToken, integration.google_id);

        for (const event of events) {
          if (
            !event.id ||
            !event.start?.dateTime ||
            !event.conferenceData?.conferenceId
          ) {
            continue;
          }

          const startTime = new Date(event.start.dateTime);
          const notificationTime = new Date(
            startTime.getTime() - 4 * 60 * 1000,
          );

          // Store or update the meeting
          await supabase.from("scheduled_meetings").upsert({
            event_id: event.id,
            calendar_id: integration.google_id,
            start_time: startTime.toISOString(),
            notification_time: notificationTime.toISOString(),
            summary: event.summary ?? "",
            meet_link: event.conferenceData.entryPoints?.[0]?.uri ?? "",
            conference_id: event.conferenceData.conferenceId,
            status: "scheduled",
          });
        }
      } catch (error) {
        console.error(
          `Failed to process calendar ${integration.google_id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    // 3. Get meetings that need notification now
    const { data: meetings, error: meetingsError } = await supabase
      .from("scheduled_meetings")
      .select("*")
      .eq("status", "scheduled")
      .gte("notification_time", new Date().toISOString())
      .lte(
        "notification_time",
        new Date(Date.now() + 4 * 60 * 1000).toISOString(),
      );

    if (meetingsError) throw meetingsError;

    // 4. Process each meeting that needs notification
    for (const meeting of meetings) {
      try {
        // Send notification to recording service
        await axios.post(
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

        // Update meeting status
        await supabase
          .from("scheduled_meetings")
          .update({ status: "notified" })
          .eq("id", meeting.id);
      } catch (error) {
        console.error(
          `Failed to process meeting ${meeting.id}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    return NextResponse.json({
      success: true,
      calendarsProcessed: integrations.length,
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
