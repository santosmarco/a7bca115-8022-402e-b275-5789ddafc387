"use client";

import type Video from "@api.video/nodejs-client/lib/model/Video";

import { useRouter } from "next/navigation";

import { VideoPlayer } from "./player/video";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export type VideoCardProps = {
  video: Pick<Video, "videoId" | "title" | "tags">;
};

export function VideoCard({ video }: VideoCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/videos/${video.videoId}`);
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg"
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle>{video.title}</CardTitle>
        {video.tags && video.tags.length > 0 && (
          <CardDescription>
            {video.tags.map((tag) => (
              <Badge key={`${video.videoId}-${tag}`}>{tag}</Badge>
            ))}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <VideoPlayer videoId={video.videoId} />
      </CardContent>
    </Card>
  );
}
