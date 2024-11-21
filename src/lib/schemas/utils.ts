import { z } from "zod";

export const JsonDate = z
  .string()
  .datetime()
  .or(z.date().transform((d) => d.toISOString()));
export type JsonDate = z.infer<typeof JsonDate>;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
export const JsonValue: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.union([z.string(), z.number(), z.boolean(), z.null()]),
    z.array(JsonValue),
    z.record(JsonValue),
  ]),
);
