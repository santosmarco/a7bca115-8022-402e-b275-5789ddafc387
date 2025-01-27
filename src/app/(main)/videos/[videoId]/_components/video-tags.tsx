import { TagIcon } from "lucide-react";
import { z } from "zod";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Video } from "~/lib/schemas/video";

export type VideoTagsProps = {
  video: Video;
};

export function VideoTags({ video }: VideoTagsProps) {
  return (
    <Card className="border-accent">
      <CardHeader className="bg-secondary/50">
        <CardTitle>Tags</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-2">
          {video.tags
            ?.filter((tag) => !isUuid(tag))
            .map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                <TagIcon className="h-3 w-3" />
                <span className="text-xs">{tag}</span>
              </Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function isUuid(tag: string) {
  return z.string().uuid().safeParse(tag).success;
}
