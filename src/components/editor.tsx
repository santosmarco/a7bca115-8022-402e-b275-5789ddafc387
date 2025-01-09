"use client";

import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type * as React from "react";
import type { Except } from "type-fest";

import { coachingFrameworkSuggestion } from "~/lib/editor/extensions/coaching-framework-suggestion";
import { Mentions } from "~/lib/editor/extensions/mentions";
import { SlashCommands } from "~/lib/editor/extensions/slash-commands";
import { suggestion as slashCommandSuggestion } from "~/lib/editor/extensions/suggestion";
import { MentionMark } from "~/lib/editor/marks/mention-mark";
import { SlashCommandMark } from "~/lib/editor/marks/slash-command-mark";
import type { Tables } from "~/lib/supabase/database.types";
import { cn } from "~/lib/utils";

type EditorProps = Except<
  React.ComponentProps<typeof EditorContent>,
  "editor" | "onChange"
> & {
  frameworks: Tables<"coaching_frameworks">[];
  onChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onSubmit: (event?: { preventDefault?: () => void }) => void;
};

export function Editor({
  onChange,
  onSubmit,
  frameworks,
  className,
  disabled,
  ...props
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Ask AI, or press '/' for commands, '@' for frameworks...",
      }),
      SlashCommandMark,
      MentionMark,
      SlashCommands.configure({
        suggestion: slashCommandSuggestion,
      }),
      Mentions.configure({
        suggestion: coachingFrameworkSuggestion(frameworks),
      }),
    ],
    content: "",
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm min-h-[74px] min-w-full grow resize-none rounded-xl border border-input bg-background p-3 pl-4 pr-24 ring-offset-background transition-[border] focus:outline-none focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-gray-400 [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
          className,
        ),
      },
      handleKeyDown(view, event) {
        // Only handle Enter without shift and when not in slash command mode
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !/(?:\/|@)[a-zA-Z0-9]*$/.test(view.state.doc.textContent)
        ) {
          onSubmit(event);
          // Clear editor content after submission
          view.dispatch(view.state.tr.delete(0, view.state.doc.content.size));
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange({
        target: { value: editor.getText() },
      } as React.ChangeEvent<HTMLInputElement>);
    },
  });

  return (
    <EditorContent
      editor={editor}
      className="min-w-full"
      disabled={disabled}
      {...props}
    />
  );
}
