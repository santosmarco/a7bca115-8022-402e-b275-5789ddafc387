import { z } from "zod";

export const JsonDate = z
  .string()
  .datetime()
  .or(z.date().transform((d) => d.toISOString()));
export type JsonDate = z.infer<typeof JsonDate>;
