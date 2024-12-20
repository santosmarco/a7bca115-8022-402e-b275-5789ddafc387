import { z } from "zod";

import { GoogleCalendarConferenceEntryPointType } from "./constants";

export const GoogleCalendarVideoConference = z
  .object({
    id: z.string(),
    start: z
      .object({
        dateTime: z.string(),
      })
      .passthrough(),
    conferenceData: z
      .object({
        entryPoints: z.array(
          z
            .object({
              entryPointType: z.literal(
                GoogleCalendarConferenceEntryPointType.VIDEO,
              ),
              uri: z.string(),
            })
            .passthrough(),
        ),
      })
      .passthrough(),
  })
  .passthrough();
export type GoogleCalendarVideoConference = z.infer<
  typeof GoogleCalendarVideoConference
>;
