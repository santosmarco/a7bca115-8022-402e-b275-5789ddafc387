import { notFound } from "next/navigation";
import Script from "next/script";
import { getVideo, getVTT } from "~/lib/api-video/videos";
import { getVideoMomentById } from "~/lib/videos";
import { EmbedMomentPageClient } from "./page.client";

export type EmbedMomentPageParams = {
  momentId: string;
};

export type EmbedMomentPageProps = {
  params: EmbedMomentPageParams;
};

export default async function EmbedMomentPage({
  params: { momentId },
}: EmbedMomentPageProps) {
  const [videoId] = momentId.split("_");
  if (!videoId) {
    return notFound();
  }

  const video = await getVideo(videoId);
  const vtt = await getVTT(videoId, "en");

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
}
