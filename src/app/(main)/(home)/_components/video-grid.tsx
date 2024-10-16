import { stagger } from "framer-motion";
import { type VideoWithDetails } from "~/lib/schemas/video";
import { VideoCard } from "./video-card";

export type VideoGridProps = {
  videos: VideoWithDetails[];
};

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {videos.map((video, index) => (
        <VideoCard
          key={video.videoId}
          video={video}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: stagger(0.1)(index, videos.length),
          }}
        />
      ))}
    </div>
  );
}
