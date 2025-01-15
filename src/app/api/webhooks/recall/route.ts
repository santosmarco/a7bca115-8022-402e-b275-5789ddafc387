import _ from "lodash";
import { NextResponse } from "next/server";
import { z } from "zod";

import { GoogleCalendarEvent } from "~/lib/google-calendar/schemas";
import { logger } from "~/lib/logging/server";
import { meetingBaas } from "~/lib/meeting-baas/client";
import {
  type Bot,
  type CalendarEvent,
  createClient as createRecallClient,
  status__2 as BotStatuses,
} from "~/lib/recall/client";
import { slack } from "~/lib/slack";
import type { Json, Tables, TablesInsert } from "~/lib/supabase/database.types";
import {
  createClient as createSupabaseClient,
  type SupabaseServerClient,
} from "~/lib/supabase/server";
import { isTruthy } from "~/lib/utils";
import { apiVideo } from "~/server/api/services/api-video";

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
        status: z
          .object({
            code: BotStatuses.unwrap().unwrap().element.optional(),
          })
          .passthrough()
          .optional(),
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

type BotMetadata = {
  event_id: string;
  user_id: string;
};

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

async function handleTranscript(
  bot: Bot,
  transcript: Awaited<
    ReturnType<
      ReturnType<typeof createRecallClient>["bot"]["bot_transcript_list"]
    >
  >,
  supabase: SupabaseServerClient,
) {
  logger.info(`Processing transcript for bot ${bot.id}`, {
    transcriptLength: transcript.length,
    fullTranscript: transcript,
  });

  const { data: transcriptSlices, error: transcriptSlicesError } =
    await supabase
      .from("transcript_slices")
      .insert(
        transcript.map(
          (slice, index): TablesInsert<"transcript_slices"> => ({
            bot_id: bot.id,
            speaker_name: slice.speaker,
            index,
          }),
        ),
      )
      .select("*");

  if (transcriptSlicesError || !transcriptSlices) {
    logger.error("Transcript slices error:", {
      fullError: transcriptSlicesError,
      botId: bot.id,
    });
    throw new Error(
      transcriptSlicesError?.message ?? "Failed to insert transcript slices",
    );
  }

  logger.info("Successfully inserted transcript slices", {
    slicesCount: transcriptSlices.length,
    slices: transcriptSlices,
  });

  const { error: wordsError } = await supabase.from("transcript_words").insert(
    transcript.flatMap((slice, transcriptSliceIndex) =>
      slice.words.map(
        (word, wordIndex): TablesInsert<"transcript_words"> => ({
          bot_id: bot.id,
          transcript_slice_id: transcriptSlices[transcriptSliceIndex]?.id,
          start_time: word.start_timestamp,
          end_time: word.end_timestamp,
          content: word.text,
          index: wordIndex,
        }),
      ),
    ),
  );

  if (wordsError) {
    logger.error("Transcript words error:", {
      fullError: wordsError,
      botId: bot.id,
    });
    throw new Error(wordsError.message);
  }

  logger.info(`Successfully processed transcript words for bot ${bot.id}`);
}

async function handleVideoUpload(
  bot: Bot,
  supabase: SupabaseServerClient,
  recallClient: ReturnType<typeof createRecallClient>,
) {
  if (!bot.video_url) return;

  const [storageUrl, apiVideoId] = await Promise.all([
    uploadVideoToStorage(bot.video_url, bot.id, supabase).catch(
      () => undefined,
    ),
    uploadVideoToApiVideo(bot, recallClient).catch(() => undefined),
  ]);

  return { storageUrl, apiVideoId };
}

async function uploadVideoToStorage(
  videoUrl: string,
  botId: string,
  supabase: SupabaseServerClient,
) {
  logger.info(`Starting video upload to storage for bot ${botId}`, {
    videoUrl,
  });

  try {
    const response = await fetch(videoUrl);
    logger.info(`Fetch response status: ${response.status}`, {
      botId,
    });

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

    logger.info(`Successfully uploaded video to storage for bot ${botId}`, {
      publicUrl,
    });

    return publicUrl;
  } catch (error) {
    logger.error("Error uploading video", {
      error: error as Error,
    });
    throw new Error("Failed to upload video to storage");
  }
}

