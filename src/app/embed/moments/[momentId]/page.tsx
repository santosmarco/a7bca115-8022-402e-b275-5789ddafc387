import { notFound } from "next/navigation";

import { getVTT } from "~/lib/api-video/videos";
import { getVideoMomentById } from "~/lib/videos";
import { api } from "~/trpc/server";

import { EmbedMomentPageClient } from "./page.client";

export type EmbedMomentPageParams = {
  momentId: string;
};

export type EmbedMomentPageProps = {
  params: EmbedMomentPageParams;
};

export default async function EmbedMomentPage({
  params,
}: EmbedMomentPageProps) {
  const { momentId } = params;

  const [videoId] = momentId.split("_");
  if (!videoId) {
    return notFound();
  }

  try {
    const video = await api.videos.getOne({
      videoId,
      options: { moments: { includeDeprecated: true } },
    });
    const vtt = await getVTT(video.videoId, "en");

    const moment = getVideoMomentById(
      video,
      decodeURIComponent(momentId),
      vtt.content,
    );
    if (!moment) {
      return notFound();
    }

    return <EmbedMomentPageClient moment={moment} />;
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
