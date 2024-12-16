"use client";

import type { ToolInvocation } from "ai";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { TrendingUpDownIcon, TrendingUpIcon, VideoIcon } from "lucide-react";
import type React from "react";

import { CollapsibleSection } from "~/components/chat/collapsible-section";
import { LoadingIndicator } from "~/components/chat/loading-indicator";
import { ChatMeetingList } from "~/components/chat/meeting-list";
import { MomentDisplay } from "~/components/chat/moment-display";
import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import type {
  ListMeetingsToolOutput,
  SearchMomentsToolOutput,
} from "~/lib/ai/tools";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

import { ChatMomentList } from "../chat/moment-list";

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
  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          chatBubbleVariants({ isUser, animation }),
          toolInvocations?.length && "sm:w-[50%]",
        )}
      >
        {role !== "data" && (
          <div
            className={isUser ? "text-primary-foreground" : "text-foreground"}
          >
            <MarkdownRenderer>
              {content.replace(/^.*<context>.*<\/context>.*---\n\n/s, "")}
            </MarkdownRenderer>
          </div>
        )}

        {role === "assistant" && actions ? (
          <div className="absolute -bottom-4 right-2 flex space-x-1 rounded-lg border bg-background p-1 opacity-0 transition-opacity group-hover/message:opacity-100">
            {actions}
          </div>
        ) : null}

        {!!toolInvocations?.length && (
          <div className="min-w-full space-y-2">
            {toolInvocations?.map((toolInvocation) => {
              if (toolInvocation.state !== "result") {
                return (
                  <LoadingIndicator
                    key={toolInvocation.toolCallId}
                    message={
                      toolInvocation.toolName === "displayMoment"
                        ? "Analyzing moment..."
                        : "Processing..."
                    }
                  />
                );
              }

              if (toolInvocation.toolName === "displayMoment") {
                const { id, reasoning, moment } = toolInvocation.result as {
                  id: string;
                  reasoning: string;
                  moment: RouterOutputs["moments"]["getOneById"];
                };

                if (!moment) {
                  return null;
                }

                return (
                  <CollapsibleSection
                    key={toolInvocation.toolCallId}
                    title={moment.title}
                    icon={TrendingUpIcon}
                    args={toolInvocation.args}
                  >
                    <MomentDisplay id={id} reasoning={reasoning} />
                  </CollapsibleSection>
                );
              }

              if (toolInvocation.toolName === "listMeetings") {
                const { data } =
                  toolInvocation.result as ListMeetingsToolOutput;

                return (
                  <CollapsibleSection
                    key={toolInvocation.toolCallId}
                    title="Found Meetings"
                    icon={VideoIcon}
                    count={data?.length ?? 0}
                    args={toolInvocation.args}
                  >
                    <ChatMeetingList meetings={data} />
                  </CollapsibleSection>
                );
              }

              if (toolInvocation.toolName === "searchMoments") {
                const { results } =
                  toolInvocation.result as SearchMomentsToolOutput;

                return (
                  <CollapsibleSection
                    key={toolInvocation.toolCallId}
                    title="Found Moments"
                    icon={TrendingUpDownIcon}
                    count={results?.length ?? 0}
                    args={toolInvocation.args}
                  >
                    <ChatMomentList moments={results} />
                  </CollapsibleSection>
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
