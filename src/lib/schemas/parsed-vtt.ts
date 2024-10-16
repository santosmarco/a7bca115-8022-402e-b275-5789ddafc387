import { z } from "zod";

export const ParsedVTT = z.object({
  videoId: z.string(),
  index: z.coerce.number().int().nonnegative(),
  start: z.string(),
  end: z.string(),
  startInSeconds: z.coerce.number().nonnegative(),
  endInSeconds: z.coerce.number().nonnegative(),
  speaker: z.string().nullish(),
  text: z.string(),
});
export type ParsedVTT = z.infer<typeof ParsedVTT>;
