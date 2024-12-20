import _ from "lodash";
import { Filter } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { SearchBar } from "~/components/search-bar";
import { Button } from "~/components/ui/button";
import { DateRangePicker } from "~/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { VideoOutput } from "~/lib/videos";

export interface MomentFiltersProps {
  onSearchChange: (value: string) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onSortOrderChange: (order: "asc" | "desc") => void;
  onCategoryChange: (category: string) => void;
  onVideoChange: (videoId: string) => void;
  categories: string[];
  selectedCategory: string | null;
  selectedVideo: string | null;
  videos: Array<{
    video: VideoOutput;
    allMoments: unknown[];
  }>;
}

export function MomentFilters({
  onSearchChange,
  onDateRangeChange,
  onSortOrderChange,
  onCategoryChange,
  onVideoChange,
  categories,
  selectedCategory,
  selectedVideo,
  videos,
}: MomentFiltersProps) {
  const categoriesSorted = React.useMemo(
    () => _.sortBy(categories, (c) => c),
    [categories],
  );

  const videosSorted = React.useMemo(
    () =>
      _.sortBy(
        _.sortBy(videos, (v) => v.video.title),
        (v) => !v.allMoments.length,
      ),
    [videos],
  );

  const [isOpen, setIsOpen] = React.useState(false);

  const FiltersContent = () => (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Video</label>
        <Select value={selectedVideo ?? "all"} onValueChange={onVideoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Video" />
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={selectedCategory ?? "all"}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectSeparator />
            {categoriesSorted.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date Range</label>
        <DateRangePicker onChange={onDateRangeChange} className="w-full" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sort Order</label>
        <Select
          defaultValue="desc"
          onValueChange={(v) => onSortOrderChange(v as "asc" | "desc")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar - Full Width */}
      <SearchBar
        placeholder="Search moments..."
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Desktop Filters */}
      <div className="hidden items-center gap-4 md:flex">
        <Select value={selectedVideo ?? "all"} onValueChange={onVideoChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Video" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectSeparator />
            {videosSorted.map((video) => (
              <SelectItem key={video.video.videoId} value={video.video.videoId}>
                {video.video.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedCategory ?? "all"}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectSeparator />
            {categoriesSorted.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker onChange={onDateRangeChange} className="w-full" />

        <Select
          defaultValue="desc"
          onValueChange={(v) => onSortOrderChange(v as "asc" | "desc")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="ml-auto flex gap-2 md:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Adjust filters to refine your moments
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FiltersContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
