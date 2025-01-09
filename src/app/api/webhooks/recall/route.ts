import _ from "lodash";
import { NextResponse } from "next/server";
import { z } from "zod";

import { meetingBaas } from "~/lib/meeting-baas/client";
import {
  type Bot,
  type CalendarEvent,
  createClient as createRecallClient,
} from "~/lib/recall/client";
import { slack } from "~/lib/slack";
import type { Json, Tables } from "~/lib/supabase/database.types";
import {
  createClient as createSupabaseClient,
  type SupabaseServerClient,
} from "~/lib/supabase/server";
import { isTruthy } from "~/lib/utils";
import { apiVideo } from "~/server/api/services/api-video";

const BOT_NAME = "Notetaker";
const WAITING_ROOM_TIMEOUT = 60 * 60;
const NOONE_JOINED_TIMEOUT = 60 * 60;

const CalendarSyncEvent = z
  .object({
    event: z.literal("calendar.sync_events"),
    data: z
      .object({
        calendar_id: z.string(),
        last_updated_ts: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

const BotStatusChangeEvent = z
  .object({
    event: z.literal("bot.status_change"),
    data: z
      .object({
        bot_id: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

const WebhookEvent = z.discriminatedUnion("event", [
  CalendarSyncEvent,
  BotStatusChangeEvent,
]);

type CalendarSyncEvent = z.infer<typeof CalendarSyncEvent>;
type BotStatusChangeEvent = z.infer<typeof BotStatusChangeEvent>;
type WebhookEvent = z.infer<typeof WebhookEvent>;

type RecallAPIError = {
  response: {
    status: number;
    data: {
      detail?: string;
      message?: string;
    };
  };
};

function isRecallAPIError(error: unknown): error is RecallAPIError {
  if (!error || typeof error !== "object") return false;

  const response = (error as RecallAPIError).response;
  return (
    response !== undefined &&
    typeof response === "object" &&
    typeof response.status === "number" &&
    (!("data" in response) || typeof response.data === "object")
  );
}

async function handleVideoUpload(
  bot: Bot,
  event: CalendarEvent | undefined,
  supabase: SupabaseServerClient,
) {
  if (!bot.video_url) return;

  void uploadVideoToStorage(bot.video_url, bot.id, supabase);
  void uploadVideoToApiVideo(bot, event);
}

async function uploadVideoToStorage(
  videoUrl: string,
  botId: string,
  supabase: SupabaseServerClient,
) {
  try {
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to fetch video from AWS S3");

    const blob = await response.blob();
    const fileName = `${botId}.mp4`;

    const { error } = await supabase.storage
      .from("meetings")
      .upload(fileName, blob, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("meetings").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw new Error("Failed to upload video to storage");
  }
}

async function uploadVideoToApiVideo(
  bot: Bot,
  event: CalendarEvent | undefined,
) {
  const tags = _.uniq(bot.meeting_participants.map(({ name }) => name.trim()));

  if (tags.length === 0) {
    await slack.warn({
      text: `Skipping API video upload for meeting ${bot.id} - No speakers detected`,
    });
    return null;
  }

  const metadata = [
    bot.id && { key: "meeting_bot_id", value: bot.id },
    event && {
      key: "google_calendar_raw_data",
      value: JSON.stringify(event.raw),
    },
  ].filter(isTruthy);

  try {
    await slack.send({
      text: `🎥 Starting video upload to api.video for meeting ${bot.id}`,
    });

    const video = await apiVideo.videos.create({
      title: getVideoTitle(event, bot.id),
      description: getVideoDescription(event),
      source: bot.video_url,
      mp4Support: true,
      transcript: true,
      transcriptSummary: true,
      language: "en",
      tags,
      metadata,
    });

    await slack.success({
      text: `Successfully uploaded video to api.video for meeting ${bot.id}`,
    });

    return video.videoId;
  } catch (error) {
    await slack.error({
      text: `Failed to upload video to api.video for meeting ${bot.id}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
    console.error("Error uploading to api.video:", error);
    throw new Error("Failed to upload video to api.video");
  }
}

function getVideoTitle(
  event: CalendarEvent | undefined,
  botId: string,
): string {
  return event?.raw &&
    typeof event.raw === "object" &&
    "summary" in event.raw &&
    typeof event.raw.summary === "string"
    ? event.raw.summary
    : `Meeting Recording - ${botId}`;
}

function getVideoDescription(
  event: CalendarEvent | undefined,
): string | undefined {
  return event?.raw &&
    typeof event.raw === "object" &&
    "description" in event.raw &&
    typeof event.raw.description === "string"
    ? event.raw.description
    : undefined;
}

async function handleBotStatusChange(
  payload: BotStatusChangeEvent,
  recallClient: ReturnType<typeof createRecallClient>,
) {
  const bot = await recallClient.bot.bot_retrieve({
    params: { id: payload.data.bot_id },
  });

  const event = bot.metadata?.event_id
    ? await recallClient.calendarV2.calendar_events_retrieve({
        params: { id: bot.metadata.event_id },
      })
    : undefined;

  const transcript = await recallClient.bot.bot_transcript_list({
    params: { id: bot.id },
  });

  return { bot, event, transcript };
}

async function handleCalendarSync(
  payload: CalendarSyncEvent,
  recallClient: ReturnType<typeof createRecallClient>,
  supabase: SupabaseServerClient,
) {
  const { data: calendarData, error: calendarError } = await supabase
    .from("recall_calendars")
    .select("*")
    .eq("id", payload.data.calendar_id)
    .maybeSingle();

  if (calendarError || !calendarData?.profile_id) {
    throw new Error("Could not find profile_id for calendar");
  }

  const calendarEvents = await recallClient.calendarV2.calendar_events_list({
    queries: {
      calendar_id: payload.data.calendar_id,
      updated_at__gte: payload.data.last_updated_ts,
    },
  });

  for (const event of calendarEvents.results ?? []) {
    await processCalendarEvent(
      event,
      payload,
      calendarData,
      recallClient,
      supabase,
    );
  }
}

async function processCalendarEvent(
  event: CalendarEvent,
  payload: CalendarSyncEvent,
  calendarData: Tables<"recall_calendars">,
  recallClient: ReturnType<typeof createRecallClient>,
  supabase: SupabaseServerClient,
) {
  const deduplicationKey = `${payload.data.calendar_id}-${calendarData.profile_id}-${event.id}`;

  // Handle deleted or invalid meetings
  if (event.is_deleted || !event.meeting_url) {
    await cleanupExistingBots(event, recallClient, supabase);
    return;
  }

  try {
    // Remove any existing bots before creating new ones
    await cleanupExistingBots(event, recallClient, supabase);

    // Handle Zoom meetings differently from other platforms
    if (event.meeting_platform === "zoom") {
      await handleZoomMeeting(event, calendarData, deduplicationKey, supabase);
      return;
    }

    // Handle Google Meet meetings
    if (event.meeting_platform === "google_meet") {
      await handleGoogleMeetMeeting(event, deduplicationKey, recallClient);
      return;
    }
  } catch (error) {
    handleCalendarEventError(error, event);
  }
}

async function cleanupExistingBots(
  event: CalendarEvent,
  recallClient: ReturnType<typeof createRecallClient>,
  supabase: SupabaseServerClient,
) {
  const cleanupPromises: Promise<unknown>[] = [];

  if (event.bots && event.bots.length > 0) {
    cleanupPromises.push(
      recallClient.calendarV2.calendar_events_bot_destroy(undefined, {
        params: { id: event.id },
      }),
    );
  }

  const { data: meetingBots } = await supabase
    .from("meeting_bots")
    .select("*")
    .eq("event_id", event.id);

  if (meetingBots && meetingBots.length > 0) {
    cleanupPromises.push(
      ...meetingBots.map((bot) => meetingBaas.meetings.leave(bot.id)),
    );
  }

  await Promise.allSettled(cleanupPromises);
}

async function handleZoomMeeting(
  event: CalendarEvent,
  calendarData: Tables<"recall_calendars">,
  deduplicationKey: string,
  supabase: SupabaseServerClient,
) {
  if (!event.meeting_url) {
    await slack.warn({
      text: `Skipping Zoom meeting ${event.id} - No meeting URL found`,
    });
    return;
  }

  const startTimeUnix = event.start_time
    ? Math.floor(new Date(event.start_time).getTime() / 1000)
    : null;

  const botResult = await meetingBaas.meetings.join({
    bot_name: BOT_NAME,
    meeting_url: event.meeting_url,
    start_time: startTimeUnix,
    reserved: true,
    deduplication_key: deduplicationKey,
    bot_image: "https://i.ibb.co/X7QvTBN/Titan-Image-1600x900.png",
    recording_mode: "speaker_view",
    speech_to_text: {
      provider: "Default",
    },
    automatic_leave: {
      waiting_room_timeout: WAITING_ROOM_TIMEOUT,
      noone_joined_timeout: NOONE_JOINED_TIMEOUT,
    },
    extra: {
      userId: calendarData.profile_id,
      event,
      google_calendar_raw_data: event,
    },
  });

  await supabase.from("meeting_bots").insert({
    id: botResult.bot_id,
    raw_data: {
      google_calendar_raw_data: event,
    } as Json,
    event_id: event.id,
  });
}

async function handleGoogleMeetMeeting(
  event: CalendarEvent,
  deduplicationKey: string,
  recallClient: ReturnType<typeof createRecallClient>,
) {
  await recallClient.calendarV2.calendar_events_bot_create(
    {
      deduplication_key: deduplicationKey,
      bot_config: {
        bot_name: BOT_NAME,
        automatic_leave: {
          waiting_room_timeout: WAITING_ROOM_TIMEOUT,
          noone_joined_timeout: NOONE_JOINED_TIMEOUT,
        },
        transcription_options: {
          provider: "gladia",
        },
        metadata: {
          event_id: event.id,
        },
      } satisfies Partial<Bot>,
    },
    {
      params: { id: event.id },
    },
  );
}

function handleCalendarEventError(error: unknown, event: CalendarEvent) {
  if (!isRecallAPIError(error)) throw new Error("Unknown error occurred");

  const status = error.response.status;
  const errorMessages = {
    409: `Conflict scheduling bot for event ${event.id}, will be retried`,
    507: `No bots available for pre-poned event ${event.id}, will be retried`,
    400: `Cannot schedule bot for event ${event.id}: ${JSON.stringify(
      error.response.data,
      null,
      2,
    )}`,
  };

  if (status in errorMessages) {
    console.error(errorMessages[status as keyof typeof errorMessages]);
  } else {
    throw new Error(
      `Unexpected error status ${status}: ${JSON.stringify(error.response.data)}`,
    );
  }
}

export async function POST(request: Request) {
  const payloadParseResult = WebhookEvent.safeParse(await request.json());

  if (!payloadParseResult.success) {
    return new NextResponse(payloadParseResult.error.message, { status: 200 });
  }

  const payload = payloadParseResult.data;
  const recallClient = createRecallClient();
  const supabase = await createSupabaseClient();

  try {
    if (payload.event === "bot.status_change") {
      const { bot, event, transcript } = await handleBotStatusChange(
        payload,
        recallClient,
      );
      await handleVideoUpload(bot, event, supabase);
      console.log(JSON.stringify({ bot, payload, transcript }, null, 2));
    } else if (payload.event === "calendar.sync_events") {
      await handleCalendarSync(payload, recallClient, supabase);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return new NextResponse("Internal Server Error", { status: 200 });
  }
}
