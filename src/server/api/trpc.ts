import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { ZodError } from "zod";

import { logger } from "~/lib/logging/server";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    headers: opts.headers,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const loggingMiddleware = t.middleware(
  async ({ type, path, meta, input, next }) => {
    const startTime = performance.now();
    const requestId = crypto.randomUUID();
    const context = { type, path, meta, input, requestId };

    const trpcLogger = logger.with(context);

    trpcLogger.info(`[TRPC] ${path} procedure invoked`, {
      event: "procedure.start",
    });

    try {
      const result = await next();

      const duration = performance.now() - startTime;

      trpcLogger.info(`[TRPC] ${path} procedure succeeded`, {
        event: "procedure.success",
        duration,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      trpcLogger.error(`[TRPC] ${path} procedure failed`, {
        event: "procedure.error",
        error,
        duration,
      });

      throw error;
    }
  },
);

export const publicProcedure = t.procedure.use(loggingMiddleware);
