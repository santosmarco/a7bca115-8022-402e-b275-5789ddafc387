"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

import { ProgressCircle } from "./progress-circle";

export type LockScreenOverlayProps = {
  progress: {
    completedMeetings: number;
    requiredMeetings: number;
  };
};

export function LockScreenOverlay({ progress }: LockScreenOverlayProps) {
  const [open, setOpen] = useState(true);

  const percentage =
    (progress.completedMeetings / progress.requiredMeetings) * 100;

  const shouldShowLockScreen = percentage < 100 && open;

  return (
    <>
      <AnimatePresence>
        {shouldShowLockScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-0 left-64 right-0 top-0 z-50"
            onClick={() => setOpen(false)}
          >
            {/* Backdrop with blur effect */}
            <div
              className="absolute inset-0 bg-background/10 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative flex h-full items-start justify-center p-4 pt-56">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md space-y-8 rounded-xl border bg-background/50 p-8 text-center shadow-lg backdrop-blur-md"
              >
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Insights Access Locked
                  </h1>
                  <p className="text-pretty text-muted-foreground">
                    Complete {progress.requiredMeetings} meetings to unlock the
                    insights feature
                  </p>
                </div>

                <div className="relative mx-auto">
                  <ProgressCircle progress={percentage}>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold">
                        {progress.completedMeetings}/{progress.requiredMeetings}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        meetings completed
                      </div>
                    </div>
                  </ProgressCircle>

                  <motion.div
                    className="absolute bottom-0 left-1/2 -ml-4 -translate-x-1/2 transform"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {percentage >= 100 ? (
                      <Unlock className="h-8 w-8 text-primary" />
                    ) : (
                      <Lock className="h-8 w-8 text-primary" />
                    )}
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <p className="text-pretty px-4 text-sm text-muted-foreground">
                    Keep going! Each meeting brings you closer to unlocking
                    insights functionality.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center text-sm">
                      <div className="mr-2 h-3 w-3 rounded-full bg-primary" />
                      <span>{progress.completedMeetings} Completed</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="mr-2 h-3 w-3 rounded-full bg-primary/20" />
                      <span>
                        {progress.requiredMeetings - progress.completedMeetings}{" "}
                        Remaining
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!shouldShowLockScreen && (
        <div
          className="pointer-events-none fixed bottom-0 left-64 right-0 top-0 z-50"
          onClick={() => setOpen(true)}
        />
      )}
    </>
  );
}
