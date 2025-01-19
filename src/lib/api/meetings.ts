import axios from "axios";
import { z } from "zod";

import { client } from "./client";

export const MeetingDeleteResponse = z.object({
  deletion_id: z.string(),
  video_id: z.string(),
});
export type MeetingDeleteResponse = z.infer<typeof MeetingDeleteResponse>;

export const MeetingDeleteParams = z.object({
  videoId: z.string(),
});
export type MeetingDeleteParams = z.infer<typeof MeetingDeleteParams>;

export async function deleteMeeting({ videoId }: MeetingDeleteParams) {
  try {
    const response = await client.delete(`/meetings/${videoId}`);
    return MeetingDeleteResponse.parse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ?? "Failed to delete meeting",
      );
    }
    throw error;
  }
}

export const ProcessVideoParams = z.object({
  meetingBotId: z.string(),
});
export type ProcessVideoParams = z.infer<typeof ProcessVideoParams>;

export async function processVideo({ meetingBotId }: ProcessVideoParams) {
  try {
    const response = await client.post("/process_video", { meetingBotId });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error ?? "Failed to process video");
    }
    throw error;
  }
}
