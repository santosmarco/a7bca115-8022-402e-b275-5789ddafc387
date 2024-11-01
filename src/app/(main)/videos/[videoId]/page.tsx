import { getVTT } from "~/lib/api-video/videos";
import { api } from "~/trpc/server";

import { VideoPageClient } from "./page.client";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await api.videos.getOne({ videoId });
  const vtt = await getVTT(video.videoId, "en");

  return <VideoPageClient video={video} vtt={vtt.content} />;
}
