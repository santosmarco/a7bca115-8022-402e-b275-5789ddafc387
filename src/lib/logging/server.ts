"server-only";

import { log } from "@logtail/next";

import { env } from "~/env";

const _logger = log.with({
  environment: env.NODE_ENV,
  source: "server",
});

export const logger = {
  ..._logger,
  info: (...args: Parameters<typeof _logger.info>) => {
    console.info(...args);
    _logger.info(...args);
  },
  debug: (...args: Parameters<typeof _logger.debug>) => {
    console.debug(...args);
    _logger.debug(...args);
  },
  warn: (...args: Parameters<typeof _logger.warn>) => {
    console.warn(...args);
    _logger.warn(...args);
  },
  error: (...args: Parameters<typeof _logger.error>) => {
    console.error(...args);
    _logger.error(...args);
  },
};
