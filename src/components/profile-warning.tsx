"use client";

import { AnimatePresence } from "framer-motion";

import { useProfile } from "~/hooks/use-profile";
import { api } from "~/trpc/react";

import { WarningBanner } from "./ui/warning-banner";

export function ProfileWarning() {
  const { profile } = useProfile();
  const { data: user, isLoading } = api.auth.getUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const showWarning = !isLoading && profile?.nickname !== user?.nickname;

  return (
    <AnimatePresence>
      {showWarning && profile && <WarningBanner profile={profile} />}
    </AnimatePresence>
  );
}
