"use client";

import { cn } from "~/lib/utils";

import { LockScreenOverlay } from "../lock-screen-overlay";

export type ChatContainerProps = {
  children: React.ReactNode;
  progress: {
    completedMeetings: number;
    requiredMeetings: number;
  };
};

export function ChatContainer({ children, progress }: ChatContainerProps) {
  return (
    <div
      className="relative h-full w-full"
      aria-hidden={progress.completedMeetings < progress.requiredMeetings}
    >
      {/* Chat content */}
      <div
        className={cn(
          progress.completedMeetings < progress.requiredMeetings &&
            "pointer-events-none",
        )}
      >
        {children}
      </div>

      {/* Lock screen overlay */}
      <LockScreenOverlay progress={progress} />
    </div>
  );
}
