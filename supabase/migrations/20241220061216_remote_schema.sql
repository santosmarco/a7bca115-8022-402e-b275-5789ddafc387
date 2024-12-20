

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."icon_enum" AS ENUM (
    'Brain',
    'GitCommitHorizontal',
    'Heart',
    'MessageSquare',
    'Goal',
    'Users',
    'UserCheck',
    'MessageCircle',
    'Scissors',
    'Activity',
    'SendToBack'
);


ALTER TYPE "public"."icon_enum" OWNER TO "postgres";


CREATE TYPE "public"."meeting_bot_error_code_type" AS ENUM (
    'CannotJoinMeeting',
    'TimeoutWaitingToStart',
    'BotNotAccepted',
    'InternalError',
    'InvalidMeetingUrl'
);


ALTER TYPE "public"."meeting_bot_error_code_type" OWNER TO "postgres";


CREATE TYPE "public"."meeting_bot_status_type" AS ENUM (
    'joining_call',
    'in_waiting_room',
    'in_call_not_recording',
    'in_call_recording',
    'call_ended'
);


ALTER TYPE "public"."meeting_bot_status_type" OWNER TO "postgres";


CREATE TYPE "public"."moment_comment_with_user" AS (
	"id" "uuid",
	"moment_id" "uuid",
	"user_id" "uuid",
	"content" "text",
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"user_nickname" "text",
	"user_avatar_url" "text",
	"user_is_admin" boolean
);


ALTER TYPE "public"."moment_comment_with_user" OWNER TO "postgres";


CREATE TYPE "public"."moment_reaction_type" AS ENUM (
    'thumbs_up',
    'thumbs_down'
);


ALTER TYPE "public"."moment_reaction_type" OWNER TO "postgres";


CREATE TYPE "public"."moment_reaction_with_user" AS (
	"id" "uuid",
	"moment_id" "uuid",
	"reaction_type" "text",
	"created_at" timestamp with time zone,
	"user_id" "uuid",
	"user_nickname" "text",
	"user_avatar_url" "text",
	"user_is_admin" boolean
);


ALTER TYPE "public"."moment_reaction_with_user" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'user',
    'coach',
    'admin'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_user_permissions"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN (auth.uid() = user_id) OR (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) OR ((SELECT coach_id INTO coach_id FROM public.profiles WHERE id = user_id) = auth.uid());
END;$$;


