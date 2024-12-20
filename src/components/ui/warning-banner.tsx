"use client";

import { motion } from "framer-motion";
import { UserCogIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import type { Tables } from "~/lib/supabase/database.types";

export type WarningBannerProps = {
  profile: Tables<"profiles">;
};

export function WarningBanner({ profile }: WarningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state when profile changes
  useEffect(() => {
    setIsDismissed(false);
  }, [profile.id]);

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 z-[100] bg-background px-4 lg:left-72 lg:right-8 lg:px-0"
    >
      <Alert
        variant="destructive"
        className="rounded-lg border-destructive bg-destructive/40 text-destructive-foreground"
      >
        <UserCogIcon className="mt-0.5 h-4 w-4 !text-destructive-foreground" />
        <AlertTitle className="-ml-0.5 mt-0.5 flex items-center justify-between leading-none">
          <span>
            Viewing as <span className="font-bold">{profile.nickname}</span>
          </span>
          <Button
            variant="ghost"
            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-sm p-0 !text-destructive-foreground transition-colors duration-100 hover:bg-transparent hover:!text-destructive-foreground/50"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </AlertTitle>
      </Alert>
    </motion.div>
  );
}
