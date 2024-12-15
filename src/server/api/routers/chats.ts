import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { AICoreMessage } from "~/lib/schemas/ai";
import type { Json } from "~/lib/supabase/database.types";
import { createClient } from "~/lib/supabase/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const chatsRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        topic: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      return await supabase
        .from("chats")
        .select()
        .eq("user_id", input.userId)
        .eq("topic", input.topic)
        .eq("latest", true)
        .maybeSingle();
    }),

  save: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        topic: z.string(),
        messages: AICoreMessage.array(),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      try {
        const chat = await supabase
          .from("chats")
          .select()
          .eq("user_id", input.userId)
          .eq("topic", input.topic)
          .eq("latest", true)
          .maybeSingle();

        if (chat.error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to get chat: ${chat.error.message}`,
            cause: chat.error,
          });
        }

        if (!chat.data) {
          return await supabase
            .from("chats")
            .insert({
              user_id: input.userId,
              topic: input.topic,
              messages: input.messages as Json[],
              latest: true,
            })
            .select("*");
        }

        return await supabase
          .from("chats")
          .update({
            messages: input.messages as Json[],
          })
          .eq("id", chat.data.id)
          .select("*");
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to save chat in database: ${(error as Error).message}`,
          cause: error,
        });
      }
    }),
});
