"use client";

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { subDays } from "date-fns";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import _ from "lodash";
import { Filter, FrownIcon, Search, TrendingUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";

import { MomentCard } from "~/components/moment-card";
import { Button } from "~/components/ui/button";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { Input } from "~/components/ui/input";
import { ScrollBar } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useProfile } from "~/hooks/use-profile";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import { emotionToMoment, getVideoEmotions } from "~/lib/videos";
import { api } from "~/trpc/react";

export function MomentsPageClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useQueryState("search", parseAsString);
  const [searchQueryDebounced, setSearchQueryDebounced] = useState(searchQuery);
  const [selectedVideo, setSelectedVideo] = useQueryState(
    "video",
    parseAsString,
  );
  const [selectedCategory, setSelectedCategory] = useQueryState(
    "category",
    parseAsString,
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { profile } = useProfile();
  const { data: user, isLoading: userLoading } = api.auth.getUser.useQuery();
  const { data: videosData, isLoading: videosLoading } =
    api.videos.listAll.useQuery({
      moments: {
        includeNonRelevant:
          user?.is_admin && (!profile || user.id === profile.id),
      },
    });
  const filteredVideos =
    (user?.is_admin && (!profile || user.id === profile.id)
      ? videosData
      : videosData?.filter((v) =>
          v.tags.includes(profile?.nickname ?? user?.nickname ?? ""),
        )) ?? [];
  const { data: searchMomentIds } = api.moments.search.useQuery({
    query: searchQueryDebounced ?? "",
    limit: 100,
  });

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

  console.log(moments);

  // Filter and sort moments based on user selections
  const filteredMoments = moments
    .filter((moment) => {
      if (selectedVideo === "all") return true;
      return moment.video_id === selectedVideo;
    })
    .filter((moment) => {
      if (selectedCategory === "all") return true;
      return moment.activity === selectedCategory;
    })
    .filter(
      (moment) =>
        !searchMomentIds || searchMomentIds.find((x) => x.id === moment.id),
    )
    .filter((moment) => {
      if (!dateRange?.from) return true;
      const videoDate = videosEnriched.find(
        (v) => v.video.videoId === moment.video_id,
      )?.video.publishedAt;
      if (!videoDate) return true;
      const date = dayjs(new Date(videoDate));
      console.log(dateRange, date);
      if (dateRange.to) {
        return date.isAfter(dateRange.from) && date.isBefore(dateRange.to);
      }
      return date.isAfter(dateRange.from);
    });

  const sortedMoments = _.orderBy(
    filteredMoments,
    [
      (m) => {
        const videoDate = videosEnriched.find(
          (v) => v.video.videoId === m.video_id,
        )?.video.publishedAt;
        return videoDate ? new Date(videoDate).getTime() : 0;
      },
      (m) =>
        m.reactions.reduce(
          (acc, r) => acc + (r.reaction_type === "thumbs_up" ? -1 : 1),
          0,
        ),
      (m) => !m.relevant,
    ],
    [sortOrder, "asc", "asc"],
  );

  const categories = _.sortBy(
    Array.from(new Set(sortedMoments.map((m) => m.activity))),
    (x) => x,
  );

  const videosSorted = _.sortBy(
    _.sortBy(videosEnriched, (v) => v.video.title),
    (v) => !v.allMoments.length,
  );

  const handleSkipToMoment = (moment: VideoMoment) => () => {
    void router.push(
      `/videos/${moment.video_id}?startAt=${moment.segment_start_timestamp_in_seconds}`,
    );
  };

  const debouncedSetSearchQueryDebounced = useCallback(
    _.debounce((value: string) => {
      setSearchQueryDebounced(value);
    }, 300),
    [],
  );

  const handleSearchChange = (value: string) => {
    void setSearchQuery(value);
    debouncedSetSearchQueryDebounced(value);
  };

  useEffect(
    function resetCategoryOnVideoChange() {
      void setSelectedCategory("all");
    },
    [setSelectedCategory],
  );

  useEffect(
    function resetVideoAndCategoryOnProfileChange() {
      void setSelectedVideo("all");
      void setSelectedCategory("all");
    },
    [setSelectedVideo, setSelectedCategory],
  );

  if (videosLoading || userLoading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <TrendingUpDown className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">Loading moments...</p>
        </motion.div>
      </div>
    );
  }

  if (!videosSorted.length) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <FrownIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No moments found</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-2 py-6 sm:space-y-8">
        {/* Header and Search Section */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">All Moments</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search moments..."
                className="pl-8"
                value={searchQuery ?? ""}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="flex max-w-full flex-col gap-2 sm:flex-row sm:gap-4">
          <Select
            value={selectedVideo ?? "all"}
            onValueChange={setSelectedVideo}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Video Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Videos</SelectItem>
              <SelectSeparator />
              {videosSorted.map((video) => (
                <TooltipProvider key={video.video.videoId} delayDuration={0}>
                  <Tooltip
                    open={video.allMoments.length === 0 ? undefined : false}
                  >
                    <TooltipTrigger asChild>
                      <SelectItem
                        value={video.video.videoId}
                        disabled={video.allMoments.length === 0}
                        className="!pointer-events-auto"
                      >
                        {video.video.title}
                      </SelectItem>
                    </TooltipTrigger>
                    <TooltipContent
                      align="start"
                      side="bottom"
                      alignOffset={8}
                      className="bg-accent"
                    >
                      {video.allMoments.length === 0 && "No moments to display"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker
            onChange={setDateRange}
            className="w-full sm:w-auto"
          />

          <Select
            value={sortOrder}
            onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort By Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <ScrollArea className="max-w-full overflow-scroll sm:max-w-[calc(100%-0.8125rem)]">
            <Tabs
              value={selectedCategory ?? "all"}
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
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {/* Moments Grid */}
        <div className="grid gap-6 pt-4 sm:pt-0">
          {sortedMoments.map((moment, index) => (
            <MomentCard
              key={moment.index}
              moment={moment}
              index={index}
              onSkipToMoment={handleSkipToMoment(moment)}
              jumpToLabel="Watch"
              className="w-full"
              videoTitle={
                videosEnriched.find((v) => v.video.videoId === moment.video_id)
                  ?.video.title
              }
              videoDate={
                videosEnriched.find((v) => v.video.videoId === moment.video_id)
                  ?.video.publishedAt
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
