import { tool } from "ai";
import { z } from "zod";

import { api } from "~/trpc/server";

export const getMomentsTool = tool({
  description: "Useful when you need to get moments for a given activity",
  parameters: z.object({
    activity: z.string().describe("The activity to get moments for"),
  }),
  execute: async ({ activity }) => {
    let { moments } = await api.moments.listAll();

    if (activity) {
      moments = moments.filter((moment) => moment.activity === activity);
    }

    return moments;
  },
});
