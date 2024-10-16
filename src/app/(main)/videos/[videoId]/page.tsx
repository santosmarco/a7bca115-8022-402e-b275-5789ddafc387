import { getVideo } from "~/lib/api-video/videos";
import { VideoPageClient } from "./page.client";

export type VideoPageParams = {
  videoId: string;
};

export type VideoPageProps = {
  params: VideoPageParams;
};

export default async function VideoPage({ params }: VideoPageProps) {
  const video = await getVideo(params.videoId);

  return <VideoPageClient video={video} />;
}
