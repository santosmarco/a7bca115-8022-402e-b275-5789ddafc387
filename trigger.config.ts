import {
  syncEnvVars,
  syncVercelEnvVars,
} from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_irrzouiahuwyibmfzwcn",
  runtime: "node",
  logLevel: "log",
  // Set the maxDuration to 300 seconds for all tasks. See https://trigger.dev/docs/runs/max-duration
  // maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/jobs"],
  build: {
    extensions: [
      process.env.NODE_ENV === "development"
        ? syncEnvVars(async () => {
            const { env } = await import("./src/env");
            return Object.entries<string>(env).map(([key, value]) => ({
              name: key,
              value,
            }));
          })
        : syncVercelEnvVars(),
    ],
  },
});
