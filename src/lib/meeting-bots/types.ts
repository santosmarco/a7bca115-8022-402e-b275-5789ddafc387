import type { logger } from "@trigger.dev/sdk/v3";

import type { meetingBaas } from "~/lib/meeting-baas/client";
import type { createClient as createRecallClient } from "~/lib/recall/client";
import type { slack } from "~/lib/slack";
import type { SupabaseServerClient } from "~/lib/supabase/server";
import type { apiVideo } from "~/server/api/services/api-video";

export type MeetingBotsServiceLogger = Pick<
  typeof logger,
  "info" | "debug" | "warn" | "error"
>;

export type MeetingBotsServiceDependencies<
  TLogger extends MeetingBotsServiceLogger = MeetingBotsServiceLogger,
> = {
  supabase: SupabaseServerClient;
  meetingBaas: typeof meetingBaas;
  recall: ReturnType<typeof createRecallClient>;
  apiVideo: typeof apiVideo;
  logger: TLogger;
  slack: typeof slack;
};
