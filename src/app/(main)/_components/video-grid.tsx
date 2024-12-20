import { motion } from "framer-motion";

import type { VideoWithDetails } from "~/lib/schemas/video";
import type { VideoOutput } from "~/lib/videos";

import { VideoCard } from "./video-card";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export type VideoGridProps = {
  videos: VideoOutput[];
};

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
    >
      {videos.map((video) => (
        <motion.div key={video.videoId} variants={cardVariants}>
          <VideoCard video={video} />
        </motion.div>
      ))}
    </motion.div>
  );
}
