"use client";

import { log } from "@logtail/next";

import { env } from "~/env";

export const logger = log.with({
  environment: env.NEXT_PUBLIC_NODE_ENV,
  source: "client",
});
