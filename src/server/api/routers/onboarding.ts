import _ from "lodash";
import { z } from "zod";

import { onboardingTasks } from "~/lib/onboarding-tasks/tasks";
import type { Enums } from "~/lib/supabase/database.types";
import { createClient } from "~/lib/supabase/server";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const onboardingRouter = createTRPCRouter({
  getTaskList: publicProcedure
    .input(
      z.object({
        profileId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClient();

      const { data: taskCompletions } = await supabase
        .from("onboarding_task_completions")
        .select("*")
        .eq("profile_id", input.profileId);

      return _.sortBy(
        onboardingTasks.map((task) => ({
          ...task,
          completed: taskCompletions?.some(
            (completion) => completion.task_name === task.name,
          ),
        })),
        (task) => task.completed,
      );
    }),

  completeTask: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        taskName: z.custom<Enums<"onboarding_task_name_enum">>(),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();

      const { data: existingTaskCompletion } = await supabase
        .from("onboarding_task_completions")
        .select("*")
        .eq("profile_id", input.userId)
        .eq("task_name", input.taskName)
        .maybeSingle();

      if (existingTaskCompletion) {
        return existingTaskCompletion;
      }

      const { data: newTaskCompletion } = await supabase
        .from("onboarding_task_completions")
        .insert({
          profile_id: input.userId,
          task_name: input.taskName,
        })
        .select("*");

      return newTaskCompletion;
    }),
});
