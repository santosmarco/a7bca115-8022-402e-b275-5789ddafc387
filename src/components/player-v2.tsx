"use client";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import {
  DefaultVideoLayout,
  isHLSProvider,
  MediaPlayer,
  type MediaPlayerInstance,
  MediaProvider,
  Poster,
  Track,
} from "@vidstack/react";
import { useEffect, useRef, useState } from "react";

import type { RouterOutputs } from "~/trpc/react";

export type PlayerV2Props = {
  video: RouterOutputs["videos"]["getOne"] & { vtt?: string };
};

export function PlayerV2({ video }: PlayerV2Props) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Set up player event listeners
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    // Handle time updates
    const onTimeUpdate = () => {
      setCurrentTime(player.currentTime);
    };

    // Handle provider changes
    const onProviderChange = () => {
      const provider = player.provider;
      if (isHLSProvider(provider)) {
        // Configure HLS specific options if needed
        provider.config = {
          // Add HLS.js config here if needed
        };
      }
    };

    player.addEventListener("time-update", onTimeUpdate);
    player.addEventListener("provider-change", onProviderChange);

    return () => {
      player.removeEventListener("time-update", onTimeUpdate);
      player.removeEventListener("provider-change", onProviderChange);
    };
  }, []);

  return (
    <MediaPlayer
      ref={playerRef}
      src={video.assets?.mp4 ?? undefined}
      poster={video.assets?.thumbnail ?? undefined}
      aspectRatio={16 / 9}
      crossorigin=""
      className="w-full"
    >
      <MediaProvider>
        {/* Add poster if available */}
        {video.assets?.thumbnail && (
          <Poster
            className="absolute inset-0 h-full w-full object-cover"
            src={video.assets.thumbnail}
            alt={video.title ?? "Video thumbnail"}
          />
        )}

        {/* Add captions/subtitles if available */}
        {video.vtt && (
          <Track
            src={video.vtt}
            kind="subtitles"
            label="English"
            lang="en"
            default
          />
        )}
      </MediaProvider>

      {/* Use the default video layout */}
      <DefaultVideoLayout
        thumbnails={video.assets?.thumbnail}
        icons={defaultLayoutIcons}
      />
    </MediaPlayer>
  );
}

// Default icons configuration for the player layout
const defaultLayoutIcons = {
  // Add custom icons here if needed
};
