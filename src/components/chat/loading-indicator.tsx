import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { cn } from "~/lib/utils";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

export function LoadingIndicator({
  message,
  className,
}: LoadingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>{message ?? "Processing..."}</span>
    </motion.div>
  );
}
