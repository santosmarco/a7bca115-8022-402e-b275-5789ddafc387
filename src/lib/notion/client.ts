"server-only";

import { Client as NotionClient } from "@notionhq/client";
import { NotionAPI as NotionAPIClient } from "notion-client";

import { env } from "~/env";

export const notion = new NotionClient({
  auth: env.NOTION_INTEGRATION_SECRET,
});

export const notionApi = new NotionAPIClient({
  authToken: env.NOTION_INTEGRATION_SECRET,
});
