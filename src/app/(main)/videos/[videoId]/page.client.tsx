"use client";

import { motion } from "framer-motion";
import _ from "lodash";
import { CameraIcon, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { PlayerProvider } from "~/components/player/provider";
import { VideoPlayer } from "~/components/player/video";
import { Button } from "~/components/ui/button";
import { useProfile } from "~/hooks/use-profile";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import { emotionToMoment, getVideoEmotions } from "~/lib/videos";
import { api } from "~/trpc/react";

import { MeetingSummary } from "./_components/meeting-summary";
import { VideoMoments } from "./_components/video-moments";
import { VideoTags } from "./_components/video-tags";

export type VideoPageClientProps = {
  videoId: string;
};

export function VideoPageClient({ videoId }: VideoPageClientProps) {
  const router = useRouter();
  const { profile } = useProfile();
  const { data: user } = api.auth.getUser.useQuery();
  const { data: video } = api.videos.getOne.useQuery({
    videoId,
    options: {
      moments: {
        includeNonRelevant:
          user?.is_admin && (!profile || user.id === profile.id),
      },
    },
  });
  const [category, setCategory] = useQueryState("category", parseAsString);
  const [startAt, setStartAt] = useQueryState("startAt", parseAsInteger);
  const vtt = video?.vtt ?? "";
  const summary = video?.summary;
  const moments = video?.moments ?? [];
  const emotions = video ? getVideoEmotions(video) : [];
  const emotionMoments = video
    ? (emotions ?? []).map((emotion) => emotionToMoment(emotion, video, vtt))
    : [];
  const allMoments = [...moments, ...emotionMoments];
  const sortedMoments = _.sortBy(
    _.sortBy(allMoments, (moment) => moment.segment_start_timestamp_in_seconds),
    (moment) => (moment.relevant ? 0 : 1),
    (m) =>
      m.reactions.reduce(
        (acc, r) =>
          acc +
          (r.reaction_type === "thumbs_up" ? -1 : 1) *
            (user?.is_admin && (!profile || user.id === profile.id) ? -1 : 1),
        0,
      ),
  );
  console.log(sortedMoments);

  const handleCategoryChange = (category: string) => {
    void setCategory(category);
  };

  const handleSkipToMoment = (moment: VideoMoment) => {
    void setStartAt(moment.segment_start_timestamp_in_seconds);
  };

  if (!video) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <CameraIcon className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Loading meeting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PlayerProvider>
      <header className="fixed left-0 right-0 top-16 z-50 flex h-16 items-center justify-between border-b border-border bg-background pl-0 lg:left-64 lg:top-0 lg:flex lg:h-auto lg:border-border lg:p-4">
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
              onClick={router.back}
              aria-label="Go back"
              className="h-[3.25rem] w-14 hover:bg-transparent lg:h-16"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="text-sm text-muted-foreground lg:text-base">
              You are watching
            </div>
            <div className="font-bold lg:text-lg">{video.title}</div>
          </motion.div>
        </motion.div>
      </header>

      <div className="container mx-auto space-y-8 p-4 pt-24">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2 lg:space-y-6">
            <VideoPlayer
              video={video}
              momentsShown={sortedMoments.filter(
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
              moments={sortedMoments}
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
