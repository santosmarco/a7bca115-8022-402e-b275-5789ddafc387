"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  PauseIcon,
  PlayIcon,
  VolumeIcon,
  Volume2Icon,
  SettingsIcon,
  Maximize2Icon,
  Minimize2Icon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import { Tooltip, TooltipProvider } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ColoredProgress } from "./colored-progress";

export type VideoPlayerProps = {
  videoId: string;
  metadata?: {
    key: string;
    value: string;
  }[];
};

type Emotion = {
  sequence_id: number;
  segment_id_sequence_start: number;
  segment_id_sequence_end: number;
  speaker_name: string;
  title: string;
  emotion_intensity: number;
  summary: string;
  context: string;
};

const emotionColors: Record<string, string> = {
  Excitement: "bg-yellow-200 border-yellow-400",
  Confidence: "bg-green-200 border-green-400",
  Frustration: "bg-red-200 border-red-400",
  Hopefulness: "bg-blue-200 border-blue-400",
  Willingness: "bg-purple-200 border-purple-400",
};

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

function parseMetadata(metadata: VideoPlayerProps["metadata"]) {
  const summary = metadata?.find((item) => item.key === "summary")?.value ?? "";
  const emotionsData = metadata?.find((item) => item.key === "emotions")?.value;
  const emotions: Emotion[] = emotionsData
    ? (JSON.parse(emotionsData).activity_sequences ?? [])
    : [];
  return { summary, emotions };
}

function parseTimestamp(timestamp: string): number {
  const [minutes, seconds] = timestamp
    .replace(/\.\d+/, "")
    .split(":")
    .map(Number);
  return (minutes ?? 0) * 60 + (seconds ?? 0);
}

const example = {
  videoId: "vi21tWLEF2GadH1FxBaaUCVv",
  metadata: [
    {
      key: "summary",
      value:
        "In this meeting, William Hayden and Jason Belando discuss the onboarding process for Jason, who will be working closely with William on accounting tasks. They address challenges in accessing QuickBooks and the need for better task management through a new system, along with strategies for improving client communication and inventory tracking. The meeting aims to set up a collaborative workflow and ensure Jason has the necessary resources to succeed in his role.",
    },
    {
      key: "emotions",
      value:
        '{"video_id": "vi66sUcAhs5skGoK6NX2DWXB", "activity_sequences": [{"sequence_id": 1, "segment_id_sequence_start": 44, "segment_id_sequence_end": 50, "summary": "AJ and Przemek discuss the importance of constructive friction in partnerships, highlighting how differing perspectives can lead to better outcomes.", "title": "Constructive Friction in Partnerships", "segment_start_timestamp": "03:34.128", "segment_end_timestamp": "04:09.684", "segment_start_timestamp_in_seconds": 214.128, "segment_end_timestamp_in_seconds": 249.684, "activity_analysis": {"type": "Positive Reinforcement", "reasoning": "Przemek Gotfryd expresses strong approval of a reaction, stating it\'s \'exactly the kind of reaction you want to hear about,\' which affirms positive outcomes."}, "target_person_analysis": {"type": "Not Involved", "reasoning": "AJ Goldstein is not mentioned in the interaction, and there is no indication of their involvement in the feedback process."}}, {"sequence_id": 2, "segment_id_sequence_start": 141, "segment_id_sequence_end": 146, "summary": "Przemek provides feedback on the stages of business where founders seek coaching, emphasizing the pressure during Series A and B rounds.", "title": "Coaching Needs During Growth Stages", "segment_start_timestamp": "11:49.994", "segment_end_timestamp": "12:18.918", "segment_start_timestamp_in_seconds": 709.994, "segment_end_timestamp_in_seconds": 738.918, "activity_analysis": {"type": "Not Feedback", "reasoning": "AJ Goldstein is providing an opinion on the topic being discussed by Przemek Gotfryd, but it does not constitute feedback."}, "target_person_analysis": {"type": "Not Involved", "reasoning": "AJ Goldstein is not giving or receiving feedback in this interaction. They are providing an opinion on a topic being discussed by Przemek Gotfryd, but it does not constitute feedback."}}, {"sequence_id": 3, "segment_id_sequence_start": 155, "segment_id_sequence_end": 180, "summary": "Przemek shares insights about the Endeavor organization and suggests potential networking opportunities for AJ, emphasizing the value of community connections.", "title": "Networking Opportunities with Endeavor", "segment_start_timestamp": "12:51.154", "segment_end_timestamp": "15:01.440", "segment_start_timestamp_in_seconds": 771.154, "segment_end_timestamp_in_seconds": 901.44, "activity_analysis": {"type": "Not Feedback", "reasoning": "AJ Goldstein is sharing information about his knowledge of \'endeavor\' and discussing his connections, rather than giving or receiving feedback."}, "target_person_analysis": {"type": "Not Involved", "reasoning": "AJ Goldstein is not involved in the interaction as they are primarily responding to Przemek Gotfryd\'s questions and sharing information rather than giving or receiving feedback."}}, {"sequence_id": 4, "segment_id_sequence_start": 204, "segment_id_sequence_end": 212, "summary": "Przemek discusses the potential for speaking engagements at conferences, suggesting that AJ\'s coaching topic could resonate well with audiences.", "title": "Speaking Engagements for Coaches", "segment_start_timestamp": "16:37.351", "segment_end_timestamp": "17:27.659", "segment_start_timestamp_in_seconds": 997.351, "segment_end_timestamp_in_seconds": 1047.659, "activity_analysis": {"type": "Not Feedback", "reasoning": "The transcript consists of general conversation about upcoming conferences and topics to cover, with no involvement or feedback related to AJ Goldstein."}, "target_person_analysis": {"type": "Not Involved", "reasoning": "AJ Goldstein is not mentioned in the interaction, and there is no indication of their involvement in the discussion."}}, {"sequence_id": 5, "segment_id_sequence_start": 261, "segment_id_sequence_end": 268, "summary": "AJ and Przemek explore the trust dynamics between founders and investors, discussing the importance of having a reliable support system outside of board members.", "title": "Trust Dynamics in Founder-Investor Relationships", "segment_start_timestamp": "21:02.219", "segment_end_timestamp": "21:41.924", "segment_start_timestamp_in_seconds": 1262.219, "segment_end_timestamp_in_seconds": 1301.924, "activity_analysis": {"type": "Not Feedback", "reasoning": "AJ Goldstein is not giving or receiving feedback in this interaction. They are sharing observations and asking a question about trust in relationships, but there is no direct feedback being exchanged."}, "target_person_analysis": {"type": "Not Involved", "reasoning": "AJ Goldstein is not giving or receiving feedback in this interaction. They are sharing observations and asking a question about trust in relationships, but there is no direct feedback being exchanged."}}]}',
    },
  ],
};

