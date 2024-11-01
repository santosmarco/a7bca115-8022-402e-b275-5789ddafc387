import { motion } from "framer-motion";
import _ from "lodash";
import { Clock, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Button } from "~/components/ui/button";
import { type VideoWithDetails } from "~/lib/schemas/video";
import { cn } from "~/lib/utils";
import { getVideoMoments } from "~/lib/videos";

export type VideoCardProps = React.ComponentProps<typeof motion.div> & {
  video: VideoWithDetails;
};

export const VideoCard = React.forwardRef<
  React.ElementRef<typeof motion.div>,
  VideoCardProps
>(({ video, className, ...props }, ref) => {
  const moments = getVideoMoments(video);
  const momentsByCategory = _.groupBy(moments, (moment) => moment.activity);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "group relative h-48 overflow-hidden rounded-lg shadow-lg",
        className,
      )}
      {...props}
    >
      <Link href={`/videos/${video.videoId}`} className="block h-full">
        <div className="relative h-[50%]">
          <Image
            src={video.assets?.thumbnail ?? "/placeholder.svg"}
            alt={video.title ?? "Video"}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex h-[50%] flex-col items-start justify-between bg-accent p-3 px-4">
          <h3 className="line-clamp-2 font-semibold leading-tight transition-colors group-hover:underline group-hover:underline-offset-4">
            {video.title}
          </h3>
          <div className="flex w-full items-center justify-between text-sm leading-none">
            <div className="flex gap-x-2">
              {Object.entries(momentsByCategory).map(([category, moments]) => (
                <div key={category} className="flex items-baseline gap-x-1">
                  <small>{category[0]}</small>
                  <span className="font-semibold">{moments.length}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>
                {formatDuration(
                  video.details?.encoding?.metadata?.duration ?? 0,
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          // TODO: Implement like functionality
        }}
      >
        <Heart className="h-5 w-5" />
      </Button>
    </motion.div>
  );
});
VideoCard.displayName = "VideoCard";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
