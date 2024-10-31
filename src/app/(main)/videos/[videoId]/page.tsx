import { getVTT } from "~/lib/api-video/videos";
import { api } from "~/trpc/server";

import { VideoPageClient } from "./page.client";

export type VideoPageParams = {
  videoId: string;
};

export type VideoPageProps = {
  params: VideoPageParams;
};

export default async function VideoPage({ params }: VideoPageProps) {
  const video = await api.videos.getOne({ videoId: params.videoId });
  const vtt = await getVTT(video.videoId, "en");

  return <VideoPageClient video={video} vtt={vtt.content} />;
}
