"use client";

import type { ToolInvocation } from "ai";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { ChevronDown, MessageSquare } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import type { ListMeetingsToolOutput } from "~/lib/ai/tools";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

const chatBubbleVariants = cva(
  "group/message relative break-words rounded-lg p-3 text-sm sm:max-w-[70%]",
  {
    variants: {
      isUser: {
        true: "bg-primary",
        false: "bg-muted",
      },
      animation: {
        none: "",
        slide: "duration-300 animate-in fade-in-0",
        scale: "duration-300 animate-in fade-in-0 zoom-in-75",
        fade: "duration-500 animate-in fade-in-0",
      },
    },
    compoundVariants: [
      {
        isUser: true,
        animation: "slide",
        class: "slide-in-from-right",
      },
      {
        isUser: false,
        animation: "slide",
        class: "slide-in-from-left",
      },
      {
        isUser: true,
        animation: "scale",
        class: "origin-bottom-right",
      },
      {
        isUser: false,
        animation: "scale",
        class: "origin-bottom-left",
      },
    ],
  },
);

type Animation = VariantProps<typeof chatBubbleVariants>["animation"];

export interface Message {
  id: string;
  role: "user" | "assistant" | (string & {});
  content: string;
  createdAt?: Date;
  attachments?: File[];
  toolInvocations?: ToolInvocation[];
}

export interface ChatMessageProps extends Message {
  showTimeStamp?: boolean;
  animation?: Animation;
  actions?: React.ReactNode;
}

interface MomentDisplayProps {
  id: string;
  reasoning: string;
  moment: RouterOutputs["moments"]["getOneById"];
}

const MomentDisplay = ({ id, reasoning, moment }: MomentDisplayProps) => {
  return (
    <div className="block space-y-2 p-2">
      <iframe
        src={`/embed/moments/${id}`}
        title={reasoning}
        className="w-full rounded-md"
        onLoad={(e) => {
          const iframe = e.currentTarget;
          const resizeObserver = new ResizeObserver(() => {
            const height =
              iframe.contentWindow?.document.documentElement.scrollHeight;
            if (height && height <= 400) iframe.style.height = `${height}px`;
          });
          if (iframe.contentWindow?.document.documentElement) {
            resizeObserver.observe(
              iframe.contentWindow?.document.documentElement,
            );
          }
        }}
      />
      <p className="text-xs italic text-muted-foreground">{reasoning}</p>
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  createdAt,
  showTimeStamp = false,
  animation = "scale",
  actions,
  toolInvocations,
}) => {
  const isUser = role === "user";
  const [openMoments, setOpenMoments] = useState<Record<string, boolean>>({});

  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const toggleMoment = (id: string) => {
    setOpenMoments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div className={chatBubbleVariants({ isUser, animation })}>
        {role !== "data" && (
          <div
            className={isUser ? "text-primary-foreground" : "text-foreground"}
          >
            <MarkdownRenderer>{content}</MarkdownRenderer>
          </div>
        )}

        {role === "assistant" && actions ? (
          <div className="absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background p-1 opacity-0 transition-opacity group-hover/message:opacity-100">
            {actions}
          </div>
        ) : null}

        {!!toolInvocations?.length && (
          <div className="space-y-2">
            {toolInvocations?.map((toolInvocation) => {
              if (toolInvocation.state !== "result") {
                return (
                  <div
                    key={toolInvocation.toolCallId}
                    className="mt-2 animate-pulse text-sm text-muted-foreground"
                  >
                    Analyzing moment...
                  </div>
                );
              }

              if (toolInvocation.toolName === "displayMoment") {
                const { id, reasoning, moment } = toolInvocation.result as {
                  id: string;
                  reasoning: string;
                  moment: RouterOutputs["moments"]["getOneById"];
                };
                const isOpen = openMoments[id] ?? false;

                return (
                  <Collapsible
                    key={toolInvocation.toolCallId}
                    open={isOpen}
                    onOpenChange={() => toggleMoment(id)}
                    className="min-w-full overflow-hidden rounded-md border border-border/50 bg-background/50"
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex w-full min-w-full items-center justify-between gap-3 p-2 text-left hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-x-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-medium leading-none">
                            {moment.title}
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
                      <MomentDisplay
                        id={id}
                        reasoning={reasoning}
                        moment={moment}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                );
              } else if (toolInvocation.toolName === "listMeetings") {
                const { data } =
                  toolInvocation.result as ListMeetingsToolOutput;
                return (
                  <motion.div className="flex flex-col gap-2">
                    {data?.map((meeting) => (
                      <div key={meeting.video_api_id}>{meeting.name}</div>
                    ))}
                  </motion.div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>

      {showTimeStamp && createdAt ? (
        <span
          className={cn(
            "mt-1 block px-1 text-xs opacity-50",
            animation !== "none" && "duration-500 animate-in fade-in-0",
          )}
        >
          {formattedTime}
        </span>
      ) : null}
    </div>
  );
};
