import TiptapSuggestion from "@tiptap/suggestion";
import { CodeIcon, TrendingUpIcon, VideoIcon } from "lucide-react";

import {
  createSuggestion,
  type SuggestionItem,
} from "../utils/create-suggestion";

export const SUGGESTION_ITEMS = [
  {
    title: "Moments",
    description: "Find relevant moments.",
    icon: TrendingUpIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark("slashCommand")
        .insertContent([{ type: "text", text: "/moments" }])
        .unsetMark("slashCommand")
        .run();
    },
  },
  {
    title: "Meetings",
    description: "Find relevant meetings.",
    icon: VideoIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark("slashCommand")
        .insertContent([{ type: "text", text: "/meetings" }])
        .unsetMark("slashCommand")
        .run();
    },
  },
] as const satisfies readonly SuggestionItem[];

export const Suggestion = TiptapSuggestion<SuggestionItem, SuggestionItem>;

export const suggestion = createSuggestion(SUGGESTION_ITEMS, {
  heading: "Commands",
});
