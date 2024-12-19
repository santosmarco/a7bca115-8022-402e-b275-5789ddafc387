import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions as TiptapSuggestionOptions } from "@tiptap/suggestion";
import TiptapSuggestion from "@tiptap/suggestion";
import {
  CodeIcon,
  type LucideIcon,
  TrendingUpIcon,
  VideoIcon,
} from "lucide-react";
import React from "react";
import tippy from "tippy.js";
import type { Except } from "type-fest";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";

export type SuggestionItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  command: NonNullable<SuggestionOptions["command"]>;
};

export type SuggestionOptions = TiptapSuggestionOptions<
  SuggestionItem,
  SuggestionItem
>;

type CommandListProps = {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
};

type SuggestionListRef = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

const SuggestionList = React.forwardRef<SuggestionListRef, CommandListProps>(
  function SuggestionList({ items, command }: CommandListProps, ref) {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    React.useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = React.useCallback(
      (index: number) => {
        const item = items[index];
        if (item) command(item);
      },
      [items, command],
    );

    const handleKeyDown = React.useCallback(
      (event: KeyboardEvent): boolean => {
        const keyHandlers: Record<string, () => boolean> = {
          ArrowUp: () => {
            setSelectedIndex(
              (prev) => (prev + items.length - 1) % items.length,
            );
            return true;
          },
          ArrowDown: () => {
            setSelectedIndex((prev) => (prev + 1) % items.length);
            return true;
          },
          Enter: () => {
            selectItem(selectedIndex);
            return true;
          },
        };

        return keyHandlers[event.key]?.() ?? false;
      },
      [items.length, selectItem, selectedIndex],
    );

    React.useImperativeHandle(ref, () => ({ onKeyDown: handleKeyDown }));

    return (
      <Command
        ref={undefined}
        value={items[selectedIndex]?.title}
        className="border border-border"
      >
        <CommandList className="min-w-64">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {items.map((item, index) => (
              <CommandItem
                key={index}
                value={item.title}
                onSelect={() => selectItem(index)}
                className={cn("flex flex-col items-start gap-1")}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <span className="text-muted-foreground">
                  {item.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    );
  },
);

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
  {
    title: "Framework",
    description: "Execute a framework.",
    icon: CodeIcon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setMark("slashCommand")
        .insertContent([{ type: "text", text: "/framework" }])
        .unsetMark("slashCommand")
        .run();
    },
  },
] as const satisfies readonly SuggestionItem[];

export const Suggestion = TiptapSuggestion<SuggestionItem, SuggestionItem>;

export const suggestion = {
  items: ({ query }) => {
    const normalizedQuery = query.trim().toLowerCase();
    return SUGGESTION_ITEMS.filter((item) =>
      item.title.toLowerCase().startsWith(normalizedQuery),
    );
  },

  render: () => {
    let component: ReactRenderer<
      SuggestionListRef,
      React.ComponentProps<typeof SuggestionList>
    > | null = null;
    let popup: ReturnType<typeof tippy>[number] | null = null;

    const getClientRect = (props: {
      clientRect?: (() => DOMRect | null) | null;
    }) => {
      const rect = props.clientRect?.();
      return rect ?? new DOMRect();
    };

    return {
      onStart: (props) => {
        component = new ReactRenderer(SuggestionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect?.()) return;

        popup = tippy(document.body, {
          getReferenceClientRect: () => getClientRect(props),
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "auto-start",
        });
      },

      onUpdate(props) {
        component?.updateProps(props);
        popup?.setProps({
          getReferenceClientRect: () => getClientRect(props),
        });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup?.hide();
          return true;
        }
        return component?.ref?.onKeyDown(props.event) ?? false;
      },

      onExit() {
        popup?.destroy();
        component?.destroy();
      },
    };
  },
} satisfies Except<SuggestionOptions, "editor">;
