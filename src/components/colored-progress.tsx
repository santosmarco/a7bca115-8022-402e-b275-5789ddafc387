import React from "react";
import { cn } from "../lib/utils";

type ColoredProgressProps = {
  duration: number;
  emotions: Emotion[];
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const emotionColors: Record<string, string> = {
  "Constructive Friction in Partnerships": "bg-yellow-400",
  "Coaching Needs During Growth Stages": "bg-green-400",
  "Networking Opportunities with Endeavor": "bg-blue-400",
  "Speaking Engagements for Coaches": "bg-purple-400",
  "Trust Dynamics in Founder-Investor Relationships": "bg-red-400",
};

export function ColoredProgress({
  duration,
  emotions,
  className,
  onClick,
}: ColoredProgressProps) {
  return (
    <div
      className={cn("flex h-full w-full cursor-pointer", className)}
      onClick={onClick}
    >
      {emotions.map((emotion) => {
        const startPercentage =
          (emotion.segment_start_timestamp_in_seconds / duration) * 100;
        const endPercentage =
          (emotion.segment_end_timestamp_in_seconds / duration) * 100;
        const width = endPercentage - startPercentage;
        console.log({ startPercentage, endPercentage, width });

        return (
          <div
            key={emotion.sequence_id}
            className={cn(
              "h-full",
              emotionColors[emotion.title] || "bg-gray-400",
            )}
            style={{
              width: `${50}%`,
              marginLeft: `${startPercentage}%`,
            }}
          />
        );
      })}
    </div>
  );
}
