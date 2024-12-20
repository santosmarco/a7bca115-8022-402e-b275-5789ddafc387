import { z } from "zod";

export const SlashCommand = z.enum(["/meetings", "/moments"]);
export type SlashCommand = z.infer<typeof SlashCommand>;
