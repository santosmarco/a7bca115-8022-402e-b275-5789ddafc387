import type { calendar_v3 } from "googleapis";
import _ from "lodash";
import type { SetRequired } from "type-fest";
import { z } from "zod";

import { meetingBaas } from "~/lib/meeting-baas/client";
import type { MeetingBaasBotData } from "~/lib/meeting-baas/schemas";
import { slack } from "~/lib/slack";
import type { Json, TablesInsert } from "~/lib/supabase/database.types";
import { createClient, type SupabaseServerClient } from "~/lib/supabase/server";
import { isTruthy } from "~/lib/utils";
import { apiVideo } from "~/server/api/services/api-video";

const MeetingBaasWebhookRequestBody = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("bot.status_change"),
    data: z.object({
      bot_id: z.string().describe("The identifier of the bot"),
      status: z.object({
        code: z
          .enum([
            "joining_call", // Bot acknowledged request to join
            "in_waiting_room", // Bot is in meeting waiting room
            "in_call_not_recording", // Bot joined but not recording
            "in_call_recording", // Bot is recording audio/video
            "call_ended", // Bot has left the call
          ])
          .describe("The current status of the bot in the meeting"),
        created_at: z
          .string()
          .datetime()
          .describe("ISO timestamp of the status change"),
      }),
    }),
  }),
  z.object({
    event: z.literal("complete"),
    data: z.object({
      bot_id: z.string().describe("The identifier of the bot"),
      mp4: z
        .string()
        .url()
        .describe("AWS S3 URL of the meeting recording (valid for 1 hour)"),
      speakers: z
        .array(z.string())
        .describe("List of speakers identified in the meeting"),
      transcript: z
        .array(
          z.object({
            speaker: z.string().describe("Name of the speaker"),
            words: z
              .array(
                z.object({
                  start: z
                    .number()
                    .describe("Start time of the word in seconds"),
                  end: z.number().describe("End time of the word in seconds"),
                  word: z.string().describe("The transcribed word"),
                }),
              )
              .describe("Array of words spoken by this speaker"),
          }),
        )
        .default([])
        .describe(
          "Complete transcript of the meeting with speaker identification",
        ),
    }),
  }),
  z.object({
    event: z.literal("failed"),
    data: z.object({
      bot_id: z.string().describe("The identifier of the bot"),
      error: z
        .enum([
          "CannotJoinMeeting", // Bot unable to join the provided meeting URL
          "TimeoutWaitingToStart", // Bot quit after waiting room timeout
          "BotNotAccepted", // Bot was refused entry to meeting
          "InternalError", // Unexpected error occurred
          "InvalidMeetingUrl", // Invalid meeting URL provided
        ])
        .describe("Type of error that caused the meeting to fail"),
    }),
  }),
]);
type MeetingBaasWebhookRequestBody = z.infer<
  typeof MeetingBaasWebhookRequestBody
>;

