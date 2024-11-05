import { z } from "zod";

import { env } from "~/env";
import { notion, notionApi } from "~/lib/notion/client";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const notionRouter = createTRPCRouter({
  listByClient: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      if (!input.name) return [];
      const reports = await notion.databases.query({
        database_id: env.NOTION_REPORTS_DATABASE_ID,
        filter: { property: "Client", select: { equals: input.name } },
      });
      const reportPages = await Promise.all(
        reports.results
          .filter(
            (
              result,
            ): result is Extract<
              typeof result,
              { object: "page"; properties: unknown }
            > => result.object === "page" && "properties" in result,
          )
          .map(async (result) => ({
            ...result,
            ...(await notionApi.getPage(result.id)),
          })),
      );
      return reportPages;
    }),

  getOne: publicProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ input }) => {
      return await notionApi.getPage(input.reportId);
    }),
});
