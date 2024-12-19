import { Extension } from "@tiptap/core";

import { Suggestion, type SuggestionOptions } from "./suggestion";

export type SlashCommandsOptions = {
  suggestion: Partial<SuggestionOptions>;
};

export const SlashCommands = Extension.create<SlashCommandsOptions, never>({
  name: "slash-commands",

  addOptions() {
    return {
      suggestion: {
        char: "/",
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
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
