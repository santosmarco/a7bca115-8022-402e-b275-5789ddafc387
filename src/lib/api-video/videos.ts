"server-only";

import ApiVideoClient from "@api.video/nodejs-client";

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
