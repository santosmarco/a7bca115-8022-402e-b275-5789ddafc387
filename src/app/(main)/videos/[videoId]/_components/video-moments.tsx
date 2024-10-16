"use client";

import _ from "lodash";
import { MomentCard } from "~/components/moment-card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type VideoMoment } from "~/lib/schemas/video-moment";
import { handleMomentCategorySort } from "~/lib/videos";

export type VideoMomentsProps = {
  moments: VideoMoment[];
  selectedCategory: string | undefined;
  onCategoryChange: (category: string) => void;
  onSkipToMoment: (moment: VideoMoment) => void;
};

export function VideoMoments({
  moments,
  selectedCategory,
  onCategoryChange,
  onSkipToMoment,
}: VideoMomentsProps) {
  const categories = _.uniq(moments.map((moment) => moment.activity))
    .sort(handleMomentCategorySort)
    .concat(["Analysis"])
    .map((category) => ({
      label: category,
      value: category,
      disabled: category === "Analysis",
      comingSoon: category === "Analysis",
    }));
  const momentsByCategory = _.mapValues(
    _.groupBy(moments, (moment) => moment.activity),
    (moments) =>
      _.sortBy(moments, (moment) => moment.segment_start_timestamp_in_seconds),
  );

  return (
    <Tabs
      defaultValue={selectedCategory ?? categories[0]?.value}
      onValueChange={onCategoryChange}
    >
      <TabsList className="flex justify-start gap-x-6 bg-transparent lg:mb-2 lg:p-4">
        {categories.map((category) => (
          <TabsTrigger
            key={category.value}
            value={category.value}
            className="relative flex items-center rounded-full hover:text-muted-foreground/70 data-[state=active]:bg-foreground data-[state=active]:text-background"
            disabled={category.disabled}
          >
            {!category.disabled && (
              <span className="absolute -right-2.5 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold leading-none text-foreground">
                {momentsByCategory[category.value]?.length}
              </span>
            )}
            {category.label}
            {category.comingSoon && (
              <Badge size="sm" color="primary" className="ml-2 opacity-80">
                Soon
              </Badge>
            )}
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
