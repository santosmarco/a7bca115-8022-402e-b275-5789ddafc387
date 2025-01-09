"use client";

import { motion } from "framer-motion";
import { useCallback } from "react";
import { SiGoogle } from "react-icons/si";
import { v4 as uuidv4 } from "uuid";

import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { createClient } from "~/lib/supabase/client";
import { cn } from "~/lib/utils";

export type SignInButtonProps = {
  inviteId: string | null;
  hidden: boolean;
};

export function SignInButton({ inviteId, hidden }: SignInButtonProps) {
  const supabase = createClient();

  const handleSignIn = useCallback(() => {
    const nonce = uuidv4();
    const state = encodeURIComponent(
      JSON.stringify({
        invite: inviteId,
        provider: "google",
        nonce,
        timestamp: Date.now(),
      }),
    );

    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getBaseUrl()}auth/callback?state=${state}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes:
          "https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/calendar.calendars.readonly https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.readonly",
      },
    });
  }, [supabase, inviteId]);

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className={cn(hidden && "hidden")}
    >
      <Button
        variant="outline"
        onClick={handleSignIn}
        className="relative w-full overflow-hidden border-border/50 bg-background/50 transition-colors hover:bg-accent"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="absolute inset-0 z-0 bg-gradient-to-r from-background to-accent opacity-0 transition-opacity hover:opacity-10"
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          <SiGoogle className="h-4 w-4" />
          Sign in with Google
        </span>
      </Button>
    </motion.div>
  );
}

function getBaseUrl() {
  let url =
    env.NEXT_PUBLIC_SITE_URL ??
    env.NEXT_PUBLIC_VERCEL_URL ??
    window.location.origin;
  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
}
