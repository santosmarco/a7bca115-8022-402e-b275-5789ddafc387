import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";

import type { SuggestionOptions } from "../utils/create-suggestion";
import { Suggestion } from "./suggestion";

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
        pluginKey: new PluginKey("slash-commands-suggestion"),
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
