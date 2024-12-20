import { z } from "zod";

import { JsonValue } from "./utils";

export const AIRole = z.enum(["user", "assistant", "system", "data"]);
export type AIRole = z.infer<typeof AIRole>;

export const AIToolCall = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  args: JsonValue,
});
export type AIToolCall = z.infer<typeof AIToolCall>;

export const AIToolResult = AIToolCall.extend({
  result: JsonValue,
});
export type AIToolResult = z.infer<typeof AIToolResult>;

export const AIToolInvocation = z.discriminatedUnion("state", [
  AIToolCall.extend({ state: z.literal("partial-call") }),
  AIToolCall.extend({ state: z.literal("call") }),
  AIToolResult.extend({ state: z.literal("result") }),
]);
export type AIToolInvocation = z.infer<typeof AIToolInvocation>;

export const AIAttachment = z.object({
  url: z.string(),
  name: z.string().optional(),
  contentType: z.string().optional(),
});
export type AIAttachment = z.infer<typeof AIAttachment>;

export const AICoreMessageTextPart = z.object({
  type: z.literal("text"),
  text: z.string(),
});
export type AICoreMessageTextPart = z.infer<typeof AICoreMessageTextPart>;

export const DataContent = z.union([
  z.string(),
  z.instanceof(Uint8Array),
  z.instanceof(ArrayBuffer),
  z.instanceof(Buffer),
]);
export type DataContent = z.infer<typeof DataContent>;

export const AICoreMessageImagePart = z.object({
  type: z.literal("image"),
  image: z
    .union([DataContent, z.instanceof(URL)])
    .transform((data) =>
      typeof data === "string"
        ? data
        : data instanceof URL
          ? data.toString()
          : Buffer.from(data).toString("base64"),
    ),
  mimeType: z.string().optional(),
});
export type AICoreMessageImagePart = z.infer<typeof AICoreMessageImagePart>;

export const AICoreMessageFilePart = z.object({
  type: z.literal("file"),
  data: z
    .union([DataContent, z.instanceof(URL)])
    .transform((data) =>
      typeof data === "string"
        ? data
        : data instanceof URL
          ? data.toString()
          : Buffer.from(data).toString("base64"),
    ),
  mimeType: z.string(),
});
export type AICoreMessageFilePart = z.infer<typeof AICoreMessageFilePart>;

export const AICoreMessageToolCallPart = z.object({
  type: z.literal("tool-call"),
  toolCallId: z.string(),
  toolName: z.string(),
  args: z.unknown(),
});
export type AICoreMessageToolCallPart = z.infer<
  typeof AICoreMessageToolCallPart
>;

export const AICoreMessageToolResultPart = z.object({
  type: z.literal("tool-result"),
  toolCallId: z.string(),
  toolName: z.string(),
  result: z.unknown(),
  isError: z.boolean().optional(),
});
export type AICoreMessageToolResultPart = z.infer<
  typeof AICoreMessageToolResultPart
>;

export const AICoreSystemMessage = z.object({
  role: z.literal("system"),
  content: z.string(),
});
export type AICoreSystemMessage = z.infer<typeof AICoreSystemMessage>;

export const AICoreUserMessage = z.object({
  role: z.literal("user"),
  content: z.union([
    z.string(),
    z.array(
      z.union([
        AICoreMessageTextPart,
        AICoreMessageImagePart,
        AICoreMessageFilePart,
      ]),
    ),
  ]),
});
export type AICoreUserMessage = z.infer<typeof AICoreUserMessage>;

export const AICoreAssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.union([
    z.string(),
    z.array(z.union([AICoreMessageTextPart, AICoreMessageToolCallPart])),
  ]),
});
export type AICoreAssistantMessage = z.infer<typeof AICoreAssistantMessage>;

export const AICoreToolMessage = z.object({
  role: z.literal("tool"),
  content: z.array(AICoreMessageToolResultPart),
});
export type AICoreToolMessage = z.infer<typeof AICoreToolMessage>;

export const AICoreMessage = z.discriminatedUnion("role", [
  AICoreSystemMessage,
  AICoreUserMessage,
  AICoreAssistantMessage,
  AICoreToolMessage,
]);
export type AICoreMessage = z.infer<typeof AICoreMessage>;

export const UIMessage = z.object({
  role: AIRole,
  content: z.string(),
  toolInvocations: z.array(AIToolInvocation).optional(),
  attachments: z.array(AIAttachment).optional(),
});
export type UIMessage = z.infer<typeof UIMessage>;
