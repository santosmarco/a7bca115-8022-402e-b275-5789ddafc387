import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

import { env } from "~/env";

export const ordering = z.string().nullish();
export type ordering = z.infer<typeof ordering>;

export const BartyCredential = z
  .object({
    id: z.string().uuid(),
    oauth_app: z.string().uuid(),
    refresh_token: z.string(),
    current_locks: z.unknown(),
    status: z.string(),
    extra: z.unknown().nullish(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type BartyCredential = z.infer<typeof BartyCredential>;

export const id = z.string().uuid();
export type id = z.infer<typeof id>;

export const PatchedBartyCredential = z
  .object({
    id: z.string().uuid(),
    oauth_app: z.string().uuid(),
    refresh_token: z.string(),
    current_locks: z.unknown(),
    status: z.string(),
    extra: z.unknown(),
    created_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
export type PatchedBartyCredential = z.infer<typeof PatchedBartyCredential>;

export const Platform78bEnum = z.enum([
  "zoom",
  "google_meet",
  "goto_meeting",
  "microsoft_teams",
  "microsoft_teams_live",
  "webex",
  "chime_sdk",
  "webrtc",
  "slack_huddle_observer",
]);
export type Platform78bEnum = z.infer<typeof Platform78bEnum>;

export const BartyOauthApp = z
  .object({
    id: z.string().uuid(),
    platform: Platform78bEnum,
    client_id: z.string(),
    client_secret: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type BartyOauthApp = z.infer<typeof BartyOauthApp>;

export const bot_id = z.string().uuid().nullish();
export type bot_id = z.infer<typeof bot_id>;

export const created_at_after = z.string().datetime({ offset: true }).nullish();
export type created_at_after = z.infer<typeof created_at_after>;

export const created_at_before = z
  .string()
  .datetime({ offset: true })
  .nullish();
export type created_at_before = z.infer<typeof created_at_before>;

export const cursor = z.string().nullish();
export type cursor = z.infer<typeof cursor>;

export const status = z
  .array(z.enum(["completed", "errored", "in_progress"]))
  .nullish();
export type status = z.infer<typeof status>;

export const JobStatusEnum = z.enum(["in_progress", "completed", "errored"]);
export type JobStatusEnum = z.infer<typeof JobStatusEnum>;

export const Job = z
  .object({
    id: z.string().uuid(),
    name: z.string().nullish(),
    status: JobStatusEnum,
    errors: z.array(z.unknown()),
    created_at: z.string().datetime({ offset: true }),
    bot_id: z.string().uuid().nullish(),
    provider_job_ids: z.array(z.string()),
  })
  .passthrough();
export type Job = z.infer<typeof Job>;

export const PaginatedJobList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(Job),
  })
  .partial()
  .passthrough();
export type PaginatedJobList = z.infer<typeof PaginatedJobList>;

export const end = z.string().datetime({ offset: true }).nullish();
export type end = z.infer<typeof end>;

export const start = z.string().datetime({ offset: true }).nullish();
export type start = z.infer<typeof start>;

export const UsageResponse = z.object({ bot_total: z.number() }).passthrough();
export type UsageResponse = z.infer<typeof UsageResponse>;

export const join_at_after = z.string().datetime({ offset: true }).nullish();
export type join_at_after = z.infer<typeof join_at_after>;

export const join_at_before = z.string().datetime({ offset: true }).nullish();
export type join_at_before = z.infer<typeof join_at_before>;

export const meeting_url = z.string().nullish();
export type meeting_url = z.infer<typeof meeting_url>;

export const page = z.number().int().nullish();
export type page = z.infer<typeof page>;

export const status__2 = z
  .array(
    z.enum([
      "analysis_done",
      "analysis_failed",
      "call_ended",
      "done",
      "fatal",
      "in_call_not_recording",
      "in_call_recording",
      "in_waiting_room",
      "joining_call",
      "media_expired",
      "ready",
      "recording_done",
      "recording_permission_allowed",
      "recording_permission_denied",
    ]),
  )
  .nullish();
export type status__2 = z.infer<typeof status__2>;

export const BotEvent = z
  .object({
    code: z.string(),
    message: z.string(),
    created_at: z.string().datetime({ offset: true }),
    sub_code: z.string(),
  })
  .passthrough();
export type BotEvent = z.infer<typeof BotEvent>;

export const MeetingMetadata = z
  .object({ title: z.string(), zoom_meeting_uuid: z.string().nullish() })
  .passthrough();
export type MeetingMetadata = z.infer<typeof MeetingMetadata>;

export const MeetingParticipantEvent = z
  .object({
    code: z.string(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type MeetingParticipantEvent = z.infer<typeof MeetingParticipantEvent>;

export const MeetingParticipantExtraDataZoom = z
  .object({
    user_guid: z.string(),
    guest: z.boolean(),
    conf_user_id: z.string(),
  })
  .partial()
  .passthrough();
export type MeetingParticipantExtraDataZoom = z.infer<
  typeof MeetingParticipantExtraDataZoom
>;

export const MeetingParticipantExtraDataMicrosoftTeams = z
  .object({
    participant_type: z.string(),
    role: z.string(),
    meeting_role: z.string(),
    user_id: z.string(),
    tenant_id: z.string(),
    client_version: z.string(),
  })
  .partial()
  .passthrough();
export type MeetingParticipantExtraDataMicrosoftTeams = z.infer<
  typeof MeetingParticipantExtraDataMicrosoftTeams
>;

export const MeetingParticipantExtraDataSlack = z
  .object({ user_id: z.string(), email: z.string() })
  .partial()
  .passthrough();
export type MeetingParticipantExtraDataSlack = z.infer<
  typeof MeetingParticipantExtraDataSlack
>;

export const MeetingParticipantExtraData = z
  .object({
    zoom: MeetingParticipantExtraDataZoom,
    microsoft_teams: MeetingParticipantExtraDataMicrosoftTeams,
    slack: MeetingParticipantExtraDataSlack,
  })
  .partial()
  .passthrough();
export type MeetingParticipantExtraData = z.infer<
  typeof MeetingParticipantExtraData
>;

export const MeetingParticipant = z
  .object({
    id: z.number().int(),
    name: z.string(),
    events: z.array(MeetingParticipantEvent),
    is_host: z.boolean(),
    platform: z.string(),
    extra_data: MeetingParticipantExtraData,
  })
  .passthrough();
export type MeetingParticipant = z.infer<typeof MeetingParticipant>;

export const RealTimeTranscription = z
  .object({
    destination_url: z.string().url(),
    partial_results: z.boolean().nullish().default(false),
    enhanced_diarization: z.boolean().nullish().default(false),
  })
  .passthrough();
export type RealTimeTranscription = z.infer<typeof RealTimeTranscription>;

export const RealTimeMedia = z
  .object({
    rtmp_destination_url: z.string(),
    websocket_video_destination_url: z.string(),
    websocket_audio_destination_url: z.string(),
    websocket_speaker_timeline_destination_url: z.string(),
    websocket_speaker_timeline_exclude_null_speaker: z.boolean().default(true),
    webhook_call_events_destination_url: z.string(),
    webhook_chat_messages_destination_url: z.string(),
  })
  .partial()
  .passthrough();
export type RealTimeMedia = z.infer<typeof RealTimeMedia>;

export const ProviderEnum = z.enum([
  "deepgram",
  "assembly_ai_async_chunked",
  "assembly_ai",
  "rev",
  "aws_transcribe",
  "speechmatics",
  "symbl",
  "gladia",
  "gladia_v2",
  "meeting_captions",
  "none",
]);
export type ProviderEnum = z.infer<typeof ProviderEnum>;

export const AssemblyAiAsyncChunkedCustomSpelling = z
  .object({ to: z.string(), from: z.array(z.string()) })
  .passthrough();
export type AssemblyAiAsyncChunkedCustomSpelling = z.infer<
  typeof AssemblyAiAsyncChunkedCustomSpelling
>;

export const AssemblyAiAsyncChunkedStreaming = z
  .object({
    boost_param: z.string(),
    content_safety: z.boolean(),
    content_safety_confidence: z.number().int(),
    custom_spelling: z.array(AssemblyAiAsyncChunkedCustomSpelling),
    disfluencies: z.boolean(),
    filter_profanity: z.boolean(),
    format_text: z.boolean(),
    language_code: z.string(),
    language_confidence_threshold: z.number(),
    language_detection: z.boolean(),
    punctuate: z.boolean(),
    redact_pii: z.boolean(),
    redact_pii_policies: z.array(z.string()),
    redact_pii_sub: z.string(),
    speaker_labels: z.boolean(),
    speakers_expected: z.number().int(),
    speech_model: z.string(),
    speech_threshold: z.number(),
    word_boost: z.array(z.string()),
    chunk_minimum: z.number().int().default(180),
    chunk_maximum: z.number().int().default(300),
  })
  .partial()
  .passthrough();
export type AssemblyAiAsyncChunkedStreaming = z.infer<
  typeof AssemblyAiAsyncChunkedStreaming
>;

export const AssemblyAiStreaming = z
  .object({ word_boost: z.array(z.string()) })
  .partial()
  .passthrough();
export type AssemblyAiStreaming = z.infer<typeof AssemblyAiStreaming>;

export const DeepgramStreaming = z
  .object({
    tier: z.string(),
    model: z.string(),
    version: z.string(),
    language: z.string(),
    profanity_filter: z.boolean(),
    redact: z.array(z.string()),
    diarize: z.boolean(),
    diarize_version: z.string(),
    smart_format: z.boolean(),
    ner: z.boolean(),
    alternatives: z.number().int(),
    numerals: z.boolean(),
    search: z.array(z.string()),
    replace: z.array(z.string()),
    keywords: z.array(z.string()),
    interim_results: z.boolean(),
    endpointing: z.number().int(),
    log_data: z.boolean(),
  })
  .partial()
  .passthrough();
export type DeepgramStreaming = z.infer<typeof DeepgramStreaming>;

export const LanguageBehaviourEnum = z.enum([
  "manual",
  "automatic single language",
  "automatic multiple languages",
]);
export type LanguageBehaviourEnum = z.infer<typeof LanguageBehaviourEnum>;

export const ModelTypeEnum = z.enum(["fast", "accurate"]);
export type ModelTypeEnum = z.infer<typeof ModelTypeEnum>;

export const GladiaStreaming = z
  .object({
    language_behaviour: LanguageBehaviourEnum,
    language: z.string(),
    transcription_hint: z.string(),
    endpointing: z.number().int(),
    model_type: ModelTypeEnum,
    audio_enhancer: z.boolean(),
  })
  .partial()
  .passthrough();
export type GladiaStreaming = z.infer<typeof GladiaStreaming>;

export const RevStreaming = z
  .object({
    language: z.string(),
    metadata: z.string(),
    custom_vocabulary_id: z.string().max(200),
    filter_profanity: z.boolean(),
    remove_disfluencies: z.boolean(),
    delete_after_seconds: z.number().int(),
    detailed_partials: z.boolean(),
    start_ts: z.number(),
    max_segment_duration_seconds: z.number().int(),
    transcriber: z.string(),
    enable_speaker_switch: z.boolean(),
    skip_postprocessing: z.boolean(),
    priority: z.string(),
  })
  .partial()
  .passthrough();
export type RevStreaming = z.infer<typeof RevStreaming>;

export const AwsTranscribeStreaming = z
  .object({
    language_code: z.string(),
    content_redaction_type: z.string(),
    language_model_name: z.string(),
    language_options: z.string(),
    language_identification: z.boolean(),
    partial_results_stability: z.string(),
    pii_entity_types: z.string(),
    preferred_language: z.string(),
    show_speaker_label: z.boolean(),
    vocabulary_filter_method: z.string(),
    vocabulary_filter_names: z.string(),
    vocabulary_names: z.string(),
    vocabulary_name: z.string(),
  })
  .partial()
  .passthrough();
export type AwsTranscribeStreaming = z.infer<typeof AwsTranscribeStreaming>;

export const SpeechmaticsAdditionalWord = z
  .object({ content: z.string(), sounds_like: z.array(z.string()).nullish() })
  .passthrough();
export type SpeechmaticsAdditionalWord = z.infer<
  typeof SpeechmaticsAdditionalWord
>;

export const SpeechmaticsDiarizationConfig = z
  .object({ max_speakers: z.number().int() })
  .passthrough();
export type SpeechmaticsDiarizationConfig = z.infer<
  typeof SpeechmaticsDiarizationConfig
>;

export const SpeechmaticsPunctuationOverrides = z
  .object({
    permitted_marks: z.array(z.string()),
    sensitivity: z.number().nullish(),
  })
  .passthrough();
export type SpeechmaticsPunctuationOverrides = z.infer<
  typeof SpeechmaticsPunctuationOverrides
>;

export const SpeechmaticsStreaming = z
  .object({
    language: z.string(),
    additional_vocab: z.array(SpeechmaticsAdditionalWord).nullish(),
    diarization: z.string().nullish(),
    speaker_diarization_config: SpeechmaticsDiarizationConfig.nullish(),
    enable_partials: z.boolean().nullish(),
    max_delay: z.number().nullish(),
    max_delay_mode: z.string().nullish(),
    output_locale: z.string().nullish(),
    punctuation_overrides: SpeechmaticsPunctuationOverrides.nullish(),
    operating_point: z.string().nullish(),
    enable_entities: z.boolean().nullish(),
  })
  .passthrough();
export type SpeechmaticsStreaming = z.infer<typeof SpeechmaticsStreaming>;

export const TranscriptionOptions = z
  .object({
    provider: ProviderEnum,
    assembly_ai_async_chunked: AssemblyAiAsyncChunkedStreaming.nullish(),
    assembly_ai: AssemblyAiStreaming.nullish(),
    deepgram: DeepgramStreaming.nullish(),
    gladia: GladiaStreaming.nullish(),
    rev: RevStreaming.nullish(),
    aws_transcribe: AwsTranscribeStreaming.nullish(),
    speechmatics: SpeechmaticsStreaming.nullish(),
    symbl: z.object({}).partial().passthrough().nullish(),
  })
  .passthrough();
export type TranscriptionOptions = z.infer<typeof TranscriptionOptions>;

export const RecordingModeEnum = z.enum([
  "speaker_view",
  "gallery_view",
  "gallery_view_v2",
  "audio_only",
]);
export type RecordingModeEnum = z.infer<typeof RecordingModeEnum>;

export const ParticipantVideoWhenScreenshareEnum = z.enum([
  "hide",
  "beside",
  "overlap",
]);
export type ParticipantVideoWhenScreenshareEnum = z.infer<
  typeof ParticipantVideoWhenScreenshareEnum
>;

export const StartRecordingOnEnum = z.enum([
  "call_join",
  "participant_join",
  "participant_speak",
  "manual",
]);
export type StartRecordingOnEnum = z.infer<typeof StartRecordingOnEnum>;

export const RecordingModeOptions = z
  .object({
    participant_video_when_screenshare:
      ParticipantVideoWhenScreenshareEnum.default("overlap"),
    start_recording_on: StartRecordingOnEnum.default("call_join"),
  })
  .partial()
  .passthrough();
export type RecordingModeOptions = z.infer<typeof RecordingModeOptions>;

export const BotIncludeInRecording = z
  .object({ audio: z.boolean().default(false) })
  .partial()
  .passthrough();
export type BotIncludeInRecording = z.infer<typeof BotIncludeInRecording>;

export const BotRecordingEmbed = z
  .object({
    id: z.string().uuid(),
    created_at: z.string().datetime({ offset: true }),
    started_at: z.string().datetime({ offset: true }).nullish(),
    completed_at: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough();
export type BotRecordingEmbed = z.infer<typeof BotRecordingEmbed>;

export const Kind188Enum = z.literal("webpage");
export type Kind188Enum = z.infer<typeof Kind188Enum>;

export const OutputMediaWebpage = z
  .object({ url: z.string().url() })
  .passthrough();
export type OutputMediaWebpage = z.infer<typeof OutputMediaWebpage>;

export const Camera = z
  .object({ kind: Kind188Enum, config: OutputMediaWebpage })
  .passthrough();
export type Camera = z.infer<typeof Camera>;

export const Screenshare = z
  .object({ kind: Kind188Enum, config: OutputMediaWebpage })
  .passthrough();
export type Screenshare = z.infer<typeof Screenshare>;

export const OutputMedia = z
  .object({ camera: Camera, screenshare: Screenshare })
  .partial()
  .passthrough();
export type OutputMedia = z.infer<typeof OutputMedia>;

export const VideoOutputKindEnum = z.literal("jpeg");
export type VideoOutputKindEnum = z.infer<typeof VideoOutputKindEnum>;

export const VideoOutput = z
  .object({ kind: VideoOutputKindEnum, b64_data: z.string().max(1835008) })
  .passthrough();
export type VideoOutput = z.infer<typeof VideoOutput>;

export const AutomaticVideoOutput = z
  .object({
    in_call_recording: VideoOutput,
    in_call_not_recording: VideoOutput,
  })
  .partial()
  .passthrough();
export type AutomaticVideoOutput = z.infer<typeof AutomaticVideoOutput>;

export const AudioOutputDataKindEnum = z.literal("mp3");
export type AudioOutputDataKindEnum = z.infer<typeof AudioOutputDataKindEnum>;

export const AudioOutputData = z
  .object({ kind: AudioOutputDataKindEnum, b64_data: z.string().max(1835008) })
  .passthrough();
export type AudioOutputData = z.infer<typeof AudioOutputData>;

export const DebounceModeEnum = z.enum(["leading", "trailing"]);
export type DebounceModeEnum = z.infer<typeof DebounceModeEnum>;

export const AudioOutputReplay = z
  .object({
    debounce_mode: DebounceModeEnum.nullish().default("trailing"),
    debounce_interval: z.number().int(),
    disable_after: z.number().int().nullish(),
  })
  .passthrough();
export type AudioOutputReplay = z.infer<typeof AudioOutputReplay>;

export const AudioOutput = z
  .object({
    data: AudioOutputData,
    replay_on_participant_join: AudioOutputReplay.nullish(),
  })
  .passthrough();
export type AudioOutput = z.infer<typeof AudioOutput>;

export const AutomaticAudioOutput = z
  .object({ in_call_recording: AudioOutput })
  .passthrough();
export type AutomaticAudioOutput = z.infer<typeof AutomaticAudioOutput>;

export const SendToEnum = z.enum(["host", "everyone", "everyone_except_host"]);
export type SendToEnum = z.infer<typeof SendToEnum>;

export const ChatOnBotJoin = z
  .object({
    send_to: SendToEnum,
    message: z.string().max(4096),
    pin: z.boolean().nullish().default(false),
  })
  .passthrough();
export type ChatOnBotJoin = z.infer<typeof ChatOnBotJoin>;

export const ChatOnParticipantJoin = z
  .object({ message: z.string().max(4096), exclude_host: z.boolean() })
  .passthrough();
export type ChatOnParticipantJoin = z.infer<typeof ChatOnParticipantJoin>;

export const Chat = z
  .object({
    on_bot_join: ChatOnBotJoin,
    on_participant_join: ChatOnParticipantJoin,
  })
  .partial()
  .passthrough();
export type Chat = z.infer<typeof Chat>;

export const AutomaticLeaveSilenceDetection = z
  .object({
    timeout: z.number().int().gte(10).default(3600),
    activate_after: z.number().int().gte(1).default(1200),
  })
  .partial()
  .passthrough();
export type AutomaticLeaveSilenceDetection = z.infer<
  typeof AutomaticLeaveSilenceDetection
>;

export const AutomaticLeaveBotDetectionUsingParticipantEvents = z
  .object({
    timeout: z.number().int().gte(10).default(600),
    activate_after: z.number().int().gte(1).default(1200),
  })
  .partial()
  .passthrough();
export type AutomaticLeaveBotDetectionUsingParticipantEvents = z.infer<
  typeof AutomaticLeaveBotDetectionUsingParticipantEvents
>;

export const AutomaticLeaveBotDetectionUsingParticipantNames = z
  .object({
    timeout: z.number().int().gte(10),
    activate_after: z.number().int().gte(1),
    matches: z.array(z.string()),
  })
  .passthrough();
export type AutomaticLeaveBotDetectionUsingParticipantNames = z.infer<
  typeof AutomaticLeaveBotDetectionUsingParticipantNames
>;

export const AutomaticLeaveBotDetection = z
  .object({
    using_participant_events: AutomaticLeaveBotDetectionUsingParticipantEvents,
    using_participant_names: AutomaticLeaveBotDetectionUsingParticipantNames,
  })
  .partial()
  .passthrough();
export type AutomaticLeaveBotDetection = z.infer<
  typeof AutomaticLeaveBotDetection
>;

export const AutomaticLeave = z
  .object({
    waiting_room_timeout: z.number().int().gte(30).default(1200),
    noone_joined_timeout: z.number().int().gte(30).default(1200),
    everyone_left_timeout: z.number().int().gte(1).default(2),
    in_call_not_recording_timeout: z.number().int().gte(1).default(3600),
    in_call_recording_timeout: z.number().int().gte(1),
    recording_permission_denied_timeout: z.number().int().gte(1).default(3600),
    silence_detection: AutomaticLeaveSilenceDetection.default({
      timeout: 3600,
      activate_after: 1200,
    }),
    bot_detection: AutomaticLeaveBotDetection.default({
      using_participant_events: { timeout: 600, activate_after: 1200 },
    }),
  })
  .partial()
  .passthrough();
export type AutomaticLeave = z.infer<typeof AutomaticLeave>;

export const ZoomEnum = z.enum(["web", "web_4_core", "native"]);
export type ZoomEnum = z.infer<typeof ZoomEnum>;

export const GoogleMeetEnum = z.enum(["web", "web_4_core"]);
export type GoogleMeetEnum = z.infer<typeof GoogleMeetEnum>;

export const MicrosoftTeamsEnum = z.enum(["web", "web_4_core"]);
export type MicrosoftTeamsEnum = z.infer<typeof MicrosoftTeamsEnum>;

export const BotVariant = z
  .object({
    zoom: ZoomEnum,
    google_meet: GoogleMeetEnum,
    microsoft_teams: MicrosoftTeamsEnum,
  })
  .partial()
  .passthrough();
export type BotVariant = z.infer<typeof BotVariant>;

export const BotCalendarUser = z
  .object({ id: z.string().uuid(), external_id: z.string() })
  .passthrough();
export type BotCalendarUser = z.infer<typeof BotCalendarUser>;

export const BotCalendarMeeting = z
  .object({
    id: z.string().uuid(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    calendar_user: BotCalendarUser,
  })
  .passthrough();
export type BotCalendarMeeting = z.infer<typeof BotCalendarMeeting>;

export const Zoom = z
  .object({
    join_token_url: z.string().url(),
    zak_url: z.string().url(),
    user_email: z.string().email(),
  })
  .partial()
  .passthrough();
export type Zoom = z.infer<typeof Zoom>;

export const GoogleMeet = z
  .object({
    login_required: z.boolean().nullish(),
    google_login_group_id: z.string().uuid().nullish(),
  })
  .partial()
  .passthrough();
export type GoogleMeet = z.infer<typeof GoogleMeet>;

export const SlackHuddleObserver = z
  .object({
    slack_team_integration_id: z.string().uuid(),
    team_domain: z.string(),
    login_email: z.string(),
    auto_join_public_huddles: z.boolean().nullish().default(true),
    ask_to_join_private_huddles: z.boolean().nullish().default(true),
    ask_to_join_message: z.string().nullish().default(""),
    filter_huddles_by_user_emails: z.array(z.string()).nullish(),
    profile_photo_base64_jpg: z.string().nullish(),
    huddle_bot_api_token: z.string(),
    huddle_bot_config: z.unknown(),
  })
  .passthrough();
export type SlackHuddleObserver = z.infer<typeof SlackHuddleObserver>;

export const Bot = z
  .object({
    id: z.string().uuid(),
    meeting_url: z.string(),
    bot_name: z.string().max(100).nullish().default("Meeting Notetaker"),
    join_at: z.string().datetime({ offset: true }).nullish(),
    video_url: z.string().url(),
    media_retention_end: z.string().datetime({ offset: true }),
    status_changes: z.array(BotEvent),
    meeting_metadata: MeetingMetadata.nullish(),
    meeting_participants: z.array(MeetingParticipant),
    real_time_transcription: RealTimeTranscription.nullish(),
    real_time_media: RealTimeMedia.nullish(),
    transcription_options: TranscriptionOptions.nullish(),
    recording_mode: RecordingModeEnum.nullish().default("speaker_view"),
    recording_mode_options: RecordingModeOptions.nullish(),
    include_bot_in_recording: BotIncludeInRecording.nullish(),
    recordings: z.array(BotRecordingEmbed),
    output_media: OutputMedia.nullish(),
    automatic_video_output: AutomaticVideoOutput.nullish(),
    automatic_audio_output: AutomaticAudioOutput.nullish(),
    chat: Chat.nullish(),
    automatic_leave: AutomaticLeave.nullish(),
    variant: BotVariant.nullish(),
    calendar_meetings: z.array(BotCalendarMeeting),
    zoom: Zoom.nullish(),
    google_meet: GoogleMeet.nullish(),
    slack_huddle_observer: SlackHuddleObserver.nullish(),
    metadata: z.record(z.string().nullish()).nullish(),
    recording: z.string(),
  })
  .passthrough();
export type Bot = z.infer<typeof Bot>;

export const PaginatedBotList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(Bot),
  })
  .partial()
  .passthrough();
export type PaginatedBotList = z.infer<typeof PaginatedBotList>;

export const bot_id__2 = z.string().uuid();
export type bot_id__2 = z.infer<typeof bot_id__2>;

export const ToEnum = z.enum(["everyone", "only_bot"]);
export type ToEnum = z.infer<typeof ToEnum>;

export const MeetingChatMessageSenderPlatformEnum = z.enum([
  "mobile_app",
  "desktop",
  "dial_in",
  "unknown",
]);
export type MeetingChatMessageSenderPlatformEnum = z.infer<
  typeof MeetingChatMessageSenderPlatformEnum
>;

export const NullEnum = z.unknown();
export type NullEnum = z.infer<typeof NullEnum>;

export const MeetingChatMessageSender = z
  .object({
    id: z.number().int(),
    name: z.string().max(200),
    is_host: z.boolean().nullish(),
    platform: z
      .union([MeetingChatMessageSenderPlatformEnum, NullEnum])
      .nullish(),
    extra_data: MeetingParticipantExtraData,
  })
  .passthrough();
export type MeetingChatMessageSender = z.infer<typeof MeetingChatMessageSender>;

export const MeetingChatMessage = z
  .object({
    text: z.string(),
    created_at: z.string().datetime({ offset: true }),
    to: ToEnum,
    sender: MeetingChatMessageSender,
  })
  .passthrough();
export type MeetingChatMessage = z.infer<typeof MeetingChatMessage>;

export const PaginatedMeetingChatMessageList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(MeetingChatMessage),
  })
  .partial()
  .passthrough();
export type PaginatedMeetingChatMessageList = z.infer<
  typeof PaginatedMeetingChatMessageList
>;

export const recorded_at_after = z
  .string()
  .datetime({ offset: true })
  .nullish();
export type recorded_at_after = z.infer<typeof recorded_at_after>;

export const recorded_at_before = z
  .string()
  .datetime({ offset: true })
  .nullish();
export type recorded_at_before = z.infer<typeof recorded_at_before>;

export const BotScreenshot = z
  .object({
    id: z.string().uuid(),
    recorded_at: z.string().datetime({ offset: true }),
    url: z.string().url(),
  })
  .passthrough();
export type BotScreenshot = z.infer<typeof BotScreenshot>;

export const PaginatedBotScreenshotList = z
  .object({
    count: z.number().int(),
    next: z.string().url().nullish(),
    previous: z.string().url().nullish(),
    results: z.array(BotScreenshot),
  })
  .partial()
  .passthrough();
export type PaginatedBotScreenshotList = z.infer<
  typeof PaginatedBotScreenshotList
>;

export const PatchedBot = z
  .object({
    id: z.string().uuid(),
    meeting_url: z.string(),
    bot_name: z.string().max(100).default("Meeting Notetaker"),
    join_at: z.string().datetime({ offset: true }).nullish(),
    video_url: z.string().url(),
    media_retention_end: z.string().datetime({ offset: true }),
    status_changes: z.array(BotEvent),
    meeting_metadata: MeetingMetadata.nullish(),
    meeting_participants: z.array(MeetingParticipant),
    real_time_transcription: RealTimeTranscription.nullish(),
    real_time_media: RealTimeMedia.nullish(),
    transcription_options: TranscriptionOptions.nullish(),
    recording_mode: RecordingModeEnum.default("speaker_view"),
    recording_mode_options: RecordingModeOptions.nullish(),
    include_bot_in_recording: BotIncludeInRecording,
    recordings: z.array(BotRecordingEmbed),
    output_media: OutputMedia.nullish(),
    automatic_video_output: AutomaticVideoOutput.nullish(),
    automatic_audio_output: AutomaticAudioOutput.nullish(),
    chat: Chat.nullish(),
    automatic_leave: AutomaticLeave.nullish(),
    variant: BotVariant.nullish(),
    calendar_meetings: z.array(BotCalendarMeeting),
    zoom: Zoom.nullish(),
    google_meet: GoogleMeet.nullish(),
    slack_huddle_observer: SlackHuddleObserver.nullish(),
    metadata: z.record(z.string().nullish()),
    recording: z.string(),
  })
  .partial()
  .passthrough();
export type PatchedBot = z.infer<typeof PatchedBot>;

export const Log = z
  .object({
    level: z.string().max(200),
    message: z.string().max(2000),
    created_at: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough();
export type Log = z.infer<typeof Log>;

export const bot_output_media_destroy_Body = z
  .object({
    camera: z.boolean().default(false),
    screenshare: z.boolean().default(false),
  })
  .partial();
export type bot_output_media_destroy_Body = z.infer<
  typeof bot_output_media_destroy_Body
>;

export const SendChatMessageInput = z
  .object({
    to: z.string().nullish().default("everyone"),
    message: z.string().max(4096),
    pin: z.boolean().nullish().default(false),
  })
  .passthrough();
export type SendChatMessageInput = z.infer<typeof SendChatMessageInput>;

export const exclude_null_speaker = z.boolean().nullish();
export type exclude_null_speaker = z.infer<typeof exclude_null_speaker>;

export const SpeakerTimelineEvent = z
  .object({
    name: z.string(),
    user_id: z.number().int(),
    timestamp: z.number(),
  })
  .passthrough();
export type SpeakerTimelineEvent = z.infer<typeof SpeakerTimelineEvent>;

export const RecordingConfig = z
  .object({
    id: z.number().int(),
    recording_mode: RecordingModeEnum.nullish().default("speaker_view"),
    recording_mode_options: RecordingModeOptions.nullish(),
    real_time_transcription: RealTimeTranscription.nullish(),
    real_time_media: RealTimeMedia.nullish(),
    transcription_options: TranscriptionOptions.nullish(),
  })
  .passthrough();
export type RecordingConfig = z.infer<typeof RecordingConfig>;

export const enhanced_diarization = z.boolean().nullish();
export type enhanced_diarization = z.infer<typeof enhanced_diarization>;

export const TranscriptLegacyWord = z
  .object({
    text: z.string(),
    start_timestamp: z.number(),
    end_timestamp: z.number(),
    language: z.string().nullish(),
    confidence: z.number().nullish(),
  })
  .passthrough();
export type TranscriptLegacyWord = z.infer<typeof TranscriptLegacyWord>;

export const TranscriptLegacyParagraph = z
  .object({
    speaker: z.string(),
    speaker_id: z.number().int(),
    language: z.string(),
    words: z.array(TranscriptLegacyWord),
  })
  .passthrough();
export type TranscriptLegacyParagraph = z.infer<
  typeof TranscriptLegacyParagraph
>;

export const CalendarAuthenticateRequest = z
  .object({ user_id: z.string() })
  .passthrough();
export type CalendarAuthenticateRequest = z.infer<
  typeof CalendarAuthenticateRequest
>;

export const CalendarAuthenticateResponse = z
  .object({ token: z.string() })
  .passthrough();
export type CalendarAuthenticateResponse = z.infer<
  typeof CalendarAuthenticateResponse
>;

export const ical_uid = z.string().nullish();
export type ical_uid = z.infer<typeof ical_uid>;

export const start_time_after = z.string().datetime({ offset: true }).nullish();
export type start_time_after = z.infer<typeof start_time_after>;

export const start_time_before = z
  .string()
  .datetime({ offset: true })
  .nullish();
export type start_time_before = z.infer<typeof start_time_before>;

export const ZoomInvite = z
  .object({ meeting_id: z.string(), meeting_password: z.string().nullish() })
  .passthrough();
export type ZoomInvite = z.infer<typeof ZoomInvite>;

export const TeamsInvite = z
  .object({
    organizer_id: z.string(),
    tenant_id: z.string(),
    message_id: z.string(),
    thread_id: z.string(),
  })
  .passthrough();
export type TeamsInvite = z.infer<typeof TeamsInvite>;

export const MeetInvite = z.object({ meeting_id: z.string() }).passthrough();
export type MeetInvite = z.infer<typeof MeetInvite>;

export const WebexInvite = z
  .object({
    meeting_subdomain: z.string(),
    meeting_path: z.string().nullish(),
    meeting_mtid: z.string().nullish(),
    meeting_personal_room_id: z.string().nullish(),
  })
  .passthrough();
export type WebexInvite = z.infer<typeof WebexInvite>;

export const MeetingAttendeeStatusEnum = z.enum([
  "accepted",
  "declined",
  "tentative",
  "not_available",
]);
export type MeetingAttendeeStatusEnum = z.infer<
  typeof MeetingAttendeeStatusEnum
>;

export const MeetingAttendee = z
  .object({
    name: z.string(),
    email: z.string(),
    is_organizer: z.boolean(),
    status: MeetingAttendeeStatusEnum,
  })
  .passthrough();
export type MeetingAttendee = z.infer<typeof MeetingAttendee>;

export const CalendarMeeting = z
  .object({
    id: z.string().uuid(),
    override_should_record: z.boolean().nullish(),
    title: z.string(),
    will_record: z.boolean(),
    will_record_reason: z.string(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    platform: z.string(),
    meeting_platform: z.string(),
    calendar_platform: z.string(),
    zoom_invite: ZoomInvite,
    teams_invite: TeamsInvite,
    meet_invite: MeetInvite,
    webex_invite: WebexInvite,
    bot_id: z.string().uuid().nullish(),
    is_external: z.boolean(),
    is_hosted_by_me: z.boolean(),
    is_recurring: z.boolean(),
    organizer_email: z.string(),
    attendee_emails: z.array(z.string()),
    attendees: z.array(MeetingAttendee),
    ical_uid: z.string(),
    visibility: z.string(),
  })
  .passthrough();
export type CalendarMeeting = z.infer<typeof CalendarMeeting>;

export const CalendarUserConnection = z
  .object({
    connected: z.boolean(),
    platform: z.string(),
    email: z.string().nullish(),
    id: z.string().nullish(),
  })
  .passthrough();
export type CalendarUserConnection = z.infer<typeof CalendarUserConnection>;

export const PatchedCalendarRecordingPreferences = z
  .object({
    id: z.string().uuid(),
    record_non_host: z.boolean(),
    record_recurring: z.boolean(),
    record_external: z.boolean(),
    record_internal: z.boolean(),
    record_confirmed: z.boolean(),
    record_only_host: z.boolean(),
    bot_name: z.string(),
  })
  .partial()
  .passthrough();
export type PatchedCalendarRecordingPreferences = z.infer<
  typeof PatchedCalendarRecordingPreferences
>;

export const CalendarUser = z
  .object({
    id: z.string().uuid(),
    external_id: z.string().nullish(),
    connections: z.array(CalendarUserConnection),
    preferences: PatchedCalendarRecordingPreferences.nullish(),
  })
  .passthrough();
export type CalendarUser = z.infer<typeof CalendarUser>;

export const CalendarUserDisconnectPlatformPlatformEnum = z.enum([
  "google",
  "microsoft",
]);
export type CalendarUserDisconnectPlatformPlatformEnum = z.infer<
  typeof CalendarUserDisconnectPlatformPlatformEnum
>;

export const CalendarUserDisconnectPlatform = z
  .object({ platform: CalendarUserDisconnectPlatformPlatformEnum })
  .passthrough();
export type CalendarUserDisconnectPlatform = z.infer<
  typeof CalendarUserDisconnectPlatform
>;

export const ParticipantExtraDataZoom = z
  .object({
    user_guid: z.string(),
    guest: z.boolean(),
    conf_user_id: z.string(),
  })
  .partial()
  .passthrough();
export type ParticipantExtraDataZoom = z.infer<typeof ParticipantExtraDataZoom>;

export const ParticipantExtraDataMicrosoftTeams = z
  .object({
    participant_type: z.string(),
    role: z.string(),
    meeting_role: z.string(),
    user_id: z.string(),
    tenant_id: z.string(),
    client_version: z.string(),
  })
  .partial()
  .passthrough();
export type ParticipantExtraDataMicrosoftTeams = z.infer<
  typeof ParticipantExtraDataMicrosoftTeams
>;

export const ParticipantExtraDataSlack = z
  .object({ user_id: z.string(), email: z.string() })
  .partial()
  .passthrough();
export type ParticipantExtraDataSlack = z.infer<
  typeof ParticipantExtraDataSlack
>;

export const ParticipantExtraData = z
  .object({
    zoom: ParticipantExtraDataZoom,
    microsoft_teams: ParticipantExtraDataMicrosoftTeams,
    slack: ParticipantExtraDataSlack,
  })
  .partial()
  .passthrough();
export type ParticipantExtraData = z.infer<typeof ParticipantExtraData>;

export const Participant = z
  .object({
    id: z.number().int(),
    name: z.string().nullish(),
    is_host: z.boolean().nullish(),
    platform: z.string().nullish(),
    extra_data: ParticipantExtraData.nullish(),
  })
  .passthrough();
export type Participant = z.infer<typeof Participant>;

export const RecordingSpeakerEntryTimestamp = z
  .object({
    absolute: z.string().datetime({ offset: true }),
    relative: z.number(),
  })
  .passthrough();
export type RecordingSpeakerEntryTimestamp = z.infer<
  typeof RecordingSpeakerEntryTimestamp
>;

export const RecordingSpeakerEntry = z
  .object({
    participant: Participant,
    start_timestamp: RecordingSpeakerEntryTimestamp,
    end_timestamp: RecordingSpeakerEntryTimestamp.nullish(),
  })
  .passthrough();
export type RecordingSpeakerEntry = z.infer<typeof RecordingSpeakerEntry>;

export const uuid = z.string();
export type uuid = z.infer<typeof uuid>;

export const CalendarAccount = z
  .object({
    id: z.string().uuid(),
    platform: z.string(),
    email: z.string().email(),
  })
  .passthrough();
export type CalendarAccount = z.infer<typeof CalendarAccount>;

export const AccessToken = z.object({ access_token: z.string() }).passthrough();
export type AccessToken = z.infer<typeof AccessToken>;

export const CodeEnum = z.enum([
  "no_oauth_credentials",
  "bad_refresh_token",
  "error",
]);
export type CodeEnum = z.infer<typeof CodeEnum>;

export const CalendarAccountAccessTokenError = z
  .object({ code: CodeEnum, message: z.string() })
  .passthrough();
export type CalendarAccountAccessTokenError = z.infer<
  typeof CalendarAccountAccessTokenError
>;

export const calendar_id = z.string().uuid().nullish();
export type calendar_id = z.infer<typeof calendar_id>;

export const is_deleted = z.boolean().nullish();
export type is_deleted = z.infer<typeof is_deleted>;

export const start_time = z.string().datetime({ offset: true }).nullish();
export type start_time = z.infer<typeof start_time>;

export const start_time__gte = z.string().datetime({ offset: true }).nullish();
export type start_time__gte = z.infer<typeof start_time__gte>;

export const start_time__lte = z.string().datetime({ offset: true }).nullish();
export type start_time__lte = z.infer<typeof start_time__lte>;

export const updated_at__gte = z.string().datetime({ offset: true }).nullish();
export type updated_at__gte = z.infer<typeof updated_at__gte>;

export const MeetingPlatformEnum = z.enum([
  "zoom",
  "google_meet",
  "goto_meeting",
  "microsoft_teams",
  "microsoft_teams_live",
  "webex",
  "chime_sdk",
  "webrtc",
  "slack_huddle_observer",
]);
export type MeetingPlatformEnum = z.infer<typeof MeetingPlatformEnum>;

export const CalendarEventBot = z
  .object({
    bot_id: z.string().uuid(),
    start_time: z.string().datetime({ offset: true }),
    deduplication_key: z.string(),
    meeting_url: z.string(),
  })
  .passthrough();
export type CalendarEventBot = z.infer<typeof CalendarEventBot>;

export const CalendarEvent = z
  .object({
    id: z.string().uuid(),
    start_time: z.string().datetime({ offset: true }),
    end_time: z.string().datetime({ offset: true }),
    calendar_id: z.string().uuid(),
    raw: z.unknown(),
    platform: z.string(),
    platform_id: z.string(),
    ical_uid: z.string(),
    meeting_platform: z.union([MeetingPlatformEnum, NullEnum]).nullish(),
    meeting_url: z.string().nullish(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    is_deleted: z.boolean(),
    bots: z.array(CalendarEventBot),
  })
  .passthrough();
export type CalendarEvent = z.infer<typeof CalendarEvent>;

export const PaginatedCalendarEventList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(CalendarEvent),
  })
  .partial()
  .passthrough();
export type PaginatedCalendarEventList = z.infer<
  typeof PaginatedCalendarEventList
>;

export const CalendarEventAddBot = z
  .object({ deduplication_key: z.string().max(2000), bot_config: z.unknown() })
  .passthrough();
export type CalendarEventAddBot = z.infer<typeof CalendarEventAddBot>;

export const created_at__gte = z.string().datetime({ offset: true }).nullish();
export type created_at__gte = z.infer<typeof created_at__gte>;

export const platform = z
  .enum(["google_calendar", "microsoft_outlook"])
  .nullish();
export type platform = z.infer<typeof platform>;

export const status__3 = z
  .enum(["connected", "connecting", "disconnected"])
  .nullish();
export type status__3 = z.infer<typeof status__3>;

export const CalendarPlatformEnum = z.enum([
  "google_calendar",
  "microsoft_outlook",
]);
export type CalendarPlatformEnum = z.infer<typeof CalendarPlatformEnum>;

export const Calendar = z
  .object({
    id: z.string().uuid(),
    oauth_client_id: z.string().max(2000),
    oauth_client_secret: z.string().max(2000),
    oauth_refresh_token: z.string().max(2000),
    platform: CalendarPlatformEnum,
    webhook_url: z.string().max(2000).url().nullish(),
    oauth_email: z.string().max(2000).email().nullish(),
    platform_email: z.string().nullish(),
    status: z.string(),
    status_changes: z.unknown(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type Calendar = z.infer<typeof Calendar>;

export const PaginatedCalendarList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(Calendar),
  })
  .partial()
  .passthrough();
export type PaginatedCalendarList = z.infer<typeof PaginatedCalendarList>;

export const PatchedCalendar = z
  .object({
    id: z.string().uuid(),
    oauth_client_id: z.string().max(2000),
    oauth_client_secret: z.string().max(2000),
    oauth_refresh_token: z.string().max(2000),
    platform: CalendarPlatformEnum,
    webhook_url: z.string().max(2000).url(),
    oauth_email: z.string().max(2000).email(),
    platform_email: z.string().nullish(),
    status: z.string(),
    status_changes: z.unknown(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
export type PatchedCalendar = z.infer<typeof PatchedCalendar>;

export const name = z.string().nullish();
export type name = z.infer<typeof name>;

export const name__contains = z.string().nullish();
export type name__contains = z.infer<typeof name__contains>;

export const LoginModeEnum = z.enum(["always", "only_if_required"]);
export type LoginModeEnum = z.infer<typeof LoginModeEnum>;

export const GoogleLogin = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    is_active: z.boolean().nullish(),
    sso_v2_workspace_domain: z.string(),
    sso_v2_private_key: z.string(),
    sso_v2_cert: z.string(),
    group_id: z.string().uuid(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type GoogleLogin = z.infer<typeof GoogleLogin>;

export const GoogleLoginGroup = z
  .object({
    id: z.string().uuid(),
    name: z.string().max(2000),
    login_mode: LoginModeEnum,
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    logins: z.array(GoogleLogin),
  })
  .passthrough();
export type GoogleLoginGroup = z.infer<typeof GoogleLoginGroup>;

export const PaginatedGoogleLoginGroupList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(GoogleLoginGroup),
  })
  .partial()
  .passthrough();
export type PaginatedGoogleLoginGroupList = z.infer<
  typeof PaginatedGoogleLoginGroupList
>;

export const PatchedGoogleLoginGroup = z
  .object({
    id: z.string().uuid(),
    name: z.string().max(2000),
    login_mode: LoginModeEnum,
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
    logins: z.array(GoogleLogin),
  })
  .partial()
  .passthrough();
export type PatchedGoogleLoginGroup = z.infer<typeof PatchedGoogleLoginGroup>;

export const email = z.string().nullish();
export type email = z.infer<typeof email>;

export const group_id = z.string().uuid().nullish();
export type group_id = z.infer<typeof group_id>;

export const is_active = z.boolean().nullish();
export type is_active = z.infer<typeof is_active>;

export const sso_v2_workspace_domain = z.string().nullish();
export type sso_v2_workspace_domain = z.infer<typeof sso_v2_workspace_domain>;

export const PaginatedGoogleLoginList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(GoogleLogin),
  })
  .partial()
  .passthrough();
export type PaginatedGoogleLoginList = z.infer<typeof PaginatedGoogleLoginList>;

export const PatchedGoogleLogin = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    is_active: z.boolean(),
    sso_v2_workspace_domain: z.string(),
    sso_v2_private_key: z.string(),
    sso_v2_cert: z.string(),
    group_id: z.string().uuid(),
    created_at: z.string().datetime({ offset: true }),
    updated_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
export type PatchedGoogleLogin = z.infer<typeof PatchedGoogleLogin>;

export const id__2 = z.string();
export type id__2 = z.infer<typeof id__2>;

export const OutputTypeEnum = z.enum([
  "mp4_video_mixed",
  "flv_video_mixed",
  "raw_audio_mixed",
  "mpng_video_unmixed",
  "raw_audio_unmixed",
  "mp4_video_unmixed",
  "active_speaker_diarized_transcription_assemblyai_async_chunked",
  "active_speaker_diarized_transcription_assemblyai",
  "active_speaker_diarized_transcription_awstranscribe",
  "active_speaker_diarized_transcription_deepgram",
  "active_speaker_diarized_transcription_gladia",
  "active_speaker_diarized_transcription_rev",
  "active_speaker_diarized_transcription_speechmatics",
  "active_speaker_diarized_transcription_symbl",
  "meeting_captions_diarized_transcription",
  "active_speaker_timeline",
]);
export type OutputTypeEnum = z.infer<typeof OutputTypeEnum>;

export const EndpointTypeEnum = z.enum([
  "s3",
  "rtmp",
  "websocket",
  "webhook",
  "database",
]);
export type EndpointTypeEnum = z.infer<typeof EndpointTypeEnum>;

export const Endpoint = z
  .object({ id: z.string().uuid(), type: EndpointTypeEnum })
  .passthrough();
export type Endpoint = z.infer<typeof Endpoint>;

export const Output = z
  .object({
    id: z.string().uuid(),
    type: OutputTypeEnum,
    metadata: z.unknown().nullish(),
    endpoints: z.array(Endpoint),
  })
  .passthrough();
export type Output = z.infer<typeof Output>;

export const LegacyRecording = z
  .object({
    id: z.string().uuid(),
    outputs: z.array(Output),
    created_at: z.string().datetime({ offset: true }),
    expires_at: z.string().datetime({ offset: true }).nullish(),
  })
  .passthrough();
export type LegacyRecording = z.infer<typeof LegacyRecording>;

export const SlackTeamIntegration = z
  .object({
    id: z.string().uuid(),
    email_address: z.string().email(),
    slack_team_domain: z.string(),
    bot_name: z.string(),
    profile_photo_base64_jpg: z.string().nullish(),
    auto_join_public_huddles: z.boolean(),
    ask_to_join_private_huddles: z.boolean(),
    ask_to_join_message: z.string(),
    filter_huddles_by_user_emails: z.array(z.string().email()).nullish(),
    huddle_bot_api_token: z.string(),
    huddle_bot_config: Bot,
    status: z.string(),
    updated_at: z.string().datetime({ offset: true }),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type SlackTeamIntegration = z.infer<typeof SlackTeamIntegration>;

export const PatchedSlackTeamIntegration = z
  .object({
    id: z.string().uuid(),
    email_address: z.string().email(),
    slack_team_domain: z.string(),
    bot_name: z.string(),
    profile_photo_base64_jpg: z.string().nullish(),
    auto_join_public_huddles: z.boolean(),
    ask_to_join_private_huddles: z.boolean(),
    ask_to_join_message: z.string(),
    filter_huddles_by_user_emails: z.array(z.string().email()).nullish(),
    huddle_bot_api_token: z.string(),
    huddle_bot_config: Bot,
    status: z.string(),
    updated_at: z.string().datetime({ offset: true }),
    created_at: z.string().datetime({ offset: true }),
  })
  .partial()
  .passthrough();
export type PatchedSlackTeamIntegration = z.infer<
  typeof PatchedSlackTeamIntegration
>;

export const credential = z.string().uuid().nullish();
export type credential = z.infer<typeof credential>;

export const meeting_id = z.number().int().nullish();
export type meeting_id = z.infer<typeof meeting_id>;

export const synced_at_after = z.string().datetime({ offset: true }).nullish();
export type synced_at_after = z.infer<typeof synced_at_after>;

export const synced_at_before = z.string().datetime({ offset: true }).nullish();
export type synced_at_before = z.infer<typeof synced_at_before>;

export const ZoomMeetingToCredential = z
  .object({
    meeting_id: z
      .number()
      .int()
      .gte(-9223372036854776000)
      .lte(9223372036854776000),
    credential: z.string().uuid(),
    synced_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type ZoomMeetingToCredential = z.infer<typeof ZoomMeetingToCredential>;

export const PaginatedZoomMeetingToCredentialList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(ZoomMeetingToCredential),
  })
  .partial()
  .passthrough();
export type PaginatedZoomMeetingToCredentialList = z.infer<
  typeof PaginatedZoomMeetingToCredentialList
>;

export const oauth_app = z.string().uuid().nullish();
export type oauth_app = z.infer<typeof oauth_app>;

export const ZoomOAuthAppLog = z
  .object({
    oauth_app: z.string().uuid(),
    message: z.string().max(2000),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type ZoomOAuthAppLog = z.infer<typeof ZoomOAuthAppLog>;

export const PaginatedZoomOAuthAppLogList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(ZoomOAuthAppLog),
  })
  .partial()
  .passthrough();
export type PaginatedZoomOAuthAppLogList = z.infer<
  typeof PaginatedZoomOAuthAppLogList
>;

export const client_id = z.string().nullish();
export type client_id = z.infer<typeof client_id>;

export const kind = z.string().nullish();
export type kind = z.infer<typeof kind>;

export const webhook_last_validation_after = z
  .string()
  .datetime({ offset: true })
  .nullish();
export type webhook_last_validation_after = z.infer<
  typeof webhook_last_validation_after
>;

export const webhook_last_validation_before = z
  .string()
  .datetime({ offset: true })
  .nullish();
export type webhook_last_validation_before = z.infer<
  typeof webhook_last_validation_before
>;

export const ZoomOAuthAppKindEnum = z.enum(["user_level", "account_level"]);
export type ZoomOAuthAppKindEnum = z.infer<typeof ZoomOAuthAppKindEnum>;

export const ZoomOAuthApp = z
  .object({
    id: z.string().uuid(),
    kind: ZoomOAuthAppKindEnum,
    client_id: z.string().max(200),
    client_secret: z.string().max(200),
    webhook_secret: z.string().max(200),
    webhook_last_validation: z.string().datetime({ offset: true }).nullish(),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type ZoomOAuthApp = z.infer<typeof ZoomOAuthApp>;

export const PaginatedZoomOAuthAppList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(ZoomOAuthApp),
  })
  .partial()
  .passthrough();
export type PaginatedZoomOAuthAppList = z.infer<
  typeof PaginatedZoomOAuthAppList
>;

export const ZoomOAuthCredentialLog = z
  .object({
    credential: z.string().uuid(),
    message: z.string().max(2000),
    created_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type ZoomOAuthCredentialLog = z.infer<typeof ZoomOAuthCredentialLog>;

export const PaginatedZoomOAuthCredentialLogList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(ZoomOAuthCredentialLog),
  })
  .partial()
  .passthrough();
export type PaginatedZoomOAuthCredentialLogList = z.infer<
  typeof PaginatedZoomOAuthCredentialLogList
>;

export const account_id = z.string().nullish();
export type account_id = z.infer<typeof account_id>;

export const meeting_sync_status = z
  .enum(["completed", "failed", "in_progress", "not_started"])
  .nullish();
export type meeting_sync_status = z.infer<typeof meeting_sync_status>;

export const status__4 = z.enum(["healthy", "unhealthy"]).nullish();
export type status__4 = z.infer<typeof status__4>;

export const user_id = z.string().nullish();
export type user_id = z.infer<typeof user_id>;

export const ZoomOAuthCredentialStatusEnum = z.enum(["healthy", "unhealthy"]);
export type ZoomOAuthCredentialStatusEnum = z.infer<
  typeof ZoomOAuthCredentialStatusEnum
>;

export const ZoomAuthorizationCode = z
  .object({
    code: z.string(),
    redirect_uri: z.string().url(),
    code_verifier: z.string().nullish(),
  })
  .passthrough();
export type ZoomAuthorizationCode = z.infer<typeof ZoomAuthorizationCode>;

export const MeetingSyncStatusEnum = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "failed",
]);
export type MeetingSyncStatusEnum = z.infer<typeof MeetingSyncStatusEnum>;

export const ZoomOAuthCredential = z
  .object({
    id: z.string().uuid(),
    oauth_app: z.string().uuid(),
    status: ZoomOAuthCredentialStatusEnum,
    user_id: z.string().nullish(),
    account_id: z.string().nullish(),
    authorization_code: ZoomAuthorizationCode.nullish(),
    access_token_callback_url: z.string().max(200).nullish(),
    created_at: z.string().datetime({ offset: true }),
    meeting_sync_status: MeetingSyncStatusEnum,
  })
  .passthrough();
export type ZoomOAuthCredential = z.infer<typeof ZoomOAuthCredential>;

export const PaginatedZoomOAuthCredentialList = z
  .object({
    next: z.string().nullish(),
    previous: z.string().nullish(),
    results: z.array(ZoomOAuthCredential),
  })
  .partial()
  .passthrough();
export type PaginatedZoomOAuthCredentialList = z.infer<
  typeof PaginatedZoomOAuthCredentialList
>;

export const ZoomOAuthCredentialBadRequest = z
  .object({
    detail: z.string(),
    conflicting_zoom_account_id: z.string().nullish(),
    conflicting_zoom_user_id: z.string().nullish(),
  })
  .passthrough();
export type ZoomOAuthCredentialBadRequest = z.infer<
  typeof ZoomOAuthCredentialBadRequest
>;

export const ZoomAccessToken = z
  .object({
    token: z.string(),
    expires_at: z.string().datetime({ offset: true }),
  })
  .passthrough();
export type ZoomAccessToken = z.infer<typeof ZoomAccessToken>;

export const AssemblyaiAsyncTranscription = z
  .object({
    language: z.string(),
    audio_end_at: z.number().int(),
    audio_start_from: z.number().int(),
    auto_chapters: z.boolean(),
    auto_highlights: z.boolean(),
    boost_param: z.string(),
    content_safety: z.boolean(),
    content_safety_confidence: z.number().int(),
    custom_spelling: z.array(z.object({}).partial().passthrough()),
    custom_topics: z.boolean(),
    disfluencies: z.boolean(),
    dual_channel: z.boolean(),
    entity_detection: z.boolean(),
    filter_profanity: z.boolean(),
    format_text: z.boolean(),
    iab_categories: z.boolean(),
    language_code: z.string(),
    language_confidence_threshold: z.number(),
    language_detection: z.boolean(),
    punctuate: z.boolean(),
    redact_pii: z.boolean(),
    redact_pii_audio: z.boolean(),
    redact_pii_audio_quality: z.string(),
    redact_pii_policies: z.array(z.string()),
    redact_pii_sub: z.string(),
    sentiment_analysis: z.boolean(),
    speaker_labels: z.boolean(),
    speakers_expected: z.number().int(),
    speech_model: z.string(),
    speech_threshold: z.number(),
    summarization: z.boolean(),
    summary_model: z.string(),
    summary_type: z.string(),
    topics: z.array(z.string()),
    word_boost: z.array(z.string()),
  })
  .partial()
  .passthrough();
export type AssemblyaiAsyncTranscription = z.infer<
  typeof AssemblyaiAsyncTranscription
>;

export const AdditionalVocab = z
  .object({ content: z.string(), sounds_like: z.array(z.string()).nullish() })
  .passthrough();
export type AdditionalVocab = z.infer<typeof AdditionalVocab>;

export const LanguageIdentificationConfig = z
  .object({
    expected_languages: z.array(z.string()),
    low_confidence_action: z.string(),
    default_language: z.string(),
  })
  .partial()
  .passthrough();
export type LanguageIdentificationConfig = z.infer<
  typeof LanguageIdentificationConfig
>;

export const SpeechmaticsAsyncTranscription = z
  .object({
    language: z.string(),
    domain: z.string().nullish(),
    output_locale: z.string().nullish(),
    operating_point: z.string().nullish(),
    additional_vocab: z.array(AdditionalVocab).nullish(),
    language_identification_config: LanguageIdentificationConfig.nullish(),
  })
  .passthrough();
export type SpeechmaticsAsyncTranscription = z.infer<
  typeof SpeechmaticsAsyncTranscription
>;

export const RevAsyncTranscription = z
  .object({
    detect_language: z.boolean(),
    language: z.string(),
    skip_diarization: z.boolean(),
    skip_postprocessing: z.boolean(),
    skip_punctuation: z.boolean(),
    remove_disfluencies: z.boolean(),
    remove_atmospherics: z.boolean(),
    filter_profanity: z.boolean(),
    custom_vocabulary_id: z.string(),
    custom_vocabularies: z.array(z.string()),
  })
  .partial()
  .passthrough();
export type RevAsyncTranscription = z.infer<typeof RevAsyncTranscription>;

export const DeepgramAsyncTranscription = z
  .object({
    tier: z.string(),
    model: z.string(),
    version: z.string(),
    language: z.string(),
    detect_language: z.union([z.boolean(), z.array(z.string())]),
    punctuate: z.boolean(),
    profanity_filter: z.boolean(),
    redact: z.array(z.string()),
    diarize: z.boolean(),
    diarize_version: z.string(),
    smart_format: z.boolean(),
    numerals: z.boolean(),
    search: z.array(z.string()),
    replace: z.array(z.string()),
    keywords: z.array(z.string()),
    summarize: z.boolean(),
    detect_topics: z.boolean(),
    tag: z.boolean(),
    credential_id: z.string(),
  })
  .partial()
  .passthrough();
export type DeepgramAsyncTranscription = z.infer<
  typeof DeepgramAsyncTranscription
>;

export const GladiaV2AsyncCodeSwitchingConfig = z
  .object({ languages: z.array(z.string()) })
  .passthrough();
export type GladiaV2AsyncCodeSwitchingConfig = z.infer<
  typeof GladiaV2AsyncCodeSwitchingConfig
>;

export const GladiaV2AsyncSubtitlesConfig = z
  .object({ formats: z.array(z.string()) })
  .passthrough();
export type GladiaV2AsyncSubtitlesConfig = z.infer<
  typeof GladiaV2AsyncSubtitlesConfig
>;

export const GladiaV2AsyncDiarizationConfig = z
  .object({
    number_of_speakers: z.number().int(),
    min_speakers: z.number().int(),
    max_speakers: z.number().int(),
  })
  .partial()
  .passthrough();
export type GladiaV2AsyncDiarizationConfig = z.infer<
  typeof GladiaV2AsyncDiarizationConfig
>;

export const GladiaV2AsyncTranslationConfig = z
  .object({
    target_languages: z.array(z.string()),
    model: z.string().nullish(),
  })
  .passthrough();
export type GladiaV2AsyncTranslationConfig = z.infer<
  typeof GladiaV2AsyncTranslationConfig
>;

export const GladiaV2AsyncSummarizationConfig = z
  .object({ type: z.string() })
  .partial()
  .passthrough();
export type GladiaV2AsyncSummarizationConfig = z.infer<
  typeof GladiaV2AsyncSummarizationConfig
>;

export const GladiaV2AsyncAudioToLlmConfig = z
  .object({ prompts: z.array(z.string()) })
  .passthrough();
export type GladiaV2AsyncAudioToLlmConfig = z.infer<
  typeof GladiaV2AsyncAudioToLlmConfig
>;

export const GladiaV2AsyncTranscription = z
  .object({
    context_prompt: z.string(),
    custom_vocabulary: z.array(z.string()),
    detect_language: z.boolean().default(true),
    enable_code_switching: z.boolean(),
    code_switching_config: GladiaV2AsyncCodeSwitchingConfig,
    language: z.string(),
    subtitles: z.boolean(),
    subtitles_config: GladiaV2AsyncSubtitlesConfig,
    diarization: z.boolean(),
    diarization_config: GladiaV2AsyncDiarizationConfig,
    translation: z.boolean(),
    translation_config: GladiaV2AsyncTranslationConfig,
    summarization: z.boolean(),
    summarization_config: GladiaV2AsyncSummarizationConfig,
    moderation: z.boolean(),
    named_entity_recognition: z.boolean(),
    chapterization: z.boolean(),
    name_consistency: z.boolean(),
    custom_spelling: z.boolean(),
    custom_spelling_config: z.unknown(),
    structured_data_extraction: z.boolean(),
    structured_data_extraction_config: z.unknown(),
    sentiment_analysis: z.boolean(),
    audio_to_llm: z.boolean(),
    audio_to_llm_config: GladiaV2AsyncAudioToLlmConfig,
    custom_metadata: z.unknown(),
    sentences: z.boolean(),
    display_mode: z.boolean(),
    punctuation_enhanced: z.boolean(),
  })
  .partial()
  .passthrough();
export type GladiaV2AsyncTranscription = z.infer<
  typeof GladiaV2AsyncTranscription
>;

export const BotAnalysis = z
  .object({
    job_id: z.string().uuid(),
    assemblyai_async_transcription: AssemblyaiAsyncTranscription.nullish(),
    speechmatics_async_transcription: SpeechmaticsAsyncTranscription.nullish(),
    rev_async_transcription: RevAsyncTranscription.nullish(),
    deepgram_async_transcription: DeepgramAsyncTranscription.nullish(),
    gladia_v2_async_transcription: GladiaV2AsyncTranscription.nullish(),
  })
  .passthrough();
export type BotAnalysis = z.infer<typeof BotAnalysis>;

const apiEndpoints = makeApi([
  {
    method: "get",
    path: "/api/_barty/credentials/",
    alias: "api__barty_credentials_list",
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
    ],
    response: z.array(BartyCredential),
  },
  {
    method: "post",
    path: "/api/_barty/credentials/",
    alias: "api__barty_credentials_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyCredential,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "get",
    path: "/api/_barty/credentials/:id/",
    alias: "api__barty_credentials_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "put",
    path: "/api/_barty/credentials/:id/",
    alias: "api__barty_credentials_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyCredential,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "patch",
    path: "/api/_barty/credentials/:id/",
    alias: "api__barty_credentials_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedBartyCredential,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "delete",
    path: "/api/_barty/credentials/:id/",
    alias: "api__barty_credentials_destroy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/_barty/credentials/:id/access-token/",
    alias: "api__barty_credentials_access_token_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyCredential,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "post",
    path: "/api/_barty/credentials/:id/free/",
    alias: "api__barty_credentials_free_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyCredential,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "post",
    path: "/api/_barty/credentials/:id/lock/",
    alias: "api__barty_credentials_lock_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyCredential,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "post",
    path: "/api/_barty/credentials/:id/meeting/",
    alias: "api__barty_credentials_meeting_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyCredential,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "post",
    path: "/api/_barty/credentials/:id/refresh/",
    alias: "api__barty_credentials_refresh_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyCredential,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyCredential,
  },
  {
    method: "get",
    path: "/api/_barty/oauth-apps/",
    alias: "api__barty_oauth_apps_list",
    requestFormat: "json",
    parameters: [
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
    ],
    response: z.array(BartyOauthApp),
  },
  {
    method: "post",
    path: "/api/_barty/oauth-apps/",
    alias: "api__barty_oauth_apps_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyOauthApp,
      },
    ],
    response: BartyOauthApp,
  },
  {
    method: "get",
    path: "/api/_barty/oauth-apps/:id/",
    alias: "api__barty_oauth_apps_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyOauthApp,
  },
  {
    method: "delete",
    path: "/api/_barty/oauth-apps/:id/",
    alias: "api__barty_oauth_apps_destroy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/_barty/oauth-apps/:id/acquire/",
    alias: "api__barty_oauth_apps_acquire_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BartyOauthApp,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: BartyOauthApp,
  },
]);
const analysisEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/analysis/job/",
    alias: "analysis_job_list",
    description: `Get a list of all jobs.`,
    requestFormat: "json",
    parameters: [
      {
        name: "bot_id",
        type: "Query",
        schema: bot_id,
      },
      {
        name: "created_at_after",
        type: "Query",
        schema: created_at_after,
      },
      {
        name: "created_at_before",
        type: "Query",
        schema: created_at_before,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "status",
        type: "Query",
        schema: status,
      },
    ],
    response: PaginatedJobList,
  },
  {
    method: "get",
    path: "/api/v1/analysis/job/:id/",
    alias: "analysis_job_retrieve",
    description: `Get a job.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Job,
  },
]);
const billingEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/billing/usage/",
    alias: "billing_usage_retrieve",
    description: `Get bot usage statistics`,
    requestFormat: "json",
    parameters: [
      {
        name: "end",
        type: "Query",
        schema: end,
      },
      {
        name: "start",
        type: "Query",
        schema: start,
      },
    ],
    response: UsageResponse,
  },
]);
const botEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/bot/",
    alias: "bot_list",
    description: `Get a list of all bots`,
    requestFormat: "json",
    parameters: [
      {
        name: "join_at_after",
        type: "Query",
        schema: join_at_after,
      },
      {
        name: "join_at_before",
        type: "Query",
        schema: join_at_before,
      },
      {
        name: "meeting_url",
        type: "Query",
        schema: meeting_url,
      },
      {
        name: "page",
        type: "Query",
        schema: page,
      },
      {
        name: "status",
        type: "Query",
        schema: status__2,
      },
    ],
    response: PaginatedBotList,
  },
  {
    method: "post",
    path: "/api/v1/bot/",
    alias: "bot_create",
    description: `Create a new bot.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Bot,
      },
    ],
    response: Bot,
    errors: [
      {
        status: 507,
        schema: z.unknown(),
      },
    ],
  },
  {
    method: "get",
    path: "/api/v1/bot/:bot_id/chat-messages/",
    alias: "bot_chat_messages_list",
    description: `Get list of chat messages read by the bot in the meeting(excluding messages sent by the bot itself).`,
    requestFormat: "json",
    parameters: [
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
      {
        name: "bot_id",
        type: "Path",
        schema: bot_id__2,
      },
    ],
    response: PaginatedMeetingChatMessageList,
  },
  {
    method: "get",
    path: "/api/v1/bot/:id/",
    alias: "bot_retrieve",
    description: `Get a bot instance.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "patch",
    path: "/api/v1/bot/:id/",
    alias: "bot_partial_update",
    description: `Update a Scheduled Bot.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedBot,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "delete",
    path: "/api/v1/bot/:id/",
    alias: "bot_destroy",
    description: `Deletes a bot. This can only be done on scheduled bots that have not yet joined a call.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/delete_media/",
    alias: "bot_delete_media_create",
    description: `Deletes bot media stored by Recall. This is irreversable.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "get",
    path: "/api/v1/bot/:id/intelligence/",
    alias: "bot_intelligence_retrieve",
    description: `Get the results of additional analysis specified by the intelligence parameter. If the call is not yet complete, this returns results from any real-time analysis performed so-far.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.unknown(),
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/leave_call/",
    alias: "bot_leave_call_create",
    description: `Removes the bot from the meeting. This is irreversable.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "get",
    path: "/api/v1/bot/:id/logs/",
    alias: "bot_logs_retrieve",
    description: `Get the logs produced by the bot.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Log,
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/output_audio/",
    alias: "bot_output_audio_create",
    description: `Causes the bot to output audio. 
Note: The bot must be configured with &#x27;automatic_audio_output&#x27; enabled in order to use this endpoint.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: AudioOutputData,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "delete",
    path: "/api/v1/bot/:id/output_audio/",
    alias: "bot_output_audio_destroy",
    description: `Causes the bot to stop outputting audio.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/output_media/",
    alias: "bot_output_media_create",
    description: `Causes the bot to start outputting media.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: OutputMedia,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "delete",
    path: "/api/v1/bot/:id/output_media/",
    alias: "bot_output_media_destroy",
    description: `Causes the bot to stop outputting media.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: bot_output_media_destroy_Body,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/output_screenshare/",
    alias: "bot_output_screenshare_create",
    description: `Causes the bot to start screensharing.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: VideoOutput,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "delete",
    path: "/api/v1/bot/:id/output_screenshare/",
    alias: "bot_output_screenshare_destroy",
    description: `Causes the bot to stop screensharing.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/output_video/",
    alias: "bot_output_video_create",
    description: `Causes the bot to start outputting video.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: VideoOutput,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "delete",
    path: "/api/v1/bot/:id/output_video/",
    alias: "bot_output_video_destroy",
    description: `Causes the bot to stop outputting video.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/pause_recording/",
    alias: "bot_pause_recording_create",
    description: `Instructs the bot to pause the current recording.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/request_recording_permission/",
    alias: "bot_request_recording_permission_create",
    description: `Zoom Only: Request recording permission from the host.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/resume_recording/",
    alias: "bot_resume_recording_create",
    description: `Instructs the bot to resume a paused recording.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/send_chat_message/",
    alias: "bot_send_chat_message_create",
    description: `Causes the bot to send a message in the meeting chat. `,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SendChatMessageInput,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "get",
    path: "/api/v1/bot/:id/speaker_timeline/",
    alias: "bot_speaker_timeline_list",
    description: `Get the speaker timeline produced by the bot. If the call is not yet complete, this returns the speaker timeline so-far.`,
    requestFormat: "json",
    parameters: [
      {
        name: "exclude_null_speaker",
        type: "Query",
        schema: exclude_null_speaker,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.array(SpeakerTimelineEvent),
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/start_recording/",
    alias: "bot_start_recording_create",
    description: `Instructs the bot to start recording the meeting. This will restart the current recording if one is already in progress.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: RecordingConfig,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "post",
    path: "/api/v1/bot/:id/stop_recording/",
    alias: "bot_stop_recording_create",
    description: `Instructs the bot to end the current recording.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Bot,
  },
  {
    method: "get",
    path: "/api/v1/bot/:id/transcript/",
    alias: "bot_transcript_list",
    description: `Get the transcript produced by the bot.
 If the call is not yet complete, this returns the transcript so-far.`,
    requestFormat: "json",
    parameters: [
      {
        name: "enhanced_diarization",
        type: "Query",
        schema: enhanced_diarization,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.array(TranscriptLegacyParagraph),
  },
  {
    method: "post",
    path: "/api/v2beta/bot/:id/analyze",
    alias: "bot_analyze_create",
    description: `Run analysis on bot media.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: BotAnalysis,
      },
      {
        name: "id",
        type: "Path",
        schema: id__2,
      },
    ],
    response: BotAnalysis,
  },
]);
const botScreenshotsEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/bot/:bot_id/screenshots/",
    alias: "bot_screenshots_list",
    description: `Get a list of all screenshots of the bot`,
    requestFormat: "json",
    parameters: [
      {
        name: "page",
        type: "Query",
        schema: page,
      },
      {
        name: "bot_id",
        type: "Path",
        schema: bot_id__2,
      },
      {
        name: "recorded_at_after",
        type: "Query",
        schema: recorded_at_after,
      },
      {
        name: "recorded_at_before",
        type: "Query",
        schema: recorded_at_before,
      },
    ],
    response: PaginatedBotScreenshotList,
  },
  {
    method: "get",
    path: "/api/v1/bot/:bot_id/screenshots/:id/",
    alias: "bot_screenshots_retrieve",
    description: `Get a bot screenshot instance.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
      {
        name: "bot_id",
        type: "Path",
        schema: bot_id__2,
      },
    ],
    response: BotScreenshot,
  },
]);
const calendarV1Endpoints = makeApi([
  {
    method: "post",
    path: "/api/v1/calendar/authenticate/",
    alias: "calendar_authenticate_create",
    description: `Generate an authentication token for calendar APIs, scoped to the user. Each token has an expiry of 1 day from time of creation.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CalendarAuthenticateRequest,
      },
    ],
    response: CalendarAuthenticateResponse,
  },
  {
    method: "get",
    path: "/api/v1/calendar/meetings/",
    alias: "calendar_meetings_list",
    requestFormat: "json",
    parameters: [
      {
        name: "ical_uid",
        type: "Query",
        schema: ical_uid,
      },
      {
        name: "start_time_after",
        type: "Query",
        schema: start_time_after,
      },
      {
        name: "start_time_before",
        type: "Query",
        schema: start_time_before,
      },
    ],
    response: z.array(CalendarMeeting),
  },
  {
    method: "get",
    path: "/api/v1/calendar/meetings/:id/",
    alias: "calendar_meetings_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: CalendarMeeting,
  },
  {
    method: "put",
    path: "/api/v1/calendar/meetings/:id/",
    alias: "calendar_meetings_update",
    description: `Use this endpoint to update override_should_record property of the meeting. This endpoint is rate limited to 10 requests per user per meeting per minute.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CalendarMeeting,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: CalendarMeeting,
  },
  {
    method: "post",
    path: "/api/v1/calendar/meetings/refresh/",
    alias: "calendar_meetings_refresh_create",
    description: `Resync the calendar meetings for the user. This endpoint is rate limited to 1 request per user per 10 minutes.`,
    requestFormat: "json",
    response: z.array(CalendarMeeting),
  },
  {
    method: "get",
    path: "/api/v1/calendar/user/",
    alias: "calendar_user_retrieve",
    requestFormat: "json",
    response: CalendarUser,
  },
  {
    method: "put",
    path: "/api/v1/calendar/user/",
    alias: "calendar_user_update",
    description: `Update the recording preferences for a calendar user. This endpoint is rate limited to 10 requests per user per minute.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CalendarUser,
      },
    ],
    response: CalendarUser,
  },
  {
    method: "delete",
    path: "/api/v1/calendar/user/",
    alias: "calendar_user_destroy",
    description: `Delete calendar user(+disconnect any connected calendars). This endpoint is rate limited to 10 requests per user per minute.`,
    requestFormat: "json",
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v1/calendar/user/disconnect/",
    alias: "calendar_user_disconnect_create",
    description: `Disconnect calendar of specific platform. This endpoint is rate limited to 2 requests per user per minute.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CalendarUserDisconnectPlatform,
      },
    ],
    response: CalendarUser,
  },
  {
    method: "get",
    path: "/api/v1/calendar/users/",
    alias: "calendar_users_list",
    description: `List all calendar users created for the account.`,
    requestFormat: "json",
    response: z.array(CalendarUser),
  },
]);
const downloadEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v1/download/participants/",
    alias: "download_participants_retrieve",
    requestFormat: "json",
    response: Participant,
  },
  {
    method: "get",
    path: "/api/v1/download/speaker_timeline/",
    alias: "download_speaker_timeline_retrieve",
    requestFormat: "json",
    response: RecordingSpeakerEntry,
  },
]);
const calendarAccountsEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/calendar-accounts/:uuid/",
    alias: "calendar_accounts_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "uuid",
        type: "Path",
        schema: uuid,
      },
    ],
    response: CalendarAccount,
  },
  {
    method: "get",
    path: "/api/v2/calendar-accounts/:uuid/access_token/",
    alias: "calendar_accounts_access_token_retrieve",
    description: `Get the OAuth access token for this calendar account.`,
    requestFormat: "json",
    parameters: [
      {
        name: "uuid",
        type: "Path",
        schema: uuid,
      },
    ],
    response: AccessToken,
    errors: [
      {
        status: 400,
        schema: CalendarAccountAccessTokenError,
      },
    ],
  },
]);
const calendarV2Endpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/calendar-events/",
    alias: "calendar_events_list",
    description: `Get a list of calendar events`,
    requestFormat: "json",
    parameters: [
      {
        name: "calendar_id",
        type: "Query",
        schema: calendar_id,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "ical_uid",
        type: "Query",
        schema: ical_uid,
      },
      {
        name: "is_deleted",
        type: "Query",
        schema: is_deleted,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
      {
        name: "start_time",
        type: "Query",
        schema: start_time,
      },
      {
        name: "start_time__gte",
        type: "Query",
        schema: start_time__gte,
      },
      {
        name: "start_time__lte",
        type: "Query",
        schema: start_time__lte,
      },
      {
        name: "updated_at__gte",
        type: "Query",
        schema: updated_at__gte,
      },
    ],
    response: PaginatedCalendarEventList,
  },
  {
    method: "get",
    path: "/api/v2/calendar-events/:id/",
    alias: "calendar_events_retrieve",
    description: `Get a calendar event instance.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: CalendarEvent,
  },
  {
    method: "post",
    path: "/api/v2/calendar-events/:id/bot/",
    alias: "calendar_events_bot_create",
    description: `Schedule a bot for a calendar event. This endpoint will return the updated calendar event in response.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: CalendarEventAddBot,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: CalendarEvent,
  },
  {
    method: "delete",
    path: "/api/v2/calendar-events/:id/bot/",
    alias: "calendar_events_bot_destroy",
    description: `Delete bot(s) scheduled for the calendar event. This endpoint will return the updated calendar event in response.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: CalendarEvent,
  },
  {
    method: "get",
    path: "/api/v2/calendars/",
    alias: "calendars_list",
    description: `Get a list of calendars`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at__gte",
        type: "Query",
        schema: created_at__gte,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
      {
        name: "platform",
        type: "Query",
        schema: platform,
      },
      {
        name: "status",
        type: "Query",
        schema: status__3,
      },
    ],
    response: PaginatedCalendarList,
  },
  {
    method: "post",
    path: "/api/v2/calendars/",
    alias: "calendars_create",
    description: `Create a new calendar.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Calendar,
      },
    ],
    response: Calendar,
  },
  {
    method: "get",
    path: "/api/v2/calendars/:id/",
    alias: "calendars_retrieve",
    description: `Get a calendar instance.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Calendar,
  },
  {
    method: "patch",
    path: "/api/v2/calendars/:id/",
    alias: "calendars_partial_update",
    description: `Update an existing calendar.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedCalendar,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: Calendar,
  },
  {
    method: "delete",
    path: "/api/v2/calendars/:id/",
    alias: "calendars_destroy",
    description: `Deletes a calendar. This will disconnect the calendar.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
]);
const googleLoginGroupEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/google-login-groups/",
    alias: "google_login_groups_list",
    description: `Get list of all Google Login Groups.`,
    requestFormat: "json",
    parameters: [
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "name",
        type: "Query",
        schema: name,
      },
      {
        name: "name__contains",
        type: "Query",
        schema: name__contains,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
    ],
    response: PaginatedGoogleLoginGroupList,
  },
  {
    method: "post",
    path: "/api/v2/google-login-groups/",
    alias: "google_login_groups_create",
    description: `Create a new Google Login Group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GoogleLoginGroup,
      },
    ],
    response: GoogleLoginGroup,
  },
  {
    method: "get",
    path: "/api/v2/google-login-groups/:id/",
    alias: "google_login_groups_retrieve",
    description: `Get an existing Google Login Group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: GoogleLoginGroup,
  },
  {
    method: "put",
    path: "/api/v2/google-login-groups/:id/",
    alias: "google_login_groups_update",
    description: `Update an existing Google Login Group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GoogleLoginGroup,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: GoogleLoginGroup,
  },
  {
    method: "patch",
    path: "/api/v2/google-login-groups/:id/",
    alias: "google_login_groups_partial_update",
    description: `Partial Update an existing Google Login Group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedGoogleLoginGroup,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: GoogleLoginGroup,
  },
  {
    method: "delete",
    path: "/api/v2/google-login-groups/:id/",
    alias: "google_login_groups_destroy",
    description: `Deletes an existing Google Login Group.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
]);
const googleLoginEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/google-logins/",
    alias: "google_logins_list",
    description: `Get list of all Google Logins.`,
    requestFormat: "json",
    parameters: [
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "email",
        type: "Query",
        schema: email,
      },
      {
        name: "group_id",
        type: "Query",
        schema: group_id,
      },
      {
        name: "is_active",
        type: "Query",
        schema: is_active,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
      {
        name: "sso_v2_workspace_domain",
        type: "Query",
        schema: sso_v2_workspace_domain,
      },
    ],
    response: PaginatedGoogleLoginList,
  },
  {
    method: "post",
    path: "/api/v2/google-logins/",
    alias: "google_logins_create",
    description: `Create a new Google Login.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GoogleLogin,
      },
    ],
    response: GoogleLogin,
  },
  {
    method: "get",
    path: "/api/v2/google-logins/:id/",
    alias: "google_logins_retrieve",
    description: `Get an existing Google Login.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: GoogleLogin,
  },
  {
    method: "put",
    path: "/api/v2/google-logins/:id/",
    alias: "google_logins_update",
    description: `Update an existing Google Login.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: GoogleLogin,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: GoogleLogin,
  },
  {
    method: "patch",
    path: "/api/v2/google-logins/:id/",
    alias: "google_logins_partial_update",
    description: `Partial Update an existing Google Login.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedGoogleLogin,
      },
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: GoogleLogin,
  },
  {
    method: "delete",
    path: "/api/v2/google-logins/:id/",
    alias: "google_logins_destroy",
    description: `Deletes an existing Google Login.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
]);
const recordingsEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/recordings/:id/",
    alias: "recordings_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id__2,
      },
    ],
    response: LegacyRecording,
  },
]);
const slackTeamsEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/slack-teams/",
    alias: "slack_teams_list",
    requestFormat: "json",
    response: z.array(SlackTeamIntegration),
  },
  {
    method: "post",
    path: "/api/v2/slack-teams/",
    alias: "slack_teams_create",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SlackTeamIntegration,
      },
    ],
    response: SlackTeamIntegration,
  },
  {
    method: "get",
    path: "/api/v2/slack-teams/:id/",
    alias: "slack_teams_retrieve",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id__2,
      },
    ],
    response: SlackTeamIntegration,
  },
  {
    method: "put",
    path: "/api/v2/slack-teams/:id/",
    alias: "slack_teams_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: SlackTeamIntegration,
      },
      {
        name: "id",
        type: "Path",
        schema: id__2,
      },
    ],
    response: SlackTeamIntegration,
  },
  {
    method: "patch",
    path: "/api/v2/slack-teams/:id/",
    alias: "slack_teams_partial_update",
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: PatchedSlackTeamIntegration,
      },
      {
        name: "id",
        type: "Path",
        schema: id__2,
      },
    ],
    response: SlackTeamIntegration,
  },
  {
    method: "delete",
    path: "/api/v2/slack-teams/:id/",
    alias: "slack_teams_destroy",
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id__2,
      },
    ],
    response: z.void(),
  },
]);
const zoomMeetingsToCredentialsEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/zoom-meetings-to-credentials/",
    alias: "zoom_meetings_to_credentials_list",
    description: `Get a list of all mappings from Zoom Meeting ID to Zoom OAuth Credential. Recall uses mappings internally to determine which credential to use when automatically fetching join tokens for a meeting. Inspecting these mappings may be helpful when debugging bots that don&#x27;t automatically record due to being unable to fetch join tokens.`,
    requestFormat: "json",
    parameters: [
      {
        name: "credential",
        type: "Query",
        schema: credential,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "meeting_id",
        type: "Query",
        schema: meeting_id,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
      {
        name: "synced_at_after",
        type: "Query",
        schema: synced_at_after,
      },
      {
        name: "synced_at_before",
        type: "Query",
        schema: synced_at_before,
      },
    ],
    response: PaginatedZoomMeetingToCredentialList,
  },
]);
const zoomOauthAppsEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/zoom-oauth-app-logs/",
    alias: "zoom_oauth_app_logs_list",
    description: `Get a list of all Zoom OAuth App Logs. Any warnings or errors related to the OAuth App will be logged here, and this can be helpful for debugging.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at_after",
        type: "Query",
        schema: created_at_after,
      },
      {
        name: "created_at_before",
        type: "Query",
        schema: created_at_before,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "oauth_app",
        type: "Query",
        schema: oauth_app,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
    ],
    response: PaginatedZoomOAuthAppLogList,
  },
  {
    method: "get",
    path: "/api/v2/zoom-oauth-apps/",
    alias: "zoom_oauth_apps_list",
    description: `Get a list of all Zoom OAuth Apps.`,
    requestFormat: "json",
    parameters: [
      {
        name: "client_id",
        type: "Query",
        schema: client_id,
      },
      {
        name: "created_at_after",
        type: "Query",
        schema: created_at_after,
      },
      {
        name: "created_at_before",
        type: "Query",
        schema: created_at_before,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "kind",
        type: "Query",
        schema: kind,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
      {
        name: "webhook_last_validation_after",
        type: "Query",
        schema: webhook_last_validation_after,
      },
      {
        name: "webhook_last_validation_before",
        type: "Query",
        schema: webhook_last_validation_before,
      },
    ],
    response: PaginatedZoomOAuthAppList,
  },
  {
    method: "post",
    path: "/api/v2/zoom-oauth-apps/",
    alias: "zoom_oauth_apps_create",
    description: `Create a new Zoom OAuth App.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoomOAuthApp,
      },
    ],
    response: ZoomOAuthApp,
  },
  {
    method: "get",
    path: "/api/v2/zoom-oauth-apps/:id/",
    alias: "zoom_oauth_apps_retrieve",
    description: `Get a Zoom OAuth App.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: ZoomOAuthApp,
  },
  {
    method: "delete",
    path: "/api/v2/zoom-oauth-apps/:id/",
    alias: "zoom_oauth_apps_destroy",
    description: `Deletes a Zoom OAuth App.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
]);
const zoomOauthCredentialsEndpoints = makeApi([
  {
    method: "get",
    path: "/api/v2/zoom-oauth-credential-logs/",
    alias: "zoom_oauth_credential_logs_list",
    description: `Get a list of all Zoom OAuth Credential Logs. Any warnings or errors related to the OAuth Credential will be logged here, and this can be helpful for debugging.`,
    requestFormat: "json",
    parameters: [
      {
        name: "created_at_after",
        type: "Query",
        schema: created_at_after,
      },
      {
        name: "created_at_before",
        type: "Query",
        schema: created_at_before,
      },
      {
        name: "credential",
        type: "Query",
        schema: credential,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
    ],
    response: PaginatedZoomOAuthCredentialLogList,
  },
  {
    method: "get",
    path: "/api/v2/zoom-oauth-credentials/",
    alias: "zoom_oauth_credentials_list",
    description: `Get a list of all Zoom OAuth Credentials`,
    requestFormat: "json",
    parameters: [
      {
        name: "account_id",
        type: "Query",
        schema: account_id,
      },
      {
        name: "created_at_after",
        type: "Query",
        schema: created_at_after,
      },
      {
        name: "created_at_before",
        type: "Query",
        schema: created_at_before,
      },
      {
        name: "cursor",
        type: "Query",
        schema: cursor,
      },
      {
        name: "meeting_sync_status",
        type: "Query",
        schema: meeting_sync_status,
      },
      {
        name: "oauth_app",
        type: "Query",
        schema: oauth_app,
      },
      {
        name: "ordering",
        type: "Query",
        schema: ordering,
      },
      {
        name: "status",
        type: "Query",
        schema: status__4,
      },
      {
        name: "user_id",
        type: "Query",
        schema: user_id,
      },
    ],
    response: PaginatedZoomOAuthCredentialList,
  },
  {
    method: "post",
    path: "/api/v2/zoom-oauth-credentials/",
    alias: "zoom_oauth_credentials_create",
    description: `Create a new Zoom OAuth Credential.`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: ZoomOAuthCredential,
      },
    ],
    response: ZoomOAuthCredential,
    errors: [
      {
        status: 400,
        schema: ZoomOAuthCredentialBadRequest,
      },
    ],
  },
  {
    method: "get",
    path: "/api/v2/zoom-oauth-credentials/:id/",
    alias: "zoom_oauth_credentials_retrieve",
    description: `Get a Zoom OAuth Credential.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: ZoomOAuthCredential,
  },
  {
    method: "delete",
    path: "/api/v2/zoom-oauth-credentials/:id/",
    alias: "zoom_oauth_credentials_destroy",
    description: `Deletes a Zoom OAuth Credential.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "get",
    path: "/api/v2/zoom-oauth-credentials/:id/access-token/",
    alias: "zoom_oauth_credentials_access_token_retrieve",
    description: `Get the access token for these credentials.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: ZoomAccessToken,
  },
  {
    method: "post",
    path: "/api/v2/zoom-oauth-credentials/:id/sync-meetings/",
    alias: "zoom_oauth_credentials_sync_meetings_create",
    description: `Manually re-sync meetings accessible from these credentials. This operation is asynchronous, and may take some time to complete.Use the &#x60;meeting_sync_status&#x60; field on the credential object to check status of sync.This is ONLY useful for debugging, and should not be called on a regular basis. Meetings are ordinarily automatically synced.`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/api/v2/zoom-oauth-credentials/:id/validate/",
    alias: "zoom_oauth_credentials_validate_create",
    description: `Manually check the validity of credentials, and re-enable them if they are functional. This can be useful if credentials are disabled due to repeated errors. `,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: id,
      },
    ],
    response: z.void(),
  },
]);

