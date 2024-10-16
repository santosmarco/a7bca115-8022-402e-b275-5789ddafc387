"server-only";

import ApiVideoClient from "@api.video/nodejs-client";
import axios from "axios";
import { z } from "zod";
import { env } from "~/env";
import { Video } from "~/lib/schemas/video";

const apiVideo = new ApiVideoClient({
  apiKey: env.API_VIDEO_API_KEY,
});

export async function listVideos(
  ...args: Parameters<typeof apiVideo.videos.list>
) {
  return await apiVideo.videos.list(...args);
}

export async function getVideo(
  ...args: Parameters<typeof apiVideo.videos.get>
) {
  const video = await apiVideo.videos.get(...args);
  return Video.parse(video);
}

export async function getVTT(
  ...args: Parameters<typeof apiVideo.captions.get>
) {
  const caption = await apiVideo.captions.get(...args);
  const res = caption.src
    ? await axios.get(caption.src, { responseType: "text" })
    : null;
  return { ...caption, content: z.string().parse(res?.data) };
}
