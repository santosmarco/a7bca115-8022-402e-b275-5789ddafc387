import { z } from "zod";

import { env } from "~/env";
import { notion, notionApi } from "~/lib/notion/client";

import { createTRPCRouter, publicProcedure } from "../trpc";

async function getNotionPage(pageId: string) {
  return await notionApi.getPage(pageId);
}

async function getEnrichedReportPages<
  T extends Awaited<ReturnType<typeof notion.databases.query>>,
>(results: T["results"]) {
  return Promise.all(
    results
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
        ...(await getNotionPage(result.id)),
      })),
  );
}

export const notionRouter = createTRPCRouter({
  listAll: publicProcedure.query(async () => {
    const reports = await notion.databases.query({
      database_id: env.NOTION_REPORTS_DATABASE_ID,
    });
    return getEnrichedReportPages(reports.results);
  }),

  listByClient: publicProcedure
    .input(z.object({ name: z.string().nullish() }))
    .query(async ({ input }) => {
      const reports = await notion.databases.query({
        database_id: env.NOTION_REPORTS_DATABASE_ID,
        ...(input.name && {
          filter: { property: "Client", select: { equals: input.name } },
        }),
      });
      return getEnrichedReportPages(reports.results);
    }),

  getOne: publicProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ input }) => {
      return await getNotionPage(input.reportId);
    }),
});
