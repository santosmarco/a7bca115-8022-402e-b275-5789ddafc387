import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from "@tiptap/core";

import { cn } from "~/lib/utils";

export type SlashCommandMarkOptions = {
  HTMLAttributes: Record<string, unknown>;
};

export const SlashCommandMark = Mark.create<SlashCommandMarkOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      HTMLAttributes: {
        class: cn("rounded-sm border border-accent bg-accent px-1"),
      },
    };
  },

  parseHTML() {
    return [{ tag: "slash-command" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addInputRules() {
    return [
      markInputRule({
        find: /^\/[a-zA-Z0-9]+$/,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /^\/[a-zA-Z0-9]+$/g,
        type: this.type,
      }),
    ];
  },
});
