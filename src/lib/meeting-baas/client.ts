"server-only";

import axios from "axios";

import { env } from "~/env";

import type {
  MeetingBaasBotParam2,
  MeetingBaasCalendar,
  MeetingBaasCalendarListEntry,
  MeetingBaasCreateCalendarParams,
  MeetingBaasEvent,
  MeetingBaasJoinRequest,
  MeetingBaasJoinResponse,
  MeetingBaasLeaveResponse,
  MeetingBaasMetadata,
} from "./schemas";

const MEETING_BAAS_API_URL = "https://api.meetingbaas.com";

const client = axios.create({
  baseURL: MEETING_BAAS_API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-meeting-baas-api-key": env.MEETING_BAAS_API_KEY,
  },
});

// Bot Management
async function joinMeeting(request: MeetingBaasJoinRequest) {
  const response = await client.post<MeetingBaasJoinResponse>("/bots", request);
  return response.data;
}

async function leaveMeeting(botId: string) {
  const response = await client.delete<MeetingBaasLeaveResponse>(
    `/bots/${botId}`,
  );
  return response.data;
}

async function getMeetingData(botId: string) {
  const response = await client.get<MeetingBaasMetadata>(
    `/bots/meeting_data?bot_id=${botId}`,
  );
  return response.data;
}

// Calendar Management
async function listCalendars() {
  const response = await client.get<MeetingBaasCalendar[]>("/calendars");
  return response.data;
}

async function createCalendar(params: MeetingBaasCreateCalendarParams) {
  const response = await client.post<{ calendar: MeetingBaasCalendar }>(
    "/calendars",
    params,
  );
  return response.data;
}

async function getCalendar(uuid: string) {
  const response = await client.get<MeetingBaasCalendar>(`/calendars/${uuid}`);
  return response.data;
}

async function deleteCalendar(uuid: string) {
  await client.delete(`/calendars/${uuid}`);
}

async function listRawCalendars(params: MeetingBaasCreateCalendarParams) {
  const response = await client.get<{
    calendars: MeetingBaasCalendarListEntry[];
  }>("/raw_calendars", {
    data: params,
  });
  return response.data;
}

// Calendar Events
async function listCalendarEvents({
  calendarId,
  offset,
  limit,
  updatedAtGte,
}: {
  calendarId: string;
  offset: number;
  limit: number;
  updatedAtGte?: string;
}) {
  const params = new URLSearchParams({
    calendar_id: calendarId,
    offset: offset.toString(),
    limit: limit.toString(),
  });

  if (updatedAtGte) params.append("updated_at_gte", updatedAtGte);

  const response = await client.get<MeetingBaasEvent[]>(
    `/calendar_events?${params.toString()}`,
  );
  return response.data;
}

async function getCalendarEvent(uuid: string) {
  const response = await client.get<MeetingBaasEvent>(
    `/calendar_events/${uuid}`,
  );
  return response.data;
}

async function scheduleRecordEvent(uuid: string, params: MeetingBaasBotParam2) {
  const response = await client.post<MeetingBaasEvent>(
    `/calendar_events/${uuid}/bot`,
    params,
  );
  return response.data;
}

async function unscheduleRecordEvent(uuid: string) {
  const response = await client.delete<MeetingBaasEvent>(
    `/calendar_events/${uuid}/bot`,
  );
  return response.data;
}

export const meetingBaas = {
  meetings: {
    join: joinMeeting,
    leave: leaveMeeting,
    getMeetingData,
  },
  calendars: {
    list: listCalendars,
    create: createCalendar,
    get: getCalendar,
    delete: deleteCalendar,
    listRaw: listRawCalendars,
  },
  events: {
    list: listCalendarEvents,
    get: getCalendarEvent,
    schedule: scheduleRecordEvent,
    unschedule: unscheduleRecordEvent,
  },
} as const;
