import { VideoPageClient } from "./page.client";

export default async function VideoPage({
  params,
}: {
  params: { videoId: string };
}) {
  return <VideoPageClient videoId={params.videoId} />;
}
