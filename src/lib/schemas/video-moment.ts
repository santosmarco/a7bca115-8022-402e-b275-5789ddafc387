import { z } from "zod";

export const VideoMoment = z
  .object({
    id: z.string().optional(),
    index: z.string(),
    sequence_id: z.coerce.number().int().nonnegative(),
    segment_id_sequence_start: z.coerce.number().int().nonnegative(),
    segment_id_sequence_end: z.coerce.number().int().nonnegative(),
    title: z.string(),
    summary: z.string(),
    segment_start_timestamp: z.string(),
    segment_end_timestamp: z.string(),
    segment_start_timestamp_in_seconds: z.coerce.number().nonnegative(),
    segment_end_timestamp_in_seconds: z.coerce.number().nonnegative(),
    video_id: z.string(),
    activity_type: z.string(),
    activity_reasoning: z.string(),
    target_person_type: z.string().nullish(),
    target_person_reasoning: z.string().nullish(),
    activity: z.string(),
  })
  .transform(({ id, ...rest }) => ({ ...rest, id: id ?? rest.index }));
export type VideoMoment = z.infer<typeof VideoMoment>;

export const VideoMoments = z.array(VideoMoment);
export type VideoMoments = z.infer<typeof VideoMoments>;
