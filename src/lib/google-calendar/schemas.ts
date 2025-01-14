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

export const GoogleCalendarEvent = z
  .object({
    id: z.string().optional(),
    end: z
      .object({
        dateTime: z.string().optional(),
        timeZone: z.string().optional(),
      })
      .passthrough()
      .optional(),
    etag: z.string().optional(),
    kind: z.string().optional(),
    start: z
      .object({
        dateTime: z.string().optional(),
        timeZone: z.string().optional(),
      })
      .passthrough()
      .optional(),
    status: z.string().optional(),
    created: z.string().optional(),
    creator: z
      .object({
        email: z.string().optional(),
      })
      .passthrough()
      .optional(),
    iCalUID: z.string().optional(),
    summary: z.string().optional(),
    updated: z.string().optional(),
    htmlLink: z.string().optional(),
    sequence: z.number().optional(),
    attendees: z
      .array(
        z
          .object({
            email: z.string().optional(),
            organizer: z.boolean().optional(),
            responseStatus: z.string().optional(),
            self: z.boolean().optional(),
          })
          .passthrough(),
      )
      .optional(),
    eventType: z.string().optional(),
    organizer: z
      .object({
        email: z.string().optional(),
      })
      .passthrough()
      .optional(),
    reminders: z
      .object({
        useDefault: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    hangoutLink: z.string().optional(),
    conferenceData: z
      .object({
        entryPoints: z
          .array(
            z
              .object({
                uri: z.string().optional(),
                label: z.string().optional(),
                entryPointType: z.string().optional(),
                pin: z.string().optional(),
                regionCode: z.string().optional(),
              })
              .passthrough(),
          )
          .optional(),
        conferenceId: z.string().optional(),
        conferenceSolution: z
          .object({
            key: z
              .object({
                type: z.string().optional(),
              })
              .passthrough()
              .optional(),
            name: z.string().optional(),
            iconUri: z.string().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    recurringEventId: z.string().optional(),
    originalStartTime: z
      .object({
        dateTime: z.string().optional(),
        timeZone: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
