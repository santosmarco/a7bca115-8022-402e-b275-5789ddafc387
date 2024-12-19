import type { Editor } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions as TiptapSuggestionOptions } from "@tiptap/suggestion";
import type { LucideIcon } from "lucide-react";
import tippy from "tippy.js";
import type { Except } from "type-fest";

import {
  SuggestionList,
  type SuggestionListRef,
} from "../components/suggestion-list";

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

export type SuggestionProps = {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
  editor: Editor;
  clientRect?: (() => DOMRect | null) | null;
  event?: KeyboardEvent;
};

export function createSuggestion(
  items: readonly SuggestionItem[],
  config: {
    heading: string;
  },
) {
  return {
    items: ({ query }: { query: string }) => {
      const normalizedQuery = query.trim().toLowerCase();
      return items.filter((item) =>
        item.title.toLowerCase().startsWith(normalizedQuery),
      );
    },

    render: () => {
      let component: ReactRenderer<
        React.ComponentRef<typeof SuggestionList>,
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
        onStart(props) {
          component = new ReactRenderer(SuggestionList, {
            props: {
              ...props,
              heading: config.heading,
            },
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
            placement: "top-start",
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

          const ref = component?.ref as SuggestionListRef | undefined;
          return ref?.onKeyDown(props.event) ?? false;
        },

        onExit() {
          popup?.destroy();
          component?.destroy();
        },
      };
    },
  } satisfies Except<SuggestionOptions, "editor">;
}
