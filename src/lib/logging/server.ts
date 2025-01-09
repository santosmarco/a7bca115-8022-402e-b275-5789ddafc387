"server-only";

import { log } from "@logtail/next";
import _ from "lodash";

import { env } from "~/env";

const _logger = log.with({
  environment: env.NODE_ENV,
  source: "server",
});

export const logger = {
  ..._logger,
  info: (...args: Parameters<typeof _logger.info>) => {
    console.log("Logging info:", args);
    _logger.info(...args);
  },
  warn: (...args: Parameters<typeof _logger.warn>) => {
    console.log("Logging warn:", args);
    _logger.warn(...args);
  },
  error: (...args: Parameters<typeof _logger.error>) => {
    console.log("Logging error:", args);
    _logger.error(...args);
  },
};
