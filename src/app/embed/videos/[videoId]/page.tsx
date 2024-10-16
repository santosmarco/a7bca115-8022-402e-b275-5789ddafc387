import { VideoPageClient } from "~/app/(main)/videos/[videoId]/page.client";
import { getVideo } from "~/lib/api-video/videos";

export type EmbedVideoPageParams = {
  videoId: string;
};

export type EmbedVideoPageProps = {
  params: EmbedVideoPageParams;
};

export default async function EmbedVideoPage({ params }: EmbedVideoPageProps) {
  const video = await getVideo(params.videoId);

  return <VideoPageClient video={video} />;
}
