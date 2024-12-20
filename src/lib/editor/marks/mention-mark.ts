import {
  Mark,
  markInputRule,
  markPasteRule,
  mergeAttributes,
} from "@tiptap/core";

import { cn } from "~/lib/utils";

export type MentionMarkOptions = {
  HTMLAttributes: Record<string, unknown>;
};

export const MentionMark = Mark.create<MentionMarkOptions>({
  name: "mention",

  addOptions() {
    return {
      HTMLAttributes: {
        class: cn("rounded-sm border border-border px-1"),
      },
    };
  },

  parseHTML() {
    return [{ tag: "mention" }];
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
        find: /^@[a-zA-Z0-9]+$/,
        type: this.type,
      }),
    ];
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /^@[a-zA-Z0-9]+$/g,
        type: this.type,
      }),
    ];
  },
});
