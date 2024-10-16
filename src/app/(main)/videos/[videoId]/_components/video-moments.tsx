"use client";

import _ from "lodash";
import { MomentCard } from "~/components/moment-card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type Video } from "~/lib/schemas/video";
import { type VideoMoment } from "~/lib/schemas/video-moment";
import { getVideoMoments } from "~/lib/videos";

export type VideoMomentsProps = {
  video: Video;
  selectedCategory: string | undefined;
  onCategoryChange: (category: string) => void;
  onSkipToMoment: (moment: VideoMoment) => void;
};

export function VideoMoments({
  video,
  selectedCategory,
  onCategoryChange,
  onSkipToMoment,
}: VideoMomentsProps) {
  const moments = getVideoMoments(video);
  const categories = _.sortBy(
    _.uniq(moments.map((moment) => moment.activity)),
    (category) => category.toLowerCase(),
  );
  const momentsByCategory = _.mapValues(
    _.groupBy(moments, (moment) => moment.activity),
    (moments) =>
      _.sortBy(moments, (moment) => moment.segment_start_timestamp_in_seconds),
  );

  return (
    <Tabs
      value={selectedCategory ?? categories[0]}
      onValueChange={onCategoryChange}
    >
      <TabsList className="flex justify-start gap-x-6 bg-transparent lg:mb-2 lg:p-4">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="relative rounded-full hover:text-muted-foreground/70 data-[state=active]:bg-foreground data-[state=active]:text-background"
          >
            <span className="absolute -right-2.5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold leading-none text-foreground">
              {momentsByCategory[category]?.length}
            </span>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.entries(momentsByCategory).map(([category, moments]) => (
        <TabsContent key={category} value={category}>
          <ScrollArea className="h-[36rem] py-0 scrollbar-hide lg:border-t lg:border-border lg:p-4 lg:pt-0">
            {moments.map((moment, index) => (
              <MomentCard
                key={moment.index}
                moment={moment}
                index={index}
                onSkipToMoment={onSkipToMoment}
                className="lg:mt-4 [&:not(:first-child)]:mt-3"
              />
            ))}
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
}
