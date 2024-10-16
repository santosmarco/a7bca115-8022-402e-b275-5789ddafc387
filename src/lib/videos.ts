import { z } from "zod";
import { type Video } from "./schemas/video";
import { VideoMoment } from "./schemas/video-moment";

export function getVideoSummary(video: Video) {
  return video.metadata.find((m) => m.key === "summary")?.value;
}

export function getVideoMoments(video: Video, category?: string) {
  const moments = z
    .array(VideoMoment)
    .parse(
      JSON.parse(
        video.metadata.find((m) => m.key === "activities")?.value ?? "[]",
      ),
    );

  if (category) {
    return moments.filter((m) => m.activity === category);
  }

  return moments;
}

export function getVideoMomentById(video: Video, momentId: string) {
  return getVideoMoments(video).find((m) => m.index === momentId);
}
