import { motion } from "framer-motion";
import { Clock, Heart, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { type RouterOutputs } from "~/trpc/react";

export type VideoCardProps = {
  video: RouterOutputs["videos"]["listAll"]["data"][number];
};

export function VideoCard({ video }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn("group relative overflow-hidden rounded-lg shadow-lg")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/videos/${video.videoId}`} className="block">
        <div className="relative aspect-video">
          <Image
            src={video.assets?.thumbnail ?? "/placeholder.svg"}
            alt={video.title ?? "Video"}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-110"
          />
          {isHovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Play className="h-16 w-16 text-white opacity-75" />
            </div>
          )}
        </div>
        <div className="bg-white p-4 dark:bg-gray-800">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
            {video.title}
          </h3>
          <div className="mb-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="mr-1 h-4 w-4" />
            <span>
              {formatDuration(video.details.encoding?.metadata?.duration ?? 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src={video.assets?.thumbnail ?? "/placeholder.svg"}
                alt={video.title ?? "Video thumbnail"}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="text-sm font-medium">{video.title}</span>
            </div>
            <Badge variant="secondary">
              {/* video.details.views ?? */ 0} views
            </Badge>
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
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
