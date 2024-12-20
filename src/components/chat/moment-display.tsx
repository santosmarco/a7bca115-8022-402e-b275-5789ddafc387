import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

interface MomentDisplayProps {
  id: string;
  reasoning?: string;
}

export function MomentDisplay({ id, reasoning }: MomentDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { data: moment, isLoading } = api.moments.getOneById.useQuery(
    { momentId: id },
    {
      retry: false,
      enabled: isMounted,
    },
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[100px] items-center justify-center rounded-md border border-border bg-accent/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{
            scale: [0.8, 1.1, 0.9],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          />
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
      </motion.div>
    );
  }

  if (!moment) {
    return null;
  }

  return (
    <div className="space-y-2">
      <iframe
        src={`/embed/moments/${id}`}
        title={reasoning}
        className="w-full rounded-md"
        onLoad={(e) => {
          const iframe = e.currentTarget;
          const resizeObserver = new ResizeObserver(() => {
            const height =
              iframe.contentWindow?.document.documentElement.scrollHeight;
            if (height && height <= 400) iframe.style.height = `${height}px`;
          });
          if (iframe.contentWindow?.document.documentElement) {
            resizeObserver.observe(
              iframe.contentWindow?.document.documentElement,
            );
          }
        }}
      />
      {reasoning && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs italic text-muted-foreground"
        >
          {reasoning}
        </motion.p>
      )}
    </div>
  );
}
