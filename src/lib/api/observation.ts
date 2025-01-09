import axios from "axios";
import { z } from "zod";

import { client } from "./client";

export const ObservationPromptResponse = z.object({
  prompt: z.string(),
  processed_at: z.string(),
  status: z.literal("success"),
});
export type ObservationPromptResponse = z.infer<
  typeof ObservationPromptResponse
>;

export const ObservationPromptParams = z.object({
  userId: z.string(),
  selectedActivity: z.string(),
});
export type ObservationPromptParams = z.infer<typeof ObservationPromptParams>;

export async function getObservationPrompt({
  userId,
  selectedActivity,
}: ObservationPromptParams) {
  try {
    const response = await client.post("/get_observation_prompt", {
      userId,
      selectedActivity,
    });

    return await ObservationPromptResponse.parseAsync(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error ?? "Failed to fetch prompt");
    }
    throw error;
  }
}
