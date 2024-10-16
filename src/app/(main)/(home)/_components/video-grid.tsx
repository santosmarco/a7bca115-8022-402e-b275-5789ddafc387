import { type RouterOutputs } from "~/trpc/react";
import { VideoCard } from "./video-card";

export type VideoGridProps = {
  videos: RouterOutputs["videos"]["listAll"]["data"];
};

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} />
      ))}
    </div>
  );
}
