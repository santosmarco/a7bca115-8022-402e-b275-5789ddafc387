"use client";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, Loader2, MicIcon, Video } from "lucide-react";
import { useEffect, useState } from "react";

import { AddLiveMeetingDialog } from "~/components/meetings/add-live-meeting-dialog";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import type { Tables } from "~/lib/supabase/database.types";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

dayjs.extend(duration);

const loadingStates = [
  "Preparing bot...",
  "Warming up circuits...",
  "Calibrating microphone...",
  "Establishing connection...",
  "Almost ready...",
  "Bot joining...",
];

type LiveMeetingStatusProps = {
  user: RouterOutputs["auth"]["getUser"];
  events: Tables<"calendar_event_details_v2">[];
  isLoading?: boolean;
  canJoinMeeting?: boolean;
  shouldShowOnMobile?: boolean;
};

export function LiveMeetingStatus({
  user,
  events,
  isLoading,
  canJoinMeeting = true,
  shouldShowOnMobile = true,
}: LiveMeetingStatusProps) {
  const [currentEvent, setCurrentEvent] =
    useState<Tables<"calendar_event_details_v2"> | null>(null);
  const [nextEvent, setNextEvent] =
    useState<Tables<"calendar_event_details_v2"> | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddButtonLoading, setIsAddButtonLoading] = useState(false);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAddButtonLoading) {
      interval = setInterval(() => {
        setLoadingStateIndex((prev) => {
          // If we're about to repeat phrases, stop loading
          if (prev >= loadingStates.length - 1) {
            setIsAddButtonLoading(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setLoadingStateIndex(0);
    };
  }, [isAddButtonLoading]);

  useEffect(() => {
    const updateEvents = () => {
      const now = dayjs();

      // Find current event
      const current = events.find((event) => {
        const start = dayjs(event.start_time);
        const end = dayjs(event.end_time);
        return now >= start && now <= end;
      });

      // Find next event
      const next = events.find((event) => {
        const start = dayjs(event.start_time);
        return now < start;
      });

      setCurrentEvent(current ?? null);
      setNextEvent(next ?? null);
    };

    updateEvents();
    const interval = setInterval(updateEvents, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [events]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = dayjs();
      const target = currentEvent
        ? dayjs(currentEvent.end_time) // Time left in current meeting
        : nextEvent
          ? dayjs(nextEvent.start_time) // Time until next meeting
          : null;

      if (!target) {
        setTimeLeft("");
        return;
      }

      const duration = dayjs.duration(target.diff(now));
      const hours = duration.hours();
      const minutes = duration.minutes();

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentEvent, nextEvent]);

  const meetingSummary =
    currentEvent?.summary ?? nextEvent?.summary ?? "Next Meeting";
  const meetingUrl = currentEvent?.meeting_url ?? nextEvent?.meeting_url;
  const startDateTime = currentEvent?.start_time ?? nextEvent?.start_time ?? "";
  const endDateTime = currentEvent?.end_time ?? nextEvent?.end_time ?? "";

  if (isLoading) {
    return (
      <Card
        className={cn(
          "mx-4 mt-20 lg:my-4",
          shouldShowOnMobile ? "block" : "hidden",
        )}
      >
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <div
        className={cn(
          "mx-4 mt-20 space-y-3 lg:my-4 lg:block",
          shouldShowOnMobile ? "block" : "hidden",
        )}
      >
        <Card className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent ? "current" : "next"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              <div className="items-between flex flex-col justify-center gap-y-2 p-4">
                <h2 className="flex items-center gap-1.5 truncate text-sm font-medium">
                  <Video className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{meetingSummary}</span>
                </h2>
                <div className="flex items-center justify-between">
                  {currentEvent || nextEvent ? (
                    <p className="text-xs text-muted-foreground">
                      {dayjs(startDateTime).format("HH:mm")}
                      {" - "}
                      {dayjs(endDateTime).format("HH:mm")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No upcoming meetings
                    </p>
                  )}
                  {timeLeft && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex shrink-0 items-center gap-1 pl-2 text-xs text-muted-foreground"
                    >
                      <Clock className="h-3 w-3" />
                      <span>
                        {currentEvent ? "Ends in" : "in"} {timeLeft}
                      </span>
                    </motion.div>
                  )}
                </div>

                {!meetingUrl && canJoinMeeting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-2"
                  >
                    <Button
                      className="w-full gap-2"
                      size="sm"
                      onClick={() => window.open(meetingUrl, "_blank")}
                    >
                      Join Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Animated gradient background */}
              <motion.div
                className={cn(
                  "absolute inset-0 -z-10 opacity-25",
                  currentEvent ? "bg-primary/10" : "bg-muted",
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
              />
            </motion.div>
          </AnimatePresence>
        </Card>

        {canJoinMeeting && (
          <Button
            variant="outline"
            size="sm"
            className="relative w-full overflow-hidden"
            onClick={() => setIsDialogOpen(true)}
            disabled={isAddButtonLoading}
          >
            <motion.div
              className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"
              animate={{
                x: ["0%", "100%"],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            {isAddButtonLoading ? (
              <div className="flex w-full items-center justify-between">
                <Loader2 className="h-4 w-4 animate-spin" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingStateIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 text-center"
                  >
                    {loadingStates[loadingStateIndex]}
                  </motion.span>
                </AnimatePresence>
                <div className="h-4 w-4" /> {/* Spacer to balance the loader */}
              </div>
            ) : (
              <>
                <MicIcon className="h-4 w-4" />
                Add to Live Meeting
              </>
            )}
          </Button>
        )}
      </div>

      <AddLiveMeetingDialog
        user={user}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          setIsAddButtonLoading(true);
        }}
      />
    </>
  );
}
