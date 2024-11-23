"use client";

import type { CoreMessage } from "ai";
import { motion } from "framer-motion";
import _ from "lodash";
import { MessageCircleMoreIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { ChatInterface } from "~/components/insights/chat-interface";
import { useProfile } from "~/hooks/use-profile";
import { emotionToMoment, getVideoEmotions } from "~/lib/videos";
import { api } from "~/trpc/react";

export const maxDuration = 30;

export default function InsightsPage() {
  const [selectedVideo, setSelectedVideo] = useQueryState(
    "video",
    parseAsString.withDefault("all"),
  );
  const [selectedTopic, setSelectedTopic] = useQueryState(
    "topic",
    parseAsString,
  );

  const { profile } = useProfile();
  const { data: user, isLoading: userLoading } = api.auth.getUser.useQuery();
  const { data: videosData, isLoading: videosLoading } =
    api.videos.listAll.useQuery({
      moments: {
        includeNonRelevant:
          user?.is_admin && (!profile || user.id === profile.id),
      },
    });

  const userId = profile?.id ?? user?.id ?? "";
  const topic = selectedTopic ?? "";

  const { data: chat, isFetching: chatLoading } = api.chats.get.useQuery({
    userId,
    topic,
  });

  const filteredVideos =
    (user?.is_admin && (!profile || user.id === profile.id)
      ? videosData
      : videosData?.filter((v) =>
          v.tags.includes(profile?.nickname ?? user?.nickname ?? ""),
        )) ?? [];

  const videosEnriched = filteredVideos.map((video) => {
    const moments = video.moments ?? [];
    const emotions = getVideoEmotions(video) ?? [];
    const emotionMoments = emotions
      .map((emotion) => video.vtt && emotionToMoment(emotion, video, video.vtt))
      .filter((m): m is Exclude<typeof m, "" | null | undefined> => !!m);
    const allMoments = [...moments, ...emotionMoments];
    return { video, moments, emotions, emotionMoments, allMoments };
  });

  const moments =
    selectedVideo === "all"
      ? videosEnriched.flatMap((v) => v.allMoments)
      : videosEnriched
          .filter((v) => v.video.videoId === selectedVideo)
          .flatMap((v) => v.allMoments);

  const filteredMoments = moments
    .filter((moment) => {
      if (selectedVideo === "all") return true;
      return moment.video_id === selectedVideo;
    })
    .filter((moment) => {
      if (!selectedTopic) return true;
      return moment.activity === selectedTopic;
    });

  const topics = _.sortBy(
    Array.from(new Set(filteredMoments.map((m) => m.activity))),
    (x) => x,
  );

  if (userLoading || videosLoading || chatLoading || !userId) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <MessageCircleMoreIcon className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Preparing chat...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ChatInterface
      userId={userId}
      selectedTopic={topic}
      topics={topics}
      relevantMoments={filteredMoments}
      initialMessages={
        (chat?.data?.messages as CoreMessage[] | undefined) ?? []
      }
      onTopicSelect={(topic) => void setSelectedTopic(topic)}
    />
  );
}
