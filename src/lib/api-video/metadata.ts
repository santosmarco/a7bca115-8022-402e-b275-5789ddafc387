export const MetadataKey = {
  ACTIVITIES: "activities",
  EMOTIONS: "emotions",
  SUMMARY: "summary",
} as const;
export type MetadataKey = (typeof MetadataKey)[keyof typeof MetadataKey];
