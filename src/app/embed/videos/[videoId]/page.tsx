import { VideoPageClient } from "~/app/(main)/videos/[videoId]/page.client";

export default async function EmbedVideoPage({
  params,
}: {
  params: { videoId: string };
}) {
  return <VideoPageClient videoId={params.videoId} />;
}
