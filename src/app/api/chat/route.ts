import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, type CoreMessage, streamText, tool } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import { z } from "zod";

import { getObservationPrompt } from "~/lib/api/observation";
import { UIMessage } from "~/lib/schemas/ai";
import { createClient } from "~/lib/supabase/server";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export const maxDuration = 60;

const cachedGetObservationPrompt = cache(getObservationPrompt);

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

    const supabase = await createClient();

    const { data: observationPrompt } = await supabase
      .from("observation_prompts")
      .select("*")
      .eq("profile_id", userId)
      .eq("type", selectedActivity)
      .eq("latest", true)
      .order("created_at", { ascending: false })
      .maybeSingle();

    const prompt =
      observationPrompt?.prompt ??
      (selectedActivity
        ? (
            await cachedGetObservationPrompt({
              userId,
              selectedActivity,
            })
          )?.prompt
        : null);

    const initialMessages = prompt
      ? [{ role: "system", content: prompt }]
      : await getObservationChat(supabase, userId);

    const tools = {
      displayMoment: tool({
        description:
          "Useful for displaying a moment in the chat. Pass the moment ID and the reasoning for displaying it.",
        parameters: z
          .object({
            id: z.string().describe("The ID of the moment to display."),
            reasoning: z
              .string()
              .describe("The reasoning for displaying the moment."),
          })
          .describe("The arguments for the displayMoment tool."),
        execute: async ({ id, reasoning }) => {
          const moment = await api.moments.getOneById({ momentId: id });
          return { id, reasoning, moment };
        },
      }),
    };

    const coreMessages = convertToCoreMessages(messages, { tools });

    const result = streamText({
      model: openai("gpt-4o-mini-2024-07-18"),
      tools,
      temperature: 0.2,
      messages: [...initialMessages, ...coreMessages].map(
        (m) =>
          ({
            ...m,
            ...(m.role === "user" &&
              typeof m.content === "string" &&
              coreMessages.length > 1 && {
                content: `
                  ${m.content}

                  ---

                  Remember: ALWAYS CALL the \`displayMoment\` tool to show a moment in the chat.
                `,
              }),
          }) as CoreMessage,
      ),
      onFinish: async ({ response: { messages: responseMessages } }) => {
        if (!selectedActivity) return;

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

async function getObservationChat(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: prompts } = await supabase
    .from("observation_prompts")
    .select("*")
    .eq("profile_id", userId)
    .eq("latest", true)
    .order("created_at", { ascending: false });

  return (prompts ?? []).flatMap((prompt) => [
    { role: "user", content: prompt.prompt },
    { role: "user", content: `Tell me more about ${prompt.type}` },
    { role: "assistant", content: prompt.result },
  ]);
}
