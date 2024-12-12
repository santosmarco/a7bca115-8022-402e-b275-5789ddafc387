import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, type CoreMessage, streamText } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { cache } from "react";
import dedent from "ts-dedent";
import { z } from "zod";

import {
  displayMomentTool,
  explainTool,
  explainTools,
  listMeetingsTool,
} from "~/lib/ai/tools";
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

const MODEL_RETRY_ORDER = [
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
] satisfies Parameters<typeof openai>[0][];

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

    const model = request.nextUrl.searchParams.get("model") ?? "gpt-4o-mini";
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

    const tools = {
      displayMoment: displayMomentTool,
      listMeetings: listMeetingsTool,
    };

    const initialMessages = prompt
      ? [
          { role: "system", content: prompt },
          {
            role: "user",
            content: dedent`
              You have the following tools available:

              ${explainTools(tools)}

              Whenever you may need further explanation about a tool, don't forget to run the \`explain\` tool.
            `,
          },
        ]
      : await getObservationChat(supabase, userId);

    const coreMessages = convertToCoreMessages(messages, { tools });

    const result = streamText({
      model: openai(model),
      tools: { ...tools, explain: explainTool(tools) },
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
      experimental_telemetry: { isEnabled: true },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);

    const nextRetryModel = MODEL_RETRY_ORDER.find((model, idx) => {
      return MODEL_RETRY_ORDER.indexOf(model) === idx + 1;
    });

    if (nextRetryModel) {
      const url = new URL(request.nextUrl);
      url.searchParams.set("model", nextRetryModel);
      return fetch(url.toString(), request);
    }

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
