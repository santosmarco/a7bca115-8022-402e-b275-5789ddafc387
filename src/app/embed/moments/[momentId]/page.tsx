import { notFound } from "next/navigation";
import Script from "next/script";

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
    const video = await api.videos.getOne({ videoId, includeDeprecated: true });
    const vtt = await getVTT(video.videoId, "en");

    const moment = getVideoMomentById(
      video,
      decodeURIComponent(momentId),
      vtt.content,
    );
    if (!moment) {
      return notFound();
    }

    return (
      <>
        <EmbedMomentPageClient moment={moment} />
        <Script
          strategy="afterInteractive"
          src={`
            function sendHeight() {
              const height = document.body.scrollHeight;
              window.parent.postMessage({ type: 'resize', height }, '*');
            }
            
            window.addEventListener('load', sendHeight);
            new ResizeObserver(sendHeight).observe(document.body);
          `}
        />
      </>
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
