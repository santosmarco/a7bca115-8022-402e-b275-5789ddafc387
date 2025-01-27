import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";

import type { SuggestionOptions } from "../utils/create-suggestion";
import { Suggestion } from "./suggestion";

export type MentionsOptions = {
  suggestion: Partial<SuggestionOptions>;
};

export const Mentions = Extension.create<MentionsOptions, never>({
  name: "mentions",

  addOptions() {
    return {
      suggestion: {
        char: "@",
        startOfLine: false,
        command: ({ editor, range, props }) => {
          props.command({ editor, range, props });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey("mentions-suggestion"),
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
