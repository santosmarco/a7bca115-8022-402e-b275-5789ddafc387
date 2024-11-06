"use client";

import { motion } from "framer-motion";
import { HomeIcon, MoveLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const numberVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
    },
  },
};

const glowVariants = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.2, 1],
    transition: {
      duration: 3,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
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

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center px-4 text-center"
      >
        {/* Glowing circle behind 404 */}
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"
        />

        {/* 404 Number */}
        <motion.div
          variants={numberVariants}
          className="mb-8 text-8xl font-bold tracking-tighter text-primary sm:text-9xl"
        >
          404
        </motion.div>

        {/* Error message */}
        <motion.h1
          variants={itemVariants}
          className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Page not found
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-8 max-w-md text-muted-foreground"
        >
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It
          might have been moved or doesn&apos;t exist.
        </motion.p>

        {/* Action buttons */}
        <motion.div variants={itemVariants}>
          <Button
            asChild
            size="lg"
            className="gap-2 bg-primary text-primary-foreground transition-transform hover:scale-105 hover:shadow-lg"
          >
            <Link href="/">
              <HomeIcon className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
