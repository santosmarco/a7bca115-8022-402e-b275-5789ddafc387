import _ from "lodash";
import { z } from "zod";

import { meetingBaas } from "~/lib/meeting-baas/client";
import {
  type MeetingBaasBotData,
  MeetingBaasEvent,
} from "~/lib/meeting-baas/schemas";
import type { Json, TablesInsert } from "~/lib/supabase/database.types";
import { createClient, type SupabaseServerClient } from "~/lib/supabase/server";
import { apiVideo } from "~/server/api/services/api-video";

const BotStatusEvent = z.object({
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
});
type BotStatusEvent = z.infer<typeof BotStatusEvent>;

// Schema for individual words in the transcript
const TranscriptWord = z.object({
  start: z.number().describe("Start time of the word in seconds"),
  end: z.number().describe("End time of the word in seconds"),
  word: z.string().describe("The transcribed word"),
});
type TranscriptWord = z.infer<typeof TranscriptWord>;

// Schema for the meeting transcript
const Transcript = z
  .array(
    z.object({
      speaker: z.string().describe("Name of the speaker"),
      words: z
        .array(TranscriptWord)
        .describe("Array of words spoken by this speaker"),
    }),
  )
  .describe("Complete transcript of the meeting with speaker identification");
type Transcript = z.infer<typeof Transcript>;

// Schema for successful meeting completion
const CompleteEvent = z.object({
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
    transcript: Transcript.optional().describe(
      "Optional transcript when speech_to_text is enabled",
    ),
  }),
});
type CompleteEvent = z.infer<typeof CompleteEvent>;

// Schema for failed meeting events
const FailedEvent = z.object({
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
});
type FailedEvent = z.infer<typeof FailedEvent>;

// Combined schema for all possible webhook events
const WebhookEvent = z.discriminatedUnion("event", [
  BotStatusEvent,
  CompleteEvent,
  FailedEvent,
]);
type WebhookEvent = z.infer<typeof WebhookEvent>;

async function uploadVideoToStorage(
  supabase: SupabaseServerClient,
  botId: string,
  videoUrl: string,
): Promise<string> {
  try {
    // Fetch the video from the temporary AWS S3 URL
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to fetch video from AWS S3");

    const blob = await response.blob();
    const fileName = `meetings/${botId}/recording.mp4`;

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
): Promise<string> {
  const {
    bot: { extra },
    transcripts,
  } = botData;

  const { data: parsedExtra } = z
    .object({ event: MeetingBaasEvent })
    .safeParse(extra);

  const event = parsedExtra?.event;

  try {
    // Create a video container
    const video = await apiVideo.videos.create({
      title: event?.name ?? `Meeting Recording - ${botId}`,
      source: videoUrl,
      mp4Support: true,
      transcript: true,
      transcriptSummary: true,
      tags: _.uniq(transcripts.map(({ speaker }) => speaker.trim())),
      metadata: [
        { key: "meeting_baas_raw_data", value: JSON.stringify(botData) },
      ],
    });

    // Upload the video from source URL
    await apiVideo.videos.upload(video.videoId, videoUrl);

    return video.videoId;
  } catch (error) {
    console.error("Error uploading to api.video:", error);
    throw new Error("Failed to upload video to api.video");
  }
}

async function updateMeetingBot(
  supabase: SupabaseServerClient,
  botId: string,
  data: Partial<TablesInsert<"meeting_bots">>,
) {
  const { error } = await supabase
    .from("meeting_bots")
    .update(data)
    .eq("id", botId);

  if (error) {
    console.error("Update error:", error);
    throw new Error(error.message);
  }
}

async function handleTranscript(
  supabase: SupabaseServerClient,
  botId: string,
  transcript: Transcript,
) {
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
    const bodyParseResult = WebhookEvent.safeParse(body);

    if (!bodyParseResult.success) {
      console.error("Validation error:", bodyParseResult.error);
      return new Response("Invalid webhook payload", { status: 400 });
    }

    const event = bodyParseResult.data;
    const supabase = await createClient();

    // Get or create meeting bot
    let meetingBot = await supabase
      .from("meeting_bots")
      .select("*")
      .eq("id", event.data.bot_id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      });

    if (!meetingBot) {
      const meetingBotInsertData: TablesInsert<"meeting_bots"> = {
        id: event.data.bot_id,
        status: "call_ended",
        ...(event.event === "bot.status_change" && {
          status: event.data.status.code,
        }),
        ...(event.event === "complete" && {
          mp4_source_url: event.data.mp4,
          speakers: event.data.speakers,
          raw_data: event.data,
        }),
        ...(event.event === "failed" && {
          error_code: event.data.error,
        }),
      };

      meetingBot = await supabase
        .from("meeting_bots")
        .insert(meetingBotInsertData)
        .select("*")
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        });
    }

    if (!meetingBot) {
      console.error("Failed to create meeting bot");
      return new Response("Failed to create meeting bot", { status: 500 });
    }

    // Handle different event types
    try {
      switch (event.event) {
        case "bot.status_change":
          await updateMeetingBot(supabase, meetingBot.id, {
            status: event.data.status.code,
          });
          break;

        case "complete":
          const { bot_data } = await meetingBaas.meetings.getMeetingData(
            event.data.bot_id,
          );

          let storageUrl: string | undefined;
          let apiVideoId: string | undefined;

          if (event.data.mp4) {
            // Upload to both storage systems in parallel
            [storageUrl, apiVideoId] = await Promise.all([
              uploadVideoToStorage(supabase, meetingBot.id, event.data.mp4),
              uploadToApiVideo(meetingBot.id, event.data.mp4, bot_data),
            ]);
          }

          await updateMeetingBot(supabase, meetingBot.id, {
            mp4_source_url: storageUrl,
            api_video_id: apiVideoId,
            speakers: event.data.speakers,
            raw_data: { event, bot_data } as Json,
          });

          if (event.data.transcript?.length) {
            await handleTranscript(
              supabase,
              meetingBot.id,
              event.data.transcript,
            );
          }
          break;

        case "failed":
          await updateMeetingBot(supabase, meetingBot.id, {
            error_code: event.data.error,
          });
          break;
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
