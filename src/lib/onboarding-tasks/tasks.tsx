import type { Enums } from "../supabase/database.types";

export type TaskSpec = {
  name: Enums<"onboarding_task_name_enum">;
  title: React.ReactNode;
  description: React.ReactNode;
};

const _taskRecord = {
  explore_team_conflict_chat: {
    name: "explore_team_conflict_chat",
    title: "Explore Team Conflict Chat",
    description:
      'Go to your Insights chats, select "Team Conflict", and write a message.',
  },
  explore_feedback_chat: {
    name: "explore_feedback_chat",
    title: "Explore Feedback Chat",
    description:
      'Go to your Insights chats, select "Feedback", and write a message.',
  },
  explore_discovery_chat: {
    name: "explore_discovery_chat",
    title: "Explore Discovery Chat",
    description:
      "Go to your Insights chats and write a message on the freeform input field.",
  },
  ask_follow_up: {
    name: "ask_follow_up",
    title: "Ask a follow up question",
    description: "Ask a follow up question on any chat.",
  },
  watch_moment: {
    name: "watch_moment",
    title: "Watch a moment",
    description: "Watch a moment from your moments list.",
  },
  use_moments_command: {
    name: "use_moments_command",
    title: "Use the /moments command",
    description:
      "Use the /moments command to load specific moments or meetings into the chat.",
  },
  reset_chat: {
    name: "reset_chat",
    title: "Reset the chat",
    description: 'Reset the chat by clicking the "Reset" button.',
  },
} satisfies Record<Enums<"onboarding_task_name_enum">, TaskSpec>;

export const onboardingTasks = Object.values(_taskRecord);