async function uploadVideoToStorage(
  botId: string,
  videoUrl: string,
  supabase: SupabaseServerClient,
): Promise<string> {
  try {
    // Fetch the video from the temporary AWS S3 URL
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to fetch video from AWS S3");

    const blob = await response.blob();
    const fileName = `${botId}.mp4`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("meetings")
      .upload(fileName, blob, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("meetings").getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw new Error("Failed to upload video to storage");
  }
}

async function uploadToApiVideo(
  botId: string,
  videoUrl: string,
  botData: MeetingBaasBotData,
): Promise<string | null> {
  const {
    bot: { extra },
    transcripts,
  } = botData;

  const tags = _.uniq(transcripts.map(({ speaker }) => speaker.trim()));

  // Skip API video upload if no speakers/tags
  if (tags.length === 0) {
    await slack.warn({
      text: `Skipping API video upload for meeting ${botId} - No speakers detected`,
    });
    return null;
  }

  const event = (extra as { event?: calendar_v3.Schema$Event } | undefined)
    ?.event;

  const metadata = [
    botId && { key: "meeting_bot_id", value: botId },
    botData && { key: "meeting_baas_raw_data", value: JSON.stringify(botData) },
    event && { key: "google_calendar_raw_data", value: JSON.stringify(event) },
  ].filter(isTruthy);

  try {
    await slack.send({
      text: `🎥 Starting video upload to api.video for meeting ${botId}`,
    });

    const video = await apiVideo.videos.create({
      title: event?.summary ?? `Meeting Recording - ${botId}`,
      description: event?.description ?? undefined,
      source: videoUrl,
      mp4Support: true,
      transcript: true,
      transcriptSummary: true,
      tags,
      metadata,
    });

    await slack.success({
      text: `Successfully uploaded video to api.video for meeting ${botId}`,
    });

    return video.videoId;
  } catch (error) {
    await slack.error({
      text: `Failed to upload video to api.video for meeting ${botId}: ${(error as Error).message}`,
    });
    console.error("Error uploading to api.video:", error);
    throw new Error("Failed to upload video to api.video");
  }
}

async function updateMeetingBot(
  supabase: SupabaseServerClient,
  data: SetRequired<Partial<TablesInsert<"meeting_bots">>, "id">,
) {
  const { error } = await supabase
    .from("meeting_bots")
    .update(data)
    .eq("id", data.id);

  if (error) {
    console.error("Update error:", error);
    throw new Error(error.message);
  }
}

async function handleTranscript(
  supabase: SupabaseServerClient,
  data: Extract<MeetingBaasWebhookRequestBody, { event: "complete" }>,
) {
  const {
    data: { bot_id: botId, transcript },
  } = data;

  const { data: transcriptSlices, error: transcriptSlicesError } =
    await supabase
      .from("transcript_slices")
      .insert(
        transcript.map(
          (slice, index): TablesInsert<"transcript_slices"> => ({
            bot_id: botId,
            speaker_name: slice.speaker,
            index,
          }),
        ),
      )
      .select("*");

  if (transcriptSlicesError || !transcriptSlices) {
    console.error("Transcript slices error:", transcriptSlicesError);
    throw new Error(
      transcriptSlicesError?.message ?? "Failed to insert transcript slices",
    );
  }

  const { error: wordsError } = await supabase.from("transcript_words").insert(
    transcript.flatMap((slice, transcriptSliceIndex) =>
      slice.words.map(
        (word, wordIndex): TablesInsert<"transcript_words"> => ({
          bot_id: botId,
          transcript_slice_id: transcriptSlices[transcriptSliceIndex]?.id,
          start_time: word.start,
          end_time: word.end,
          content: word.word,
          index: wordIndex,
        }),
      ),
    ),
  );

  if (wordsError) {
    console.error("Transcript words error:", wordsError);
    throw new Error(wordsError.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const bodyParseResult = MeetingBaasWebhookRequestBody.safeParse(body);

    if (!bodyParseResult.success) {
      console.error(
        "Validation error:",
        JSON.stringify(bodyParseResult.error.format(), null, 2),
      );
      return new Response("Invalid webhook payload", { status: 400 });
    }

    const event = bodyParseResult.data;
    const supabase = await createClient();

    // Handle different event types
    try {
      if (event.event === "bot.status_change") {
        const { error } = await supabase
          .from("meeting_bots")
          .upsert(
            { id: event.data.bot_id, status: event.data.status.code },
            { onConflict: "id" },
          );

        if (error) {
          console.error("Status change error:", error);
          throw new Error(error.message);
        }
      } else if (event.event === "failed") {
        await updateMeetingBot(supabase, {
          id: event.data.bot_id,
          error_code: event.data.error,
        });
      } else if (event.event === "complete") {
        await slack.send({
          text: `🎯 Processing complete event for meeting ${event.data.bot_id}`,
        });

        const { bot_data, mp4 } = await meetingBaas.meetings.getMeetingData(
          event.data.bot_id,
        );

        const [storageUrl, apiVideoId] = await Promise.all([
          uploadVideoToStorage(event.data.bot_id, mp4, supabase),
          uploadToApiVideo(event.data.bot_id, mp4, bot_data),
        ]);

        await updateMeetingBot(supabase, {
          id: event.data.bot_id,
          mp4_source_url: storageUrl,
          api_video_id: apiVideoId,
          speakers: event.data.speakers,
          raw_data: {
            meeting_baas_raw_data: { bot_data, event },
            google_calendar_raw_data: bot_data.bot.extra?.event,
          } as Json,
        });

        if (event.data.transcript?.length) {
          await slack.send({
            text: `📝 Processing transcript for meeting ${event.data.bot_id}`,
          });
          await handleTranscript(supabase, event);
        }

        await slack.done({
          text: `Successfully processed meeting ${event.data.bot_id}`,
        });
      }

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Event handling error:", error);
      return new Response((error as Error).message, { status: 500 });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}