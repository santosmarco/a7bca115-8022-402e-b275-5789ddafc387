import { z } from "zod";

export const MeetingBaasSpeechToTextProvider = z.enum([
  "Gladia",
  "Runpod",
  "Default",
]);
export type MeetingBaasSpeechToTextProvider = z.infer<
  typeof MeetingBaasSpeechToTextProvider
>;

export const MeetingBaasRecordingMode = z.enum([
  "speaker_view",
  "gallery_view",
  "audio_only",
]);
export type MeetingBaasRecordingMode = z.infer<typeof MeetingBaasRecordingMode>;

export const MeetingBaasSpeechToTextApiParameter = z.object({
  provider: MeetingBaasSpeechToTextProvider,
  api_key: z.string().nullish(),
});
export type MeetingBaasSpeechToTextApiParameter = z.infer<
  typeof MeetingBaasSpeechToTextApiParameter
>;

export const MeetingBaasSpeechToText = z.union([
  MeetingBaasSpeechToTextApiParameter,
  MeetingBaasSpeechToTextProvider,
]);
export type MeetingBaasSpeechToText = z.infer<typeof MeetingBaasSpeechToText>;

export const MeetingBaasStreamingApiParameter = z.object({
  input: z.string().nullish(),
  output: z.string().nullish(),
});
export type MeetingBaasStreamingApiParameter = z.infer<
  typeof MeetingBaasStreamingApiParameter
>;

export const MeetingBaasAutomaticLeaveRequest = z.object({
  waiting_room_timeout: z.number().int().nonnegative().nullish(),
  noone_joined_timeout: z.number().int().nonnegative().nullish(),
});
export type MeetingBaasAutomaticLeaveRequest = z.infer<
  typeof MeetingBaasAutomaticLeaveRequest
>;

export const MeetingBaasJoinRequest = z.object({
  meeting_url: z.string(),
  bot_name: z.string(),
  bot_image: z.string().url().nullish(),
  speech_to_text: MeetingBaasSpeechToText.nullish(),
  streaming: MeetingBaasStreamingApiParameter.nullish(),
  reserved: z.boolean(),
  entry_message: z.string().nullish(),
  webhook_url: z.string().nullish(),
  automatic_leave: MeetingBaasAutomaticLeaveRequest.nullish(),
  deduplication_key: z.string().nullish(),
  recording_mode: MeetingBaasRecordingMode.nullish(),
  start_time: z.number().int().nonnegative().nullish(),
  extra: z.unknown().nullish(),
});
export type MeetingBaasJoinRequest = z.infer<typeof MeetingBaasJoinRequest>;

export const MeetingBaasJoinResponse = z.object({
  bot_id: z.string().uuid(),
});
export type MeetingBaasJoinResponse = z.infer<typeof MeetingBaasJoinResponse>;

export const MeetingBaasWord = z.object({
  id: z.number().int(),
  text: z.string(),
  start_time: z.number(),
  end_time: z.number(),
  transcript_id: z.number().int(),
});
export type MeetingBaasWord = z.infer<typeof MeetingBaasWord>;

export const MeetingBaasTranscript = z.object({
  id: z.number().int(),
  speaker: z.string(),
  bot_id: z.number().int(),
  start_time: z.number(),
  words: z.array(MeetingBaasWord),
  end_time: z.number(),
});
export type MeetingBaasTranscript = z.infer<typeof MeetingBaasTranscript>;

export const MeetingBaasBotData = z.object({
  bot: z.object({
    id: z.number().int(),
    account_id: z.number().int(),
    meeting_url: z.string(),
    created_at: z.string(),
    session_id: z.string().nullish(),
    reserved: z.boolean(),
    errors: z.string().nullish(),
    ended_at: z.string().nullish(),
    mp4_s3_path: z.string(),
    webhook_url: z.string(),
    uuid: z.string().uuid(),
    bot_param_id: z.number().int(),
    event_id: z.number().int().nullish(),
    scheduled_bot_id: z.number().int().nullish(),
    bot_name: z.string(),
    bot_image: z.string().nullish(),
    speech_to_text_provider: MeetingBaasSpeechToTextProvider.nullish(),
    enter_message: z.string().nullish(),
    recording_mode: MeetingBaasRecordingMode.nullish(),
    speech_to_text_api_key: z.string().nullish(),
    streaming_input: z.string().nullish(),
    streaming_output: z.string().nullish(),
    waiting_room_timeout: z.number().int().nullish(),
    noone_joined_timeout: z.number().int().nullish(),
    deduplication_key: z.string().nullish(),
    extra: z.unknown().nullish(),
  }),
  transcripts: z.array(MeetingBaasTranscript),
});
export type MeetingBaasBotData = z.infer<typeof MeetingBaasBotData>;

