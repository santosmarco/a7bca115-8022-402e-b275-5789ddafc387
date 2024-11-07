export const GoogleCalendarEventType = {
  BIRTHDAY: "birthday",
  DEFAULT: "default",
  FOCUS_TIME: "focusTime",
  FROM_GMAIL: "fromGmail",
  OUT_OF_OFFICE: "outOfOffice",
  WORKING_LOCATION: "workingLocation",
} as const;
export type GoogleCalendarEventType =
  (typeof GoogleCalendarEventType)[keyof typeof GoogleCalendarEventType];

export const GoogleCalendarConferenceEntryPointType = {
  VIDEO: "video",
  PHONE: "phone",
  SIP: "sip",
  MORE: "more",
} as const;
export type GoogleCalendarConferenceEntryPointType =
  (typeof GoogleCalendarConferenceEntryPointType)[keyof typeof GoogleCalendarConferenceEntryPointType];
