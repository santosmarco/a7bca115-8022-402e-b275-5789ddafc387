"use client";

import { Filter, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MomentCard } from "~/components/moment-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useProfile } from "~/hooks/use-profile";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import {
  emotionToMoment,
  getVideoEmotions,
  getVideoMoments,
} from "~/lib/videos";
import { api, type RouterOutputs } from "~/trpc/react";

type MomentsPageProps = {
  videos: RouterOutputs["videos"]["listAll"];
};

export function MomentsPageClient({ videos: videosProp }: MomentsPageProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { profile } = useProfile();
  const { data: user } = api.auth.getUser.useQuery();
  const videos = videosProp.filter((v) =>
    v.tags.includes(profile?.nickname ?? user?.nickname ?? ""),
  );

  const videosEnriched = videos.map((video) => {
    const moments = getVideoMoments(video);
    const emotions = getVideoEmotions(video) ?? [];
    const emotionMoments = emotions
      .map((emotion) => video.vtt && emotionToMoment(emotion, video, video.vtt))
      .filter((m): m is Exclude<typeof m, "" | null | undefined> => !!m);
    const allMoments = [...moments, ...emotionMoments];
    return { video, moments, emotions, emotionMoments, allMoments };
  });

  const moments = videosEnriched.flatMap((v) => v.allMoments);

  // Filter and sort moments based on user selections
  const filteredMoments = moments
    .filter((moment) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          moment.title.toLowerCase().includes(searchLower) ||
          moment.summary.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((moment) => {
      if (selectedVideo === "all") return true;
      return moment.video_id === selectedVideo;
    })
    .filter((moment) => {
      if (selectedCategory === "all") return true;
      return moment.activity === selectedCategory;
    });

  const categories = Array.from(new Set(moments.map((m) => m.activity)));

  const handleSkipToMoment = (moment: VideoMoment) => () => {
    void router.push(
      `/videos/${moment.video_id}?startAt=${moment.segment_start_timestamp_in_seconds}`,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-8 py-6">
        {/* Header and Search Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">All Moments</h1>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search moments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select value={selectedVideo} onValueChange={setSelectedVideo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Video Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              {videosEnriched.map((video) => (
                <SelectItem
                  key={video.video.videoId}
                  value={video.video.videoId}
                >
                  {video.video.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select> */}

          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Moments Grid */}
        <div className="grid gap-6">
          {filteredMoments.map((moment, index) => (
            <MomentCard
              key={moment.index}
              moment={moment}
              index={index}
              onSkipToMoment={handleSkipToMoment(moment)}
              jumpToLabel="Watch"
              className="w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
