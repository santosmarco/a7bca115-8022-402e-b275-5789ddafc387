import { motion } from "framer-motion";
import { Clock, Tag, Timer, Video } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import { cn } from "~/lib/utils";
import type { VideoOutput } from "~/lib/videos";

export interface SelectedContentListProps {
  selectedMoments: VideoMoment[];
  selectedVideos: VideoOutput[];
  onUnselectMoment: (moment: VideoMoment) => void;
  onUnselectVideo: (video: VideoOutput) => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function SelectedContentList({
  selectedMoments,
  selectedVideos,
  onUnselectMoment,
  onUnselectVideo,
}: SelectedContentListProps) {
  if (selectedMoments.length === 0 && selectedVideos.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-x-3 bottom-0 overflow-x-scroll py-3">
      <div className="flex space-x-2">
        {selectedMoments.map((moment) => (
          <TooltipProvider delayDuration={0} key={moment.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={cn(
                    "group flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs transition-colors hover:border-primary/30 hover:bg-primary/10",
                  )}
                >
                  <Tag className="h-3 w-3 text-primary/70" />
                  <span className="max-w-[120px] truncate">{moment.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mr-1 -mt-[1px] h-4 w-4 rounded-sm opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                    onClick={() => onUnselectMoment(moment)}
                  >
                    ×
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                alignOffset={-10}
                className="max-w-xs bg-accent"
              >
                <div className="space-y-1">
                  <p className="font-medium">{moment.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 leading-none">
                      <Timer className="flex h-3 w-3" />
                      <span>
                        {formatDuration(
                          moment.segment_end_timestamp_in_seconds -
                            moment.segment_start_timestamp_in_seconds,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 leading-none">
                      <Clock className="h-3 w-3" />
                      <span>{moment.segment_start_timestamp}</span>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {moment.summary}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {selectedVideos.map((video) => (
          <TooltipProvider delayDuration={0} key={video.videoId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={cn(
                    "group flex items-center gap-1.5 rounded-md border border-accent px-2 py-1 text-xs transition-colors hover:border-accent/70 hover:bg-accent/10",
                  )}
                >
                  <Video className="h-3 w-3 text-accent-foreground/70" />
                  <span className="max-w-[120px] truncate">{video.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mr-1 -mt-[1px] h-4 w-4 rounded-sm opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                    onClick={() => onUnselectVideo(video)}
                  >
                    ×
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="end"
                alignOffset={10}
                className="max-w-xs bg-accent"
              >
                <div className="space-y-1">
                  <p className="font-medium">{video.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {video.meeting?.duration_in_ms && (
                      <div className="flex items-center gap-1 leading-none">
                        <Timer className="h-3 w-3" />
                        <span>
                          {formatDuration(video.meeting.duration_in_ms / 1000)}
                        </span>
                      </div>
                    )}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex items-center gap-1 leading-none">
                        <Tag className="h-3 w-3" />
                        <span>{video.tags.join(", ")}</span>
                      </div>
                    )}
                  </div>
                  {video.summary && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {video.summary}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
