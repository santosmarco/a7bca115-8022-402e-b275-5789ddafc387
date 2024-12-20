import { motion } from "framer-motion";
import { Calendar, Clock, PinIcon, Tag, Timer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import type { VideoOutput } from "~/lib/videos";

export interface ContentSelectorProps {
  moments?: VideoMoment[];
  videos?: VideoOutput[];
  selectedMoments: VideoMoment[];
  selectedVideos: VideoOutput[];
  onSelectMoment: (moment: VideoMoment) => void;
  onUnselectMoment: (moment: VideoMoment) => void;
  onSelectVideo: (video: VideoOutput) => void;
  onUnselectVideo: (video: VideoOutput) => void;
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function ContentSelector({
  moments = [],
  videos = [],
  selectedMoments,
  selectedVideos,
  onSelectMoment,
  onUnselectMoment,
  onSelectVideo,
  onUnselectVideo,
}: ContentSelectorProps) {
  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="relative h-8 w-8"
                aria-label="Select content"
              >
                <PinIcon className="h-4 w-4" />
                {selectedMoments.length + selectedVideos.length < 5 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                  >
                    {5 - (selectedMoments.length + selectedVideos.length)}
                  </motion.div>
                )}
              </Button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <TooltipContent side="top" align="end">
            <p>Pin your favorite videos and moments</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-[700px]">
        <div className="flex divide-x divide-border">
          {/* Moments Column */}
          <div className="w-1/2">
            {moments.length > 0 && (
              <>
                <DropdownMenuLabel className="px-3">Moments</DropdownMenuLabel>
                <DropdownMenuGroup className="max-h-96 overflow-y-auto">
                  {moments.map((moment) => (
                    <div
                      key={moment.id}
                      className="flex cursor-pointer flex-col gap-1 border-b border-border/10 px-3 py-2 hover:bg-accent"
                      onClick={() => {
                        if (selectedMoments.some((m) => m.id === moment.id)) {
                          onUnselectMoment(moment);
                        } else if (
                          selectedMoments.length + selectedVideos.length <
                          5
                        ) {
                          onSelectMoment(moment);
                        } else {
                          toast.error("You can only pin up to 5 items");
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{moment.title}</span>
                        {selectedMoments.some((m) => m.id === moment.id) && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {moment.activity_type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatDuration(
                            moment.segment_end_timestamp_in_seconds -
                              moment.segment_start_timestamp_in_seconds,
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {moment.segment_start_timestamp}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {moment.summary}
                      </p>
                    </div>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
          </div>

          {/* Videos Column */}
          <div className="w-1/2">
            {videos.length > 0 && (
              <>
                <DropdownMenuLabel className="px-3">Videos</DropdownMenuLabel>
                <DropdownMenuGroup className="max-h-96 overflow-y-auto">
                  {videos.map((video) => (
                    <div
                      key={video.videoId}
                      className="flex cursor-pointer flex-col gap-1 border-b border-border/10 px-3 py-2 hover:bg-accent"
                      onClick={() => {
                        if (
                          selectedVideos.some(
                            (v) => v.videoId === video.videoId,
                          )
                        ) {
                          onUnselectVideo(video);
                        } else if (
                          selectedMoments.length + selectedVideos.length <
                          5
                        ) {
                          onSelectVideo(video);
                        } else {
                          toast.error("You can only pin up to 5 items");
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{video.title}</span>
                        {selectedVideos.some(
                          (v) => v.videoId === video.videoId,
                        ) && <span className="text-primary">✓</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {video.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(video.publishedAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </div>
                        )}
                        {video.tags && video.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {video.tags.join(", ")}
                          </div>
                        )}
                      </div>
                      {video.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {video.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
