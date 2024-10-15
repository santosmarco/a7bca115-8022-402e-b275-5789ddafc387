"use client";

import * as React from "react";

export type PlayerSegment = {
  start: number;
  end: number;
  color: string;
};

export type PlayerContextValue = {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  buffered: number;
  segments: Array<PlayerSegment>;
  setSegments: (segments: Array<PlayerSegment>) => void;
  volume: number;
  changeVolume: (value: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  playbackRate: number;
  changePlaybackRate: (rate: number) => void;
  isCaptionOn: boolean;
  toggleCaptions: () => void;
  error: string | null;
  isControlsVisible: boolean;
  skip: (seconds: number) => void;
};

export const PlayerContext = React.createContext<PlayerContextValue | null>(
  null,
);

export type PlayerProviderProps = {
  children?: React.ReactNode;
};

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [volume, setVolume] = React.useState<number>(1); // Range: 0 to 1
  const [currentTime, setCurrentTime] = React.useState<number>(0); // In seconds
  const [duration, setDuration] = React.useState<number>(0); // In seconds
  const [buffered, setBuffered] = React.useState<number>(0); // In seconds
  const [segments, setSegments] = React.useState<Array<PlayerSegment>>([]);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = React.useState<number>(1); // Speed of playback
  const [isCaptionOn, setIsCaptionOn] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isControlsVisible, setIsControlsVisible] =
    React.useState<boolean>(true);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Play the video
  const play = React.useCallback(() => {
    void videoRef.current?.play();
  }, []);

  // Pause the video
  const pause = React.useCallback(() => {
    videoRef.current?.pause();
  }, []);

  // Toggle play/pause
  const togglePlay = React.useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // Seek to a specific time
  const seek = React.useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Handle volume change
  const changeVolume = React.useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  }, []);

  // Toggle mute
  const toggleMute = React.useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle fullscreen
  const toggleFullscreen = React.useCallback(() => {
    const videoElement =
      videoRef.current as HTMLVideoElementWithFullscreen | null;
    const doc = document as DocumentWithFullscreen;
    if (!isFullscreen) {
      if (videoElement?.requestFullscreen) {
        void videoElement.requestFullscreen();
      } else if (videoElement?.webkitRequestFullscreen) {
        /* Safari */
        void videoElement.webkitRequestFullscreen();
      } else if (videoElement?.msRequestFullscreen) {
        /* IE11 */
        videoElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (doc.exitFullscreen) {
        void doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        /* Safari */
        void doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        /* IE11 */
        doc.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Change playback speed
  const changePlaybackRate = React.useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  }, []);

  // Toggle captions/subtitles
  const toggleCaptions = React.useCallback(() => {
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      if (tracks.length > 0) {
        for (const track of tracks) {
          track.mode = isCaptionOn ? "hidden" : "showing";
        }
        setIsCaptionOn(!isCaptionOn);
      }
    }
  }, [isCaptionOn]);

  // Update current time
  const handleTimeUpdate = React.useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleDurationChange = React.useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  // Update duration
  const handleLoadedMetadata = React.useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  // Update buffered time
  const handleProgress = React.useCallback(() => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      setBuffered(
        videoRef.current.buffered.end(videoRef.current.buffered.length - 1),
      );
    }
  }, []);

  // Handle play state
  const handlePlay = React.useCallback(() => {
    setIsPlaying(true);
    handleDurationChange();
  }, [handleDurationChange]);

  // Handle pause state
  const handlePause = React.useCallback(() => {
    setIsPlaying(false);
    handleDurationChange();
  }, [handleDurationChange]);

  // Handle volume change
  const handleVolumeChange = React.useCallback(() => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  // Handle errors
  const handleError = React.useCallback(() => {
    setError("An error occurred during video playback.");
  }, []);

  const skip = React.useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsControlsVisible(false), 3000);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  React.useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("durationchange", handleDurationChange);
    videoElement.addEventListener("progress", handleProgress);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("volumechange", handleVolumeChange);
    videoElement.addEventListener("error", handleError);

    // Clean up event listeners on unmount
    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("durationchange", handleDurationChange);
      videoElement.removeEventListener("progress", handleProgress);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("volumechange", handleVolumeChange);
      videoElement.removeEventListener("error", handleError);
    };
  }, [
    handleTimeUpdate,
    handleLoadedMetadata,
    handleDurationChange,
    handleProgress,
    handlePlay,
    handlePause,
    handleVolumeChange,
    handleError,
  ]);

  const contextValue: PlayerContextValue = React.useMemo(
    () => ({
      videoRef,
      isPlaying,
      play,
      pause,
      togglePlay,
      currentTime,
      duration,
      seek,
      buffered,
      segments,
      setSegments,
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
      error,
      isControlsVisible,
      skip,
    }),
    [
      isPlaying,
      play,
      pause,
      togglePlay,
      currentTime,
      duration,
      seek,
      buffered,
      segments,
      setSegments,
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
      error,
      isControlsVisible,
      skip,
    ],
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = React.useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a <PlayerProvider />");
  }

  return context;
}

interface HTMLVideoElementWithFullscreen extends HTMLVideoElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => void;
}

interface DocumentWithFullscreen extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => void;
}
