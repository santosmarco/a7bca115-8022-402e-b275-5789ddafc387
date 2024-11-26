import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, type CoreMessage, streamText, tool } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getObservationPrompt } from "~/lib/api/observation";
import { UIMessage } from "~/lib/schemas/ai";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export const ChatRequestBody = z
  .object({
    userId: z.string(),
    selectedActivity: z.string(),
    messages: z.array(UIMessage.passthrough()),
  })
  .partial()
  .passthrough();
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

    const { userId, selectedActivity, messages } = bodyParseResult.data;

    const { prompt } = await getObservationPrompt({
      userId,
      selectedActivity,
    });

    const coreMessages = convertToCoreMessages(messages);

    const result = streamText({
      model: openai("gpt-4o-mini-2024-07-18"),
      // tools: {
      //   displayMoment: tool({
      //     description: "Useful for displaying a moment in the chat.",
      //     parameters: z.object({
      //       id: z.string(),
      //       reasoning: z.string(),
      //     }),
      //     execute: async ({ id, reasoning }) => {
      //       return `<moment id="${id}" reasoning="${reasoning.replace(
      //         /"/g,
      //         "'",
      //       )}" />`;
      //     },
      //   }),
      // },
      messages: [{ role: "system", content: prompt }, ...coreMessages],
      // messages: [{ role: "system", content: prompt }, ...coreMessages].map(
      //   (m) =>
      //     ({
      //       ...m,
      //       ...(m.role === "user" &&
      //         typeof m.content === "string" &&
      //         coreMessages.length > 1 && {
      //           content: `
      //         ${m.content}

      //         ---

      //         Remember: ALWAYS CALL the \`displayMoment\` tool to show a moment in the chat.
      //       `,
      //         }),
      //     }) as CoreMessage,
      // ),
      onFinish: async ({ response: { messages: responseMessages } }) => {
        try {
          await api.chats.save({
            userId,
            topic: selectedActivity,
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
