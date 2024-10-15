import { z } from "zod";

export const EmotionSequence = z.object({
  sequence_id: z.number(),
  segment_id_sequence_start: z.number(),
  segment_id_sequence_end: z.number(),
  speaker_name: z.string(),
  emotion: z.string(),
  emotion_intensity: z.number(),
  reasoning: z.string(),
  context: z.string(),
});
export type EmotionSequence = z.infer<typeof EmotionSequence>;

export const EmotionAnalysis = z.object({
  emotion_sequences: z.array(EmotionSequence),
});
export type EmotionAnalysis = z.infer<typeof EmotionAnalysis>;
