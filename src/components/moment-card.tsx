"use client";

import { motion } from "framer-motion";
import { ClockIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "~/hooks/use-toast";
import { type VideoMoment } from "~/lib/schemas/video-moment";
import { cn } from "~/lib/utils";
import { ExpandingText } from "./expanding-text";

export type MomentCardProps = {
  moment: VideoMoment;
  index?: number;
  onSkipToMoment?: (moment: VideoMoment) => void;
  jumpToLabel?: React.ReactNode;
  noShare?: boolean;
  className?: string;
};

export function MomentCard({
  moment,
  index,
  onSkipToMoment,
  jumpToLabel,
  noShare,
  className,
}: MomentCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/embed/moments/${moment.index}`;
    void navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "The moment URL has been copied to your clipboard.",
    });
    setIsOpen(false);
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/moments/${moment.index}" width="100%" height="400" frameborder="0"></iframe>`;
    void navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed Code Copied",
      description: "The embed code has been copied to your clipboard.",
    });
    setIsOpen(false);
  };

  return (
    <motion.div
      key={moment.index}
      className={cn(
        "flex flex-col rounded-md border border-border bg-accent p-4 shadow-md",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: index ? index * 0.1 : 0,
      }}
    >
      <div className="mb-3 flex flex-col md:flex-row md:items-center md:justify-between lg:mb-2">
        <h2 className="font-bold">{moment.title}</h2>
        <div className="mt-0.5 flex items-center gap-x-2 text-muted-foreground lg:mt-0">
          <span className="flex items-center gap-x-1.5 text-sm">
            <ClockIcon className="h-3.5 w-3.5" />
            {moment.segment_start_timestamp.replace(/\.\d+/, "")}
          </span>
          {!noShare && (
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="link"
                  size="icon"
                  className="ml-1.5 hidden h-3.5 w-3.5 text-muted-foreground hover:text-foreground focus-visible:ring-0 md:block"
                >
                  <Share2Icon className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyUrl}>
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyEmbed}>
                  Copy Embed Code
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 lg:mb-4">
        <Badge variant="outline" className="rounded-full">
          {moment.target_person_type}
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {moment.activity_type}
        </Badge>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end">
        <ExpandingText
          text={moment.summary}
          className="text-sm text-muted-foreground"
          containerProps={{ className: "mb-4 sm:mb-0 sm:flex-grow" }}
        />
        {onSkipToMoment && (
          <div className="flex justify-end sm:ml-4">
            <Button onClick={() => onSkipToMoment(moment)}>
              {jumpToLabel ?? "Jump To"}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
