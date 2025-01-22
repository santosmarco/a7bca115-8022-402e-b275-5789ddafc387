import { createBotStatusChangeService } from "./bot-status-change/service";
import { createCalendarSyncService } from "./calendar-sync/service";
import type { MeetingBotsServiceDependencies } from "./types";

export function createMeetingBotsService(deps: MeetingBotsServiceDependencies) {
  const botStatusChangeService = createBotStatusChangeService(deps);
  const calendarSyncService = createCalendarSyncService(deps);

  return {
    ...botStatusChangeService,
    ...calendarSyncService,
  } as const;
}