export function VideoPlayer({
  videoId,
  metadata = example.metadata,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const { summary, emotions } = parseMetadata(metadata);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const seekPosition = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = seekPosition * duration;
    },
    [duration],
  );

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const jumpToEmotion = useCallback((startTime: number) => {
    console.log(startTime);
    if (!videoRef.current) return;
    videoRef.current.currentTime = startTime;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const hideControlsTimer = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(hideControlsTimer);
  }, [isPlaying, showControls]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-4 md:flex-row" ref={containerRef}>
        <div className="w-full md:w-2/3">
          <div
            className="relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              playsInline
              className="w-full rounded-lg shadow-lg"
              crossOrigin="anonymous"
              preload="auto"
              src={`https://vod.api.video/vod/${videoId}/mp4/source.mp4`}
              onClick={handlePlayPause}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
            />
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300",
                showControls ? "opacity-100" : "opacity-0",
              )}
            >
              <div className="flex items-center justify-between">
                <Button size="icon" variant="ghost" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <PauseIcon className="h-6 w-6 text-background" />
                  ) : (
                    <PlayIcon className="h-6 w-6 text-background" />
                  )}
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleMuteToggle}
                  >
                    {isMuted ? (
                      <VolumeIcon className="h-6 w-6 text-background" />
                    ) : (
                      <Volume2Icon className="h-6 w-6 text-background" />
                    )}
                  </Button>
                  <Slider
                    className="w-24"
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={([newVolume]) =>
                      handleVolumeChange(newVolume)
                    }
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <SettingsIcon className="h-6 w-6 text-background" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2">
                        <p className="font-semibold">Playback Speed</p>
                        {[0.5, 1, 1.5, 2].map((rate) => (
                          <Button
                            key={rate}
                            variant={
                              playbackRate === rate ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePlaybackRateChange(rate)}
                          >
                            {rate}x
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleFullscreenToggle}
                  >
                    {isFullscreen ? (
                      <Minimize2Icon className="h-6 w-6 text-background" />
                    ) : (
                      <Maximize2Icon className="h-6 w-6 text-background" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-sm text-background">
                  {formatTime(currentTime)}
                </span>
                <div className="relative flex-grow">
                  <Progress
                    value={(currentTime / duration) * 100}
                    className="h-1 cursor-pointer"
                    onClick={handleSeek}
                  />
                  <ColoredProgress
                    duration={duration}
                    emotions={emotions}
                    className="absolute inset-0"
                    onClick={handleSeek}
                  />
                </div>
                <span className="text-sm text-background">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-semibold">Emotion Timeline</h3>
            {emotions.map((emotion) => (
              <Tooltip key={emotion.sequence_id} content={emotion.summary}>
                <div
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md",
                    emotionColors[emotion.title] ||
                      "border-gray-400 bg-gray-200",
                  )}
                  onClick={() =>
                    jumpToEmotion(
                      parseTimestamp(emotion.segment_start_timestamp),
                    )
                  }
                >
                  <p className="font-semibold">
                    {emotion.speaker_name}: {emotion.title} (Intensity:{" "}
                    {emotion.emotion_intensity})
                  </p>
                  <p className="text-sm">{emotion.context}</p>
                </div>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="w-full md:w-1/3">
          <h3 className="text-lg font-semibold">Video Summary</h3>
          <p className="mt-2">{summary}</p>
        </div>
      </div>
    </TooltipProvider>
  );
}
