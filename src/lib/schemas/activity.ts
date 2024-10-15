import _ from "lodash";
import { z } from "zod";

export const ActivityType = z.enum([
  "Delegation",
  "Decision Making",
  "Feedback",
]);
export type ActivityType = z.infer<typeof ActivityType>;

export const Activity = z.object({
  video_id: z.string(),
  index: z.string(),
  sequence_id: z.string(),
  segment_id_sequence_start: z.string(),
  segment_id_sequence_end: z.string(),
  segment_start_timestamp: z.string(),
  segment_end_timestamp: z.string(),
  segment_start_timestamp_in_seconds: z.coerce.number(),
  segment_end_timestamp_in_seconds: z.coerce.number(),
  title: z.string(),
  summary: z.string(),
  activity: ActivityType,
  activity_type: z.string(),
  activity_reasoning: z.string(),
  target_person_type: z.string(),
  target_person_reasoning: z.string(),
});
export type Activity = z.infer<typeof Activity>;

export const Activities = z.array(Activity);
export type Activities = z.infer<typeof Activities>;
