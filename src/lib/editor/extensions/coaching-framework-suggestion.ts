import TiptapSuggestion from "@tiptap/suggestion";
import {
  BrainIcon,
  CompassIcon,
  GoalIcon,
  // Import other icons as needed
} from "lucide-react";

import {
  createSuggestion,
  type SuggestionItem,
} from "../utils/create-suggestion";

export const COACHING_FRAMEWORK_ITEMS = [
  {
    title: "GROW",
    description: "Goal, Reality, Options, Way Forward",
    icon: GoalIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark("mention")
        .insertContent([{ type: "text", text: "@GROW" }])
        .unsetMark("mention")
        .run();
    },
  },
  // Add other coaching frameworks here
] as const satisfies readonly SuggestionItem[];

export const CoachingFrameworkSuggestion = TiptapSuggestion<
  SuggestionItem,
  SuggestionItem
>;

export const coachingFrameworkSuggestion = createSuggestion(
  COACHING_FRAMEWORK_ITEMS,
  {
    heading: "Frameworks",
  },
);
