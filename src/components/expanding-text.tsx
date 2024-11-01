"use client";

import { /* AnimatePresence, */ motion } from "framer-motion";

/*
import { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
*/
import { cn } from "~/lib/utils";

type ExpandingTextProps = {
  text: string;
  className?: string;
  containerProps?: React.ComponentProps<typeof motion.div>;
};

export function ExpandingText({
  text,
  className,
  containerProps,
}: ExpandingTextProps) {
  /*
  const [didInitialize, setDidInitialize] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const handleTextRef = (node: HTMLParagraphElement) => {
    if (!node || didInitialize) return;
    setDidInitialize(true);
    const lineHeight = parseInt(getComputedStyle(node).lineHeight);
    const height = node.offsetHeight;
    const isExpandable = height > lineHeight * 3;
    setIsExpandable(isExpandable);
    if (isExpandable) setIsExpanded(false);
  };

  const toggleExpand = () => {
    if (isExpandable) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      <TooltipProvider
        key={isExpanded ? "expanded" : "collapsed"}
        delayDuration={0}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ height: "3.75rem" }}
              animate={{ height: isExpanded ? "auto" : "3.75rem" }}
              exit={{ height: "3.75rem" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              {...containerProps}
              className={cn("overflow-hidden", containerProps?.className)}
            >
              <div className="group flex flex-col">
                <p
                  ref={handleTextRef}
                  onClick={toggleExpand}
                  className={cn(
                    "text-sm text-muted-foreground",
                    isExpandable &&
                      "cursor-pointer group-hover:text-foreground/80",
                    className,
                  )}
                >
                  {text}
                  {isExpandable && !isExpanded && (
                    <>
                      {" "}
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                        className="inline-block animate-pulse"
                      >
                        ↑
                      </motion.span>
                    </>
                  )}
                  {isExpandable && isExpanded && (
                    <>
                      {" "}
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                        className="inline-block animate-pulse"
                      >
                        ↑
                      </motion.span>
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          </TooltipTrigger>
          {isExpandable && (
            <TooltipContent
              sideOffset={12}
              className="border border-border bg-accent"
            >
              Click to {isExpanded ? "collapse" : "expand"}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </AnimatePresence>
  );
  */

  return (
    <motion.div {...containerProps}>
      <p className={cn("text-sm text-muted-foreground", className)}>{text}</p>
    </motion.div>
  );
}
