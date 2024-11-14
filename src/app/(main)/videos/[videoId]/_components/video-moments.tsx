"use client";

import _ from "lodash";

import { MomentCard } from "~/components/moment-card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { VideoMoment } from "~/lib/schemas/video-moment";
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
    (moments) => moments,
  );

  return (
    <Tabs
      defaultValue={selectedCategory ?? categories[0]?.value}
      onValueChange={onCategoryChange}
    >
      <ScrollArea>
        <TabsList className="inline-flex h-11 items-center justify-start gap-2 bg-transparent p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="relative inline-flex items-center whitespace-nowrap rounded-full hover:text-muted-foreground/70 data-[state=active]:bg-foreground data-[state=active]:text-background"
              disabled={category.disabled}
            >
              {!category.disabled && (
                <span className="absolute -right-2 -top-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold leading-none text-foreground">
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
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {Object.entries(momentsByCategory).map(([category, moments]) => (
        <TabsContent key={category} value={category}>
          <ScrollArea className="py-0 scrollbar-hide lg:border-t lg:border-border lg:py-4 lg:pt-0">
            {moments.map((moment, index) => (
              <MomentCard
                key={moment.index}
                moment={moment}
                index={index}
                onSkipToMoment={onSkipToMoment}
                className="lg:mt-4 [&:not(:first-child)]:mt-4"
              />
            ))}
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
}
