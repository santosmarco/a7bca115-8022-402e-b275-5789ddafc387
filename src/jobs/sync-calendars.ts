import { logger, schemaTask } from "@trigger.dev/sdk/v3";

import { meetingBaas } from "~/lib/meeting-baas/client";
import { CalendarSyncEvent } from "~/lib/meeting-bots/schemas";
import { createMeetingBotsService } from "~/lib/meeting-bots/service";
import type { MeetingBotsServiceDependencies } from "~/lib/meeting-bots/types";
import { createClient as createRecallClient } from "~/lib/recall/client";
import { slack } from "~/lib/slack";
import { __dangerouslyCreateAdminClient__ } from "~/lib/supabase/admin";
import { apiVideo } from "~/server/api/services/api-video";

export const syncCalendars = schemaTask({
  id: "sync-calendars",
  schema: CalendarSyncEvent,
  maxDuration: 60 * 10, // 10 minutes
  run: async (payload) => {
    const deps = {
      supabase: await __dangerouslyCreateAdminClient__(),
      meetingBaas: meetingBaas,
      recall: createRecallClient(),
      apiVideo: apiVideo,
      logger: logger,
      slack: slack,
    } satisfies MeetingBotsServiceDependencies;

    const meetingBotsService = createMeetingBotsService(deps);

    await meetingBotsService.handleCalendarSyncEvent(payload);
  },
});