async function uploadVideoToApiVideo(
  bot: Bot,
  recallClient: ReturnType<typeof createRecallClient>,
) {
  const event =
    typeof bot.metadata?.event_id === "string"
      ? await recallClient.calendarV2.calendar_events_retrieve({
          params: { id: bot.metadata?.event_id },
        })
      : undefined;

  const tags = _.uniq(bot.meeting_participants.map(({ name }) => name.trim()));
  logger.info(`Detected speakers/tags: ${tags.join(", ")}`, { tags });

  if (tags.length === 0) {
    await slack.warn({
      text: `Skipping API video upload for meeting ${bot.id} - No speakers detected`,
    });
    return null;
  }

  const metadata = [
    bot.id && { key: "meeting_bot_id", value: bot.id },
    event && { key: "google_calendar_raw_data", value: JSON.stringify(event) },
    bot.metadata?.user_id && { key: "user_id", value: bot.metadata.user_id },
  ].filter(isTruthy);

  logger.info("Prepared metadata:", { metadata });

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

    logger.info("API.video upload successful", {
      videoId: video.videoId,
      videoDetails: video,
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
    logger.error("Error uploading to api.video", {
      error,
    });
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
    .select("*, profile:profiles(*)")
    .eq("id", payload.data.calendar_id)
    .maybeSingle();

  if (calendarError || !calendarData?.profile_id) {
    throw new Error("Could not find profile_id for calendar");
  }

  if (!calendarData.profile) {
    throw new Error("Could not find profile");
  }

  if (calendarData.profile.role === "coach") {
    logger.info("Skipping calendar sync for coach", {
      profile: calendarData.profile,
    });
    return;
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

    const shouldScheduleBot = await evaluateShouldScheduleBot(
      event,
      calendarData.profile_id,
      supabase,
    );

    if (!shouldScheduleBot) return;

    // Handle Zoom meetings differently from other platforms
    if (event.meeting_platform === "zoom") {
      await handleZoomMeeting(event, calendarData, deduplicationKey, supabase);
      return;
    }

    // Handle Google Meet meetings
    if (event.meeting_platform === "google_meet") {
      await handleGoogleMeetMeeting(
        event,
        calendarData,
        deduplicationKey,
        recallClient,
        supabase,
      );
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

async function evaluateShouldScheduleBot(
  event: CalendarEvent,
  profile_id: string,
  supabase: SupabaseServerClient,
) {
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*, profile:profiles(*)")
    .eq("profile_id", profile_id)
    .maybeSingle();

  if (!userSettings?.profile) return false;

  // Parse raw event data against schema
  const parseResult = GoogleCalendarEvent.safeParse(event.raw);
  if (!parseResult.success) {
    logger.error("Failed to parse event data", {
      error: parseResult.error,
      eventId: event.id,
    });
    return false;
  }

  const calendarEvent = parseResult.data;
  const userEmail = userSettings.profile.email;

  if (!userEmail) return false;

  // Get user's domain for internal/external check
  const userDomain = userEmail.split("@")[1];

  // Check if user is the organizer
  const isOrganizer = calendarEvent.organizer?.email === userEmail;

  // Check if user's response is pending
  const userAttendee = calendarEvent.attendees?.find(
    (attendee) => attendee.email === userEmail,
  );
  const isPending = userAttendee?.responseStatus === "needsAction";

  // Check if all attendees are internal
  const isInternalMeeting =
    calendarEvent.attendees?.every((attendee) => {
      const attendeeDomain = attendee.email?.split("@")[1];
      return attendeeDomain === userDomain;
    }) ?? true;

  // Apply exclusion rules first
  if (userSettings.should_not_join_pending_meetings && isPending) {
    return false;
  }

  if (userSettings.should_not_join_owned_by_others_meetings && !isOrganizer) {
    return false;
  }

  // Apply inclusion rules
  if (isInternalMeeting) {
    return userSettings.should_join_team_meetings;
  }

  return userSettings.should_join_external_meetings;
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

  const botName = await getBotName(calendarData.profile_id, supabase);

  const startTimeUnix = event.start_time
    ? Math.floor(new Date(event.start_time).getTime() / 1000)
    : null;

  const metadata = {
    event_id: event.id,
    user_id: calendarData.profile_id,
  } satisfies BotMetadata;

  const botResult = await meetingBaas.meetings.join({
    bot_name: botName,
    bot_image: "https://i.ibb.co/X7QvTBN/Titan-Image-1600x900.png",
    meeting_url: event.meeting_url,
    start_time: startTimeUnix,
    reserved: true,
    deduplication_key: deduplicationKey,
    recording_mode: "speaker_view",
    speech_to_text: {
      provider: "Default",
    },
    automatic_leave: {
      waiting_room_timeout: WAITING_ROOM_TIMEOUT,
      noone_joined_timeout: NOONE_JOINED_TIMEOUT,
    },
    extra: metadata,
  });

  await supabase.from("meeting_bots").upsert(
    {
      id: botResult.bot_id,
      raw_data: {
        google_calendar_raw_data: event,
      } as Json,
      event_id: event.id,
      recall_calendar_id: calendarData.id,
      provider: "meeting_baas",
      profile_id: calendarData.profile_id,
    },
    { onConflict: "id" },
  );
}

async function handleGoogleMeetMeeting(
  event: CalendarEvent,
  calendarData: Tables<"recall_calendars">,
  deduplicationKey: string,
  recallClient: ReturnType<typeof createRecallClient>,
  supabase: SupabaseServerClient,
) {
  const botName = await getBotName(calendarData.profile_id, supabase);

  const metadata = {
    event_id: event.id,
    user_id: calendarData.profile_id,
  } satisfies BotMetadata;

  const calendarEventResult =
    await recallClient.calendarV2.calendar_events_bot_create(
      {
        deduplication_key: deduplicationKey,
        bot_config: {
          bot_name: botName,
          automatic_leave: {
            waiting_room_timeout: WAITING_ROOM_TIMEOUT,
            noone_joined_timeout: NOONE_JOINED_TIMEOUT,
          },
          transcription_options: {
            provider: "gladia",
          },
          metadata,
        } satisfies Partial<Bot>,
      },
      {
        params: { id: event.id },
      },
    );

  await supabase.from("meeting_bots").upsert(
    calendarEventResult.bots.map(
      (bot) =>
        ({
          id: bot.bot_id,
          raw_data: {
            google_calendar_raw_data: event,
          } as Json,
          event_id: event.id,
          recall_calendar_id: calendarData.id,
          provider: "recall",
          profile_id: calendarData.profile_id,
        }) satisfies TablesInsert<"meeting_bots">,
    ),
    { onConflict: "id" },
  );
}

async function getBotName(
  profile_id: string,
  supabase: SupabaseServerClient,
): Promise<string> {
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("profile_id", profile_id)
    .maybeSingle();

  return userSettings?.bot_name ?? "Notetaker";
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
    logger.error(errorMessages[status as keyof typeof errorMessages], {
      error,
    });
  } else {
    throw new Error(
      `Unexpected error status ${status}: ${JSON.stringify(error.response.data)}`,
    );
  }
}

export async function POST(request: Request) {
  logger.info("Received webhook request", {
    headers: request.headers,
  });

  const payloadParseResult = WebhookEvent.safeParse(await request.json());

  if (!payloadParseResult.success) {
    logger.error("Validation error:", {
      error: payloadParseResult.error,
    });
    return new NextResponse(payloadParseResult.error.message, { status: 200 });
  }

  const payload = payloadParseResult.data;
  logger.info("Parsed event:", { payload });

  const recallClient = createRecallClient();
  const supabase = await createSupabaseClient();

  try {
    if (payload.event === "bot.status_change") {
      const { bot, event, transcript } = await handleBotStatusChange(
        payload,
        recallClient,
      );

      const videoUploadResult = await handleVideoUpload(
        bot,
        supabase,
        recallClient,
      );

      await supabase
        .from("meeting_bots")
        .update({
          status: payload.data.status?.code,
          mp4_source_url: videoUploadResult?.storageUrl,
          api_video_id: videoUploadResult?.apiVideoId,
          speakers: bot.meeting_participants.map(({ name }) => name),
          raw_data: {
            meeting_baas_raw_data: { bot, event },
            google_calendar_raw_data: event,
          } as Json,
        })
        .eq("id", bot.id);

      if (transcript.length > 0) {
        await handleTranscript(bot, transcript, supabase);
      }

      logger.info("Bot status change processed successfully", {
        botId: bot.id,
        eventId: event?.id,
        transcriptLength: transcript.length,
      });
    } else if (payload.event === "calendar.sync_events") {
      await handleCalendarSync(payload, recallClient, supabase);
    }

    logger.info("Successfully processed webhook request");
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    logger.error("Error processing webhook event:", {
      error: error as Error,
    });
    return new NextResponse("Internal Server Error", { status: 200 });
  }
}
