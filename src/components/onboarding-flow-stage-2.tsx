"use client";

import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import * as React from "react";

import { Button } from "~/components/ui/button";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/react";

export type OnboardingStep = {
  title: React.ReactNode;
  description: React.ReactNode;
  gifUrl?: string;
};

interface OnboardingFlowStage2Props {
  user: RouterOutputs["auth"]["getUser"];
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to Your Explore Chat",
    description:
      "Uncover insights and tackle blind spots in your moments and meetings. Explore chats for Decision Making, Delegation, Emotions, Feedback, Goals, and Team Conflict, or let the Coach guide you through it all. Just start chatting to see the magic.",
    gifUrl: "/onboarding/stage-2/step-1.gif",
  },
  {
    title: "Commands in Explore Chat",
    description: (
      <>
        <div>
          Quickly load specific moments with slash commands like{" "}
          <span className="rounded-sm bg-accent px-1 py-0.5 text-foreground/80 transition-all">
            /moments
          </span>{" "}
          or{" "}
          <span className="rounded-sm bg-accent px-1 py-0.5 text-foreground/80 transition-all">
            /meetings
          </span>
          . Analyze them using frameworks with the{" "}
          <span className="rounded-sm bg-accent px-1 py-0.5 text-foreground/80 transition-all">
            @framework
          </span>{" "}
          command!
        </div>
        <div>
          <strong>Pro Tip:</strong> Use your arrow keys and Tab for
          autocomplete.
        </div>
      </>
    ),
    gifUrl: "/onboarding/stage-2/step-2.gif",
  },
  {
    title: "Start Exploring",
    description:
      "Jump into moments by clicking on them and see for yourself. Want a fresh start? You can [Reset] the chat anytime. Your insights chat grows smarter with every meeting you provide.",
    gifUrl: "/onboarding/stage-2/step-3.gif",
  },
];

export function OnboardingFlowStage2({ user }: OnboardingFlowStage2Props) {
  const [currentStepIdx, setCurrentStepIdx] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(
    () => user.did_complete_post_ten_meeting_onboarding,
  );

  const apiUtils = api.useUtils();
  const { mutate: completePostTenMeetingOnboarding } =
    api.auth.completePostTenMeetingOnboarding.useMutation({
      onSuccess: () => {
        void apiUtils.auth.getUser.invalidate();
      },
    });

  const nextStep = async () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else if (currentStepIdx === steps.length - 1) {
      void fireConfetti(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      void fireConfetti(0.2, {
        spread: 60,
      });
      void fireConfetti(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      void fireConfetti(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      void fireConfetti(0.1, {
        spread: 120,
        startVelocity: 45,
      });
      setIsComplete(true);
      completePostTenMeetingOnboarding({ userId: user.id });
    }
  };

  const previousStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  const currentStep = steps[currentStepIdx];

  if (!currentStep) return null;

  return (
    <AnimatePresence mode="wait">
      {!isComplete ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl rounded-lg border border-border bg-card/50 p-6 shadow-lg backdrop-blur-3xl"
          >
            <div className="flex flex-col items-center gap-6 bg-background/50 text-center backdrop-blur-3xl">
              <div>
                {typeof user.user_metadata.avatar_url === "string" ? (
                  <div className="-mt-20 h-20 w-20 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center"
                >
                  <h2 className="mb-20 px-8 text-3xl font-bold">
                    {currentStep.title}
                  </h2>

                  {currentStep.gifUrl && (
                    <div className="aspect-video relative mb-14 overflow-hidden rounded-xl border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentStep.gifUrl}
                        alt={`Tutorial step ${currentStepIdx + 1}`}
                        className="object-contain"
                        height={450}
                        width={800}
                      />
                    </div>
                  )}

                  <p className="mb-10 flex min-h-[84px] flex-col items-center justify-center px-12 text-sm leading-loose text-muted-foreground">
                    {currentStep.description}
                  </p>

                  <div className="mb-8 flex gap-3">
                    {steps.map((_, index) => (
                      <div
                        key={`step-${index}`}
                        className={`h-2 w-2 rounded-full ${
                          index === currentStepIdx ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex w-full gap-3">
                    {currentStepIdx > 0 && (
                      <Button
                        variant="outline"
                        onClick={previousStep}
                        className="flex-1"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      onClick={nextStep}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {currentStepIdx === steps.length - 1
                        ? "Get Started"
                        : "Next"}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

async function fireConfetti(particleRatio: number, opts?: confetti.Options) {
  await confetti({
    ...opts,
    origin: { y: 0.3 },
    particleCount: Math.floor(200 * particleRatio),
  });
}
