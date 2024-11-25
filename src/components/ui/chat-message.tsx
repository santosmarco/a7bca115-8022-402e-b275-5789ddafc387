"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

import { MarkdownRenderer } from "~/components/ui/markdown-renderer";
import { cn } from "~/lib/utils";

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
}) => {
  const isUser = role === "user";

  const formattedTime = createdAt?.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

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

        {role === "data" &&
          (() => {
            const { title, momentId, subtitle } = JSON.parse(content) as {
              title: string;
              momentId: string;
              subtitle: string;
            };

            return (
              <>
                <div
                  className={
                    isUser ? "text-primary-foreground" : "text-foreground"
                  }
                >
                  <MarkdownRenderer>{`### ${title}`}</MarkdownRenderer>
                </div>

                <iframe
                  src={`/embed/moments/${momentId}`}
                  title={title}
                  className="my-2 w-full rounded-md"
                  onLoad={(e) => {
                    const iframe = e.currentTarget;
                    const resizeObserver = new ResizeObserver(() => {
                      const height =
                        iframe.contentWindow?.document.documentElement
                          .scrollHeight;
                      if (height) iframe.style.height = `${height}px`;
                    });
                    if (iframe.contentWindow?.document.documentElement) {
                      resizeObserver.observe(
                        iframe.contentWindow?.document.documentElement,
                      );
                    }
                  }}
                />

                <div className="text-xs italic text-muted-foreground">
                  {subtitle}
                </div>
              </>
            );
          })()}
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
