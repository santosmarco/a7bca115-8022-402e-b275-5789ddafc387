"use client";

import dayjs from "dayjs";
import { motion } from "framer-motion";
import _ from "lodash";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

import { usePlayer } from "./provider";

export type VideoPlayerProps = {
  video: RouterOutputs["videos"]["getOne"];
  momentsShown?: VideoMoment[];
  startAt?: number;
};

export function VideoPlayer({
  video,
  momentsShown,
  startAt,
}: VideoPlayerProps) {
  const {
    videoRef,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    play,
    volume,
    changeVolume,
    isMuted,
    toggleMute,
    isFullscreen,
    toggleFullscreen,
    isControlsVisible,
    skip,
  } = usePlayer();

  const [currentMoment, setCurrentMoment] = useState<VideoMoment | undefined>(
    undefined,
  );
  const [hoveredMoment, setHoveredMoment] = useState<VideoMoment | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  useEffect(() => {
    if (startAt !== undefined && videoRef.current) {
      videoRef.current.currentTime = startAt;
    }
  }, [startAt, videoRef]);

  useEffect(() => {
    toggleMute(true);
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (momentsShown && currentTime) {
      const newCurrentMoment = momentsShown.find(
        (moment) =>
          currentTime >= moment.segment_start_timestamp_in_seconds &&
          currentTime < moment.segment_end_timestamp_in_seconds,
      );
      setCurrentMoment(newCurrentMoment);
    }
  }, [currentTime, momentsShown]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <TooltipProvider>
      <div className="group relative w-full rounded-lg">
        {isVideoLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-accent">
            <p className="text-sm text-muted-foreground">Loading video...</p>
          </div>
        )}
        <video
          ref={videoRef}
          src={video.videoSrc}
          className={cn(
            "w-full cursor-pointer rounded-lg",
            isVideoLoading && "invisible",
          )}
          crossOrigin="anonymous"
          playsInline={true}
          preload="auto"
          onClick={togglePlay}
          onLoadedData={() => setIsVideoLoading(false)}
          tabIndex={0}
        />

        {isControlsVisible && (
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-accent/50" />
        )}

        {isControlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 right-0 top-0 flex flex-row items-start justify-between rounded-b rounded-t-lg bg-gradient-to-b from-accent to-transparent p-4 px-6 pb-12 text-lg font-normal text-foreground"
          >
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
              >
                {video.title}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.2 }}
                className="text-sm text-foreground/70"
              >
                {dayjs(video.publishedAt).format("dddd, MMMM D")}
              </motion.div>
            </div>

            {currentMoment && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.2 }}
                className="mt-2 max-w-[40%] text-right text-sm font-semibold text-foreground"
              >
                {currentMoment.title}
              </motion.div>
            )}
          </motion.div>
        )}

        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 rounded-b-lg rounded-t-sm bg-gradient-to-t from-accent to-transparent p-4 transition-all duration-300",
            isControlsVisible ? "opacity-100" : "opacity-0",
          )}
        >
          <Tooltip open={!!hoveredMoment}>
            <div className="relative -mb-1 h-1 w-full rounded-full bg-accent">
              {momentsShown?.map((moment) => (
                <Tooltip key={moment.index}>
                  <TooltipTrigger
                    className="absolute top-0 h-full rounded-full bg-primary"
                    style={{
                      left: `${(moment.segment_start_timestamp_in_seconds / (duration ?? 1)) * 100}%`,
                      width: `${((moment.segment_end_timestamp_in_seconds - moment.segment_start_timestamp_in_seconds) / (duration ?? 1)) * 100}%`,
                    }}
                  />
                  <TooltipContent className="bg-accent text-xs text-foreground">
                    <p>{moment.title}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            <TooltipTrigger asChild>
              <Slider
                min={0}
                max={duration ?? 100}
                value={[currentTime ?? 0]}
                onValueChange={(value) => seek(value[0] ?? 0)}
                aria-label="Seek"
                onMouseMove={(ev) => {
                  if (momentsShown && duration) {
                    const rect = ev.currentTarget.getBoundingClientRect();
                    const mouseX = ev.clientX - rect.left;
                    const mouseTimePosition = (mouseX / rect.width) * duration;

                    const newHoveredMoment = momentsShown.find(
                      (moment) =>
                        mouseTimePosition >=
                          moment.segment_start_timestamp_in_seconds &&
                        mouseTimePosition <
                          moment.segment_end_timestamp_in_seconds,
                    );

                    setHoveredMoment(newHoveredMoment ?? null);
                  }
                }}
                onMouseLeave={() => setHoveredMoment(null)}
              />
            </TooltipTrigger>
            <TooltipContent
              sideOffset={24}
              className={cn(
                "bg-accent text-xs text-foreground shadow-xl",
                !hoveredMoment && "hidden",
              )}
            >
              {hoveredMoment?.title}
            </TooltipContent>
          </Tooltip>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="start">
                  <p>{isPlaying ? "Pause" : "Play"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                    onClick={() => skip(-10)}
                    aria-label="Rewind 10 seconds"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rewind 10s</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                    onClick={() => skip(10)}
                    aria-label="Forward 10 seconds"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Forward 10s</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex items-center space-x-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                      onClick={() => changeVolume(isMuted ? 1 : 0)}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMuted ? "Unmute" : "Mute"}</p>
                  </TooltipContent>
                </Tooltip>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[volume ?? 0]}
                  onValueChange={(value) => changeVolume(value[0] ?? 0)}
                  className="w-16"
                  aria-label="Volume"
                />
              </div>
              <span className="ml-2 text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">
                  <p>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
