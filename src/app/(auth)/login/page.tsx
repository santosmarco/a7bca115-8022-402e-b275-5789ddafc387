"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SiGoogle } from "react-icons/si";

import { Button } from "~/components/ui/button";
import { createClient } from "~/lib/supabase/client";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function SignInPage() {
  // const session = /* await getServerAuthSession(); */ null;

  // if (session) {
  //   redirect("/");
  // }

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto flex h-screen w-screen flex-col items-center justify-center"
    >
      <motion.div
        className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[350px]"
        variants={containerVariants}
      >
        <motion.div
          className="flex flex-col space-y-2 text-center"
          variants={itemVariants}
        >
          <motion.h1
            className="text-2xl font-semibold tracking-tight"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Sign in
          </motion.h1>
          <motion.p
            className="text-sm text-muted-foreground"
            variants={itemVariants}
          >
            to continue to Titan
          </motion.p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            onClick={handleSignIn}
            className="w-full gap-x-2"
          >
            <SiGoogle />
            Sign in with Google
          </Button>
        </motion.div>

        <motion.p
          className="px-8 text-center text-sm text-muted-foreground"
          variants={itemVariants}
        >
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