ALTER FUNCTION "public"."check_user_permissions"("user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."moments" (
    "id" "text" NOT NULL,
    "segment_id_sequence_start" bigint,
    "segment_id_sequence_end" bigint,
    "summary" "text",
    "title" "text",
    "segment_start_timestamp" "text",
    "segment_end_timestamp" "text",
    "segment_start_timestamp_in_seconds" bigint,
    "segment_end_timestamp_in_seconds" bigint,
    "video_api_id" "text",
    "activity_type" "text",
    "activity_reasoning" "text",
    "target_person_type" "text",
    "target_person_reasoning" "text",
    "activity" "text",
    "moment_url" "text",
    "latest" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "search_vector" "tsvector" GENERATED ALWAYS AS ((((((("setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("title", ''::"text")), 'A'::"char") || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("summary", ''::"text")), 'B'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("activity", ''::"text")), 'C'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("activity_type", ''::"text")), 'D'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("target_person_type", ''::"text")), 'D'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("activity_reasoning", ''::"text")), 'D'::"char")) || "setweight"("to_tsvector"('"english"'::"regconfig", COALESCE("target_person_reasoning", ''::"text")), 'D'::"char"))) STORED,
    "version" integer DEFAULT 1 NOT NULL,
    "updated_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "relevant" boolean DEFAULT true NOT NULL,
    "intensity" smallint,
    "profile_id" "uuid"
);


ALTER TABLE "public"."moments" OWNER TO "postgres";


COMMENT ON TABLE "public"."moments" IS 'Has moments that are generated via OpenAI prompting references meetings';



COMMENT ON COLUMN "public"."moments"."id" IS 'Randomly generated UUID';



COMMENT ON COLUMN "public"."moments"."segment_id_sequence_start" IS 'References the Index of the segment (not id) of the video that this moment relates to';



COMMENT ON COLUMN "public"."moments"."segment_id_sequence_end" IS 'References the Index of the segment (not id) of the video that this moment relates to';



COMMENT ON COLUMN "public"."moments"."video_api_id" IS 'FK for meetings';



COMMENT ON COLUMN "public"."moments"."latest" IS 'Indicates the latest batch of moments, when prompt is changed, old moments go to FALSE';



COMMENT ON COLUMN "public"."moments"."intensity" IS 'For activity = Emotion, otherwise it is null';



CREATE OR REPLACE FUNCTION "public"."get_moments_with_metadata"("p_limit" integer, "p_cursor" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("moment_data" "public"."moments", "reactions" "public"."moment_reaction_with_user"[], "comments" "public"."moment_comment_with_user"[])
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.*,
    ARRAY_AGG(
      (r.id, r.moment_id, r.user_id, r.reaction_type, r.created_at,
       rp.id, rp.nickname, rp.avatar_url, rp.is_admin)::moment_reaction_with_user
    ) FILTER (WHERE r.id IS NOT NULL) as reactions,
    ARRAY_AGG(
      (c.id, c.moment_id, c.user_id, c.content, c.created_at, c.updated_at,
       cp.id, cp.nickname, cp.avatar_url, cp.is_admin)::moment_comment_with_user
    ) FILTER (WHERE c.id IS NOT NULL) as comments
  FROM moments m
  LEFT JOIN moment_reactions r ON m.id = r.moment_id
  LEFT JOIN profiles rp ON r.user_id = rp.id
  LEFT JOIN moment_comments c ON m.id = c.moment_id
  LEFT JOIN profiles cp ON c.user_id = cp.id
  WHERE m.latest = true
    AND (p_cursor IS NULL OR m.created_at < p_cursor)
  GROUP BY m.id
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_moments_with_metadata"("p_limit" integer, "p_cursor" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_moment_versioning"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Get the latest version for this moment
    NEW.version = COALESCE(
        (SELECT version + 1
         FROM moments
         WHERE video_api_id = NEW.video_api_id
         AND segment_start_timestamp_in_seconds = NEW.segment_start_timestamp_in_seconds
         ORDER BY version DESC
         LIMIT 1),
        1
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_moment_versioning"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_user"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $_$
  select is_admin from profiles where id = $1 limit 1;
$_$;


ALTER FUNCTION "public"."is_admin_user"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."parse_search_query"("search_input" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    RETURN websearch_to_tsquery('english', search_input);
END;$$;


ALTER FUNCTION "public"."parse_search_query"("search_input" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meetings" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "video_api_id" "text" NOT NULL,
    "original_vtt_file" "text",
    "summary" "text",
    "date" timestamp with time zone,
    "clean_vtt_file" "text",
    "speaker" "text",
    "db_created_at" timestamp with time zone DEFAULT "now"(),
    "duration_in_ms" numeric,
    "thumbnail_url" "text",
    "meeting_baas_original_json" "jsonb",
    "tags" "text",
    "searchable" "tsvector" GENERATED ALWAYS AS ("to_tsvector"('"english"'::"regconfig", ((((((COALESCE("name", ''::"text") || ' '::"text") || COALESCE("summary", ''::"text")) || ' '::"text") || COALESCE("speaker", ''::"text")) || ' '::"text") || COALESCE("tags", ''::"text")))) STORED,
    "vectorized" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."meetings" OWNER TO "postgres";


COMMENT ON TABLE "public"."meetings" IS 'Mirrors all videos that are uploaded to Video API';



COMMENT ON COLUMN "public"."meetings"."name" IS 'Name of the meeting provided by API Video';



COMMENT ON COLUMN "public"."meetings"."video_api_id" IS 'Primary key to identfiy meetings. Used to retrieve VTT, metadata, etc. from API Video';



COMMENT ON COLUMN "public"."meetings"."original_vtt_file" IS 'VTT file that is pulled from Video API (originating from Grain)';



COMMENT ON COLUMN "public"."meetings"."summary" IS 'Summary that is generated via OpenAI, by feeding the entire clean vtt file';



COMMENT ON COLUMN "public"."meetings"."date" IS 'Upload date in Video API, thus currently not correct';



COMMENT ON COLUMN "public"."meetings"."clean_vtt_file" IS 'Clean VTT file, where speakers are combined, used further to detect moments and do any kind of analysis';



COMMENT ON COLUMN "public"."meetings"."speaker" IS '@todo CORRECTLY POPULATE THIS';



CREATE OR REPLACE FUNCTION "public"."search_meetings"("search_input" "text") RETURNS SETOF "public"."meetings"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM meetings
  WHERE searchable
        @@ websearch_to_tsquery('english', search_input);
END;
$$;


ALTER FUNCTION "public"."search_meetings"("search_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_moments"("search_query" "text") RETURNS TABLE("id" "uuid", "rank" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    moments.*,
    ts_rank(search_vector, to_tsquery('english', search_query)) as rank
  FROM moments
  WHERE search_vector @@ to_tsquery('english', search_query)
  AND latest = true
  ORDER BY rank DESC;
END;
$$;


ALTER FUNCTION "public"."search_moments"("search_query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_update_profile_id_on_moments"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    PERFORM update_profile_id_on_moments();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_update_profile_id_on_moments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_integration_credentials_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_integration_credentials_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile_id_on_moments"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.moments m
    SET profile_id = (
        SELECT p.id
        FROM public.meetings mt
        JOIN public.profiles p ON mt.speaker = p.nickname
        WHERE mt.video_api_id = m.video_api_id
        LIMIT 1
    )
    WHERE m.video_api_id IS NOT NULL;
END;
$$;


ALTER FUNCTION "public"."update_profile_id_on_moments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calendar_integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "google_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "resource_id" "text",
    "uuid" "uuid",
    "user_id" "uuid" NOT NULL,
    "watch_expiry" timestamp with time zone
);


ALTER TABLE "public"."calendar_integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "messages" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "topic" "text",
    "latest" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."chats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chunks" (
    "start_segment" "text",
    "end_segment" "text",
    "reasoning" "text",
    "summary" "text",
    "focus_person_analysis" "text",
    "video_api_id" "text",
    "id" "text" NOT NULL
);


ALTER TABLE "public"."chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coaching_frameworks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "definition_prompt" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "icon" "public"."icon_enum",
    "description" "text"
);


ALTER TABLE "public"."coaching_frameworks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_credentials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "access_token" "text",
    "refresh_token" "text",
    "expiry_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "provider" "text",
    "last_refresh_attempt" timestamp with time zone,
    "requires_reauth" boolean DEFAULT false,
    "refresh_error" "text"
);


ALTER TABLE "public"."integration_credentials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meeting_bots" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."meeting_bot_status_type",
    "mp4_source_url" "text",
    "speakers" "text"[],
    "error_code" "public"."meeting_bot_error_code_type",
    "raw_data" "jsonb",
    "api_video_id" "text"
);


ALTER TABLE "public"."meeting_bots" OWNER TO "postgres";


COMMENT ON COLUMN "public"."meeting_bots"."mp4_source_url" IS 'A private AWS S3 URL of the mp4 recording of the meeting. Valid for one hour only.';



COMMENT ON COLUMN "public"."meeting_bots"."speakers" IS 'The list of speakers in this meeting.';



CREATE TABLE IF NOT EXISTS "public"."transcript_slices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bot_id" "text" NOT NULL,
    "speaker_name" "text",
    "index" numeric NOT NULL
);


ALTER TABLE "public"."transcript_slices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transcript_words" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transcript_slice_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bot_id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "start_time" numeric,
    "end_time" numeric,
    "content" "text",
    "index" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."transcript_words" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."meeting_bot_transcripts" AS
 SELECT "mb"."id" AS "bot_id",
    "array_agg"("json_build_object"('speaker', "ts"."speaker_name", 'words', ( SELECT "array_agg"("json_build_object"('start', "tw"."start_time", 'end', "tw"."end_time", 'word', "tw"."content")) AS "array_agg"
           FROM "public"."transcript_words" "tw"
          WHERE ("tw"."transcript_slice_id" = "ts"."id"))) ORDER BY "ts"."index") AS "transcripts"
   FROM ("public"."meeting_bots" "mb"
     LEFT JOIN "public"."transcript_slices" "ts" ON (("ts"."bot_id" = "mb"."id")))
  GROUP BY "mb"."id";


ALTER TABLE "public"."meeting_bot_transcripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meeting_notes_chunks" (
    "clear_text" "text",
    "start_segment" bigint,
    "end_segment" bigint,
    "chunk_id" "text",
    "id" "text" NOT NULL,
    "video_api_id" "text"
);


ALTER TABLE "public"."meeting_notes_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."meeting_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "video_api_id" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "category" "text",
    "confidence" double precision,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL
);


ALTER TABLE "public"."meeting_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "nickname" "text",
    "is_admin" boolean DEFAULT false NOT NULL,
    "email" "text",
    "dossier" "text",
    "coach_id" "uuid",
    "role" "public"."user_role_enum" DEFAULT 'user'::"public"."user_role_enum" NOT NULL,
    "org_chart" "jsonb"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."id" IS 'The user ID linked to this profile';



CREATE OR REPLACE VIEW "public"."meetings_with_profile" AS
 SELECT "m"."created_at",
    "m"."name",
    "m"."video_api_id",
    "m"."original_vtt_file",
    "m"."summary",
    "m"."date",
    "m"."clean_vtt_file",
    "m"."speaker",
    "m"."db_created_at",
    "m"."duration_in_ms",
    "m"."thumbnail_url",
    "m"."meeting_baas_original_json",
    "m"."tags",
    "m"."searchable",
    "m"."vectorized",
    "p"."id" AS "profile_id"
   FROM ("public"."meetings" "m"
     LEFT JOIN "public"."profiles" "p" ON (("m"."speaker" = "p"."nickname")));


ALTER TABLE "public"."meetings_with_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moment_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moment_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."moment_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moment_reactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moment_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reaction_type" "public"."moment_reaction_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."moment_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moment_types" (
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "icon" "public"."icon_enum" NOT NULL
);


ALTER TABLE "public"."moment_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moments_segment" (
    "id" "text" NOT NULL,
    "moments_id" "text" NOT NULL,
    "segment_id" "text" NOT NULL,
    "video_api_id" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL
);


ALTER TABLE "public"."moments_segment" OWNER TO "postgres";


COMMENT ON TABLE "public"."moments_segment" IS 'Connects moments to segments (and meetings)';



COMMENT ON COLUMN "public"."moments_segment"."id" IS 'Random UUID';



COMMENT ON COLUMN "public"."moments_segment"."moments_id" IS 'FK references moments';



COMMENT ON COLUMN "public"."moments_segment"."segment_id" IS 'FK references segment';



COMMENT ON COLUMN "public"."moments_segment"."video_api_id" IS 'FK references meetings';



CREATE OR REPLACE VIEW "public"."moments_with_score" AS
SELECT
    NULL::"text" AS "id",
    NULL::bigint AS "segment_id_sequence_start",
    NULL::bigint AS "segment_id_sequence_end",
    NULL::"text" AS "summary",
    NULL::"text" AS "title",
    NULL::"text" AS "segment_start_timestamp",
    NULL::"text" AS "segment_end_timestamp",
    NULL::bigint AS "segment_start_timestamp_in_seconds",
    NULL::bigint AS "segment_end_timestamp_in_seconds",
    NULL::"text" AS "video_api_id",
    NULL::"text" AS "activity_type",
    NULL::"text" AS "activity_reasoning",
    NULL::"text" AS "target_person_type",
    NULL::"text" AS "target_person_reasoning",
    NULL::"text" AS "activity",
    NULL::"text" AS "moment_url",
    NULL::boolean AS "latest",
    NULL::timestamp with time zone AS "created_at",
    NULL::"tsvector" AS "search_vector",
    NULL::integer AS "version",
    NULL::timestamp without time zone AS "updated_at",
    NULL::boolean AS "relevant",
    NULL::smallint AS "intensity",
    NULL::"uuid" AS "profile_id",
    NULL::bigint AS "score",
    NULL::timestamp with time zone AS "date";


ALTER TABLE "public"."moments_with_score" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."observation_prompts" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_id" "uuid" DEFAULT "gen_random_uuid"(),
    "type" "text",
    "prompt" "text" NOT NULL,
    "latest" boolean,
    "id" "uuid" NOT NULL,
    "result" "text"
);


ALTER TABLE "public"."observation_prompts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_meetings" (
    "id" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_id" "uuid",
    "meetings_id" "text"
);


ALTER TABLE "public"."profile_meetings" OWNER TO "postgres";


COMMENT ON TABLE "public"."profile_meetings" IS 'Relates a profile to meetings';



CREATE TABLE IF NOT EXISTS "public"."qna_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "chunk_id" "text",
    "clear_text" "text",
    "video_api_id" "text",
    "sources" "jsonb"
);


ALTER TABLE "public"."qna_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scheduled_meetings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_id" "text" NOT NULL,
    "calendar_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "notification_time" timestamp with time zone NOT NULL,
    "summary" "text",
    "meet_link" "text",
    "conference_id" "text",
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."scheduled_meetings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."segments" (
    "id" "text" NOT NULL,
    "video_api_id" "text",
    "index" bigint,
    "start_timestamp" "text",
    "end_timestamp" "text",
    "text" "text",
    "speaker_name" "text",
    "word_count" bigint,
    "sentence_count" bigint,
    "duration" double precision,
    "hard_filler_word_count" bigint,
    "soft_filler_word_count" bigint,
    "profanity_count" bigint,
    "question_count" bigint,
    "vad_word_count" bigint,
    "total_valence" double precision,
    "total_arousal" double precision,
    "total_dominance" double precision
);


ALTER TABLE "public"."segments" OWNER TO "postgres";


COMMENT ON TABLE "public"."segments" IS 'Has segments that are related a specific meetings';



COMMENT ON COLUMN "public"."segments"."id" IS 'Primary key, concat of video_api_id and segment index (starting at 0)';



COMMENT ON COLUMN "public"."segments"."video_api_id" IS 'FK referecing meetings';



COMMENT ON COLUMN "public"."segments"."index" IS 'Index of segment to order by index - starts at 0';



CREATE TABLE IF NOT EXISTS "public"."test" (
    "index" bigint,
    "id" bigint,
    "name" "text"
);


ALTER TABLE "public"."test" OWNER TO "postgres";


ALTER TABLE ONLY "public"."calendar_integrations"
    ADD CONSTRAINT "calendar_integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chunks"
    ADD CONSTRAINT "chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coaching_frameworks"
    ADD CONSTRAINT "coaching_frameworks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_credentials"
    ADD CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_credentials"
    ADD CONSTRAINT "integration_credentials_user_id_provider_key" UNIQUE ("user_id", "provider");



ALTER TABLE ONLY "public"."transcript_slices"
    ADD CONSTRAINT "meeting_bot_transcript_slices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meeting_bots"
    ADD CONSTRAINT "meeting_bots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meeting_notes_chunks"
    ADD CONSTRAINT "meeting_notes_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meeting_tags"
    ADD CONSTRAINT "meeting_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meeting_video_api_id_key" UNIQUE ("video_api_id");



ALTER TABLE ONLY "public"."meetings"
    ADD CONSTRAINT "meetings_pkey" PRIMARY KEY ("video_api_id");



ALTER TABLE ONLY "public"."moment_comments"
    ADD CONSTRAINT "moment_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moment_reactions"
    ADD CONSTRAINT "moment_reactions_moment_id_user_id_key" UNIQUE ("moment_id", "user_id");



ALTER TABLE ONLY "public"."moment_reactions"
    ADD CONSTRAINT "moment_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moment_types"
    ADD CONSTRAINT "moment_types_pkey" PRIMARY KEY ("slug");



ALTER TABLE ONLY "public"."moments"
    ADD CONSTRAINT "moments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moments_segment"
    ADD CONSTRAINT "moments_segment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."observation_prompts"
    ADD CONSTRAINT "observation_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile_meetings"
    ADD CONSTRAINT "profiles_metings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."qna_chunks"
    ADD CONSTRAINT "qna_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scheduled_meetings"
    ADD CONSTRAINT "scheduled_meetings_event_id_key" UNIQUE ("event_id");



ALTER TABLE ONLY "public"."scheduled_meetings"
    ADD CONSTRAINT "scheduled_meetings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."segments"
    ADD CONSTRAINT "segments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcript_words"
    ADD CONSTRAINT "transcript_words_pkey" PRIMARY KEY ("id");



CREATE INDEX "calendar_integrations_user_id_idx" ON "public"."calendar_integrations" USING "btree" ("user_id");



CREATE INDEX "chats_user_id_idx" ON "public"."chats" USING "btree" ("user_id");



CREATE INDEX "idx_user_id_provider" ON "public"."integration_credentials" USING "btree" ("user_id", "provider");



CREATE INDEX "integration_credentials_user_provider_idx" ON "public"."integration_credentials" USING "btree" ("user_id", "provider");



CREATE INDEX "ix_test_index" ON "public"."test" USING "btree" ("index");



CREATE INDEX "meetings_searchable_idx" ON "public"."meetings" USING "gin" ("searchable");



CREATE INDEX "moment_comments_moment_id_idx" ON "public"."moment_comments" USING "btree" ("moment_id");



CREATE INDEX "moment_comments_user_id_idx" ON "public"."moment_comments" USING "btree" ("user_id");



CREATE INDEX "moment_reactions_moment_id_idx" ON "public"."moment_reactions" USING "btree" ("moment_id");



CREATE INDEX "moment_reactions_user_id_idx" ON "public"."moment_reactions" USING "btree" ("user_id");



CREATE INDEX "moments_latest_idx" ON "public"."moments" USING "btree" ("latest");



CREATE INDEX "moments_search_idx" ON "public"."moments" USING "gin" ("search_vector");



CREATE INDEX "moments_version_idx" ON "public"."moments" USING "btree" ("video_api_id", "segment_start_timestamp_in_seconds", "version");



CREATE INDEX "moments_video_id_idx" ON "public"."moments" USING "btree" ("video_api_id");



CREATE INDEX "scheduled_meetings_calendar_id_idx" ON "public"."scheduled_meetings" USING "btree" ("calendar_id");



CREATE INDEX "scheduled_meetings_notification_time_idx" ON "public"."scheduled_meetings" USING "btree" ("notification_time");



CREATE INDEX "scheduled_meetings_status_idx" ON "public"."scheduled_meetings" USING "btree" ("status");



CREATE INDEX "scheduled_meetings_status_notification_time_idx" ON "public"."scheduled_meetings" USING "btree" ("status", "notification_time");



CREATE OR REPLACE VIEW "public"."moments_with_score" AS
 SELECT "m"."id",
    "m"."segment_id_sequence_start",
    "m"."segment_id_sequence_end",
    "m"."summary",
    "m"."title",
    "m"."segment_start_timestamp",
    "m"."segment_end_timestamp",
    "m"."segment_start_timestamp_in_seconds",
    "m"."segment_end_timestamp_in_seconds",
    "m"."video_api_id",
    "m"."activity_type",
    "m"."activity_reasoning",
    "m"."target_person_type",
    "m"."target_person_reasoning",
    "m"."activity",
    "m"."moment_url",
    "m"."latest",
    "m"."created_at",
    "m"."search_vector",
    "m"."version",
    "m"."updated_at",
    "m"."relevant",
    "m"."intensity",
    "m"."profile_id",
    (COALESCE("sum"(
        CASE
            WHEN ("mr"."reaction_type" = 'thumbs_up'::"public"."moment_reaction_type") THEN 1
            ELSE 0
        END), (0)::bigint) - COALESCE("sum"(
        CASE
            WHEN ("mr"."reaction_type" = 'thumbs_down'::"public"."moment_reaction_type") THEN 1
            ELSE 0
        END), (0)::bigint)) AS "score",
    "mt"."date"
   FROM (("public"."moments" "m"
     LEFT JOIN "public"."moment_reactions" "mr" ON (("m"."id" = "mr"."moment_id")))
     LEFT JOIN "public"."meetings" "mt" ON (("m"."video_api_id" = "mt"."video_api_id")))
  GROUP BY "m"."id", "mt"."date";



CREATE OR REPLACE TRIGGER "handle_moment_versions" BEFORE INSERT ON "public"."moments" FOR EACH ROW EXECUTE FUNCTION "public"."handle_moment_versioning"();



CREATE OR REPLACE TRIGGER "integration_credentials_updated_at_trigger" BEFORE UPDATE ON "public"."integration_credentials" FOR EACH ROW EXECUTE FUNCTION "public"."update_integration_credentials_updated_at"();



CREATE OR REPLACE TRIGGER "update_moment_comments_updated_at" BEFORE UPDATE ON "public"."moment_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_moments_updated_at" BEFORE UPDATE ON "public"."moments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profile_id_on_moments_trigger" AFTER INSERT ON "public"."moments" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_update_profile_id_on_moments"();



ALTER TABLE ONLY "public"."calendar_integrations"
    ADD CONSTRAINT "calendar_integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chunks"
    ADD CONSTRAINT "chunks_video_api_id_fkey" FOREIGN KEY ("video_api_id") REFERENCES "public"."meetings"("video_api_id");



ALTER TABLE ONLY "public"."integration_credentials"
    ADD CONSTRAINT "integration_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."transcript_slices"
    ADD CONSTRAINT "meeting_bot_transcript_slices_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."meeting_bots"("id");



ALTER TABLE ONLY "public"."meeting_tags"
    ADD CONSTRAINT "meeting_tags_video_api_id_fkey" FOREIGN KEY ("video_api_id") REFERENCES "public"."meetings"("video_api_id");



ALTER TABLE ONLY "public"."moment_comments"
    ADD CONSTRAINT "moment_comments_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id");



ALTER TABLE ONLY "public"."moment_comments"
    ADD CONSTRAINT "moment_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."moment_reactions"
    ADD CONSTRAINT "moment_reactions_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "public"."moments"("id");



ALTER TABLE ONLY "public"."moment_reactions"
    ADD CONSTRAINT "moment_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."moments"
    ADD CONSTRAINT "moments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."moments"
    ADD CONSTRAINT "moments_video_api_id_fkey" FOREIGN KEY ("video_api_id") REFERENCES "public"."meetings"("video_api_id");



ALTER TABLE ONLY "public"."observation_prompts"
    ADD CONSTRAINT "observations_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile_meetings"
    ADD CONSTRAINT "profiles_metings_meetings_id_fkey" FOREIGN KEY ("meetings_id") REFERENCES "public"."meetings"("video_api_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profile_meetings"
    ADD CONSTRAINT "profiles_metings_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."qna_chunks"
    ADD CONSTRAINT "qna_chunks_video_api_id_fkey" FOREIGN KEY ("video_api_id") REFERENCES "public"."meetings"("video_api_id");



ALTER TABLE ONLY "public"."scheduled_meetings"
    ADD CONSTRAINT "scheduled_meetings_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendar_integrations"("id");



ALTER TABLE ONLY "public"."transcript_words"
    ADD CONSTRAINT "transcript_words_bot_id_fkey" FOREIGN KEY ("bot_id") REFERENCES "public"."meeting_bots"("id");



ALTER TABLE ONLY "public"."transcript_words"
    ADD CONSTRAINT "transcript_words_transcript_slice_id_fkey" FOREIGN KEY ("transcript_slice_id") REFERENCES "public"."transcript_slices"("id");



CREATE POLICY "Enable insert via function for all users" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for own profile, admins, or coaches" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "id") OR "public"."is_admin_user"("auth"."uid"()) OR ("coach_id" = "auth"."uid"())));



CREATE POLICY "Update via function" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Users can update integration credentials if they own the creden" ON "public"."integration_credentials" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."meeting_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";















































































































































































































































































































GRANT ALL ON FUNCTION "public"."check_user_permissions"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_permissions"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_permissions"("user_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."moments" TO "anon";
GRANT ALL ON TABLE "public"."moments" TO "authenticated";
GRANT ALL ON TABLE "public"."moments" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_moments_with_metadata"("p_limit" integer, "p_cursor" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_moments_with_metadata"("p_limit" integer, "p_cursor" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_moments_with_metadata"("p_limit" integer, "p_cursor" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_moment_versioning"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_moment_versioning"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_moment_versioning"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."parse_search_query"("search_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."parse_search_query"("search_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."parse_search_query"("search_input" "text") TO "service_role";



GRANT ALL ON TABLE "public"."meetings" TO "anon";
GRANT ALL ON TABLE "public"."meetings" TO "authenticated";
GRANT ALL ON TABLE "public"."meetings" TO "service_role";



GRANT ALL ON FUNCTION "public"."search_meetings"("search_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_meetings"("search_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_meetings"("search_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_moments"("search_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_moments"("search_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_moments"("search_query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_update_profile_id_on_moments"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_update_profile_id_on_moments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_update_profile_id_on_moments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_integration_credentials_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_integration_credentials_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_integration_credentials_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile_id_on_moments"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile_id_on_moments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile_id_on_moments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";





















GRANT ALL ON TABLE "public"."calendar_integrations" TO "anon";
GRANT ALL ON TABLE "public"."calendar_integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."calendar_integrations" TO "service_role";



GRANT ALL ON TABLE "public"."chats" TO "anon";
GRANT ALL ON TABLE "public"."chats" TO "authenticated";
GRANT ALL ON TABLE "public"."chats" TO "service_role";



GRANT ALL ON TABLE "public"."chunks" TO "anon";
GRANT ALL ON TABLE "public"."chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."chunks" TO "service_role";



GRANT ALL ON TABLE "public"."coaching_frameworks" TO "anon";
GRANT ALL ON TABLE "public"."coaching_frameworks" TO "authenticated";
GRANT ALL ON TABLE "public"."coaching_frameworks" TO "service_role";



GRANT ALL ON TABLE "public"."integration_credentials" TO "anon";
GRANT ALL ON TABLE "public"."integration_credentials" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_credentials" TO "service_role";



GRANT ALL ON TABLE "public"."meeting_bots" TO "anon";
GRANT ALL ON TABLE "public"."meeting_bots" TO "authenticated";
GRANT ALL ON TABLE "public"."meeting_bots" TO "service_role";



GRANT ALL ON TABLE "public"."transcript_slices" TO "anon";
GRANT ALL ON TABLE "public"."transcript_slices" TO "authenticated";
GRANT ALL ON TABLE "public"."transcript_slices" TO "service_role";



GRANT ALL ON TABLE "public"."transcript_words" TO "anon";
GRANT ALL ON TABLE "public"."transcript_words" TO "authenticated";
GRANT ALL ON TABLE "public"."transcript_words" TO "service_role";



GRANT ALL ON TABLE "public"."meeting_bot_transcripts" TO "anon";
GRANT ALL ON TABLE "public"."meeting_bot_transcripts" TO "authenticated";
GRANT ALL ON TABLE "public"."meeting_bot_transcripts" TO "service_role";



GRANT ALL ON TABLE "public"."meeting_notes_chunks" TO "anon";
GRANT ALL ON TABLE "public"."meeting_notes_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."meeting_notes_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."meeting_tags" TO "anon";
GRANT ALL ON TABLE "public"."meeting_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."meeting_tags" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."meetings_with_profile" TO "anon";
GRANT ALL ON TABLE "public"."meetings_with_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."meetings_with_profile" TO "service_role";



GRANT ALL ON TABLE "public"."moment_comments" TO "anon";
GRANT ALL ON TABLE "public"."moment_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."moment_comments" TO "service_role";



GRANT ALL ON TABLE "public"."moment_reactions" TO "anon";
GRANT ALL ON TABLE "public"."moment_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."moment_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."moment_types" TO "anon";
GRANT ALL ON TABLE "public"."moment_types" TO "authenticated";
GRANT ALL ON TABLE "public"."moment_types" TO "service_role";



GRANT ALL ON TABLE "public"."moments_segment" TO "anon";
GRANT ALL ON TABLE "public"."moments_segment" TO "authenticated";
GRANT ALL ON TABLE "public"."moments_segment" TO "service_role";



GRANT ALL ON TABLE "public"."moments_with_score" TO "anon";
GRANT ALL ON TABLE "public"."moments_with_score" TO "authenticated";
GRANT ALL ON TABLE "public"."moments_with_score" TO "service_role";



GRANT ALL ON TABLE "public"."observation_prompts" TO "anon";
GRANT ALL ON TABLE "public"."observation_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."observation_prompts" TO "service_role";



GRANT ALL ON TABLE "public"."profile_meetings" TO "anon";
GRANT ALL ON TABLE "public"."profile_meetings" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_meetings" TO "service_role";



GRANT ALL ON TABLE "public"."qna_chunks" TO "anon";
GRANT ALL ON TABLE "public"."qna_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."qna_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."scheduled_meetings" TO "anon";
GRANT ALL ON TABLE "public"."scheduled_meetings" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduled_meetings" TO "service_role";



GRANT ALL ON TABLE "public"."segments" TO "anon";
GRANT ALL ON TABLE "public"."segments" TO "authenticated";
GRANT ALL ON TABLE "public"."segments" TO "service_role";



GRANT ALL ON TABLE "public"."test" TO "anon";
GRANT ALL ON TABLE "public"."test" TO "authenticated";
GRANT ALL ON TABLE "public"."test" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
