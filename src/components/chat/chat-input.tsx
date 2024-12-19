import { ArrowUp, Square } from "lucide-react";

import { Editor } from "~/components/editor";
import { Button } from "~/components/ui/button";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import { cn } from "~/lib/utils";
import type { VideoOutput } from "~/lib/videos";

import { ContentSelector } from "./content-selector";
import { SelectedContentList } from "./selected-content-list";

export type ChatInputProps = {
  value: string;
  onChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onSubmit: (event?: { preventDefault?: () => void }) => void;
  stop?: () => void;
  isGenerating: boolean;
  moments?: VideoMoment[];
  videos?: VideoOutput[];
  selectedMoments: VideoMoment[];
  selectedVideos: VideoOutput[];
  onSelectMoment: (moment: VideoMoment) => void;
  onUnselectMoment: (moment: VideoMoment) => void;
  onSelectVideo: (video: VideoOutput) => void;
  onUnselectVideo: (video: VideoOutput) => void;
};

export function ChatInput({
  onChange,
  onSubmit,
  stop,
  isGenerating,
  moments = [],
  videos = [],
  selectedMoments,
  selectedVideos,
  onSelectMoment,
  onUnselectMoment,
  onSelectVideo,
  onUnselectVideo,
  ...props
}: ChatInputProps) {
  const showSelectionsList =
    selectedMoments.length > 0 || selectedVideos.length > 0;

  return (
    <div className="relative flex w-full">
      <Editor
        onChange={onChange}
        onSubmit={onSubmit}
        className={cn(showSelectionsList && "pb-[50px]")}
      />

      <SelectedContentList
        selectedMoments={selectedMoments}
        selectedVideos={selectedVideos}
        onUnselectMoment={onUnselectMoment}
        onUnselectVideo={onUnselectVideo}
      />

      <div className="absolute right-3 top-3 flex gap-2">
        <ContentSelector
          moments={moments}
          videos={videos}
          selectedMoments={selectedMoments}
          selectedVideos={selectedVideos}
          onSelectMoment={onSelectMoment}
          onUnselectMoment={onUnselectMoment}
          onSelectVideo={onSelectVideo}
          onUnselectVideo={onUnselectVideo}
        />

        {isGenerating && stop ? (
          <Button
            type="button"
            size="icon"
            className="h-8 w-8"
            aria-label="Stop generating"
            onClick={stop}
          >
            <Square className="h-3 w-3 animate-pulse" fill="currentColor" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 transition-opacity"
            aria-label="Send message"
            disabled={props.value === "" || isGenerating}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