export const MeetingBaasMetadata = z.object({
  bot_data: MeetingBaasBotData,
  mp4: z.string(),
});
export type MeetingBaasMetadata = z.infer<typeof MeetingBaasMetadata>;

export const MeetingBaasProvider = z.enum(["Google", "Microsoft"]);
export type MeetingBaasProvider = z.infer<typeof MeetingBaasProvider>;

export const MeetingBaasCalendar = z.object({
  google_id: z.string(),
  name: z.string(),
  email: z.string(),
  resource_id: z.string().nullish(),
  uuid: z.string().uuid(),
});
export type MeetingBaasCalendar = z.infer<typeof MeetingBaasCalendar>;

export const MeetingBaasCreateCalendarParams = z.object({
  oauth_client_id: z.string(),
  oauth_client_secret: z.string(),
  oauth_refresh_token: z.string(),
  platform: MeetingBaasProvider,
  raw_calendar_id: z.string().nullish(),
});
export type MeetingBaasCreateCalendarParams = z.infer<
  typeof MeetingBaasCreateCalendarParams
>;

export const MeetingBaasCalendarListEntry = z.object({
  id: z.string(),
  email: z.string(),
  is_primary: z.boolean(),
});
export type MeetingBaasCalendarListEntry = z.infer<
  typeof MeetingBaasCalendarListEntry
>;

export const MeetingBaasBotParam = z.object({
  bot_name: z.string(),
  bot_image: z.string().nullish(),
  speech_to_text_provider: MeetingBaasSpeechToTextProvider.nullish(),
  enter_message: z.string().nullish(),
  recording_mode: MeetingBaasRecordingMode.nullish(),
  speech_to_text_api_key: z.string().nullish(),
  streaming_input: z.string().nullish(),
  streaming_output: z.string().nullish(),
  waiting_room_timeout: z.number().int().nullish(),
  noone_joined_timeout: z.number().int().nullish(),
  deduplication_key: z.string().nullish(),
  extra: z.unknown().nullish(),
});
export type MeetingBaasBotParam = z.infer<typeof MeetingBaasBotParam>;

export const MeetingBaasBotParam2 = z.object({
  bot_name: z.string(),
  bot_image: z.string().nullish(),
  speech_to_text: MeetingBaasSpeechToText.nullish(),
  streaming_input: z.string().nullish(),
  streaming_output: z.string().nullish(),
  enter_message: z.string().nullish(),
  recording_mode: MeetingBaasRecordingMode.nullish(),
  waiting_room_timeout: z.number().int().nullish(),
  noone_joined_timeout: z.number().int().nullish(),
  deduplication_key: z.string().nullish(),
  extra: z.unknown().nullish(),
});
export type MeetingBaasBotParam2 = z.infer<typeof MeetingBaasBotParam2>;

export const MeetingBaasEvent = z.object({
  google_id: z.string(),
  name: z.string(),
  meeting_url: z.string(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  is_organizer: z.boolean(),
  recurring_event_id: z.string().nullish(),
  is_recurring: z.boolean(),
  uuid: z.string().uuid(),
  raw: z.unknown(),
  bot_param: MeetingBaasBotParam.nullish(),
  last_updated_at: z.string().datetime(),
  deleted: z.boolean(),
});
export type MeetingBaasEvent = z.infer<typeof MeetingBaasEvent>;

export const MeetingBaasLeaveResponse = z.object({
  ok: z.boolean(),
});
export type MeetingBaasLeaveResponse = z.infer<typeof MeetingBaasLeaveResponse>;
