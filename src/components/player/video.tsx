"use client";

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
  Subtitles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { usePlayer } from "./provider";
import _ from "lodash";

export type VideoPlayerProps = {
  videoId: string;
};

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const {
    videoRef,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    buffered,
    volume,
    changeVolume,
    isMuted,
    toggleMute,
    isFullscreen,
    toggleFullscreen,
    playbackRate,
    changePlaybackRate,
    isCaptionOn,
    toggleCaptions,
    isControlsVisible,
    skip,
    segments,
  } = usePlayer();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  console.log({ duration, currentTime, buffered, videoRef, segments });

  return (
    <TooltipProvider delayDuration={0}>
      <div className="group relative w-full">
        <video
          ref={videoRef}
          src={`https://vod.api.video/vod/${videoId}/mp4/source.mp4`}
          className="w-full cursor-pointer rounded-lg"
          crossOrigin="anonymous"
          playsInline={true}
          preload="auto"
          onClick={togglePlay}
        />
        {isControlsVisible && (
          <div className="pointer-events-none absolute inset-0 rounded-lg bg-accent-foreground/50" />
        )}
        <div
          className={cn(
            "absolute -bottom-0.5 -left-1 -right-1 rounded-b-lg rounded-t-sm border border-border bg-accent p-4 shadow-md transition-opacity duration-300",
            isControlsVisible ? "opacity-100" : "opacity-0",
          )}
        >
          {_.sortBy([...segments], "start").map((segment) => (
            <div
              key={segment.start}
              className={cn("absolute top-4 h-1.5", {
                "bg-chart-1": segment.color === "chart-1",
                "bg-chart-2": segment.color === "chart-2",
                "bg-chart-3": segment.color === "chart-3",
                "bg-chart-4": segment.color === "chart-4",
                "bg-chart-5": segment.color === "chart-5",
              })}
              style={{
                marginLeft: `${(segment.start / duration) * 964}px`,
                width: `${((segment.end - segment.start) / duration) * 964}px`,
              }}
            />
          ))}
          <Slider
            min={0}
            max={duration}
            value={[currentTime]}
            onValueChange={(value) => seek(value[0])}
            className="mb-4"
            aria-label="Seek"
          >
            <div
              className="absolute h-full bg-primary/50"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
          </Slider>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPlaying ? "Pause" : "Play"}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => skip(-10)}
                    aria-label="Rewind 10 seconds"
                  >
                    <RotateCcw className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rewind 10 seconds</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => skip(10)}
                    aria-label="Forward 10 seconds"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Forward 10 seconds</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-primary/10 hover:text-primary"
                      onClick={toggleMute}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-6 w-6" />
                      ) : (
                        <Volume2 className="h-6 w-6" />
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
                  value={[volume]}
                  onValueChange={(value) => changeVolume(value[0])}
                  className="w-24"
                  aria-label="Volume"
                />
              </div>
              <span className="text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={toggleCaptions}
                    aria-label={
                      isCaptionOn ? "Turn off captions" : "Turn on captions"
                    }
                  >
                    <Subtitles className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isCaptionOn ? "Turn off captions" : "Turn on captions"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => {
                      /* Open settings menu */
                    }}
                    aria-label="Settings"
                  >
                    <Settings className="h-6 w-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={toggleFullscreen}
                    aria-label={
                      isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                  >
                    {isFullscreen ? (
                      <Minimize className="h-6 w-6" />
                    ) : (
                      <Maximize className="h-6 w-6" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
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
