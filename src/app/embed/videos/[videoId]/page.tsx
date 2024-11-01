import { VideoPageClient } from "~/app/(main)/videos/[videoId]/page.client";
import { getVTT } from "~/lib/api-video/videos";
import { api } from "~/trpc/server";

export default async function EmbedVideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await api.videos.getOne({ videoId });
  const vtt = await getVTT(video.videoId, "en");

  return <VideoPageClient video={video} vtt={vtt.content} />;
}
