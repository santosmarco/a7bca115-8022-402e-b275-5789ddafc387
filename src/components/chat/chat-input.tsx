import { ArrowUp, Square } from "lucide-react";
import { useRef } from "react";

import { Button } from "~/components/ui/button";
import { useAutosizeTextArea } from "~/hooks/use-autosize-textarea";
import type { VideoMoment } from "~/lib/schemas/video-moment";
import { cn } from "~/lib/utils";
import type { VideoOutput } from "~/lib/videos";

import { ContentSelector } from "./content-selector";
import { SelectedContentList } from "./selected-content-list";

export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
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
}

export function ChatInput({
  className,
  placeholder = "Ask AI...",
  onKeyDown: onKeyDownProp,
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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const showSelectionsList =
    selectedMoments.length > 0 || selectedVideos.length > 0;

  useAutosizeTextArea({
    ref: textAreaRef,
    maxHeight: 240,
    borderWidth: 1,
    dependencies: [props.value, showSelectionsList],
  });

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
    onKeyDownProp?.(event);
  };

  return (
    <div className="relative flex w-full">
      <textarea
        ref={textAreaRef}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        className={cn(
          "w-full grow resize-none rounded-xl border border-input bg-background p-3 pr-24 text-sm ring-offset-background transition-[border] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          showSelectionsList && "pb-[50px]",
          className,
        )}
        {...props}
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
