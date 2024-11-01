"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SiGoogle } from "react-icons/si";

import titanLogo from "~/assets/titan-logo.svg";
import { Button } from "~/components/ui/button";
import { Link } from "~/components/ui/link";
import { createClient } from "~/lib/supabase/client";

export default function SignInPage() {
  const supabase = createClient();

  const handleSignIn = () => {
    void supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background to-accent/20">
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute -left-4 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
      </motion.div>

      {/* Login container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-background/50 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="space-y-6">
          {/* Logo and title */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
            >
              <Image src={titanLogo} alt="Titan Logo" width={48} height={48} />
            </motion.div>
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-2xl font-bold tracking-tight"
            >
              Welcome to Titan
            </motion.h1>
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              Sign in to continue to your account
            </motion.p>
          </motion.div>

          {/* Sign in button */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
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

          {/* Terms */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center text-sm text-muted-foreground"
          >
            By continuing, you agree to our
            <br />
            <Link href="/terms">Terms of Service</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
