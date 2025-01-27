import TiptapSuggestion from "@tiptap/suggestion";

import { createLucideIcon } from "~/components/icons";
import type { Tables } from "~/lib/supabase/database.types";

import {
  createSuggestion,
  type SuggestionItem,
} from "../utils/create-suggestion";

export const CoachingFrameworkSuggestion = TiptapSuggestion<
  SuggestionItem,
  SuggestionItem
>;

export const coachingFrameworkToSuggestionItem = (
  framework: Tables<"coaching_frameworks">,
) =>
  ({
    title: framework.title,
    description: framework.description,
    icon: framework.icon && createLucideIcon(framework.icon),
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark("mention")
        .insertContent(`@${framework.title}`)
        .unsetMark("mention")
        .insertContent({ type: "text", text: " " })
        .run();
    },
  }) satisfies SuggestionItem;

export const coachingFrameworkSuggestion = (
  frameworks: Tables<"coaching_frameworks">[],
) =>
  createSuggestion(frameworks.map(coachingFrameworkToSuggestionItem), {
    heading: "Frameworks",
  });
