import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import type { SearchMomentsToolOutput } from "~/lib/ai/tools";
import { cn } from "~/lib/utils";

interface ChatMomentListProps {
  moments: SearchMomentsToolOutput["results"];
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};

export function ChatMomentList({ moments, className }: ChatMomentListProps) {
  if (!moments?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <MessageSquare className="h-4 w-4" />
        <span>No moments found</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-2", className)}
    >
      {moments.map((result, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          onClick={() => {
            window.open(
              `/videos/${result.moment.video_id}?startAt=${result.moment.segment_start_timestamp_in_seconds}`,
              "_blank",
            );
          }}
          className="group flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border/50 bg-background/50 px-3 py-2 transition-colors hover:border-primary/20"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate text-sm font-medium group-hover:text-primary">
                {result.moment.title}
              </h4>
              {result.metadata?.activity_type && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border border-primary/20 text-xs"
                >
                  {result.metadata.activity_type}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
