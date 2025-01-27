import React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { cn } from "~/lib/utils";

import type { SuggestionItem } from "../utils/create-suggestion";

type CommandListProps = {
  heading: string;
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
};

export type SuggestionListRef = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

export const SuggestionList = React.forwardRef<
  SuggestionListRef,
  CommandListProps
>(function SuggestionList({ heading, items, command }: CommandListProps, ref) {
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
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
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
      <CommandList className="w-auto">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading={heading ?? "Suggestions"}>
          {items.map((item, index) => (
            <CommandItem
              key={index}
              value={item.title}
              onSelect={() => selectItem(index)}
              className={cn("flex flex-col items-start gap-1")}
            >
              <div className="flex items-start gap-2">
                {item.icon && <item.icon className="mt-0.5 h-4 w-4" />}
                <span className="text-sm font-medium">{item.title}</span>
              </div>
              {item.description && (
                <span className="pl-6 text-muted-foreground">
                  {item.description}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
});
