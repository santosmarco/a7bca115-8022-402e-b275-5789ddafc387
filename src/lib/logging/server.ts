"server-only";

import { log } from "@logtail/next";

import { env } from "~/env";

export const logger = log.with({
  environment: env.NODE_ENV,
  source: "server",
});
