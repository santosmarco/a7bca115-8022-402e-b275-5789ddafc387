import { VideoPageClient } from "~/app/(main)/videos/[videoId]/page.client";
import { getVideo, getVTT } from "~/lib/api-video/videos";

export type EmbedVideoPageParams = {
  videoId: string;
};

export type EmbedVideoPageProps = {
  params: EmbedVideoPageParams;
};

export default async function EmbedVideoPage({ params }: EmbedVideoPageProps) {
  const video = await getVideo(params.videoId);
  const vtt = await getVTT(video.videoId, "en");

  return <VideoPageClient video={video} vtt={vtt.content} />;
}
