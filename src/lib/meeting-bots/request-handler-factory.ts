import { type NextRequest, NextResponse } from "next/server";

import { createClient as createRecallClient } from "~/lib/recall/client";
import { createClient as createSupabaseClient } from "~/lib/supabase/server";
import { apiVideo } from "~/server/api/services/api-video";

import { logger } from "../logging/server";
import { meetingBaas } from "../meeting-baas/client";
import { slack } from "../slack";
import { MeetingBotsWebhookRequest } from "./schemas";
import { createMeetingBotsService } from "./service";
import type { MeetingBotsServiceDependencies } from "./types";

export function createRequestHandler(provider: "recall" | "meeting_baas") {
  return async function handleRequest(request: NextRequest) {
    async function run() {
      try {
        logger.info("📥 Received webhook request", {
          url: request.url,
          method: request.method,
        });

        const body = (await request.json()) as unknown;

        const bodyParseResult = MeetingBotsWebhookRequest.safeParse(body);

        if (!bodyParseResult.success) {
          logger.warn("⚠️ Invalid webhook payload", {
            validation_errors: bodyParseResult.error.errors,
            body,
          });
          return;
        }

        const parsedBody = bodyParseResult.data;

        logger.info("✅ Validated webhook payload", {
          event: parsedBody.event,
          bot_id:
            "bot_id" in parsedBody.data ? parsedBody.data.bot_id : undefined,
          calendar_id:
            "calendar_id" in parsedBody.data
              ? parsedBody.data.calendar_id
              : undefined,
        });

        const deps = {
          supabase: await createSupabaseClient(),
          meetingBaas: meetingBaas,
          recall: createRecallClient(),
          apiVideo: apiVideo,
          logger: logger,
          slack: slack,
        } satisfies MeetingBotsServiceDependencies;

        const meetingBotsService = createMeetingBotsService(deps);

        if (parsedBody.event === "bot.status_change") {
          logger.info("🤖 Processing bot status change event", {
            bot_id: parsedBody.data.bot_id,
            status: parsedBody.data.status,
          });
          await meetingBotsService.handleBotStatusChange(parsedBody);
        } else if (
          parsedBody.event === "calendar.sync_events" &&
          provider === "recall"
        ) {
          logger.info("📅 Processing calendar sync event", {
            calendar_id: parsedBody.data.calendar_id,
            last_updated: parsedBody.data.last_updated_ts,
          });
          await meetingBotsService.handleCalendarSyncEvent(parsedBody);
        }

        logger.info("✨ Successfully processed webhook", {
          event: parsedBody.event,
        });

        await slack.success({
          text: `Successfully processed ${parsedBody.event} webhook`,
        });
      } catch (error) {
        logger.error("❌ Failed to process webhook", {
          error,
          url: request.url,
        });

        await slack.error({
          text: `Failed to process webhook: ${(error as Error).message}`,
        });
      }
    }

    void run();

    return new NextResponse(null, { status: 200 });
  };
}
