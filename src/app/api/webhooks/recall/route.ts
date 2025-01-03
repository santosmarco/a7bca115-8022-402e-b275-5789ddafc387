import { createHmac } from "node:crypto";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "~/env";
import { type Bot, createClient } from "~/lib/recall/client";
import { createClient as createSupabaseClient } from "~/lib/supabase/server";

const CalendarSyncEvent = z.object({
  event: z.literal("calendar.sync_events"),
  data: z.object({
    calendar_id: z.string(),
    last_updated_ts: z.string(), // ISO 8601 datetime
  }),
});

type CalendarSyncEvent = z.infer<typeof CalendarSyncEvent>;

export async function POST(request: Request) {
  // const headersList = headers();

  // // Verify webhook signature
  // const signature = headersList.get("x-recall-signature");
  // if (!signature) return new NextResponse("Unauthorized", { status: 401 });

  // const hmac = createHmac("sha256", env.RECALL_WEBHOOK_SECRET);
  // hmac.update(body);
  // const digest = hmac.digest("hex");

  // if (signature !== digest) {
  //   return new NextResponse("Invalid signature", { status: 401 });
  // }

  const payloadParseResult = CalendarSyncEvent.safeParse(await request.json());

  if (!payloadParseResult.success) {
    return new NextResponse(payloadParseResult.error.message, { status: 200 });
  }

  const payload = payloadParseResult.data;

  const client = createClient();
  const supabase = await createSupabaseClient();

  try {
    // Get profile_id for the calendar
    const { data: calendarData, error: calendarError } = await supabase
      .from("recall_calendars")
      .select("*")
      .eq("id", payload.data.calendar_id)
      .maybeSingle();

    if (calendarError || !calendarData?.profile_id) {
      throw new Error("Could not find profile_id for calendar");
    }

    // Fetch updated calendar events using incremental sync
    const calendarEvents = await client.calendarV2.calendar_events_list({
      queries: {
        calendar_id: payload.data.calendar_id,
        updated_at__gte: payload.data.last_updated_ts,
      },
    });

    // Process each calendar event
    for (const event of calendarEvents.results ?? []) {
      const deduplicationKey = `${payload.data.calendar_id}-${calendarData.profile_id}-${event.id}`;

      // Remove bot if event is deleted
      if (event.is_deleted) {
        if (event.bots?.length > 0) {
          await client.calendarV2.calendar_events_bot_destroy(undefined, {
            params: { id: event.id },
          });
        }
        continue;
      }

      // Skip if no meeting URL
      if (!event.meeting_url) {
        console.log(`No meeting URL for event ${event.id}, skipping`);
        if (event.bots?.length > 0) {
          await client.calendarV2.calendar_events_bot_destroy(undefined, {
            params: { id: event.id },
          });
        }
        continue;
      }

      try {
        // First remove any existing bot to handle time updates
        if (event.bots?.length > 0) {
          await client.calendarV2.calendar_events_bot_destroy(undefined, {
            params: { id: event.id },
          });
        }

        // Schedule new bot with deduplication
        const result = await client.calendarV2.calendar_events_bot_create(
          {
            deduplication_key: deduplicationKey,
            bot_config: {
              bot_name: "Notetaker",
              automatic_leave: {
                waiting_room_timeout: 60 * 60,
                noone_joined_timeout: 60 * 60,
              },
              transcription_options: {
                provider: "gladia_v2",
              },
            } satisfies Partial<Bot>,
          },
          {
            params: { id: event.id },
          },
        );
      } catch (error) {
        if (error instanceof Error) {
          // Handle specific error cases
          const status = (error as any).response?.status;

          if (status === 409) {
            // Conflict - another request is processing
            console.error(
              `Conflict scheduling bot for event ${event.id}, will be retried`,
            );
          } else if (status === 507) {
            // Pre-poned event - not enough bots available
            console.error(
              `No bots available for pre-poned event ${event.id}, will be retried`,
            );
          } else if (status === 400) {
            // Invalid request (e.g. event ended)
            console.error(
              `Cannot schedule bot for event ${event.id}: ${JSON.stringify(
                (error as any).response?.data,
                null,
                2,
              )}`,
            );
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing calendar sync event:", error);
    return new NextResponse("Internal Server Error", { status: 200 });
  }
}
