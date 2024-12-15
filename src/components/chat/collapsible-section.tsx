import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { cn } from "~/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  icon: React.ElementType;
  count?: number;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  count,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "min-w-full overflow-hidden rounded-md border border-border/50 bg-background/50",
        className,
      )}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full min-w-full items-center justify-between gap-3 p-2 text-left hover:bg-accent/50"
        >
          <div className="flex items-center gap-x-2">
            <Icon className="h-4 w-4 text-primary" />
            <span className="font-medium leading-none">
              {title}
              {count !== undefined && (
                <span className="ml-1.5 text-xs leading-none text-muted-foreground">
                  ({count})
                </span>
              )}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-2"
        >
          {children}
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
