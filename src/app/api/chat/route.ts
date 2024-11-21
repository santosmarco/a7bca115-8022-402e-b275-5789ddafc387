import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { UIMessage } from "~/lib/schemas/ai";
import { api } from "~/trpc/server";

export const ChatRequestBody = z
  .object({
    userId: z.string(),
    topic: z.string(),
    messages: z.array(UIMessage),
  })
  .partial();
export type ChatRequestBody = z.infer<typeof ChatRequestBody>;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const bodyParseResult = ChatRequestBody.required().safeParse(body);

    if (!bodyParseResult.success) {
      console.error("Validation error:", bodyParseResult.error);
      return NextResponse.json(
        { error: "Invalid chat payload" },
        { status: 400 },
      );
    }

    const { userId, topic, messages } = bodyParseResult.data;

    const coreMessages = convertToCoreMessages(messages);

    const result = streamText({
      model: openai("gpt-4"),
      system: "you are a friendly assistant!",
      messages: coreMessages,
      onFinish: async ({ response: { messages: responseMessages } }) => {
        try {
          await api.chats.save({
            userId,
            topic,
            messages: [...coreMessages, ...responseMessages],
          });
        } catch (error) {
          console.error("Failed to save chat", { error });
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
