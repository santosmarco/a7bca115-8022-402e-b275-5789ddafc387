"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { PlayerProvider } from "~/components/player/provider";
import { VideoPlayer } from "~/components/player/video";
import { Button } from "~/components/ui/button";
import { type Video } from "~/lib/schemas/video";
import { type VideoMoment } from "~/lib/schemas/video-moment";
import {
  emotionToMoment,
  getVideoEmotions,
  getVideoMoments,
  getVideoSummary,
} from "~/lib/videos";
import { MeetingSummary } from "./_components/meeting-summary";
import { VideoMoments } from "./_components/video-moments";
import { VideoTags } from "./_components/video-tags";

export type VideoPageClientProps = {
  video: Video;
  vtt: string;
};

export function VideoPageClient({ video, vtt }: VideoPageClientProps) {
  const router = useRouter();
  const [category, setCategory] = useQueryState("category", parseAsString);
  const [startAt, setStartAt] = useQueryState("startAt", parseAsInteger);
  const summary = getVideoSummary(video);
  const moments = getVideoMoments(video);
  const emotions = getVideoEmotions(video);
  const emotionMoments = (emotions ?? []).map((emotion) =>
    emotionToMoment(emotion, video, vtt),
  );
  const allMoments = [...moments, ...emotionMoments];

  const handleCategoryChange = (category: string) => {
    void setCategory(category);
  };

  const handleSkipToMoment = (moment: VideoMoment) => {
    void setStartAt(moment.segment_start_timestamp_in_seconds);
  };

  return (
    <PlayerProvider>
      <header className="fixed left-64 right-0 top-0 z-50 hidden items-center justify-between border-b border-border bg-background p-4 pl-0 lg:flex">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center"
        >
          <motion.div whileHover={{ scale: 1.2, x: -5 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              aria-label="Go back"
              className="h-[3.25rem] w-16 hover:bg-transparent"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="text-muted-foreground">You are watching</div>
            <div className="text-lg font-bold">{video.title}</div>
          </motion.div>
        </motion.div>
      </header>

      <div className="container mx-auto space-y-8 p-4 pt-8 lg:pt-32">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2 lg:space-y-6">
            <VideoPlayer
              video={video}
              momentsShown={allMoments.filter(
                ({ activity }) => !category || activity === category,
              )}
              startAt={startAt ?? undefined}
            />
            {summary && (
              <div className="block pb-2 lg:hidden">
                <MeetingSummary summary={summary} />
              </div>
            )}
            <VideoMoments
              moments={allMoments}
              selectedCategory={category ?? undefined}
              onCategoryChange={handleCategoryChange}
              onSkipToMoment={handleSkipToMoment}
            />
          </div>
          <div className="hidden space-y-4 lg:block">
            {summary && <MeetingSummary summary={summary} />}
            <VideoTags video={video} />
          </div>
        </div>
      </div>
    </PlayerProvider>
  );
}
