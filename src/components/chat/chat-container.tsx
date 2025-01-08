"use client";

import { cn } from "~/lib/utils";

import { LockScreenOverlay } from "../lock-screen-overlay";

export type ChatContainerProps = {
  children: React.ReactNode;
  progress: {
    completedMeetings: number;
    requiredMeetings: number;
  };
  open: boolean;
  onClose: () => void;
};

export function ChatContainer({
  children,
  progress,
  open,
  onClose,
}: ChatContainerProps) {
  return (
    <div className="relative h-full w-full" aria-hidden={open}>
      {/* Chat content */}
      <div className={cn(open && "pointer-events-none blur-sm filter")}>
        {children}
      </div>

      {/* Lock screen overlay */}
      <LockScreenOverlay progress={progress} open={open} onClose={onClose} />
    </div>
  );
}