const BASE_URL = env.RECALL_BASE_URL;

export function createClient(options?: ZodiosOptions) {
  const mergedOptions = {
    ...options,
    axiosConfig: {
      baseURL: BASE_URL,
      ...options?.axiosConfig,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Token ${env.RECALL_API_KEY}`,
        ...options?.axiosConfig?.headers,
      },
    },
  } satisfies ZodiosOptions;

  return {
    api: new Zodios(BASE_URL, apiEndpoints, mergedOptions),
    analysis: new Zodios(BASE_URL, analysisEndpoints, mergedOptions),
    billing: new Zodios(BASE_URL, billingEndpoints, mergedOptions),
    bot: new Zodios(BASE_URL, botEndpoints, mergedOptions),
    botScreenshots: new Zodios(
      BASE_URL,
      botScreenshotsEndpoints,
      mergedOptions,
    ),
    calendarV1: new Zodios(BASE_URL, calendarV1Endpoints, mergedOptions),
    download: new Zodios(BASE_URL, downloadEndpoints, mergedOptions),
    calendarAccounts: new Zodios(
      BASE_URL,
      calendarAccountsEndpoints,
      mergedOptions,
    ),
    calendarV2: new Zodios(BASE_URL, calendarV2Endpoints, mergedOptions),
    googleLoginGroup: new Zodios(
      BASE_URL,
      googleLoginGroupEndpoints,
      mergedOptions,
    ),
    googleLogin: new Zodios(BASE_URL, googleLoginEndpoints, mergedOptions),
    recordings: new Zodios(BASE_URL, recordingsEndpoints, mergedOptions),
    slackTeams: new Zodios(BASE_URL, slackTeamsEndpoints, mergedOptions),
    zoomMeetingsToCredentials: new Zodios(
      BASE_URL,
      zoomMeetingsToCredentialsEndpoints,
      mergedOptions,
    ),
    zoomOauthApps: new Zodios(BASE_URL, zoomOauthAppsEndpoints, mergedOptions),
    zoomOauthCredentials: new Zodios(
      BASE_URL,
      zoomOauthCredentialsEndpoints,
      mergedOptions,
    ),
  } as const;
}
