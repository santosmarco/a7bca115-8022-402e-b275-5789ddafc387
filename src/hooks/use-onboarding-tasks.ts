"use client";

import { toast } from "sonner";

import { logger } from "~/lib/logging/client";
import type { Enums } from "~/lib/supabase/database.types";
import { api } from "~/trpc/react";

import { useProfile } from "./use-profile";

export function useOnboardingTasks() {
  const utils = api.useUtils();
  const { data: user } = api.auth.getUser.useQuery();
  const { profile } = useProfile();

  const { mutateAsync: completeTask } =
    api.onboarding.completeTask.useMutation();

  const { data: tasks } = api.onboarding.getTaskList.useQuery(
    { profileId: profile?.id ?? "" },
    { enabled: !!profile },
  );

  const isTaskCompleted = (taskName: Enums<"onboarding_task_name_enum">) => {
    return (
      tasks?.some((task) => task.name === taskName && task.completed) ?? false
    );
  };

  const handleCompleteTask = async (
    taskName: Enums<"onboarding_task_name_enum">,
  ) => {
    if (!user) return;

    try {
      const completedTask = await completeTask({
        userId: user.id,
        taskName,
      });
      void utils.onboarding.getTaskList.invalidate();
      if (completedTask.isNew) {
        toast.success("Task completed!");
      }
      return completedTask;
    } catch (error) {
      logger.error("Failed to complete task", { error });
      toast.error("Failed to complete task");
    }
  };

  return {
    tasks,
    isTaskCompleted,
    completeTask: handleCompleteTask,
    isLoading: !tasks,
  } as const;
}
