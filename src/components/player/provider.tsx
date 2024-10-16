"use client";

import * as React from "react";

export type PlayerState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  error: string | null;
  isControlsVisible: boolean;
};

export type PlayerMethods = {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  changeVolume: (value: number) => void;
  toggleMute: (muted?: boolean) => void;
  toggleFullscreen: () => void;
  changePlaybackRate: (rate: number) => void;
  skip: (seconds: number) => void;
};

export type PlayerContextValue = {
  videoRef: React.RefObject<HTMLVideoElement>;
} & PlayerState &
  PlayerMethods;

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
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = React.useState<number>(1); // Speed of playback
  const [error, setError] = React.useState<string | null>(null);
  const [isControlsVisible, setIsControlsVisible] =
    React.useState<boolean>(true);

  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Play the video
  const play = React.useCallback(async () => {
    if (!videoRef.current) return;
    await videoRef.current.play();
  }, []);

  // Pause the video
  const pause = React.useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
  }, []);

  // Toggle play/pause
  const togglePlay = React.useCallback(async () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) await play();
    else pause();
  }, [pause, play, videoRef]);

  // Seek to a specific time
  const seek = React.useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Handle volume change
  const changeVolume = React.useCallback((value: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = value;
    videoRef.current.muted = value === 0;
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  // Toggle mute
  const toggleMute = React.useCallback(
    (muted?: boolean) => {
      const value = muted ?? !isMuted;
      changeVolume(value ? 0 : 1);
    },
    [isMuted, changeVolume],
  );

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
      volume,
      changeVolume,
      isMuted,
      toggleMute,
      isFullscreen,
      toggleFullscreen,
      playbackRate,
      changePlaybackRate,
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
      volume,
      changeVolume,
      isMuted,
      toggleMute,
      isFullscreen,
      toggleFullscreen,
      playbackRate,
      changePlaybackRate,
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
