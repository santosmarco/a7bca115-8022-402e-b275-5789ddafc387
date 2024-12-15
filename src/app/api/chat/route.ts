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
import { searchSimilar } from "~/lib/pinecone/search";
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
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
] as const satisfies Parameters<typeof openai>[0][];
const modelRetryOrderSchema = z
  .enum(MODEL_RETRY_ORDER)
  .catch(MODEL_RETRY_ORDER[0]);

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

    const model = modelRetryOrderSchema.parse(
      request.nextUrl.searchParams.get("model") ?? MODEL_RETRY_ORDER[0],
    );
    const { userId, selectedActivity, messages } = bodyParseResult.data;

    const supabase = await createClient();

    const [{ data: profile }, { data: observationPrompt }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("observation_prompts")
        .select("*")
        .eq("profile_id", userId)
        .eq("type", selectedActivity)
        .eq("latest", true)
        .order("created_at", { ascending: false })
        .maybeSingle(),
    ]);

    const tools = {
      displayMoment: displayMomentTool,
      listMeetings: listMeetingsTool,
    };

    let systemMessage = dedent`
      You are the best coach in the world. You can assist your clients with any questions they have. You help them with their goals, emotions, decisions, delegations, feedback, team conflicts, goal setting, and more.

      You have the following tools available:

      <tools>
      ${explainTools(tools)}
      </tools>

      Whenever you may need further explanation about a tool, don't forget to run the \`explain\` tool.
    `;
    if (profile?.nickname) {
      systemMessage += `\n\nYou are coaching <user>${profile.nickname}</user>.`;
    }
    if (selectedActivity) {
      systemMessage += `\n\nYou are specifically discussing <topic>${selectedActivity}</topic>.`;
    }
    systemMessage += "\n\nNow, the conversation begins.";

    /*
    const prompt =
      observationPrompt?.prompt ??
      (selectedActivity
        ? (
            await cachedGetObservationPrompt({
              userId,
              selectedActivity,
            }).catch(() => undefined)
          )?.prompt
        : undefined);
    */

    const initialMessages: CoreMessage[] = [
      { role: "system", content: systemMessage },
      ...(observationPrompt?.result
        ? [
            { role: "user" as const, content: observationPrompt.prompt },
            { role: "assistant" as const, content: observationPrompt.result },
          ]
        : []),
    ];

    const coreMessages = convertToCoreMessages(messages, {
      tools: { ...tools, explain: explainTool(tools) },
    });

    const latestUserMessage = [...coreMessages]
      .reverse()
      .find((m): m is Extract<typeof m, { role: "user" }> => m.role === "user");

    if (latestUserMessage) {
      const ragFilters: Record<string, unknown> = {};
      if (profile) {
        ragFilters.profile_id = profile.id;
      }
      if (selectedActivity && selectedActivity !== "Coach") {
        ragFilters.activity_type = selectedActivity;
      }

      const results = await searchSimilar(
        latestUserMessage.content.toString(),
        {
          topK: 30,
          minScore: 0.4,
          filter: ragFilters,
        },
      );

      latestUserMessage.content = dedent`
        Here is some relevant context from previous meetings that might help with the response:
        
        <context>
        ${results.length > 0 ? results.map((r) => JSON.stringify(r, null, 2)).join("\n\n") : "No relevant context found"}
        </context>

        ---

        ${latestUserMessage.content}
      `;
    }

    const result = streamText({
      model: openai(model),
      tools: { ...tools, explain: explainTool(tools) },
      temperature: 0.2,
      messages: [...initialMessages, ...coreMessages],
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
