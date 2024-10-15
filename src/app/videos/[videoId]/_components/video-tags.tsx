import type Video from "@api.video/nodejs-client/lib/model/Video";
import { TagIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export type VideoTagsProps = Pick<Video, "tags">;

export function VideoTags({ tags }: VideoTagsProps) {
  return (
    <Card>
      <CardHeader className="bg-secondary">
        <CardTitle className="text-lg">Tags</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag, index) => (
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
