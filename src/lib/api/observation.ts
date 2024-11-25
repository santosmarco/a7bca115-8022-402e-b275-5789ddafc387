import axios from "axios";
import { z } from "zod";

import { env } from "~/env";

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

const client = axios.create({
  baseURL: "https://titan-backend-x.replit.app",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": env.INTERNAL_API_KEY,
  },
});

// Add request interceptor
client.interceptors.request.use(
  (config) => {
    console.log("Request:", {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor
client.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

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
