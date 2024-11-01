import axios from "axios";
import { z } from "zod";

import { env } from "~/env";
import { notion, notionApi } from "~/lib/notion/client";

import { createTRPCRouter, publicProcedure } from "../trpc";

async function getPageWithBlocks(pageId: string) {
  const [page, { data: blocks }] = await Promise.all([
    notionApi.getPage(pageId),
    axios.get(`https://notion-api.splitbee.io/v1/page/${pageId}`),
  ]);
  return { ...page };
}

export const notionRouter = createTRPCRouter({
  listByClient: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const reports = await notion.databases.query({
        database_id: env.NOTION_REPORTS_DATABASE_ID,
        filter: { property: "Client", select: { equals: input.name } },
      });
      const reportPages = await Promise.all(
        reports.results
          .filter((result) => result.object === "page")
          .map((result) => getPageWithBlocks(result.id)),
      );
      return reportPages;
    }),

  getOne: publicProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ input }) => {
      return getPageWithBlocks(input.reportId);
    }),
});
