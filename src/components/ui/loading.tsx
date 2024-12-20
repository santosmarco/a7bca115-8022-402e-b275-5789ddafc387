import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import React from "react";

import { cn } from "~/lib/utils";

export const Loading = React.forwardRef<
  React.ElementRef<typeof motion.div>,
  React.ComponentPropsWithoutRef<typeof motion.div>
>(function Loading({ className, ...props }, ref) {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("flex flex-col items-center gap-4", className)}
      {...props}
    />
  );
});

export const LoadingIcon = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(function LoadingIcon({ className, ...props }, ref) {
  return (
    <Slot
      ref={ref}
      className={cn("h-10 w-10 animate-pulse text-primary", className)}
      {...props}
    />
  );
});

export const LoadingText = React.forwardRef<
  React.ElementRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(function LoadingText({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
